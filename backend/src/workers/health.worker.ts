import { Queue, Worker, QueueEvents } from 'bullmq';
import { redisClient } from '../config/redis';
import { HealthService } from '../services/health.service';

const healthQueue = new Queue('health-checks', {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
});

const worker = new Worker(
  'health-checks',
  async (job) => {
    if (job.name === 'check-all-apis') {
      await HealthService.checkAllAPIs();
    }
  },
  { connection: redisClient }
);

// Schedule the health check every 5 minutes
export const scheduleHealthChecks = async () => {
  await healthQueue.add(
    'check-all-apis',
    {},
    {
      repeat: {
        pattern: '*/5 * * * *', // Every 5 minutes
      },
    }
  );
};

export default worker;
