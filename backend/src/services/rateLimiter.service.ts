import { redisClient } from '../config/redis';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

export class RateLimiterService {
  /**
   * Sliding Window Counter
   * Most accurate for basic rate limiting, no burst support.
   */
  static async slidingWindow(
    keyId: string,
    limit: number,
    windowMs: number
  ): Promise<RateLimitResult> {
    const key = `rl:sw:${keyId}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    const pipeline = redisClient.multi();
    pipeline.zremrangebyscore(key, 0, windowStart);
    pipeline.zadd(key, now, `${now}-${Math.random()}`);
    pipeline.zcard(key);
    pipeline.pexpire(key, Math.ceil(windowMs / 1000) + 10);

    const results = await pipeline.exec();
    if (!results) throw new Error('Redis pipeline failed');

    const count = results[2][1] as number;
    const allowed = count <= limit;

    return {
      allowed,
      remaining: Math.max(0, limit - count),
      reset: now + windowMs,
      retryAfter: allowed ? undefined : Math.ceil(windowMs / 1000)
    };
  }

  /**
   * Token Bucket Algorithm
   * Allows burst traffic while maintaining average rate.
   * capacity: Burst limit
   * refillRate: How many tokens added per windowMs
   */
  static async tokenBucket(
    keyId: string,
    capacity: number,
    refillRate: number,
    windowMs: number
  ): Promise<RateLimitResult> {
    const key = `rl:tb:${keyId}`;
    const now = Date.now();
    const refillInterval = windowMs / refillRate;

    const data = await redisClient.hgetall(key);
    let tokens = data.tokens ? parseFloat(data.tokens) : capacity;
    let lastRefill = data.lastRefill ? parseInt(data.lastRefill) : now;

    // Calculate refill
    const elapsed = now - lastRefill;
    const refill = Math.floor(elapsed / refillInterval);
    
    if (refill > 0) {
      tokens = Math.min(capacity, tokens + refill);
      lastRefill = lastRefill + (refill * refillInterval);
    }

    let allowed = false;
    if (tokens >= 1) {
      tokens -= 1;
      allowed = true;
    }

    const pipeline = redisClient.multi();
    pipeline.hset(key, 'tokens', tokens, 'lastRefill', lastRefill);
    pipeline.pexpire(key, Math.ceil(refillInterval * capacity * 2));
    await pipeline.exec();

    return {
      allowed,
      remaining: Math.floor(tokens),
      reset: lastRefill + refillInterval,
      retryAfter: allowed ? undefined : Math.ceil(refillInterval / 1000)
    };
  }

  /**
   * Leaky Bucket Algorithm
   * Smooths out bursts into a steady output rate.
   * capacity: Queue size
   * leakRate: How many requests processed per windowMs
   */
  static async leakyBucket(
    keyId: string,
    capacity: number,
    leakRate: number,
    windowMs: number
  ): Promise<RateLimitResult> {
    const key = `rl:lb:${keyId}`;
    const now = Date.now();
    const leakInterval = windowMs / leakRate;

    const data = await redisClient.hgetall(key);
    let level = data.level ? parseFloat(data.level) : 0;
    let lastLeak = data.lastLeak ? parseInt(data.lastLeak) : now;

    // Calculate leaks
    const elapsed = now - lastLeak;
    const leaked = Math.floor(elapsed / leakInterval);
    
    if (leaked > 0) {
      level = Math.max(0, level - leaked);
      lastLeak = lastLeak + (leaked * leakInterval);
    }

    let allowed = false;
    if (level < capacity) {
      level += 1;
      allowed = true;
    }

    const pipeline = redisClient.multi();
    pipeline.hset(key, 'level', level, 'lastLeak', lastLeak);
    pipeline.pexpire(key, Math.ceil(leakInterval * capacity * 2));
    await pipeline.exec();

    return {
      allowed,
      remaining: Math.floor(capacity - level),
      reset: lastLeak + leakInterval,
      retryAfter: allowed ? undefined : Math.ceil(leakInterval / 1000)
    };
  }
}
