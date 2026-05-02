import mongoose, { Schema, Document } from 'mongoose';

export interface IUserAnalytics extends Document {
  userId: mongoose.Types.ObjectId;
  period: 'daily' | 'monthly';
  date: Date;
  metrics: {
    totalRequests: number;
    totalRevenue: number;
    activeAPIs: number;
    newUsers?: number;
    apiUsageBreakdown: {
      apiId: mongoose.Types.ObjectId;
      name: string;
      requestCount: number;
      revenue: number;
    }[];
  };
  updatedAt: Date;
}

const userAnalyticsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    period: {
      type: String,
      enum: ['daily', 'monthly'],
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
      totalRevenue: { type: Number, default: 0 },
      activeAPIs: { type: Number, default: 0 },
      apiUsageBreakdown: [
        {
          apiId: { type: Schema.Types.ObjectId, ref: 'API' },
          name: String,
          requestCount: Number,
          revenue: Number,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
userAnalyticsSchema.index({ userId: 1, period: 1, date: 1 }, { unique: true });

export const UserAnalytics = mongoose.model<IUserAnalytics>('UserAnalytics', userAnalyticsSchema);
