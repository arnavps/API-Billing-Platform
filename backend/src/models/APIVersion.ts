import mongoose, { Schema, Document } from 'mongoose';

export interface IAPIVersion extends Document {
  apiId: mongoose.Types.ObjectId;
  version: string;
  baseUrl: string;
  isDefault: boolean;
  isDeprecated: boolean;
  deprecationDate?: Date;
  changelog?: string;
  createdAt: Date;
  updatedAt: Date;
}

const APIVersionSchema: Schema = new Schema(
  {
    apiId: { type: Schema.Types.ObjectId, ref: 'API', required: true, index: true },
    version: { type: String, required: true, trim: true },
    baseUrl: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
    isDeprecated: { type: Boolean, default: false },
    deprecationDate: { type: Date },
    changelog: { type: String },
  },
  { timestamps: true }
);

// Ensure version is unique per API
APIVersionSchema.index({ apiId: 1, version: 1 }, { unique: true });

export const APIVersion = mongoose.model<IAPIVersion>('APIVersion', APIVersionSchema);
