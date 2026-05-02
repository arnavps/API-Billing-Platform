import { create } from 'zustand';
import { apiKeyService, APIKeyData } from '../services/apiKey.service';

interface APIKeyState {
  keys: APIKeyData[];
  isLoading: boolean;
  error: string | null;

  fetchKeys: (apiId: string) => Promise<void>;
  createKey: (apiId: string, keyData: any) => Promise<APIKeyData | null>;
  rotateKey: (apiId: string, keyId: string) => Promise<any | null>;
  revokeKey: (apiId: string, keyId: string) => Promise<void>;
  clearError: () => void;
}

export const useAPIKeyStore = create<APIKeyState>((set) => ({
  keys: [],
  isLoading: false,
  error: null,

  fetchKeys: async (apiId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiKeyService.getKeys(apiId);
      set({ keys: response.data.apiKeys, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.error?.message || 'Failed to fetch API keys', isLoading: false });
    }
  },

  createKey: async (apiId, keyData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiKeyService.createKey(apiId, keyData);
      const newKey = response.data;
      set((state) => ({
        keys: [newKey, ...state.keys],
        isLoading: false,
      }));
      return newKey;
    } catch (error: any) {
      set({ error: error.response?.data?.error?.message || 'Failed to create API key', isLoading: false });
      return null;
    }
  },

  rotateKey: async (apiId, keyId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiKeyService.rotateKey(apiId, keyId);
      const { newApiKey } = response.data;
      set((state) => ({
        keys: [newApiKey, ...state.keys.map(k => k._id === keyId ? { ...k, status: 'revoked' } : k)],
        isLoading: false,
      }));
      return response.data;
    } catch (error: any) {
      set({ error: error.response?.data?.error?.message || 'Failed to rotate API key', isLoading: false });
      return null;
    }
  },

  revokeKey: async (apiId, keyId) => {
    set({ isLoading: true, error: null });
    try {
      await apiKeyService.revokeKey(apiId, keyId);
      set((state) => ({
        keys: state.keys.map((k) => (k._id === keyId ? { ...k, status: 'revoked' } : k)),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.error?.message || 'Failed to revoke API key', isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
