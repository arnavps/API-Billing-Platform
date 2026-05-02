import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';

export interface IAPIKey extends Document {
  apiId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  key: string; // Hashed version
  prefix: string; // First few characters (e.g., mf_live_...)
  lastFour: string; // Last 4 characters for display
  type: 'live' | 'test';
  status: 'active' | 'revoked' | 'expired';
  permissions: {
    read: boolean;
    write: boolean;
    delete: boolean;
  };
  rateLimit: {
    maxRequests: number;
    windowMs: number;
  };
  quota: {
    limit: number;
    used: number;
    resetAt: Date;
  };
  restrictions: {
    allowedIPs: string[];
    allowedDomains: string[];
    allowedMethods: Array<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>;
  };
  expiresAt?: Date;
  lastUsedAt?: Date;
  rotatedFrom?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const apiKeySchema = new Schema(
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
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    prefix: {
      type: String,
      required: true,
    },
    lastFour: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['live', 'test'],
      default: 'test',
    },
    status: {
      type: String,
      enum: ['active', 'revoked', 'expired'],
      default: 'active',
    },
    permissions: {
      read: { type: Boolean, default: true },
      write: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
    rateLimit: {
      maxRequests: { type: Number, default: 1000 },
      windowMs: { type: Number, default: 3600000 }, // 1 hour
    },
    quota: {
      limit: { type: Number, default: 10000 },
      used: { type: Number, default: 0 },
      resetAt: { type: Date, default: () => new Date(new Date().setMonth(new Date().getMonth() + 1)) },
    },
    restrictions: {
      allowedIPs: [String],
      allowedDomains: [String],
      allowedMethods: {
        type: [String],
        enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        default: ['GET'],
      },
    },
    expiresAt: Date,
    lastUsedAt: Date,
    rotatedFrom: {
      type: Schema.Types.ObjectId,
      ref: 'APIKey',
    },
  },
  {
    timestamps: true,
  }
);

export const APIKey = mongoose.model<IAPIKey>('APIKey', apiKeySchema);
