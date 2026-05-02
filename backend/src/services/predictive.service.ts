import { Usage } from '../models/Usage';
import mongoose from 'mongoose';

export class PredictiveService {
  /**
   * Forecasts usage for the next N days based on last 30 days of data
   */
  static async forecastUsage(apiId: string, days: number = 7): Promise<any[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const history = await Usage.aggregate([
      {
        $match: {
          apiId: new mongoose.Types.ObjectId(apiId),
          timestamp: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    if (history.length < 2) return [];

    // Simple Linear Regression: y = mx + b
    const n = history.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    history.forEach((day, index) => {
      sumX += index;
      sumY += day.count;
      sumXY += index * day.count;
      sumX2 += index * index;
    });

    const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const b = (sumY - m * sumX) / n;

    const forecast = [];
    const lastDate = new Date(history[history.length - 1]._id);

    for (let i = 1; i <= days; i++) {
      const nextDate = new Date(lastDate);
      nextDate.setDate(lastDate.getDate() + i);
      
      const x = n + i - 1;
      const predictedCount = Math.max(0, Math.round(m * x + b));
      
      forecast.push({
        date: nextDate.toISOString().split('T')[0],
        predictedCount,
      });
    }

    return forecast;
  }
}
