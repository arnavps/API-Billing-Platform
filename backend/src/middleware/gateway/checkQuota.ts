import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../../config/redis';
import Subscription from '../../models/Subscription';
import Plan from '../../models/Plan';

export const checkQuota = async (req: Request, res: Response, next: NextFunction) => {
  const { api, apiKeyDoc } = req;

  if (!api || !apiKeyDoc) return next();

  // Pricing model for the specific API (set by the owner)
  const pricing = api.pricing;
  const ownerId = api.userId.toString();
  
  try {
    // 1. Check if the API Owner has an active subscription with MeterFlow
    // (This limits how many requests the owner's account can process in total)
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

    if (totalOwnerUsage >= monthlyQuota) {
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
    next(); // Fail open for now, but in production we might want to fail closed or use a fallback
  }
};
