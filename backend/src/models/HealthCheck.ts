import mongoose, { Schema, Document } from 'mongoose';

export interface IHealthCheck extends Document {
  apiId: mongoose.Types.ObjectId;
  status: 'up' | 'down' | 'degraded';
  responseTime: number; // ms
  statusCode: number;
  error?: string;
  checkedAt: Date;
}

const HealthCheckSchema: Schema = new Schema({
  apiId: { type: Schema.Types.ObjectId, ref: 'API', required: true, index: true },
  status: {
    type: String,
    enum: ['up', 'down', 'degraded'],
    required: true,
  },
  responseTime: { type: Number, required: true },
  statusCode: { type: Number, required: true },
  error: { type: String },
  checkedAt: { type: Date, default: Date.now, index: true },
});

export const HealthCheck = mongoose.model<IHealthCheck>('HealthCheck', HealthCheckSchema);
