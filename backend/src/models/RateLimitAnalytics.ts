import mongoose, { Schema, Document } from 'mongoose';

export interface IRateLimitAnalytics extends Document {
  apiId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  keyId: mongoose.Types.ObjectId;
  strategy: string;
  limit: number;
  timestamp: Date;
  ip?: string;
  userAgent?: string;
}

const rateLimitAnalyticsSchema = new Schema({
  apiId: { type: Schema.Types.ObjectId, ref: 'API', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  keyId: { type: Schema.Types.ObjectId, ref: 'APIKey', required: true, index: true },
  strategy: { type: String, required: true },
  limit: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
  ip: String,
  userAgent: String
});

export const RateLimitAnalytics = mongoose.model<IRateLimitAnalytics>('RateLimitAnalytics', rateLimitAnalyticsSchema);
