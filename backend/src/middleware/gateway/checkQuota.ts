import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../../config/redis';

export const checkQuota = async (req: Request, res: Response, next: NextFunction) => {
  const { api, apiKeyDoc } = req;

  if (!api || !apiKeyDoc) return next();

  // pricing.model: 'free' | 'pay_per_request' | 'subscription' | 'hybrid'
  const pricing = api.pricing;
  
  // If it's pay_per_request, we don't necessarily have a hard quota check here, 
  // but we might check if their payment method is valid in a real scenario.
  if (pricing.model === 'pay_per_request') return next();

  const userId = api.userId.toString();
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const redisKey = `mf:quota:${userId}:${api._id}:${currentMonth}`;

  try {
    const currentUsage = await redisClient.get(redisKey);
    const usageCount = currentUsage ? parseInt(currentUsage) : 0;

    if (pricing.freeQuota > 0 && usageCount >= pricing.freeQuota) {
      // In a real app, we'd check if they have a paid subscription here.
      // For now, if they hit the free quota and the model is 'free', block them.
      if (pricing.model === 'free') {
        return res.status(403).json({
          error: {
            code: 'QUOTA_EXCEEDED',
            message: 'Monthly quota exceeded for this API.'
          }
        });
      }
    }

    // We increment the usage in the logUsage middleware or worker, 
    // but we check it here to block before forwarding.
    next();
  } catch (error) {
    console.error('Quota Check Error:', error);
    next();
  }
};
