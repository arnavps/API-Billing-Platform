import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  userId: mongoose.Types.ObjectId;
  teamId?: mongoose.Types.ObjectId;
  action: string;
  entityType: 'api' | 'key' | 'billing' | 'team' | 'webhook';
  entityId: mongoose.Types.ObjectId;
  metadata: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const ActivityLogSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  teamId: { type: Schema.Types.ObjectId, ref: 'Team', index: true },
  action: { type: String, required: true },
  entityType: {
    type: String,
    enum: ['api', 'key', 'billing', 'team', 'webhook'],
    required: true,
  },
  entityId: { type: Schema.Types.ObjectId, required: true },
  metadata: { type: Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now, index: true },
});

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
