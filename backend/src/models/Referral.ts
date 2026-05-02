import mongoose, { Schema, Document } from 'mongoose';

export interface IReferral extends Document {
  referrerId: mongoose.Types.ObjectId;
  refereeEmail: string;
  refereeId?: mongoose.Types.ObjectId;
  code: string;
  status: 'pending' | 'completed' | 'cancelled';
  reward: {
    type: 'credits' | 'discount';
    amount: number;
    currency: string;
  };
  createdAt: Date;
  completedAt?: Date;
}

const ReferralSchema: Schema = new Schema(
  {
    referrerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    refereeEmail: { type: String, required: true, trim: true },
    refereeId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    code: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending',
    },
    reward: {
      type: { type: String, enum: ['credits', 'discount'], required: true },
      amount: { type: Number, required: true },
      currency: { type: String, default: 'USD' },
    },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

// Unique code per referral instance or per user? 
// Requirements say "Unique referral code per user", but model shows "referral instance".
// I'll assume one model per referral invitation/completion.
ReferralSchema.index({ referrerId: 1, refereeEmail: 1 }, { unique: true });

export const Referral = mongoose.model<IReferral>('Referral', ReferralSchema);
