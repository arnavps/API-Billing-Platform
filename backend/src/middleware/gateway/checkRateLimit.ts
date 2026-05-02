import { Request, Response, NextFunction } from 'express';
import { RateLimiterService, RateLimitResult } from '../../services/rateLimiter.service';
import { SocketService } from '../../services/socket.service';
import { WebhookService } from '../../services/webhook.service';

export const checkRateLimit = async (req: Request, res: Response, next: NextFunction) => {
  const { api, apiKeyDoc } = req;

  if (!api || !apiKeyDoc) return next();

  const rateLimit = api.configuration.rateLimit;
  if (!rateLimit.enabled) return next();

  const keyId = apiKeyDoc._id.toString();
  const strategy = rateLimit.strategy || 'sliding_window';
  
  try {
    let result: RateLimitResult;

    switch (strategy) {
      case 'token_bucket':
        result = await RateLimiterService.tokenBucket(
          keyId,
          rateLimit.burstCapacity || rateLimit.maxRequests,
          rateLimit.maxRequests,
          rateLimit.windowMs
        );
        break;
      case 'leaky_bucket':
        result = await RateLimiterService.leakyBucket(
          keyId,
          rateLimit.maxRequests,
          rateLimit.maxRequests,
          rateLimit.windowMs
        );
        break;
      case 'sliding_window':
      default:
        result = await RateLimiterService.slidingWindow(
          keyId,
          rateLimit.maxRequests,
          rateLimit.windowMs
        );
        break;
    }

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', rateLimit.maxRequests);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(result.reset / 1000));

    if (!result.allowed) {
      const userId = api.userId.toString();

      // Emit rate limit event via socket
      SocketService.emitToUser(userId, 'rate_limit_hit', {
        apiId: api._id,
        apiName: api.name,
        keyId,
        timestamp: new Date(),
        limit: rateLimit.maxRequests,
        strategy
      });

      // Trigger Webhook
      await WebhookService.trigger(userId, 'rate_limit.hit', {
        apiId: api._id,
        keyId,
        strategy,
        limit: rateLimit.maxRequests,
      });

      return res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Rate limit exceeded (${strategy}). Please slow down.`,
          retryAfter: result.retryAfter
        }
      });
    }

    next();
  } catch (error) {
    console.error('Rate Limit Error:', error);
    // Fail open in case of Redis/Service issues
    next();
  }
};
