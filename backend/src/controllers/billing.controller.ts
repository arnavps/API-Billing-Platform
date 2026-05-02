import { Request, Response } from 'express';
import StripeService from '../services/stripe.service';
import Subscription from '../models/Subscription';
import Plan from '../models/Plan';
import Invoice from '../models/Invoice';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-04-22.dahlia' as any,
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
      const { planId } = req.body;
      const userId = (req as any).user.id;

      const plan = await Plan.findById(planId);
      if (!plan) {
        return res.status(404).json({ message: 'Plan not found' });
      }

      const session = await StripeService.createCheckoutSession(userId, plan.stripePriceId);
      res.json({ url: session.url });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Create Customer Portal Session
   */
  async createPortal(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const session = await StripeService.createPortalSession(userId);
      res.json({ url: session.url });
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
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      await StripeService.handleWebhook(event);
      res.json({ received: true });
    } catch (error: any) {
      console.error(`Webhook Processing Error: ${error.message}`);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default new BillingController();
