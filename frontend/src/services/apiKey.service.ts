import { api } from './api';

export interface APIKeyData {
  _id: string;
  apiId: string;
  name: string;
  key?: string; // Only present on creation/rotation
  prefix: string;
  lastFour: string;
  type: 'live' | 'test';
  status: 'active' | 'revoked' | 'expired';
  permissions: {
    read: boolean;
    write: boolean;
    delete: boolean;
  };
  rateLimit: {
    maxRequests: number;
    windowMs: number;
  };
  expiresAt?: string;
  lastUsedAt?: string;
  createdAt: string;
}

export const apiKeyService = {
  getKeys: async (apiId: string) => {
    const { data } = await api.get(`/apis/${apiId}/keys`);
    return data;
  },

  createKey: async (apiId: string, keyData: any) => {
    const { data } = await api.post(`/apis/${apiId}/keys`, keyData);
    return data;
  },

  updateKey: async (apiId: string, keyId: string, keyData: any) => {
    const { data } = await api.patch(`/apis/${apiId}/keys/${keyId}`, keyData);
    return data;
  },

  rotateKey: async (apiId: string, keyId: string) => {
    const { data } = await api.post(`/apis/${apiId}/keys/${keyId}/rotate`);
    return data;
  },

  revokeKey: async (apiId: string, keyId: string) => {
    const { data } = await api.delete(`/apis/${apiId}/keys/${keyId}`);
    return data;
  },
};
