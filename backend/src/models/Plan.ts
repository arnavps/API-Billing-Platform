import mongoose, { Schema, Document } from 'mongoose';

export interface IPlan extends Document {
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  requestsQuota: number; // Max requests per month
  features: string[];
  stripePriceId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PlanSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    price: { type: Number, required: true },
    currency: { type: String, default: 'usd' },
    billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
    requestsQuota: { type: Number, required: true },
    features: [{ type: String }],
    stripePriceId: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPlan>('Plan', PlanSchema);
