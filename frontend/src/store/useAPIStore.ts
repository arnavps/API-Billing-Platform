import { create } from 'zustand';
import { apiService, APIData } from '../services/api.service';

interface APIState {
  apis: APIData[];
  currentAPI: APIData | null;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  pages: number;
  logs: any[];
  analyticsData: any[];
  isLogsLoading: boolean;
  isAnalyticsLoading: boolean;
  logsTotal: number;
  logsPage: number;
  logsPages: number;
  isUpdating: boolean;
  versions: any[];
  isVersionsLoading: boolean;

  fetchAPIs: (params?: any) => Promise<void>;
  fetchAPIDetails: (id: string) => Promise<void>;
  fetchAPILogs: (id: string, params?: any) => Promise<void>;
  fetchAPIAnalytics: (id: string, params?: any) => Promise<void>;
  createAPI: (apiData: any) => Promise<any | null>;
  updateAPI: (id: string, apiData: any) => Promise<void>;
  updateAPIConfiguration: (id: string, configuration: any) => Promise<void>;
  deleteAPI: (id: string) => Promise<void>;
  fetchAPIVersions: (id: string) => Promise<void>;
  createAPIVersion: (id: string, versionData: any) => Promise<void>;
  updateAPIVersion: (id: string, versionId: string, versionData: any) => Promise<void>;
  setCurrentVersion: (id: string, versionId: string) => Promise<void>;
  clearError: () => void;
}

export const useAPIStore = create<APIState>((set, get) => ({
  apis: [],
  currentAPI: null,
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  pages: 1,
  logs: [],
  analyticsData: [],
  isLogsLoading: false,
  isAnalyticsLoading: false,
  logsTotal: 0,
  logsPage: 1,
  logsPages: 1,
  isUpdating: false,
  versions: [],
  isVersionsLoading: false,

  fetchAPIs: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getAPIs(params);
      set({ 
        apis: response.data.apis, 
        total: response.data.total,
        page: response.data.page,
        pages: response.data.pages,
        isLoading: false 
      });
    } catch (error: any) {
      set({ error: error.response?.data?.error?.message || 'Failed to fetch APIs', isLoading: false });
    }
  },

  fetchAPIDetails: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getAPIDetails(id);
      set({ currentAPI: response.data.api, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.error?.message || 'Failed to fetch API details', isLoading: false });
    }
  },

  fetchAPILogs: async (id, params) => {
    set({ isLogsLoading: true });
    try {
      const response = await apiService.getAPILogs(id, params);
      set({ 
        logs: params?.page > 1 ? [...get().logs, ...response.data.logs] : response.data.logs,
        logsTotal: response.data.total,
        logsPage: response.data.page,
        logsPages: response.data.pages,
        isLogsLoading: false 
      });
    } catch (error: any) {
      set({ isLogsLoading: false });
    }
  },

  fetchAPIAnalytics: async (id, params) => {
    set({ isAnalyticsLoading: true });
    try {
      const response = await apiService.getAPIAnalytics(id, params);
      set({ analyticsData: response.data, isAnalyticsLoading: false });
    } catch (error: any) {
      set({ isAnalyticsLoading: false });
    }
  },

  createAPI: async (apiData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.createAPI(apiData);
      const newAPI = response.data.api;
      set((state) => ({ 
        apis: [newAPI, ...state.apis],
        isLoading: false 
      }));
      return response.data; // Return full response as it might contain the initial key
    } catch (error: any) {
      set({ error: error.response?.data?.error?.message || 'Failed to create API', isLoading: false });
      return null;
    }
  },

  updateAPI: async (id, apiData) => {
    set({ isUpdating: true, error: null });
    try {
      const response = await apiService.updateAPI(id, apiData);
      set((state) => ({
        apis: state.apis.map((a) => (a._id === id ? response.data : a)),
        currentAPI: state.currentAPI?._id === id ? response.data : state.currentAPI,
        isUpdating: false,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.error?.message || 'Failed to update API', isUpdating: false });
    }
  },

  updateAPIConfiguration: async (id, configuration) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.updateAPI(id, { configuration });
      set((state) => ({
        apis: state.apis.map((a) => (a._id === id ? response.data : a)),
        currentAPI: state.currentAPI?._id === id ? response.data : state.currentAPI,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.error?.message || 'Failed to update API configuration', isLoading: false });
    }
  },

  deleteAPI: async (id) => {
    set({ isUpdating: true, error: null });
    try {
      await apiService.deleteAPI(id);
      set((state) => ({
        apis: state.apis.filter((a) => a._id !== id),
        currentAPI: state.currentAPI?._id === id ? null : state.currentAPI,
        isUpdating: false,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.error?.message || 'Failed to delete API', isUpdating: false });
    }
  },

  fetchAPIVersions: async (id) => {
    set({ isVersionsLoading: true, error: null });
    try {
      const response = await apiService.getAPIVersions(id);
      set({ versions: response.data, isVersionsLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.error?.message || 'Failed to fetch API versions', isVersionsLoading: false });
    }
  },

  createAPIVersion: async (id, versionData) => {
    set({ isUpdating: true, error: null });
    try {
      const response = await apiService.createAPIVersion(id, versionData);
      set((state) => ({
        versions: [response.data, ...state.versions],
        isUpdating: false,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.error?.message || 'Failed to create API version', isUpdating: false });
    }
  },

  updateAPIVersion: async (id, versionId, versionData) => {
    set({ isUpdating: true, error: null });
    try {
      const response = await apiService.updateAPIVersion(id, versionId, versionData);
      set((state) => ({
        versions: state.versions.map((v) => (v._id === versionId ? response.data : v)),
        isUpdating: false,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.error?.message || 'Failed to update API version', isUpdating: false });
    }
  },

  setCurrentVersion: async (id, versionId) => {
    set({ isUpdating: true, error: null });
    try {
      const response = await apiService.setCurrentVersion(id, versionId);
      // Update main API and current version status
      set((state) => ({
        currentAPI: response.data.api,
        versions: state.versions.map((v) => ({
          ...v,
          isDefault: v._id === versionId,
        })),
        isUpdating: false,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.error?.message || 'Failed to set current version', isUpdating: false });
    }
  },

  clearError: () => set({ error: null }),
}));
