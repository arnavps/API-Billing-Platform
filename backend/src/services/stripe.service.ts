import Stripe from 'stripe';
import { User } from '../models/User';
import Subscription from '../models/Subscription';
import Plan from '../models/Plan';
import Invoice from '../models/Invoice';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-04-22.dahlia' as any, // Using the version requested by the types
});

class StripeService {
  /**
   * Create or retrieve a Stripe customer for a user
   */
  async getOrCreateCustomer(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    if (user.subscription?.customerId) {
      return user.subscription.customerId;
    }

    const customer = await stripe.customers.create({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      metadata: {
        userId: user._id.toString(),
      },
    });

    user.subscription = {
      ...user.subscription,
      customerId: customer.id,
    } as any;
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
   * Create a customer portal session for managing subscriptions
   */
  async createPortalSession(userId: string) {
    const customerId = await this.getOrCreateCustomer(userId);

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard/settings/billing`,
    });

    return session;
  }

  /**
   * Handle Stripe webhooks
   */
  async handleWebhook(event: any) {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        await this.handleCheckoutCompleted(session);
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object as any;
        await this.handleInvoicePaid(invoice);
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        await this.handleSubscriptionUpdated(subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        await this.handleSubscriptionDeleted(subscription);
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
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

    // Update user's primary subscription info
    await User.findByIdAndUpdate(userId, {
      'subscription.plan': plan.name.toLowerCase() as any,
      'subscription.status': 'active',
      'subscription.currentPeriodStart': new Date(stripeSub.current_period_start * 1000),
      'subscription.currentPeriodEnd': new Date(stripeSub.current_period_end * 1000),
    });
  }

  private async handleInvoicePaid(invoice: any) {
    const stripeSubscriptionId = invoice.subscription as string;
    if (!stripeSubscriptionId) return;

    const subscription = await Subscription.findOne({ stripeSubscriptionId });
    if (!subscription) return;

    await Invoice.create({
      userId: subscription.userId,
      subscriptionId: subscription._id,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency,
      status: 'paid',
      stripeInvoiceId: invoice.id,
      pdfUrl: invoice.invoice_pdf,
      billingReason: invoice.billing_reason,
      date: new Date(),
    });
  }

  private async handleSubscriptionUpdated(stripeSub: any) {
    const subscription = await Subscription.findOne({
      stripeSubscriptionId: stripeSub.id,
    });
    if (!subscription) return;

    subscription.status = stripeSub.status as any;
    subscription.currentPeriodStart = new Date(stripeSub.current_period_start * 1000);
    subscription.currentPeriodEnd = new Date(stripeSub.current_period_end * 1000);
    subscription.cancelAtPeriodEnd = stripeSub.cancel_at_period_end;
    await subscription.save();

    // Sync with User model
    await User.findByIdAndUpdate(subscription.userId, {
      'subscription.status': stripeSub.status as any,
      'subscription.currentPeriodStart': subscription.currentPeriodStart,
      'subscription.currentPeriodEnd': subscription.currentPeriodEnd,
    });
  }

  private async handleSubscriptionDeleted(stripeSub: any) {
    const subscription = await Subscription.findOne({
      stripeSubscriptionId: stripeSub.id,
    });
    if (!subscription) return;

    subscription.status = 'cancelled';
    await subscription.save();

    await User.findByIdAndUpdate(subscription.userId, {
      'subscription.status': 'cancelled',
    });
  }
}

export default new StripeService();
