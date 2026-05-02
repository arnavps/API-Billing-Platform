import { create } from 'zustand';
import axios from 'axios';

interface Plan {
  _id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: string;
  requestsQuota: number;
  features: string[];
  stripePriceId: string;
}

interface Subscription {
  _id: string;
  planId: Plan;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;
  razorpaySubscriptionId?: string;
}

interface Invoice {
  _id: string;
  amount: number;
  currency: string;
  status: string;
  pdfUrl: string;
  date: string;
  billingReason: string;
}

interface BillingCycle {
  month: string;
  totalCost: number;
  status: string;
  apis: Array<{
    apiId: string;
    name: string;
    totalRequests: number;
    cost: number;
  }>;
}

interface BillingState {
  plans: Plan[];
  subscription: Subscription | null;
  invoices: Invoice[];
  currentCycle: BillingCycle | null;
  loading: boolean;
  error: string | null;
  fetchPlans: () => Promise<void>;
  fetchSubscription: () => Promise<void>;
  fetchInvoices: () => Promise<void>;
  fetchCurrentCycle: () => Promise<void>;
  createCheckout: (planId: string, gateway?: 'stripe' | 'razorpay') => Promise<any>;
  createPortal: () => Promise<string>;
  payInvoice: (invoiceId: string) => Promise<{ clientSecret: string }>;
  cancelSubscription: (gateway?: 'stripe' | 'razorpay') => Promise<void>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useBillingStore = create<BillingState>((set) => ({
  plans: [],
  subscription: null,
  invoices: [],
  currentCycle: null,
  loading: false,
  error: null,

  fetchPlans: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/billing/plans`, { withCredentials: true });
      set({ plans: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch plans', loading: false });
    }
  },

  fetchSubscription: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/billing/subscription`, { withCredentials: true });
      set({ subscription: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch subscription', loading: false });
    }
  },

  fetchInvoices: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/billing/invoices`, { withCredentials: true });
      set({ invoices: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch invoices', loading: false });
    }
  },

  createCheckout: async (planId: string, gateway: 'stripe' | 'razorpay' = 'stripe') => {
    try {
      const response = await axios.post(
        `${API_URL}/billing/checkout`,
        { planId, gateway },
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create checkout session');
    }
  },

  cancelSubscription: async (gateway: 'stripe' | 'razorpay' = 'stripe') => {
    try {
      await axios.delete(`${API_URL}/billing/subscription`, {
        data: { gateway },
        withCredentials: true,
      });
      // Refresh subscription state
      const response = await axios.get(`${API_URL}/billing/subscription`, { withCredentials: true });
      set({ subscription: response.data });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to cancel subscription');
    }
  },

  createPortal: async () => {
    try {
      const response = await axios.post(
        `${API_URL}/billing/portal`,
        {},
        { withCredentials: true }
      );
      return response.data.url;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create portal session');
    }
  },
  fetchCurrentCycle: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/billing/current-cycle`, { withCredentials: true });
      set({ currentCycle: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch current cycle', loading: false });
    }
  },

  payInvoice: async (invoiceId: string) => {
    try {
      const response = await axios.post(
        `${API_URL}/billing/invoices/${invoiceId}/pay`,
        {},
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to initiate payment');
    }
  },
}));
