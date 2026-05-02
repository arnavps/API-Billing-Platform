import { create } from 'zustand';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

interface AnalyticsStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgLatency: number;
  totalData: number;
  successRate: number;
}

interface TimeSeriesData {
  timestamp: string;
  requests: number;
  latency: number;
  success: number;
  failed: number;
}

interface EndpointData {
  endpoint: string;
  count: number;
}

interface AnalyticsState {
  overview: AnalyticsStats | null;
  series: TimeSeriesData[];
  endpoints: EndpointData[];
  loading: boolean;
  error: string | null;
  socket: Socket | null;
  
  fetchOverview: (period: string) => Promise<void>;
  fetchSeries: (apiId?: string, period?: string) => Promise<void>;
  fetchEndpoints: (apiId?: string) => Promise<void>;
  initSocket: (userId: string) => void;
  disconnectSocket: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  overview: null,
  series: [],
  endpoints: [],
  loading: false,
  error: null,
  socket: null,

  fetchOverview: async (period: string) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/analytics/overview?period=${period}`, {
        withCredentials: true,
      });
      set({ overview: response.data.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchSeries: async (apiId?: string, period?: string) => {
    set({ loading: true, error: null });
    try {
      const url = apiId 
        ? `${API_URL}/api/analytics/series?apiId=${apiId}&period=${period}`
        : `${API_URL}/api/analytics/series?period=${period}`;
      const response = await axios.get(url, { withCredentials: true });
      set({ series: response.data.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchEndpoints: async (apiId?: string) => {
    try {
      const url = apiId 
        ? `${API_URL}/api/analytics/endpoints?apiId=${apiId}`
        : `${API_URL}/api/analytics/endpoints`;
      const response = await axios.get(url, { withCredentials: true });
      set({ endpoints: response.data.data });
    } catch (error: any) {
      console.error('Error fetching endpoints:', error);
    }
  },

  initSocket: (userId: string) => {
    if (get().socket) return;

    const socket = io(API_URL, {
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('Connected to socket');
      socket.emit('join', userId);
    });

    socket.on('usage-update', (data) => {
      // Update real-time stats if needed
      console.log('Real-time usage update:', data);
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));
