import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'api_owner' | 'consumer';
  company?: string;
  avatar?: string;
  emailVerified: boolean;
  isActive: boolean;
  subscription: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'cancelled' | 'past_due';
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    customerId?: string;
  };
  settings: {
    notifications: boolean;
    twoFactorEnabled: boolean;
    timezone: string;
  };
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Don't return password by default
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'api_owner', 'consumer'],
      default: 'api_owner',
    },
    company: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'pro', 'enterprise'],
        default: 'free',
      },
      status: {
        type: String,
        enum: ['active', 'cancelled', 'past_due'],
        default: 'active',
      },
      currentPeriodStart: Date,
      currentPeriodEnd: Date,
      customerId: String,
    },
    settings: {
      notifications: { type: Boolean, default: true },
      twoFactorEnabled: { type: Boolean, default: false },
      timezone: { type: String, default: 'UTC' },
    },
    lastLoginAt: Date,
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt
userSchema.pre<IUser>('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  if (this.password) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
