import { Request, Response } from 'express';
import { Webhook } from '../models/Webhook';
import { WebhookEvent } from '../models/WebhookEvent';
import crypto from 'crypto';

/**
 * Create a new webhook subscription
 */
export const createWebhook = async (req: Request, res: Response) => {
  try {
    const { url, name, enabledEvents, apiId } = req.body;
    
    // Generate a unique secret for signing events
    const secret = `whsec_${crypto.randomBytes(24).toString('hex')}`;
    
    const webhook = await Webhook.create({
      userId: req.user._id,
      apiId,
      url,
      name,
      secret,
      enabledEvents: enabledEvents || ['*'],
    });
    
    res.status(201).json(webhook);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all webhooks for the user
 */
export const getWebhooks = async (req: Request, res: Response) => {
  try {
    const webhooks = await Webhook.find({ userId: req.user._id });
    res.json(webhooks);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete a webhook subscription
 */
export const deleteWebhook = async (req: Request, res: Response) => {
  try {
    const webhook = await Webhook.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!webhook) {
      return res.status(404).json({ message: 'Webhook not found' });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get recent delivery events for a specific webhook
 */
export const getWebhookEvents = async (req: Request, res: Response) => {
  try {
    const events = await WebhookEvent.find({ webhookId: req.params.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
