import { Worker, Job } from 'bullmq';
import mongoose from 'mongoose';
import { APILog } from '../models/APILog';
import { APIAnalytics } from '../models/APIAnalytics';
import { API } from '../models/API';
import { redisClient } from '../config/redis';

export const aggregationWorker = new Worker(
  'analytics-aggregation',
  async (job: Job) => {
    const { type, userId, apiId, date } = job.data;
    const targetDate = new Date(date);
    
    console.log(`Running ${type} aggregation for ${apiId} on ${targetDate.toISOString()}`);

    let startTime: Date;
    let endTime: Date;

    if (type === 'hourly') {
      startTime = new Date(targetDate);
      startTime.setMinutes(0, 0, 0);
      endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);
    } else if (type === 'daily') {
      startTime = new Date(targetDate);
      startTime.setHours(0, 0, 0, 0);
      endTime = new Date(startTime);
      endTime.setDate(startTime.getDate() + 1);
    } else {
      return;
    }

    // Match logs within the time period
    const logs = await APILog.find({
      apiId: new mongoose.Types.ObjectId(apiId),
      timestamp: { $gte: startTime, $lt: endTime },
    });

    if (logs.length === 0) return;

    // Perform Aggregation
    const totalRequests = logs.length;
    const successfulRequests = logs.filter(l => l.status >= 200 && l.status < 300).length;
    const failedRequests = totalRequests - successfulRequests;
    
    const latencies = logs.map(l => l.latency).sort((a, b) => a - b);
    const avgResponseTime = latencies.reduce((a, b) => a + b, 0) / totalRequests;
    const p95ResponseTime = latencies[Math.floor(latencies.length * 0.95)] || latencies[latencies.length - 1];
    const p99ResponseTime = latencies[Math.floor(latencies.length * 0.99)] || latencies[latencies.length - 1];

    // Status Code Distribution
    const statusCodeDistribution: Record<string, number> = {};
    logs.forEach(l => {
      statusCodeDistribution[l.status] = (statusCodeDistribution[l.status] || 0) + 1;
    });

    // Top Endpoints
    const endpointCounts: Record<string, number> = {};
    logs.forEach(l => {
      endpointCounts[l.path] = (endpointCounts[l.path] || 0) + 1;
    });
    const topEndpoints = Object.entries(endpointCounts)
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Errors
    const errorCounts: Record<string, number> = {};
    logs.filter(l => l.status >= 400).forEach(l => {
      const code = l.status.toString();
      errorCounts[code] = (errorCounts[code] || 0) + 1;
    });
    const errors = Object.entries(errorCounts).map(([code, count]) => ({ code, count }));

    // Unique IPs
    const uniqueIPs = new Set(logs.map(l => l.ip)).size;

    // Update or Create APIAnalytics
    await APIAnalytics.findOneAndUpdate(
      {
        apiId: new mongoose.Types.ObjectId(apiId),
        userId: new mongoose.Types.ObjectId(userId),
        period: type,
        date: startTime,
      },
      {
        $set: {
          metrics: {
            totalRequests,
            successfulRequests,
            failedRequests,
            avgResponseTime,
            p95ResponseTime,
            p99ResponseTime,
            totalDataTransferred: 0, // Placeholder
            uniqueIPs,
            topEndpoints,
            statusCodeDistribution,
            errors,
          },
        },
      },
      { upsert: true, new: true }
    );
  },
  {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
  }
);
