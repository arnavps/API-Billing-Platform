import mongoose, { Schema, Document } from 'mongoose';

export interface IBillingCycle extends Document {
  userId: mongoose.Types.ObjectId;
  month: Date; // Start of the billing month
  apis: {
    apiId: mongoose.Types.ObjectId;
    name: string;
    totalRequests: number;
    dataTransferred: number;
    cost: number;
  }[];
  totalCost: number;
  status: 'open' | 'closing' | 'closed';
  invoiceId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BillingCycleSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    month: { type: Date, required: true, index: true },
    apis: [
      {
        apiId: { type: Schema.Types.ObjectId, ref: 'API', required: true },
        name: { type: String, required: true },
        totalRequests: { type: Number, default: 0 },
        dataTransferred: { type: Number, default: 0 },
        cost: { type: Number, default: 0 },
      },
    ],
    totalCost: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['open', 'closing', 'closed'],
      default: 'open',
    },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
  },
  { timestamps: true }
);

// Index for unique user + month
BillingCycleSchema.index({ userId: 1, month: 1 }, { unique: true });

export default mongoose.model<IBillingCycle>('BillingCycle', BillingCycleSchema);
