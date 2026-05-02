import { Request, Response } from 'express';
import StripeService from '../services/stripe.service';
import RazorpayService from '../services/razorpay.service';
import Subscription from '../models/Subscription';
import Plan from '../models/Plan';
import Invoice from '../models/Invoice';
import BillingCycle from '../models/BillingCycle';
import PaymentMethod from '../models/PaymentMethod';
import { API } from '../models/API';
import { PricingService } from '../services/pricing.service';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-01-27.acacia' as any,
});

class BillingController {
  /**
   * Get all available plans
   */
  async getPlans(req: Request, res: Response) {
    try {
      const plans = await Plan.find({ isActive: true }).sort({ price: 1 });
      res.json(plans);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Create Stripe Checkout Session
   */
  async createCheckout(req: Request, res: Response) {
    try {
      const { planId, gateway = 'stripe' } = req.body;
      const userId = (req as any).user.id;

      const plan = await Plan.findById(planId);
      if (!plan) {
        return res.status(404).json({ message: 'Plan not found' });
      }

      if (gateway === 'stripe') {
        const session = await StripeService.createCheckoutSession(userId, plan.stripePriceId);
        return res.json({ url: session.url });
      } else if (gateway === 'razorpay') {
        const order = await RazorpayService.createOrder(
          plan.price, // assuming plan.price is in smallest unit or handle it here
          'INR',
          `receipt_${Date.now()}`
        );
        return res.json({ 
          orderId: order.id, 
          amount: order.amount, 
          currency: order.currency,
          key: process.env.RAZORPAY_KEY_ID 
        });
      }

      res.status(400).json({ message: 'Invalid gateway' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Cancel Subscription
   */
  async cancelSubscription(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { gateway = 'stripe' } = req.body;

      if (gateway === 'stripe') {
        await StripeService.cancelSubscription(userId);
      } else {
        // Razorpay cancellation logic
        const user = await (req as any).user;
        if (user.subscription.razorpaySubscriptionId) {
          // Implement Razorpay cancellation if needed
        }
      }

      res.json({ message: 'Subscription cancelled successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Handle Stripe Webhooks
   */
  async handleWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];
    let event: any;

    try {
      event = stripe.webhooks.constructEvent(
        (req as any).rawBody || req.body,
        sig as string,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      await StripeService.handleWebhook(event);
      res.json({ received: true });
    } catch (error: any) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Handle Razorpay Webhooks
   */
  async handleRazorpayWebhook(req: Request, res: Response) {
    const signature = req.headers['x-razorpay-signature'] as string;

    try {
      await RazorpayService.handleWebhook(req.body, signature);
      res.json({ received: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Get current subscription
   */
  async getSubscription(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const subscription = await Subscription.findOne({ userId }).populate('planId');
      res.json(subscription);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Get invoice history
   */
  async getInvoices(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const invoices = await Invoice.find({ userId }).sort({ createdAt: -1 });
      res.json(invoices);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Get current billing cycle usage
   */
  async getCurrentCycle(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const cycle = await BillingCycle.findOne({ userId, month: startOfMonth });

      if (!cycle) {
        const userApis = await API.find({ userId });
        const apisUsage = userApis.map(api => ({
          apiId: api._id,
          name: api.name,
          totalRequests: api.analytics.totalRequests,
          dataTransferred: 0,
          cost: PricingService.calculateUsageCost(api as any, api.analytics.totalRequests)
        }));

        const totalCost = apisUsage.reduce((sum, api) => sum + api.cost, 0);

        return res.status(200).json({
          userId,
          month: startOfMonth,
          apis: apisUsage,
          totalCost,
          status: 'open'
        });
      }

      res.status(200).json(cycle);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Get payment methods
   */
  async getPaymentMethods(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const methods = await PaymentMethod.find({ userId });
      res.status(200).json(methods);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Add payment method
   */
  async addPaymentMethod(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { paymentMethodId, isDefault } = req.body;

      if (!paymentMethodId) {
        return res.status(400).json({ message: 'Payment Method ID is required' });
      }

      const customerId = await StripeService.getOrCreateCustomer(userId);
      const stripeMethod = await StripeService.attachPaymentMethod(customerId, paymentMethodId);

      const method = await PaymentMethod.create({
        userId,
        stripePaymentMethodId: stripeMethod.id,
        type: stripeMethod.type,
        card: {
          brand: stripeMethod.card?.brand,
          last4: stripeMethod.card?.last4,
          expMonth: stripeMethod.card?.exp_month,
          expYear: stripeMethod.card?.exp_year,
        },
        isDefault: isDefault || false,
      });

      res.status(201).json(method);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Pay a custom invoice
   */
  async payInvoice(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { invoiceId } = req.params;

      const invoice = await Invoice.findOne({ _id: invoiceId, userId });
      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }

      if (invoice.status === 'paid') {
        return res.status(400).json({ message: 'Invoice is already paid' });
      }

      const customerId = await StripeService.getOrCreateCustomer(userId);
      const paymentIntent = await StripeService.createPaymentIntent(customerId, invoice.total, {
        invoiceId: invoice._id.toString(),
        invoiceNumber: invoice.invoiceNumber,
      });

      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        invoice,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default new BillingController();
