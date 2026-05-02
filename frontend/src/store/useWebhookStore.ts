import { create } from 'zustand';
import axios from 'axios';

export interface Webhook {
  _id: string;
  name: string;
  url: string;
  secret: string;
  enabledEvents: string[];
  status: 'active' | 'inactive';
  apiId?: string;
  createdAt: string;
}

export interface WebhookEvent {
  _id: string;
  event: string;
  status: 'delivered' | 'failed' | 'pending';
  attempts: number;
  lastAttemptAt: string;
  responseStatus?: number;
  responseBody?: string;
  payload: any;
}

interface WebhookState {
  webhooks: Webhook[];
  events: WebhookEvent[];
  loading: boolean;
  fetchWebhooks: () => Promise<void>;
  createWebhook: (data: any) => Promise<void>;
  deleteWebhook: (id: string) => Promise<void>;
  fetchEvents: (id: string) => Promise<void>;
}

export const useWebhookStore = create<WebhookState>((set) => ({
  webhooks: [],
  events: [],
  loading: false,
  fetchWebhooks: async () => {
    set({ loading: true });
    try {
      const { data } = await axios.get('/api/webhooks', { withCredentials: true });
      set({ webhooks: data, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },
  createWebhook: async (data: any) => {
    set({ loading: true });
    try {
      const response = await axios.post('/api/webhooks', data, { withCredentials: true });
      set((state) => ({ 
        webhooks: [...state.webhooks, response.data],
        loading: false 
      }));
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  deleteWebhook: async (id: string) => {
    try {
      await axios.delete(`/api/webhooks/${id}`, { withCredentials: true });
      set((state) => ({ webhooks: state.webhooks.filter(w => w._id !== id) }));
    } catch (error) {
      console.error(error);
    }
  },
  fetchEvents: async (id: string) => {
    set({ loading: true });
    try {
      const { data } = await axios.get(`/api/webhooks/${id}/events`, { withCredentials: true });
      set({ events: data, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  }
}));
