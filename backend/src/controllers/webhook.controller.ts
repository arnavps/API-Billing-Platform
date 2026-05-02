import { Request, Response } from 'express';
import { Webhook } from '../models/Webhook';
import { WebhookDelivery } from '../models/WebhookDelivery';
import { WebhookService } from '../services/webhook.service';
import crypto from 'crypto';

/**
 * Create a new webhook
 */
export const createWebhook = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { url, events, metadata } = req.body;

    const webhook = await Webhook.create({
      userId,
      url,
      events,
      secret: `whsec_${crypto.randomBytes(24).toString('hex')}`,
      metadata,
      status: 'active'
    });

    res.status(201).json(webhook);
  } catch (error: any) {
    res.status(500).json({ error: { message: error.message } });
  }
};

/**
 * Get all webhooks for user
 */
export const getWebhooks = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const webhooks = await Webhook.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ webhooks, total: webhooks.length });
  } catch (error: any) {
    res.status(500).json({ error: { message: error.message } });
  }
};

/**
 * Update a webhook
 */
export const updateWebhook = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { url, events, status } = req.body;

    const webhook = await Webhook.findOneAndUpdate(
      { _id: req.params.id, userId },
      { url, events, status },
      { new: true }
    );

    if (!webhook) {
      return res.status(404).json({ error: { message: 'Webhook not found' } });
    }

    res.status(200).json(webhook);
  } catch (error: any) {
    res.status(500).json({ error: { message: error.message } });
  }
};

/**
 * Delete a webhook
 */
export const deleteWebhook = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const webhook = await Webhook.findOneAndDelete({ _id: req.params.id, userId });

    if (!webhook) {
      return res.status(404).json({ error: { message: 'Webhook not found' } });
    }

    // Also delete delivery history
    await WebhookDelivery.deleteMany({ webhookId: req.params.id });

    res.status(200).json({ message: 'Webhook deleted' });
  } catch (error: any) {
    res.status(500).json({ error: { message: error.message } });
  }
};

/**
 * Test a webhook with a ping event
 */
export const testWebhook = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const webhook = await Webhook.findOne({ _id: req.params.id, userId });

    if (!webhook) {
      return res.status(404).json({ error: { message: 'Webhook not found' } });
    }

    await WebhookService.queueDelivery(webhook, 'ping', {
      message: 'This is a test notification from MeterFlow',
      webhookId: webhook._id
    });

    res.status(200).json({ message: 'Test event queued' });
  } catch (error: any) {
    res.status(500).json({ error: { message: error.message } });
  }
};

/**
 * Get delivery history for a webhook
 */
export const getWebhookDeliveries = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Verify webhook ownership first
    const webhook = await Webhook.findOne({ _id: req.params.id, userId });
    if (!webhook) {
      return res.status(404).json({ error: { message: 'Webhook not found' } });
    }

    const [deliveries, total] = await Promise.all([
      WebhookDelivery.find({ webhookId: req.params.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      WebhookDelivery.countDocuments({ webhookId: req.params.id })
    ]);

    res.status(200).json({
      deliveries,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error: any) {
    res.status(500).json({ error: { message: error.message } });
  }
};
