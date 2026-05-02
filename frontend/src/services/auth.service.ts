import { api } from './api';

export const authService = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  forgotPassword: (data: any) => api.post('/auth/forgot-password', data),
  resetPassword: (token: string, data: any) => api.post(`/auth/reset-password/${token}`, data),
  verifyEmail: (token: string) => api.post(`/auth/verify-email/${token}`),
  me: () => api.get('/auth/me'),
};
