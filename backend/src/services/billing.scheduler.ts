import { billingQueue } from '../config/queues';

export class BillingScheduler {
  static async init() {
    // 1. Daily usage sync trigger (runs at midnight)
    await billingQueue.add(
      'daily-sync-trigger',
      { type: 'trigger-daily-sync' },
      { 
        repeat: { pattern: '0 0 * * *' },
        jobId: 'daily-sync-trigger'
      }
    );

    // 2. Monthly cycle closure trigger (runs at 1 AM on the 1st of every month)
    await billingQueue.add(
      'monthly-close-trigger',
      { type: 'trigger-monthly-close' },
      { 
        repeat: { pattern: '0 1 1 * *' },
        jobId: 'monthly-close-trigger'
      }
    );

    // 3. Daily payment retry trigger (runs at 2 AM)
    await billingQueue.add(
      'payment-retry-trigger',
      { type: 'trigger-payment-retry' },
      { 
        repeat: { pattern: '0 2 * * *' },
        jobId: 'payment-retry-trigger'
      }
    );

    console.log('🚀 Billing Scheduler initialized with repeatable jobs');
  }
}
