import Stripe from 'stripe';
import { User } from '../models/User';
import Subscription from '../models/Subscription';
import Plan from '../models/Plan';
import Invoice from '../models/Invoice';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-01-27.acacia' as any,
});

class StripeService {
  /**
   * Create or retrieve a Stripe customer for a user
   */
  async getOrCreateCustomer(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    if (user.subscription?.stripeCustomerId) {
      return user.subscription.stripeCustomerId;
    }

    const customer = await stripe.customers.create({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      metadata: {
        userId: user._id.toString(),
      },
    });

    user.subscription.stripeCustomerId = customer.id;
    await user.save();

    return customer.id;
  }

  /**
   * Create a checkout session for a subscription
   */
  async createCheckoutSession(userId: string, priceId: string) {
    const customerId = await this.getOrCreateCustomer(userId);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/billing/cancel`,
      metadata: {
        userId,
      },
    });

    return session;
  }

  /**
   * Create a customer portal session
   */
  async createPortalSession(userId: string) {
    const customerId = await this.getOrCreateCustomer(userId);

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard/billing`,
    });

    return session;
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(userId: string) {
    const subscription = await Subscription.findOne({ userId, status: { $ne: 'cancelled' } });
    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new Error('No active Stripe subscription found');
    }

    const stripeSub = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    subscription.cancelAtPeriodEnd = true;
    await subscription.save();

    await User.findByIdAndUpdate(userId, {
      'subscription.status': 'cancelled', // Or maintain 'active' but with cancelAtPeriodEnd
    });

    return stripeSub;
  }

  /**
   * Handle Stripe webhooks
   */
  async handleWebhook(event: any) {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object);
        break;
      case 'invoice.paid':
        await this.handleInvoicePaid(event.data.object);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object);
        break;
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object);
        break;
    }
  }

  private async handleCheckoutCompleted(session: any) {
    const userId = session.metadata?.userId;
    const stripeSubscriptionId = session.subscription as string;

    if (!userId || !stripeSubscriptionId) return;

    const stripeSub = (await stripe.subscriptions.retrieve(stripeSubscriptionId)) as any;
    const priceId = stripeSub.items.data[0].price.id;

    const plan = await Plan.findOne({ stripePriceId: priceId });
    if (!plan) return;

    await Subscription.findOneAndUpdate(
      { userId },
      {
        userId,
        planId: plan._id,
        status: 'active',
        currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
        stripeSubscriptionId,
        stripeCustomerId: session.customer as string,
      },
      { upsert: true, new: true }
    );

    await User.findByIdAndUpdate(userId, {
      'subscription.plan': plan.name.toLowerCase() as any,
      'subscription.status': 'active',
      'subscription.currentPeriodStart': new Date(stripeSub.current_period_start * 1000),
      'subscription.currentPeriodEnd': new Date(stripeSub.current_period_end * 1000),
      'subscription.stripeSubscriptionId': stripeSubscriptionId,
    });
  }

  private async handleInvoicePaid(invoice: any) {
    const stripeSubscriptionId = invoice.subscription as string;
    if (!stripeSubscriptionId) return;

    const subscription = await Subscription.findOne({ stripeSubscriptionId });
    if (!subscription) return;

    await Invoice.create({
      userId: subscription.userId,
      invoiceNumber: `INV-${Date.now()}`,
      status: 'paid',
      period: {
        start: new Date(invoice.period_start * 1000),
        end: new Date(invoice.period_end * 1000),
      },
      lineItems: invoice.lines.data.map((line: any) => ({
        type: 'subscription',
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.amount,
        amount: line.amount,
      })),
      subtotal: invoice.subtotal,
      total: invoice.total,
      amountPaid: invoice.amount_paid,
      amountDue: 0,
      currency: invoice.currency,
      gateway: 'stripe',
      externalId: invoice.id,
      dueDate: new Date(invoice.due_date ? invoice.due_date * 1000 : Date.now()),
    });
  }

  private async handleSubscriptionUpdated(stripeSub: any) {
    const subscription = await Subscription.findOne({ stripeSubscriptionId: stripeSub.id });
    if (!subscription) return;

    subscription.status = stripeSub.status as any;
    subscription.currentPeriodStart = new Date(stripeSub.current_period_start * 1000);
    subscription.currentPeriodEnd = new Date(stripeSub.current_period_end * 1000);
    subscription.cancelAtPeriodEnd = stripeSub.cancel_at_period_end;
    await subscription.save();

    await User.findByIdAndUpdate(subscription.userId, {
      'subscription.status': stripeSub.status as any,
      'subscription.currentPeriodStart': subscription.currentPeriodStart,
      'subscription.currentPeriodEnd': subscription.currentPeriodEnd,
    });
  }

  private async handleSubscriptionDeleted(stripeSub: any) {
    const subscription = await Subscription.findOne({ stripeSubscriptionId: stripeSub.id });
    if (!subscription) return;

    subscription.status = 'cancelled';
    await subscription.save();

    await User.findByIdAndUpdate(subscription.userId, {
      'subscription.status': 'cancelled',
    });
  }

  private async handlePaymentIntentSucceeded(paymentIntent: any) {
    const invoiceId = paymentIntent.metadata?.invoiceId;
    if (!invoiceId) return;

    await Invoice.findByIdAndUpdate(invoiceId, {
      status: 'paid',
      paymentIntent: paymentIntent.id,
      paidAt: new Date(),
      amountPaid: paymentIntent.amount,
      amountDue: 0,
    });
  }
}

export default new StripeService();
