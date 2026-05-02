import mongoose, { Schema, Document } from 'mongoose';

export interface IWebhook extends Document {
  userId: mongoose.Types.ObjectId;
  apiId?: mongoose.Types.ObjectId;
  url: string;
  name: string;
  secret: string;
  enabledEvents: string[];
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const webhookSchema = new Schema<IWebhook>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    apiId: { type: Schema.Types.ObjectId, ref: 'API', index: true },
    url: { type: String, required: true },
    name: { type: String, required: true },
    secret: { type: String, required: true },
    enabledEvents: [{ type: String }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export const Webhook = mongoose.model<IWebhook>('Webhook', webhookSchema);
