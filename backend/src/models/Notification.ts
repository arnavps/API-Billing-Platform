import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'info' | 'warning' | 'error' | 'success';
  category: 'usage' | 'billing' | 'security' | 'system';
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  isRead: boolean;
  readAt?: Date;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { 
      type: String, 
      enum: ['info', 'warning', 'error', 'success'], 
      default: 'info' 
    },
    category: { 
      type: String, 
      enum: ['usage', 'billing', 'security', 'system'], 
      required: true 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    actionUrl: { type: String },
    actionText: { type: String },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
