import mongoose, { Schema, Document } from 'mongoose';

export interface IEndpoint {
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  parameters: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    in: 'query' | 'header' | 'path' | 'body';
    required: boolean;
    description: string;
    example?: any;
  }>;
  requestBody?: {
    type: string;
    example: string;
  };
  responses: Array<{
    status: number;
    description: string;
    example: string;
  }>;
}

export interface IAPI extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  slug: string;
  category: 'data' | 'ai' | 'finance' | 'social' | 'weather' | 'crypto' | 'other';
  baseUrl: string;
  icon: string;
  status: 'active' | 'paused' | 'maintenance';
  visibility: 'public' | 'private';
  endpoints: IEndpoint[];
  configuration: {
    timeout: number;
    retries: number;
    rateLimit: {
      enabled: boolean;
      maxRequests: number;
      windowMs: number;
      strategy: 'sliding_window' | 'token_bucket' | 'leaky_bucket';
      burstCapacity?: number;
    };
    authentication: {
      type: 'none' | 'api_key' | 'oauth' | 'bearer';
      headers: Record<string, string>;
    };
    transformations: {
      enabled: boolean;
      request: string;
      response: string;
    };
  };
  versions: mongoose.Types.ObjectId[];
  currentVersion: string;
  pricing: {
    model: 'free' | 'pay_per_request' | 'subscription' | 'hybrid';
    freeQuota: number;
    pricePerRequest: number;
    tiers: Array<{
      name: string;
      limit: number;
      price: number;
    }>;
  };
  analytics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    avgResponseTime: number;
    lastRequestAt?: Date;
  };
  marketplace: {
    isFeatured: boolean;
    rating: number;
    reviewCount: number;
    verified: boolean;
    screenshots: string[];
  };
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const apiSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['data', 'ai', 'finance', 'social', 'weather', 'crypto', 'other'],
      default: 'other',
    },
    baseUrl: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      default: '⚡',
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'maintenance'],
      default: 'active',
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'private',
    },
    endpoints: [
      {
        name: { type: String, required: true },
        path: { type: String, required: true },
        method: {
          type: String,
          enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
          required: true,
        },
        description: { type: String, required: true },
        parameters: [
          {
            name: String,
            type: {
              type: String,
              enum: ['string', 'number', 'boolean', 'object', 'array'],
            },
            in: {
              type: String,
              enum: ['query', 'header', 'path', 'body'],
            },
            required: Boolean,
            description: String,
            example: Schema.Types.Mixed,
          },
        ],
        requestBody: {
          type: { type: String },
          example: { type: String },
        },
        responses: [
          {
            status: Number,
            description: String,
            example: String,
          },
        ],
      },
    ],
    configuration: {
      timeout: { type: Number, default: 30000 },
      retries: { type: Number, default: 3 },
      rateLimit: {
        enabled: { type: Boolean, default: true },
        maxRequests: { type: Number, default: 100 },
        windowMs: { type: Number, default: 60000 },
        strategy: { 
          type: String, 
          enum: ['sliding_window', 'token_bucket', 'leaky_bucket'],
          default: 'sliding_window'
        },
        burstCapacity: { type: Number, default: 0 },
      },
      authentication: {
        type: {
          type: String,
          enum: ['none', 'api_key', 'oauth', 'bearer'],
          default: 'api_key',
        },
        headers: { type: Map, of: String, default: {} },
      },
      transformations: {
        enabled: { type: Boolean, default: false },
        request: { type: String, default: '' },
        response: { type: String, default: '' },
      },
    },
    versions: [{ type: Schema.Types.ObjectId, ref: 'APIVersion' }],
    currentVersion: { type: String, default: '1.0.0' },
    pricing: {
      model: {
        type: String,
        enum: ['free', 'pay_per_request', 'subscription', 'hybrid'],
        default: 'free',
      },
      freeQuota: { type: Number, default: 1000 },
      pricePerRequest: { type: Number, default: 0 },
      tiers: [
        {
          name: String,
          limit: Number,
          price: Number,
        },
      ],
    },
    analytics: {
      totalRequests: { type: Number, default: 0 },
      successfulRequests: { type: Number, default: 0 },
      failedRequests: { type: Number, default: 0 },
      avgResponseTime: { type: Number, default: 0 },
      lastRequestAt: Date,
    },
    metadata: {
      documentation: { type: String, default: '' },
      supportEmail: { type: String, default: '' },
      webhookUrl: { type: String, default: '' },
    },
    marketplace: {
      isFeatured: { type: Boolean, default: false },
      rating: { type: Number, default: 0 },
      reviewCount: { type: Number, default: 0 },
      verified: { type: Boolean, default: false },
      screenshots: [String],
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

export const API = mongoose.model<IAPI>('API', apiSchema);
