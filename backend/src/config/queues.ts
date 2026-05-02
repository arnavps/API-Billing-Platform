import { Queue } from 'bullmq';
import { redisClient } from './redis';

export const usageQueue = new Queue('usage-logs', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  }
});
