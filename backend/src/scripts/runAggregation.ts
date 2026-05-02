import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { APILog } from '../models/APILog';
import { API } from '../models/API';
import { APIAnalytics } from '../models/APIAnalytics';
import { connectDB } from '../config/database';

dotenv.config();

const runAggregation = async () => {
  await connectDB();

  const apis = await API.find();
  console.log(`Aggregating data for ${apis.length} APIs...`);

  for (const api of apis) {
    // Aggregate for the last 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const logs = await APILog.find({
        apiId: api._id,
        timestamp: { $gte: date, $lt: nextDate },
      });

      if (logs.length === 0) continue;

      const totalRequests = logs.length;
      const successfulRequests = logs.filter(l => l.status >= 200 && l.status < 300).length;
      const failedRequests = totalRequests - successfulRequests;
      
      const latencies = logs.map(l => l.latency).sort((a, b) => a - b);
      const avgResponseTime = latencies.reduce((a, b) => a + b, 0) / totalRequests;
      const p95ResponseTime = latencies[Math.floor(latencies.length * 0.95)] || latencies[latencies.length - 1];
      const p99ResponseTime = latencies[Math.floor(latencies.length * 0.99)] || latencies[latencies.length - 1];

      const statusCodeDistribution: Record<string, number> = {};
      logs.forEach(l => {
        statusCodeDistribution[l.status] = (statusCodeDistribution[l.status] || 0) + 1;
      });

      const endpointCounts: Record<string, number> = {};
      logs.forEach(l => {
        endpointCounts[l.path] = (endpointCounts[l.path] || 0) + 1;
      });
      const topEndpoints = Object.entries(endpointCounts)
        .map(([endpoint, count]) => ({ endpoint, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const errorCounts: Record<string, number> = {};
      logs.filter(l => l.status >= 400).forEach(l => {
        const code = l.status.toString();
        errorCounts[code] = (errorCounts[code] || 0) + 1;
      });
      const errors = Object.entries(errorCounts).map(([code, count]) => ({ code, count }));

      const uniqueIPs = new Set(logs.map(l => l.ip)).size;

      await APIAnalytics.findOneAndUpdate(
        {
          apiId: api._id,
          userId: api.userId,
          period: 'daily',
          date: date,
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
              totalDataTransferred: 0,
              uniqueIPs,
              topEndpoints,
              statusCodeDistribution,
              errors,
            },
          },
        },
        { upsert: true }
      );
    }
  }

  console.log('Aggregation completed successfully.');
  process.exit(0);
};

runAggregation();
