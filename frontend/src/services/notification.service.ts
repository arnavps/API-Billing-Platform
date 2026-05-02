import { api } from './api';

export interface NotificationData {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'usage' | 'billing' | 'security' | 'system';
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  actionText?: string;
  createdAt: string;
}

export const notificationService = {
  getNotifications: async (params?: any) => {
    const { data } = await api.get('/notifications', { params });
    return data;
  },

  markRead: async (id: string) => {
    const { data } = await api.patch(`/notifications/${id}/read`);
    return data;
  },

  markAllRead: async () => {
    const { data } = await api.patch('/notifications/read-all');
    return data;
  },

  deleteNotification: async (id: string) => {
    const { data } = await api.delete(`/notifications/${id}`);
    return data;
  },
};
