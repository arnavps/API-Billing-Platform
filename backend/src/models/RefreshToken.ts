import mongoose, { Schema, Document } from 'mongoose';

export interface IRefreshToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  isRevoked: boolean;
  deviceInfo?: {
    userAgent?: string;
    ip?: string;
    device?: string;
  };
  createdAt: Date;
}

const refreshTokenSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    deviceInfo: {
      userAgent: String,
      ip: String,
      device: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // only track createdAt
  }
);

// Add index to auto-delete expired tokens (TTL index)
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', refreshTokenSchema);
