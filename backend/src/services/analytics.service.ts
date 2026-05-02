import mongoose from 'mongoose';
import { APIAnalytics } from '../models/APIAnalytics';
import { UserAnalytics } from '../models/UserAnalytics';
import { APILog } from '../models/APILog';
import { API } from '../models/API';

export class AnalyticsService {
  /**
   * Get overview stats for a user across all APIs
   */
  static async getUserOverview(userId: string, period: '24h' | '7d' | '30d' | '90d') {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
    }

    // Get aggregated data from APIAnalytics
    const analytics = await APIAnalytics.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: startDate },
          period: period === '24h' ? 'hourly' : 'daily',
        },
      },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: '$metrics.totalRequests' },
          successfulRequests: { $sum: '$metrics.successfulRequests' },
          failedRequests: { $sum: '$metrics.failedRequests' },
          avgLatency: { $avg: '$metrics.avgResponseTime' },
          totalData: { $sum: '$metrics.totalDataTransferred' },
        },
      },
    ]);

    const stats = analytics[0] || {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      avgLatency: 0,
      totalData: 0,
    };

    // Calculate success rate
    const successRate = stats.totalRequests > 0 
      ? (stats.successfulRequests / stats.totalRequests) * 100 
      : 100;

    return {
      ...stats,
      successRate,
    };
  }

  /**
   * Get time-series data for requests and latency
   */
  static async getTimeSeriesData(
    userId: string, 
    apiId?: string, 
    period: '24h' | '7d' | '30d' = '24h'
  ) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const apiObjectId = apiId ? new mongoose.Types.ObjectId(apiId) : null;
    
    const now = new Date();
    let startDate = new Date();
    let interval: 'hourly' | 'daily' = 'daily';

    if (period === '24h') {
      startDate.setHours(now.getHours() - 24);
      interval = 'hourly';
    } else if (period === '7d') {
      startDate.setDate(now.getDate() - 7);
      interval = 'daily';
    } else {
      startDate.setDate(now.getDate() - 30);
      interval = 'daily';
    }

    const matchQuery: any = {
      userId: userObjectId,
      date: { $gte: startDate },
      period: interval,
    };

    if (apiObjectId) {
      matchQuery.apiId = apiObjectId;
    }

    const data = await APIAnalytics.find(matchQuery)
      .sort({ date: 1 })
      .select('date metrics.totalRequests metrics.avgResponseTime metrics.successfulRequests metrics.failedRequests');

    return data.map(item => ({
      timestamp: item.date,
      requests: item.metrics.totalRequests,
      latency: item.metrics.avgResponseTime,
      success: item.metrics.successfulRequests,
      failed: item.metrics.failedRequests,
    }));
  }

  /**
   * Get top endpoints for a specific API or across all APIs
   */
  static async getTopEndpoints(userId: string, apiId?: string, limit: number = 5) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const apiObjectId = apiId ? new mongoose.Types.ObjectId(apiId) : null;

    const matchQuery: any = {
      userId: userObjectId,
      period: 'daily',
      date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
    };

    if (apiObjectId) {
      matchQuery.apiId = apiObjectId;
    }

    const results = await APIAnalytics.aggregate([
      { $match: matchQuery },
      { $unwind: '$metrics.topEndpoints' },
      {
        $group: {
          _id: '$metrics.topEndpoints.endpoint',
          count: { $sum: '$metrics.topEndpoints.count' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);

    return results.map(r => ({
      endpoint: r._id,
      count: r.count,
    }));
  }

  /**
   * Get error distribution
   */
  static async getErrorBreakdown(userId: string, apiId?: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const apiObjectId = apiId ? new mongoose.Types.ObjectId(apiId) : null;

    const matchQuery: any = {
      userId: userObjectId,
      period: 'daily',
      date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    };

    if (apiObjectId) {
      matchQuery.apiId = apiObjectId;
    }

    const results = await APIAnalytics.aggregate([
      { $match: matchQuery },
      { $unwind: '$metrics.errors' },
      {
        $group: {
          _id: '$metrics.errors.code',
          count: { $sum: '$metrics.errors.count' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return results.map(r => ({
      code: r._id,
      count: r.count,
    }));
  }
}
