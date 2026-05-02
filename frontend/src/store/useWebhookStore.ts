import { create } from 'zustand';
import { webhookService, WebhookData, WebhookDeliveryData } from '../services/webhook.service';

interface WebhookState {
  webhooks: WebhookData[];
  currentWebhook: WebhookData | null;
  deliveries: WebhookDeliveryData[];
  isLoading: boolean;
  isDeliveriesLoading: boolean;
  error: string | null;
  total: number;
  deliveriesTotal: number;
  deliveriesPage: number;
  deliveriesPages: number;

  fetchWebhooks: (params?: any) => Promise<void>;
  createWebhook: (webhookData: any) => Promise<void>;
  updateWebhook: (id: string, webhookData: any) => Promise<void>;
  deleteWebhook: (id: string) => Promise<void>;
  testWebhook: (id: string) => Promise<void>;
  fetchWebhookDeliveries: (id: string, params?: any) => Promise<void>;
  clearError: () => void;
}

export const useWebhookStore = create<WebhookState>((set, get) => ({
  webhooks: [],
  currentWebhook: null,
  deliveries: [],
  isLoading: false,
  isDeliveriesLoading: false,
  error: null,
  total: 0,
  deliveriesTotal: 0,
  deliveriesPage: 1,
  deliveriesPages: 1,

  fetchWebhooks: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await webhookService.getWebhooks(params);
      set({ 
        webhooks: response.data.webhooks, 
        total: response.data.total,
        isLoading: false 
      });
    } catch (error: any) {
      set({ error: error.response?.data?.error?.message || 'Failed to fetch webhooks', isLoading: false });
    }
  },

  createWebhook: async (webhookData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await webhookService.createWebhook(webhookData);
      set((state) => ({ 
        webhooks: [response.data, ...state.webhooks],
        isLoading: false 
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.error?.message || 'Failed to create webhook', isLoading: false });
      throw error;
    }
  },

  updateWebhook: async (id, webhookData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await webhookService.updateWebhook(id, webhookData);
      set((state) => ({
        webhooks: state.webhooks.map((w) => (w._id === id ? response.data : w)),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.error?.message || 'Failed to update webhook', isLoading: false });
    }
  },

  deleteWebhook: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await webhookService.deleteWebhook(id);
      set((state) => ({
        webhooks: state.webhooks.filter((w) => w._id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.error?.message || 'Failed to delete webhook', isLoading: false });
    }
  },

  testWebhook: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await webhookService.testWebhook(id);
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.error?.message || 'Failed to test webhook', isLoading: false });
    }
  },

  fetchWebhookDeliveries: async (id, params) => {
    set({ isDeliveriesLoading: true });
    try {
      const response = await webhookService.getWebhookDeliveries(id, params);
      set({ 
        deliveries: params?.page > 1 ? [...get().deliveries, ...response.data.deliveries] : response.data.deliveries,
        deliveriesTotal: response.data.total,
        deliveriesPage: response.data.page,
        deliveriesPages: response.data.pages,
        isDeliveriesLoading: false 
      });
    } catch (error: any) {
      set({ isDeliveriesLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
