import mongoose, { Schema, Document } from 'mongoose';

export interface ITeamMember {
  userId: mongoose.Types.ObjectId;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  permissions: {
    manageAPIs: boolean;
    manageKeys: boolean;
    viewAnalytics: boolean;
    manageBilling: boolean;
    manageTeam: boolean;
  };
  invitedAt: Date;
  joinedAt?: Date;
}

export interface ITeamInvitation {
  email: string;
  role: 'admin' | 'member' | 'viewer';
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface ITeam extends Document {
  name: string;
  ownerId: mongoose.Types.ObjectId;
  members: ITeamMember[];
  invitations: ITeamInvitation[];
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        role: {
          type: String,
          enum: ['owner', 'admin', 'member', 'viewer'],
          default: 'member',
        },
        permissions: {
          manageAPIs: { type: Boolean, default: false },
          manageKeys: { type: Boolean, default: false },
          viewAnalytics: { type: Boolean, default: true },
          manageBilling: { type: Boolean, default: false },
          manageTeam: { type: Boolean, default: false },
        },
        invitedAt: { type: Date, default: Date.now },
        joinedAt: { type: Date },
      },
    ],
    invitations: [
      {
        email: { type: String, required: true },
        role: { type: String, enum: ['admin', 'member', 'viewer'], default: 'member' },
        token: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const Team = mongoose.model<ITeam>('Team', TeamSchema);
