import { Worker, Job } from 'bullmq';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { API } from '../models/API';
import { APIAnalytics } from '../models/APIAnalytics';
import BillingCycle from '../models/BillingCycle';
import Invoice from '../models/Invoice';
import { EmailService } from '../services/email.service';
import { PricingService } from '../services/pricing.service';
import { NotificationService } from '../services/notification.service';
import { WebhookService } from '../services/webhook.service';
import { PDFService } from '../services/pdf.service';
import Stripe from 'stripe';
import { billingQueue } from '../config/queues';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-04-22.dahlia' as any,
});

export const billingWorker = new Worker(
  'billing-tasks',
  async (job: Job) => {
    const { type, userId, month } = job.data;

    try {
      if (type === 'sync-usage') {
        await syncUsageForUser(userId, new Date(month));
      } else if (type === 'close-cycle') {
        await closeCycleAndGenerateInvoice(userId, new Date(month));
      } else if (type === 'retry-payment') {
        await retryPayment(job.data.invoiceId);
      } else if (type === 'send-reminder') {
        await sendReminder(job.data.invoiceId);
      } else if (type === 'trigger-daily-sync') {
        await triggerDailySync();
      } else if (type === 'trigger-monthly-close') {
        await triggerMonthlyClose();
      } else if (type === 'trigger-payment-retry') {
        await triggerPaymentRetry();
      }
    } catch (error) {
      console.error(`Error processing billing job ${job.id}:`, error);
      throw error;
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
  }
);

async function syncUsageForUser(userId: string, month: Date) {
  const startOfMonth = new Date(month);
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(startOfMonth.getMonth() + 1);

  // Get all analytics for this user in this month
  const analytics = await APIAnalytics.find({
    userId: new mongoose.Types.ObjectId(userId),
    period: 'daily',
    date: { $gte: startOfMonth, $lt: endOfMonth }
  });

  // Group by API
  const apiUsageMap = new Map<string, number>();
  for (const record of analytics) {
    const apiId = record.apiId.toString();
    const current = apiUsageMap.get(apiId) || 0;
    apiUsageMap.set(apiId, current + record.metrics.totalRequests);
  }

  const apisData = [];
  let totalCycleCost = 0;

  for (const [apiId, totalRequests] of apiUsageMap.entries()) {
    const api = await API.findById(apiId);
    if (!api) continue;

    const cost = PricingService.calculateUsageCost(api as any, totalRequests);
    apisData.push({
      apiId: new mongoose.Types.ObjectId(apiId),
      name: api.name,
      totalRequests,
      dataTransferred: 0,
      cost
    });
    totalCycleCost += cost;
  }

  await BillingCycle.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId), month: startOfMonth },
    {
      $set: {
        apis: apisData,
        totalCost: totalCycleCost,
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );
}

async function closeCycleAndGenerateInvoice(userId: string, month: Date) {
  const startOfMonth = new Date(month);
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const cycle = await BillingCycle.findOne({ userId, month: startOfMonth, status: 'open' });
  if (!cycle || cycle.totalCost === 0) return;

  const user = await User.findById(userId);
  if (!user) return;

  // 1. Create Invoice
  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(startOfMonth.getMonth() + 1);
  endOfMonth.setDate(0); // Last day of month

  const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  const lineItems = cycle.apis.map(api => ({
    type: 'usage' as const,
    description: `API Usage: ${api.name}`,
    apiId: api.apiId,
    apiName: api.name,
    quantity: api.totalRequests,
    unitPrice: api.totalRequests > 0 ? Math.round(api.cost / api.totalRequests) : 0,
    amount: api.cost
  }));

  const subtotal = cycle.totalCost;
  const taxRate = 10; // 10%
  const taxAmount = Math.round(subtotal * (taxRate / 100));
  const total = subtotal + taxAmount;

  const invoice = await Invoice.create({
    userId,
    invoiceNumber,
    status: 'pending',
    period: { start: startOfMonth, end: endOfMonth },
    lineItems,
    subtotal,
    tax: { rate: taxRate, amount: taxAmount },
    total,
    amountDue: total,
    currency: 'USD',
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days due
  });

  // 2. Update Cycle
  cycle.status = 'closed';
  cycle.invoiceId = invoice._id as any;
  await cycle.save();

  // 3. Generate PDF
  const pdfBuffer = await PDFService.generateInvoicePDF(invoice as any, user as any);
  
  // 4. Send Email
  await EmailService.sendInvoice(user as any, invoice as any, pdfBuffer);

  // 5. Notify & Webhook
  await NotificationService.create(userId, {
    title: 'New Invoice Generated',
    message: `Your invoice ${invoice.invoiceNumber} for $${(invoice.total / 100).toFixed(2)} has been generated.`,
    type: 'info',
    category: 'billing',
    actionUrl: `/billing/invoices/${invoice._id}`,
    actionText: 'View Invoice'
  });

  await WebhookService.trigger(userId, 'invoice.created', {
    invoiceId: invoice._id,
    invoiceNumber: invoice.invoiceNumber,
    total: invoice.total,
    currency: invoice.currency,
    dueDate: invoice.dueDate
  });
}

async function retryPayment(invoiceId: string) {
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice || invoice.status !== 'failed') return;

  const user = await User.findById(invoice.userId);
  if (!user || !user.subscription?.stripeCustomerId) return;

  try {
    const customer = await stripe.customers.retrieve(user.subscription.stripeCustomerId) as any;
    const paymentMethodId = customer.invoice_settings?.default_payment_method;

    if (!paymentMethodId) {
      throw new Error('No default payment method found');
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: invoice.total,
      currency: invoice.currency.toLowerCase() || 'usd',
      customer: user.subscription.stripeCustomerId,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
      metadata: { invoiceId: invoice._id.toString() }
    });

    if (paymentIntent.status === 'succeeded') {
      invoice.status = 'paid';
      invoice.paymentIntent = paymentIntent.id;
      invoice.paidAt = new Date();
      invoice.amountPaid = invoice.total;
      invoice.amountDue = 0;
      await invoice.save();
      await EmailService.sendPaymentSuccess(user as any, invoice as any);

      // Notify & Webhook
      await NotificationService.create(user._id.toString(), {
        title: 'Payment Succeeded',
        message: `Your payment for invoice ${invoice.invoiceNumber} was successful.`,
        type: 'success',
        category: 'billing',
        actionUrl: '/billing/invoices'
      });

      await WebhookService.trigger(user._id.toString(), 'payment.succeeded', {
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.total,
        paymentIntentId: paymentIntent.id
      });
    }
  } catch (error: any) {
    console.error(`Retry payment failed for invoice ${invoiceId}:`, error);

    // Notify & Webhook on failure
    const invoice = await Invoice.findById(invoiceId);
    if (invoice) {
      await NotificationService.create(invoice.userId.toString(), {
        title: 'Payment Failed',
        message: `Your payment for invoice ${invoice.invoiceNumber} failed. Please update your payment method.`,
        type: 'error',
        category: 'billing',
        actionUrl: '/billing/payment-methods',
        actionText: 'Update Card'
      });

      await WebhookService.trigger(invoice.userId.toString(), 'payment.failed', {
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        error: error.message
      });
    }
  }
}

async function sendReminder(invoiceId: string) {
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice || invoice.status !== 'pending') return;

  const user = await User.findById(invoice.userId);
  if (!user) return;

  await EmailService.sendPaymentReminder(user as any, invoice as any);
}

async function triggerDailySync() {
  const users = await User.find({ isActive: true });
  const now = new Date();
  
  for (const user of users) {
    await billingQueue.add('sync-usage', { 
      type: 'sync-usage', 
      userId: user._id.toString(), 
      month: now.toISOString() 
    });
  }
}

async function triggerMonthlyClose() {
  // Close previous month
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  const users = await User.find({ isActive: true });
  for (const user of users) {
    await billingQueue.add('close-cycle', { 
      type: 'close-cycle', 
      userId: user._id.toString(), 
      month: lastMonth.toISOString() 
    });
  }
}

async function triggerPaymentRetry() {
  const failedInvoices = await Invoice.find({ 
    status: 'failed',
    createdAt: { $gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
  });
  
  for (const invoice of failedInvoices) {
    await billingQueue.add('retry-payment', { 
      type: 'retry-payment', 
      invoiceId: invoice._id.toString() 
    });
  }
}
