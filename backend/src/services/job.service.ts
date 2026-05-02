import { Queue } from 'bullmq';
import { usageQueue, aggregationQueue } from '../config/queues';

export class JobService {
  /**
   * Queue a log request job
   */
  static async queueLogRequest(data: any) {
    await usageQueue.add('log-request', data, {
      removeOnComplete: true,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }

  /**
   * Queue an aggregation job
   */
  static async queueAggregation(type: 'hourly' | 'daily', userId: string, apiId: string, date: Date) {
    await aggregationQueue.add(`aggregate-${type}`, {
      type,
      userId,
      apiId,
      date,
    }, {
      jobId: `${type}:${apiId}:${date.getTime()}`, // Prevent duplicates
      removeOnComplete: true,
    });
  }

  /**
   * Schedule recurring aggregation tasks
   * In a real app, this would be handled by a scheduler (e.g. node-cron or BullMQ repeatable jobs)
   */
  static async scheduleAggregations() {
    // This is a placeholder for repeatable job setup
    // await aggregationQueue.add('cleanup', {}, { repeat: { cron: '0 0 * * *' } });
  }
}
