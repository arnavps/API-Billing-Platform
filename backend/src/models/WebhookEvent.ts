import mongoose, { Schema, Document } from 'mongoose';

export interface IWebhookEvent extends Document {
  webhookId: mongoose.Types.ObjectId;
  event: string;
  payload: any;
  status: 'pending' | 'delivered' | 'failed';
  attempts: number;
  lastAttemptAt?: Date;
  responseStatus?: number;
  responseBody?: string;
  createdAt: Date;
}

const webhookEventSchema = new Schema<IWebhookEvent>(
  {
    webhookId: { type: Schema.Types.ObjectId, ref: 'Webhook', required: true, index: true },
    event: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, required: true },
    status: { type: String, enum: ['pending', 'delivered', 'failed'], default: 'pending' },
    attempts: { type: Number, default: 0 },
    lastAttemptAt: { type: Date },
    responseStatus: { type: Number },
    responseBody: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const WebhookEvent = mongoose.model<IWebhookEvent>('WebhookEvent', webhookEventSchema);
