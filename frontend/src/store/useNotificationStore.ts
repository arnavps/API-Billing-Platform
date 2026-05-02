import { create } from 'zustand';
import axios from 'axios';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Notification) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const { data } = await axios.get('/api/notifications', { withCredentials: true });
      set({ 
        notifications: data, 
        unreadCount: data.filter((n: Notification) => !n.isRead).length,
        loading: false 
      });
    } catch (error) {
      set({ loading: false });
    }
  },
  markAsRead: async (id: string) => {
    try {
      await axios.patch(`/api/notifications/${id}/read`, {}, { withCredentials: true });
      const notifications = get().notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      );
      set({ 
        notifications,
        unreadCount: notifications.filter(n => !n.isRead).length
      });
    } catch (error) {
      console.error(error);
    }
  },
  markAllAsRead: async () => {
    try {
      await axios.patch('/api/notifications/read-all', {}, { withCredentials: true });
      const notifications = get().notifications.map(n => ({ ...n, isRead: true }));
      set({ notifications, unreadCount: 0 });
    } catch (error) {
      console.error(error);
    }
  },
  addNotification: (notification: Notification) => {
    const notifications = [notification, ...get().notifications].slice(0, 50);
    set({ 
      notifications,
      unreadCount: notifications.filter(n => !n.isRead).length
    });
  }
}));
