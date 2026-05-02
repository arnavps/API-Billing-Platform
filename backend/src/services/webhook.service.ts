import axios from 'axios';
import crypto from 'crypto';
import { Webhook } from '../models/Webhook';
import { WebhookEvent } from '../models/WebhookEvent';
import { Queue } from 'bullmq';

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379');

const webhookQueue = new Queue('webhook-delivery', { 
  connection: { host: redisHost, port: redisPort } 
});

export class WebhookService {
  /**
   * Triggers webhooks for a specific user and event
   */
  static async trigger(userId: string, event: string, payload: any, apiId?: string) {
    // Find active webhooks for this user and event
    // We search for webhooks that either have no apiId (account-wide) or match the specific apiId
    const query: any = { 
      userId, 
      status: 'active', 
      enabledEvents: event 
    };
    
    if (apiId) {
      query.$or = [{ apiId }, { apiId: { $exists: false } }];
    } else {
      query.apiId = { $exists: false };
    }

    const webhooks = await Webhook.find(query);

    for (const webhook of webhooks) {
      // Create event log
      const eventLog = await WebhookEvent.create({
        webhookId: webhook._id,
        event,
        payload,
        status: 'pending',
      });

      // Add to queue for delivery with retries
      await webhookQueue.add('deliver', {
        webhookId: webhook._id,
        eventId: eventLog._id,
        url: webhook.url,
        secret: webhook.secret,
        payload,
      }, {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
      });
    }
  }

  /**
   * Generates a HMAC-SHA256 signature for the payload
   */
  static generateSignature(secret: string, payload: any): string {
    return crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
  }

  /**
   * Performs the actual HTTP request to the webhook URL
   */
  static async deliver(data: {
    webhookId: string;
    eventId: string;
    url: string;
    secret: string;
    payload: any;
  }) {
    const signature = this.generateSignature(data.secret, data.payload);
    const eventLog = await WebhookEvent.findById(data.eventId);

    if (!eventLog) return;

    eventLog.attempts += 1;
    eventLog.lastAttemptAt = new Date();

    try {
      const response = await axios.post(data.url, data.payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-MeterFlow-Signature': signature,
          'X-MeterFlow-Event': eventLog.event,
          'User-Agent': 'MeterFlow-Webhook-Delivery/1.0',
        },
        timeout: 10000,
      });

      eventLog.status = 'delivered';
      eventLog.responseStatus = response.status;
      eventLog.responseBody = JSON.stringify(response.data).substring(0, 1000);
      await eventLog.save();
    } catch (error: any) {
      eventLog.status = 'failed';
      eventLog.responseStatus = error.response?.status;
      eventLog.responseBody = JSON.stringify(error.response?.data || error.message).substring(0, 1000);
      await eventLog.save();
      
      // Re-throw to trigger BullMQ retry logic
      throw error;
    }
  }
}
