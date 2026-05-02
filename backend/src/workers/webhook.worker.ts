import { Worker, Job } from 'bullmq';
import { WebhookService } from '../services/webhook.service';

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379');

const worker = new Worker('webhook-delivery', async (job: Job) => {
  if (job.name === 'deliver') {
    try {
      await WebhookService.deliver(job.data);
      console.log(`Successfully delivered webhook job ${job.id}`);
    } catch (error) {
      console.error(`Failed to deliver webhook job ${job.id}:`, error);
      // Re-throw so BullMQ knows the job failed and can retry if configured
      throw error;
    }
  }
}, {
  connection: { host: redisHost, port: redisPort },
  concurrency: 10,
  limiter: {
    max: 100,
    duration: 1000
  }
});

worker.on('completed', (job) => {
  console.log(`Webhook job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Webhook job ${job?.id} failed with error: ${err.message}`);
});

console.log('Webhook worker started');

export default worker;
