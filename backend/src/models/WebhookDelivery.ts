import mongoose, { Schema, Document } from 'mongoose';

export interface IWebhookDelivery extends Document {
  webhookId: mongoose.Types.ObjectId;
  event: string;
  payload: any;
  response: {
    status?: number;
    body?: string;
    headers?: any;
  };
  deliveryTime?: number; // ms
  status: 'pending' | 'success' | 'failed';
  attempts: number;
  nextRetryAt?: Date;
  createdAt: Date;
}

const webhookDeliverySchema = new Schema<IWebhookDelivery>(
  {
    webhookId: { type: Schema.Types.ObjectId, ref: 'Webhook', required: true, index: true },
    event: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, required: true },
    response: {
      status: { type: Number },
      body: { type: String },
      headers: { type: Schema.Types.Mixed },
    },
    deliveryTime: { type: Number },
    status: { 
      type: String, 
      enum: ['pending', 'success', 'failed'], 
      default: 'pending' 
    },
    attempts: { type: Number, default: 0 },
    nextRetryAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const WebhookDelivery = mongoose.model<IWebhookDelivery>('WebhookDelivery', webhookDeliverySchema);
