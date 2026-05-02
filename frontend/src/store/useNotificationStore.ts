import { create } from 'zustand';
import { notificationService, NotificationData } from '../services/notification.service';
import { SocketService } from '../services/socket.service';

interface NotificationState {
  notifications: NotificationData[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  pages: number;

  fetchNotifications: (params?: any) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  addNotification: (notification: NotificationData) => void;
  clearError: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  pages: 1,

  fetchNotifications: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await notificationService.getNotifications(params);
      set({ 
        notifications: response.data.notifications,
        unreadCount: response.data.unreadCount,
        total: response.data.total,
        page: response.data.page,
        pages: response.data.pages,
        isLoading: false 
      });
    } catch (error: any) {
      set({ error: error.response?.data?.error?.message || 'Failed to fetch notifications', isLoading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await notificationService.markRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) => 
          n._id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
    } catch (error: any) {
      console.error('Failed to mark notification as read', error);
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationService.markAllRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0
      }));
    } catch (error: any) {
      console.error('Failed to mark all notifications as read', error);
    }
  },

  deleteNotification: async (id) => {
    try {
      await notificationService.deleteNotification(id);
      const notification = get().notifications.find(n => n._id === id);
      set((state) => ({
        notifications: state.notifications.filter((n) => n._id !== id),
        unreadCount: notification && !notification.isRead ? Math.max(0, state.unreadCount - 1) : state.unreadCount
      }));
    } catch (error: any) {
      console.error('Failed to delete notification', error);
    }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
      total: state.total + 1
    }));
  },

  clearError: () => set({ error: null }),
}));
