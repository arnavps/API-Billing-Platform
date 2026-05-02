import { Worker, Job } from 'bullmq';
import { WebhookService } from '../services/webhook.service';

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379');

export const webhookWorker = new Worker(
  'webhook-delivery',
  async (job: Job) => {
    if (job.name === 'deliver') {
      await WebhookService.deliver(job.data);
    }
  },
  {
    connection: {
      host: redisHost,
      port: redisPort,
    },
    concurrency: 50, // Handle many deliveries in parallel
  }
);

webhookWorker.on('completed', (job) => {
  // console.log(`Webhook job ${job.id} completed successfully`);
});

webhookWorker.on('failed', (job, err) => {
  console.error(`Webhook job ${job?.id} failed after retries:`, err);
});
