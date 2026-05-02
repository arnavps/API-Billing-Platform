import mongoose, { Schema, Document } from 'mongoose';

export interface IAPIAnalytics extends Document {
  apiId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  period: 'hourly' | 'daily' | 'monthly';
  date: Date;
  metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    avgResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    totalDataTransferred: number;
    uniqueIPs: number;
    topEndpoints: {
      endpoint: string;
      count: number;
    }[];
    statusCodeDistribution: Record<string, number>;
    errors: {
      code: string;
      count: number;
    }[];
  };
  updatedAt: Date;
}

const apiAnalyticsSchema = new Schema(
  {
    apiId: {
      type: Schema.Types.ObjectId,
      ref: 'API',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    period: {
      type: String,
      enum: ['hourly', 'daily', 'monthly'],
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    metrics: {
      totalRequests: { type: Number, default: 0 },
      successfulRequests: { type: Number, default: 0 },
      failedRequests: { type: Number, default: 0 },
      avgResponseTime: { type: Number, default: 0 },
      p95ResponseTime: { type: Number, default: 0 },
      p99ResponseTime: { type: Number, default: 0 },
      totalDataTransferred: { type: Number, default: 0 },
      uniqueIPs: { type: Number, default: 0 },
      topEndpoints: [
        {
          endpoint: String,
          count: Number,
        },
      ],
      statusCodeDistribution: {
        type: Map,
        of: Number,
        default: {},
      },
      errors: [
        {
          code: String,
          count: Number,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
apiAnalyticsSchema.index({ apiId: 1, period: 1, date: 1 }, { unique: true });
apiAnalyticsSchema.index({ userId: 1, period: 1, date: 1 });

export const APIAnalytics = mongoose.model<IAPIAnalytics>('APIAnalytics', apiAnalyticsSchema);
