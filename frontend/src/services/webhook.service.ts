import { api } from './api';

export interface WebhookData {
  _id: string;
  userId: string;
  apiId?: string;
  url: string;
  events: string[];
  secret: string;
  status: 'active' | 'disabled' | 'failed';
  failureCount: number;
  lastTriggeredAt?: string;
  lastSuccessAt?: string;
  lastFailureAt?: string;
  createdAt: string;
}

export interface WebhookDeliveryData {
  _id: string;
  webhookId: string;
  event: string;
  payload: any;
  response: {
    status: number;
    body: any;
    headers: any;
  };
  duration: number;
  status: 'success' | 'failed';
  error?: string;
  attempt: number;
  timestamp: string;
}

export const webhookService = {
  getWebhooks: async (params?: any) => {
    const { data } = await api.get('/webhooks', { params });
    return data;
  },

  createWebhook: async (webhookData: any) => {
    const { data } = await api.post('/webhooks', webhookData);
    return data;
  },

  updateWebhook: async (id: string, webhookData: any) => {
    const { data } = await api.patch(`/webhooks/${id}`, webhookData);
    return data;
  },

  deleteWebhook: async (id: string) => {
    const { data } = await api.delete(`/webhooks/${id}`);
    return data;
  },

  testWebhook: async (id: string) => {
    const { data } = await api.post(`/webhooks/${id}/test`);
    return data;
  },

  getWebhookDeliveries: async (id: string, params?: any) => {
    const { data } = await api.get(`/webhooks/${id}/deliveries`, { params });
    return data;
  },
};
