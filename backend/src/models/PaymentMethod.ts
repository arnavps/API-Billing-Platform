import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentMethod extends Document {
  userId: mongoose.Types.ObjectId;
  stripePaymentMethodId: string;
  type: string;
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentMethodSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    stripePaymentMethodId: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    card: {
      brand: { type: String, required: true },
      last4: { type: String, required: true },
      expMonth: { type: Number, required: true },
      expYear: { type: Number, required: true },
    },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IPaymentMethod>('PaymentMethod', PaymentMethodSchema);
