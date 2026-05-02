import { Worker, Job } from 'bullmq';
import { APILog } from '../models/APILog';
import { API } from '../models/API';
import { redisClient } from '../config/redis';
import { SocketService } from '../services/socket.service';

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

        // 3. Update Redis Quota
        const currentMonth = new Date().toISOString().slice(0, 7);
        const quotaKey = `mf:quota:${data.userId}:${data.apiId}:${currentMonth}`;
        
        await redisClient.incr(quotaKey);
        // Set expiry for 2 months to be safe
        await redisClient.expire(quotaKey, 60 * 60 * 24 * 60);

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

usageWorker.on('completed', (job) => {
  // console.log(`Job ${job.id} completed`);
});

usageWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});
