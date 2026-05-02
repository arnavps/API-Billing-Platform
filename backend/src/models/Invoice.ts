import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoice extends Document {
  userId: mongoose.Types.ObjectId;
  subscriptionId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  status: 'paid' | 'open' | 'void' | 'uncollectible';
  stripeInvoiceId: string;
  pdfUrl: string;
  billingReason: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'usd' },
    status: {
      type: String,
      enum: ['paid', 'open', 'void', 'uncollectible'],
      required: true,
    },
    stripeInvoiceId: { type: String, required: true, unique: true },
    pdfUrl: { type: String },
    billingReason: { type: String },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IInvoice>('Invoice', InvoiceSchema);
