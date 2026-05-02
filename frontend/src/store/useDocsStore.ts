import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface DocsState {
  publicAPIs: any[];
  currentAPI: any | null;
  currentGuide: any | null;
  loading: boolean;
  error: string | null;
  fetchPublicAPIs: () => Promise<void>;
  fetchAPIDocs: (slug: string) => Promise<void>;
  fetchGuide: (id: string) => Promise<void>;
  proxyPlaygroundRequest: (slug: string, request: any, apiKey: string) => Promise<any>;
}

export const useDocsStore = create<DocsState>((set) => ({
  publicAPIs: [],
  currentAPI: null,
  currentGuide: null,
  loading: false,
  error: null,

  fetchPublicAPIs: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/docs/apis`);
      set({ publicAPIs: response.data.data, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch APIs', loading: false });
    }
  },

  fetchAPIDocs: async (slug: string) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/docs/apis/${slug}`);
      set({ currentAPI: response.data.data, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch API docs', loading: false });
    }
  },

  fetchGuide: async (id: string) => {
    set({ loading: true, error: null, currentAPI: null });
    try {
      const response = await axios.get(`${API_URL}/docs/guides/${id}`);
      set({ currentGuide: response.data.data, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch guide', loading: false });
    }
  },

  proxyPlaygroundRequest: async (slug: string, request: any, apiKey: string) => {
    try {
      const response = await axios.post(`${API_URL}/docs/playground/${slug}/proxy`, request, {
        headers: {
          'X-MF-API-Key': apiKey,
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Request failed');
    }
  },
}));
