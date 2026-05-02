import mongoose, { Schema, Document } from 'mongoose';

export interface IAPILog extends Document {
  apiId: mongoose.Types.ObjectId;
  apiKeyId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // API Owner
  method: string;
  path: string;
  status: number;
  latency: number;
  ip: string;
  userAgent: string;
  request: {
    headers: Record<string, any>;
    body: any;
  };
  response: {
    headers: Record<string, any>;
    body: any;
  };
  timestamp: Date;
}

const apiLogSchema = new Schema(
  {
    apiId: {
      type: Schema.Types.ObjectId,
      ref: 'API',
      required: true,
      index: true,
    },
    apiKeyId: {
      type: Schema.Types.ObjectId,
      ref: 'APIKey',
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    method: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    status: {
      type: Number,
      required: true,
      index: true,
    },
    latency: {
      type: Number,
      required: true,
    },
    ip: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    request: {
      headers: { type: Map, of: Schema.Types.Mixed },
      body: Schema.Types.Mixed,
    },
    response: {
      headers: { type: Map, of: Schema.Types.Mixed },
      body: Schema.Types.Mixed,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false, // We use our own timestamp
  }
);

// TTL index to automatically delete logs after 30 days (default)
apiLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const APILog = mongoose.model<IAPILog>('APILog', apiLogSchema);
