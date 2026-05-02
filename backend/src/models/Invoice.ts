import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoice extends Document {
  userId: mongoose.Types.ObjectId;
  invoiceNumber: string;
  status: 'draft' | 'pending' | 'paid' | 'failed' | 'refunded';
  period: {
    start: Date;
    end: Date;
  };
  lineItems: Array<{
    type: 'usage' | 'subscription' | 'addon';
    description: string;
    apiId?: mongoose.Types.ObjectId;
    apiName?: string;
    quantity: number;
    unitPrice: number; // in cents
    amount: number; // in cents
  }>;
  subtotal: number; // in cents
  tax: {
    rate: number; // percentage, e.g., 18
    amount: number; // in cents
  };
  discount: {
    code?: string;
    amount: number; // in cents
  };
  total: number; // in cents
  amountPaid: number; // in cents
  amountDue: number; // in cents
  currency: string;
  gateway: 'stripe' | 'razorpay' | 'manual';
  paymentMethod?: string;
  paymentIntent?: string;
  externalId?: string; // Stripe Invoice ID or Razorpay Payment ID
  pdfUrl?: string;
  paidAt?: Date;
  dueDate: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    invoiceNumber: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['draft', 'pending', 'paid', 'failed', 'refunded'],
      default: 'draft',
    },
    period: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    lineItems: [
      {
        type: { type: String, enum: ['usage', 'subscription', 'addon'], required: true },
        description: { type: String, required: true },
        apiId: { type: Schema.Types.ObjectId, ref: 'API' },
        apiName: { type: String },
        quantity: { type: Number, required: true, default: 0 },
        unitPrice: { type: Number, required: true, default: 0 },
        amount: { type: Number, required: true, default: 0 },
      },
    ],
    subtotal: { type: Number, required: true, default: 0 },
    tax: {
      rate: { type: Number, default: 0 },
      amount: { type: Number, default: 0 },
    },
    discount: {
      code: { type: String },
      amount: { type: Number, default: 0 },
    },
    total: { type: Number, required: true, default: 0 },
    amountPaid: { type: Number, default: 0 },
    amountDue: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    gateway: {
      type: String,
      enum: ['stripe', 'razorpay', 'manual'],
      default: 'manual',
    },
    paymentMethod: { type: String },
    paymentIntent: { type: String },
    externalId: { type: String, index: true },
    pdfUrl: { type: String },
    paidAt: { type: Date },
    dueDate: { type: Date, required: true },
    metadata: { type: Map, of: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.model<IInvoice>('Invoice', InvoiceSchema);
