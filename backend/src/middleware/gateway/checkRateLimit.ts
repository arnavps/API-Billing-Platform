import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../../config/redis';

export const checkRateLimit = async (req: Request, res: Response, next: NextFunction) => {
  const { api, apiKeyDoc } = req;

  if (!api || !apiKeyDoc) return next();

  const rateLimit = api.configuration.rateLimit;
  if (!rateLimit.enabled) return next();

  const keyId = apiKeyDoc._id.toString();
  const redisKey = `mf:ratelimit:${keyId}`;
  const now = Date.now();
  const windowStart = now - rateLimit.windowMs;

  try {
    const pipeline = redisClient.multi();

    // Remove old requests outside the window
    pipeline.zremrangebyscore(redisKey, 0, windowStart);
    
    // Count requests in current window
    pipeline.zcard(redisKey);
    
    // Add current request
    pipeline.zadd(redisKey, now, now.toString());
    
    // Set expiry for the key to cleanup
    pipeline.pexpire(redisKey, rateLimit.windowMs);

    const results = await pipeline.exec();
    
    if (!results) {
      throw new Error('Redis pipeline execution failed');
    }

    // Results format for ioredis: [[err, res], [err, res], ...]
    const count = results[1][1] as number;

    if (count >= rateLimit.maxRequests) {
      return res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please slow down.',
          retryAfter: Math.ceil(rateLimit.windowMs / 1000)
        }
      });
    }

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', rateLimit.maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, rateLimit.maxRequests - count - 1));
    res.setHeader('X-RateLimit-Reset', Math.ceil((now + rateLimit.windowMs) / 1000));

    next();
  } catch (error) {
    console.error('Rate Limit Error:', error);
    // Fail open? Or fail closed? For a billing platform, we might want to fail open but log it.
    // However, for security/integrity, let's just proceed to forwardRequest but log the error.
    next();
  }
};
