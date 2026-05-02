import { Worker, Job } from 'bullmq';
import { APILog } from '../models/APILog';
import { API } from '../models/API';
import { User } from '../models/User';
import Plan from '../models/Plan';
import { redisClient } from '../config/redis';
import { SocketService } from '../services/socket.service';
import { NotificationService } from '../services/notification.service';
import { WebhookService } from '../services/webhook.service';

export const usageWorker = new Worker(
  'usage-logs',
  async (job: Job) => {
    if (job.name === 'log-request') {
      const data = job.data;

      try {
        // 1. Save to MongoDB
        await APILog.create(data);

        // 2. Update API Analytics
        const isSuccess = data.response.status >= 200 && data.response.status < 300;
        
        await API.findByIdAndUpdate(data.apiId, {
          $inc: {
            'analytics.totalRequests': 1,
            [isSuccess ? 'analytics.successfulRequests' : 'analytics.failedRequests']: 1,
          },
          $set: {
            'analytics.lastRequestAt': new Date(),
          },
        });

        // 3. Update Redis Quotas
        const currentMonth = new Date().toISOString().slice(0, 7);
        
        // a. API Owner's total account usage (MeterFlow Plan Quota)
        const ownerUsageKey = `mf:usage:owner:${data.userId}:${currentMonth}`;
        await redisClient.incr(ownerUsageKey);
        await redisClient.expire(ownerUsageKey, 60 * 60 * 24 * 60);

        // b. Consumer's usage for this specific API (API specific Quota)
        const apiUsageKey = `mf:usage:api:${data.apiId}:consumer:${data.consumerId}:${currentMonth}`;
        await redisClient.incr(apiUsageKey);
        await redisClient.expire(apiUsageKey, 60 * 60 * 24 * 60);

        // c. Old quota key (for backward compatibility if needed)
        const legacyQuotaKey = `mf:quota:${data.userId}:${data.apiId}:${currentMonth}`;
        await redisClient.incr(legacyQuotaKey);
        await redisClient.expire(legacyQuotaKey, 60 * 60 * 24 * 60);

        // 4. Emit Real-time Update via Socket.io
        SocketService.emitToUser(data.userId, 'usage-update', {
          apiId: data.apiId,
          status: data.response.status,
          latency: data.latency,
          timestamp: new Date(),
        });

        SocketService.emitToUser(data.userId, 'realtime-log', {
          ...data,
          timestamp: new Date(),
        });

        // 5. Check Quota Thresholds and Notify
        await checkQuotaThresholds(data.userId, data.apiId);

      } catch (error) {
        console.error('Error in usage worker:', error);
        throw error;
      }
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
  }
);

async function checkQuotaThresholds(userId: string, apiId: string) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const ownerUsageKey = `mf:usage:owner:${userId}:${currentMonth}`;
  
  const currentUsage = await redisClient.get(ownerUsageKey);
  const usage = currentUsage ? parseInt(currentUsage) : 0;

  // Cache/Fetch plan quota
  const user = await User.findById(userId);
  if (!user) return;

  const subscription = user.subscription;
  // This is a bit simplified, usually we'd have the plan object or ID
  // For now, let's assume standard quotas or fetch the plan
  const plan = await Plan.findOne({ name: subscription.plan });
  if (!plan) return;

  const quota = plan.requestsQuota;
  if (quota <= 0) return;

  const percentage = (usage / quota) * 100;

  // 80% Threshold
  if (percentage >= 80 && percentage < 100) {
    const lockKey = `mf:notif:80:${userId}:${currentMonth}`;
    const alreadyNotified = await redisClient.get(lockKey);

    if (!alreadyNotified) {
      await NotificationService.notify(userId, {
        title: 'Quota Warning',
        message: `Your account has reached 80% of your monthly request quota (${usage.toLocaleString()} / ${quota.toLocaleString()}).`,
        type: 'warning',
        link: '/dashboard/billing'
      });

      await WebhookService.trigger(userId, 'quota.warning', {
        usage,
        quota,
        percentage,
        month: currentMonth
      });

      await redisClient.set(lockKey, 'true', 'EX', 60 * 60 * 24 * 31);
    }
  }

  // 100% Threshold
  if (percentage >= 100) {
    const lockKey = `mf:notif:100:${userId}:${currentMonth}`;
    const alreadyNotified = await redisClient.get(lockKey);

    if (!alreadyNotified) {
      await NotificationService.notify(userId, {
        title: 'Quota Exceeded',
        message: `Your account has exceeded your monthly request quota. APIs will be rate-limited until the next cycle or upgrade.`,
        type: 'error',
        link: '/dashboard/billing'
      });

      await WebhookService.trigger(userId, 'quota.exceeded', {
        usage,
        quota,
        percentage,
        month: currentMonth
      });

      await redisClient.set(lockKey, 'true', 'EX', 60 * 60 * 24 * 31);
    }
  }
}

usageWorker.on('completed', (job) => {
  // console.log(`Job ${job.id} completed`);
});

usageWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});
