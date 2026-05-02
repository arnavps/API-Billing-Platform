import { api } from './api';

export interface APIData {
  _id: string;
  name: string;
  description: string;
  slug: string;
  category: string;
  baseUrl: string;
  icon: string;
  status: 'active' | 'paused' | 'maintenance';
  visibility: 'public' | 'private';
  configuration: {
    timeout: number;
    retries: number;
    rateLimit: {
      enabled: boolean;
      maxRequests: number;
      windowMs: number;
    };
    authentication: {
      type: 'none' | 'api_key' | 'oauth' | 'bearer';
      headers: Record<string, string>;
    };
  };
  pricing: {
    model: string;
    freeQuota: number;
    pricePerRequest: number;
  };
  analytics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    avgResponseTime: number;
  };
  createdAt: string;
  updatedAt: string;
  activeKeysCount?: number;
}

export const apiService = {
  getAPIs: async (params?: any) => {
    const { data } = await api.get('/apis', { params });
    return data;
  },

  getAPIDetails: async (id: string) => {
    const { data } = await api.get(`/apis/${id}`);
    return data;
  },

  createAPI: async (apiData: any) => {
    const { data } = await api.post('/apis', apiData);
    return data;
  },

  updateAPI: async (id: string, apiData: any) => {
    const { data } = await api.patch(`/apis/${id}`, apiData);
    return data;
  },

  deleteAPI: async (id: string) => {
    const { data } = await api.delete(`/apis/${id}`);
    return data;
  },

  testConnection: async (testData: any) => {
    const { data } = await api.post('/apis/test', testData);
    return data;
  },

  getAPILogs: async (id: string, params?: any) => {
    const { data } = await api.get(`/apis/${id}/logs`, { params });
    return data;
  },

  getAPIAnalytics: async (id: string, params?: any) => {
    const { data } = await api.get(`/apis/${id}/analytics`, { params });
    return data;
  },

  getAPIVersions: async (id: string) => {
    const { data } = await api.get(`/apis/${id}/versions`);
    return data;
  },

  createAPIVersion: async (id: string, versionData: any) => {
    const { data } = await api.post(`/apis/${id}/versions`, versionData);
    return data;
  },

  updateAPIVersion: async (id: string, versionId: string, versionData: any) => {
    const { data } = await api.patch(`/apis/${id}/versions/${versionId}`, versionData);
    return data;
  },

  setCurrentVersion: async (id: string, versionId: string) => {
    const { data } = await api.post(`/apis/${id}/versions/${versionId}/set-current`);
    return data;
  },
};
