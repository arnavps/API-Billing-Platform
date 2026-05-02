import mongoose, { Schema, Document } from 'mongoose';

export interface IDNSRecord {
  type: 'CNAME' | 'TXT' | 'A';
  name: string;
  value: string;
  verified: boolean;
}

export interface ICustomDomain extends Document {
  userId: mongoose.Types.ObjectId;
  domain: string;
  status: 'pending_verification' | 'active' | 'failed';
  dnsRecords: IDNSRecord[];
  sslCertificate?: {
    issuer: string;
    expiresAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CustomDomainSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    domain: { type: String, required: true, unique: true, trim: true },
    status: {
      type: String,
      enum: ['pending_verification', 'active', 'failed'],
      default: 'pending_verification',
    },
    dnsRecords: [
      {
        type: { type: String, enum: ['CNAME', 'TXT', 'A'], required: true },
        name: { type: String, required: true },
        value: { type: String, required: true },
        verified: { type: Boolean, default: false },
      },
    ],
    sslCertificate: {
      issuer: { type: String },
      expiresAt: { type: Date },
    },
  },
  { timestamps: true }
);

export const CustomDomain = mongoose.model<ICustomDomain>('CustomDomain', CustomDomainSchema);
