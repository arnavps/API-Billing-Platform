import mongoose, { Schema, Document } from 'mongoose';

export type WebhookEvent = 
  | 'usage.warning'
  | 'usage.exceeded'
  | 'rate_limit.hit'
  | 'payment.succeeded'
  | 'payment.failed'
  | 'invoice.created'
  | 'api.created'
  | 'api.paused'
  | 'key.created'
  | 'key.revoked';

export interface IWebhook extends Document {
  userId: mongoose.Types.ObjectId;
  apiId?: mongoose.Types.ObjectId;
  url: string;
  events: WebhookEvent[];
  secret: string;
  status: 'active' | 'disabled' | 'failed';
  failureCount: number;
  lastTriggeredAt?: Date;
  lastSuccessAt?: Date;
  lastFailureAt?: Date;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const webhookSchema = new Schema<IWebhook>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    apiId: { type: Schema.Types.ObjectId, ref: 'API', index: true },
    url: { type: String, required: true },
    events: [{ 
      type: String, 
      enum: [
        'usage.warning',
        'usage.exceeded',
        'rate_limit.hit',
        'payment.succeeded',
        'payment.failed',
        'invoice.created',
        'api.created',
        'api.paused',
        'key.created',
        'key.revoked'
      ] 
    }],
    secret: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['active', 'disabled', 'failed'], 
      default: 'active' 
    },
    failureCount: { type: Number, default: 0 },
    lastTriggeredAt: { type: Date },
    lastSuccessAt: { type: Date },
    lastFailureAt: { type: Date },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Webhook = mongoose.model<IWebhook>('Webhook', webhookSchema);
