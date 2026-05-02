import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies (refreshToken)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: add access token to headers
api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401s and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Prevent infinite loops if the refresh token endpoint itself fails with 401
      if (originalRequest.url === '/auth/refresh') {
        useAuthStore.getState().clearAuth();
        return Promise.reject(error);
      }
      
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh token directly using axios to avoid circular dependency
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {}, {
          withCredentials: true
        });
        
        // Update store with new access token
        useAuthStore.getState().setAccessToken(data.data.accessToken);
        
        // Update the failed request with the new token and retry
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear auth state (user needs to log in again)
        useAuthStore.getState().clearAuth();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
