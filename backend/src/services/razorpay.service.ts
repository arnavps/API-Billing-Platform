import Razorpay from 'razorpay';
import crypto from 'crypto';
import { User } from '../models/User';
import Invoice from '../models/Invoice';

class RazorpayService {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });
  }

  async createCustomer(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    if (user.subscription.razorpayCustomerId) {
      return user.subscription.razorpayCustomerId;
    }

    const customer = await this.razorpay.customers.create({
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      fail_existing: 0,
    });

    user.subscription.razorpayCustomerId = customer.id;
    await user.save();

    return customer.id;
  }

  async createOrder(amount: number, currency: string = 'INR', receipt: string) {
    const options = {
      amount: amount, // amount in the smallest currency unit
      currency,
      receipt,
    };

    return await this.razorpay.orders.create(options);
  }

  async verifyPayment(orderId: string, paymentId: string, signature: string) {
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body.toString())
      .digest('hex');

    return expectedSignature === signature;
  }

  async handleWebhook(payload: any, signature: string) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(payload));
    const digest = shasum.digest('hex');

    if (digest !== signature) {
      throw new Error('Invalid signature');
    }

    const event = payload.event;
    const data = payload.payload;

    switch (event) {
      case 'payment.captured':
        await this.handlePaymentCaptured(data.payment.entity);
        break;
      case 'subscription.activated':
        await this.handleSubscriptionActivated(data.subscription.entity);
        break;
      case 'subscription.halted':
        await this.handleSubscriptionHalted(data.subscription.entity);
        break;
      case 'subscription.cancelled':
        await this.handleSubscriptionCancelled(data.subscription.entity);
        break;
    }
  }

  private async handlePaymentCaptured(payment: any) {
    const invoice = await Invoice.findOne({ externalId: payment.order_id });
    if (invoice) {
      invoice.status = 'paid';
      invoice.amountPaid = payment.amount;
      invoice.amountDue = 0;
      invoice.paidAt = new Date();
      invoice.paymentIntent = payment.id;
      await invoice.save();
    }
  }

  private async handleSubscriptionActivated(subscription: any) {
    const user = await User.findOne({ 'subscription.razorpaySubscriptionId': subscription.id });
    if (user) {
      user.subscription.status = 'active';
      user.subscription.currentPeriodStart = new Date(subscription.current_start * 1000);
      user.subscription.currentPeriodEnd = new Date(subscription.current_end * 1000);
      await user.save();
    }
  }

  private async handleSubscriptionHalted(subscription: any) {
    const user = await User.findOne({ 'subscription.razorpaySubscriptionId': subscription.id });
    if (user) {
      user.subscription.status = 'past_due';
      await user.save();
    }
  }

  private async handleSubscriptionCancelled(subscription: any) {
    const user = await User.findOne({ 'subscription.razorpaySubscriptionId': subscription.id });
    if (user) {
      user.subscription.status = 'cancelled';
      await user.save();
    }
  }
}

export default new RazorpayService();
