import axios from 'axios';
import crypto from 'crypto';
import { Webhook, WebhookEvent } from '../models/Webhook';
import { WebhookDelivery } from '../models/WebhookDelivery';
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
  static async trigger(userId: string, event: WebhookEvent, data: any, apiId?: string) {
    // Find matching webhooks
    const query: any = {
      userId,
      events: event,
      status: 'active'
    };

    if (apiId) {
      query.$or = [{ apiId }, { apiId: null }];
    } else {
      query.apiId = null;
    }

    const webhooks = await Webhook.find(query);

    for (const webhook of webhooks) {
      await this.queueDelivery(webhook, event, data);
    }
  }

  /**
   * Queues a webhook delivery
   */
  static async queueDelivery(webhook: any, event: string, data: any) {
    const payload = {
      event,
      timestamp: new Date().toISOString(),
      data
    };

    const delivery = await WebhookDelivery.create({
      webhookId: webhook._id,
      event,
      payload,
      status: 'pending'
    });

    await webhookQueue.add('deliver', {
      webhookId: webhook._id,
      deliveryId: delivery._id,
      url: webhook.url,
      secret: webhook.secret,
      payload
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 60000, // 1 minute base
      },
      removeOnComplete: true
    });
  }

  /**
   * Generates a HMAC-SHA256 signature for the payload
   */
  static generateSignature(payload: any, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
  }

  /**
   * Performs the actual HTTP request to the webhook URL
   * This is typically called by the BullMQ worker
   */
  static async deliver(data: {
    webhookId: string;
    deliveryId: string;
    url: string;
    secret: string;
    payload: any;
  }) {
    const signature = this.generateSignature(data.payload, data.secret);
    const delivery = await WebhookDelivery.findById(data.deliveryId);
    const webhook = await Webhook.findById(data.webhookId);

    if (!delivery || !webhook) return;

    delivery.attempts += 1;
    const start = Date.now();

    try {
      const response = await axios.post(data.url, data.payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-MeterFlow-Signature': signature,
          'X-MeterFlow-Event': delivery.event,
          'User-Agent': 'MeterFlow-Webhook-Delivery/1.0',
        },
        timeout: 10000,
      });

      const deliveryTime = Date.now() - start;

      delivery.status = 'success';
      delivery.response = {
        status: response.status,
        body: JSON.stringify(response.data).substring(0, 5000),
        headers: response.headers
      };
      delivery.deliveryTime = deliveryTime;
      await delivery.save();

      await Webhook.findByIdAndUpdate(webhook._id, {
        lastTriggeredAt: new Date(),
        lastSuccessAt: new Date(),
        failureCount: 0
      });

    } catch (error: any) {
      const deliveryTime = Date.now() - start;
      
      delivery.status = 'failed';
      delivery.response = {
        status: error.response?.status || 0,
        body: (error.response?.data ? JSON.stringify(error.response.data) : error.message).substring(0, 5000),
        headers: error.response?.headers
      };
      delivery.deliveryTime = deliveryTime;
      
      // Calculate next retry time if BullMQ is going to retry
      // (This is just for visibility in the DB, BullMQ handles actual timing)
      const backoff = Math.pow(2, delivery.attempts) * 60000;
      delivery.nextRetryAt = new Date(Date.now() + backoff);
      
      await delivery.save();

      await Webhook.findByIdAndUpdate(webhook._id, {
        $inc: { failureCount: 1 },
        lastTriggeredAt: new Date(),
        lastFailureAt: new Date()
      });

      // Disable webhook after 5 consecutive failures
      // We check if failureCount + 1 (current attempt) >= 5
      if (webhook.failureCount + 1 >= 5) {
        await Webhook.findByIdAndUpdate(webhook._id, {
          status: 'failed'
        });
        // TODO: Notification for disabled webhook
      }

      // Re-throw to trigger BullMQ retry logic
      throw error;
    }
  }
}
