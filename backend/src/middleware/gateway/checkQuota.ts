import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../../config/redis';
import Subscription from '../../models/Subscription';
import { WebhookService } from '../../services/webhook.service';
import { NotificationService } from '../../services/notification.service';

export const checkQuota = async (req: Request, res: Response, next: NextFunction) => {
  const { api, apiKeyDoc } = req;

  if (!api || !apiKeyDoc) return next();

  // Pricing model for the specific API (set by the owner)
  const pricing = api.pricing;
  const ownerId = api.userId.toString();
  
  try {
    // 1. Check if the API Owner has an active subscription with MeterFlow
    const subscription = await Subscription.findOne({ userId: ownerId, status: 'active' }).populate('planId');
    
    let monthlyQuota = 1000; // Default fallback for free tier
    
    if (subscription && subscription.planId) {
      const plan = subscription.planId as any;
      monthlyQuota = plan.requestsQuota;
    }

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    // Redis key for total usage by this OWNER across all their APIs
    const ownerUsageKey = `mf:usage:owner:${ownerId}:${currentMonth}`;
    
    const ownerUsageCount = await redisClient.get(ownerUsageKey);
    const totalOwnerUsage = ownerUsageCount ? parseInt(ownerUsageCount) : 0;

    // Check for 80% warning
    const warningThreshold = monthlyQuota * 0.8;
    const warningKey = `mf:usage:warned:owner:${ownerId}:${currentMonth}`;

    if (totalOwnerUsage >= warningThreshold && totalOwnerUsage < monthlyQuota) {
      const alreadyWarned = await redisClient.get(warningKey);
      if (!alreadyWarned) {
        // Trigger usage warning
        await WebhookService.trigger(ownerId, 'usage.warning', {
          currentUsage: totalOwnerUsage,
          quota: monthlyQuota,
          percentage: 80,
        });

        await NotificationService.create(ownerId, {
          title: 'Usage Warning (80%)',
          message: `Your account has used 80% of your monthly request quota (${totalOwnerUsage}/${monthlyQuota}).`,
          type: 'warning',
          category: 'usage',
          actionUrl: '/dashboard/usage',
          actionText: 'View Usage',
        });

        // Mark as warned (expire at end of month or after 30 days)
        await redisClient.set(warningKey, 'true', 'EX', 30 * 24 * 60 * 60);
      }
    }

    if (totalOwnerUsage >= monthlyQuota) {
      // Trigger usage exceeded (if not already handled this session/period)
      const exceededKey = `mf:usage:exceeded:owner:${ownerId}:${currentMonth}`;
      const alreadyNotifiedExceeded = await redisClient.get(exceededKey);

      if (!alreadyNotifiedExceeded) {
        await WebhookService.trigger(ownerId, 'usage.exceeded', {
          currentUsage: totalOwnerUsage,
          quota: monthlyQuota,
        });

        await NotificationService.create(ownerId, {
          title: 'Quota Exceeded',
          message: `Your account has exceeded your monthly request quota (${monthlyQuota}). Further requests will be blocked.`,
          type: 'error',
          category: 'usage',
          actionUrl: '/dashboard/billing',
          actionText: 'Upgrade Plan',
        });

        await redisClient.set(exceededKey, 'true', 'EX', 30 * 24 * 60 * 60);
      }

      return res.status(403).json({
        error: {
          code: 'ACCOUNT_QUOTA_EXCEEDED',
          message: 'The API owner has exceeded their monthly processing quota. Please contact the owner.'
        }
      });
    }

    // 2. Check the specific API's pricing/quota (set by the owner for their consumers)
    if (pricing.model === 'free') {
      const consumerId = apiKeyDoc.userId.toString();
      const apiUsageKey = `mf:usage:api:${api._id}:consumer:${consumerId}:${currentMonth}`;
      
      const apiUsageCount = await redisClient.get(apiUsageKey);
      const currentApiUsage = apiUsageCount ? parseInt(apiUsageCount) : 0;

      if (pricing.freeQuota > 0 && currentApiUsage >= pricing.freeQuota) {
        return res.status(403).json({
          error: {
            code: 'API_QUOTA_EXCEEDED',
            message: 'You have exceeded the free quota for this API.'
          }
        });
      }
    }

    next();
  } catch (error) {
    console.error('Quota Check Error:', error);
    next();
  }
};
