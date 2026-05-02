import { Notification } from '../models/Notification';
import { SocketService } from './socket.service';

export class NotificationService {
  /**
   * Creates an in-app notification and alerts the user in real-time
   */
  static async notify(userId: string, data: {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    link?: string;
  }) {
    try {
      // 1. Save to MongoDB
      const notification = await Notification.create({
        userId,
        ...data,
      });

      // 2. Emit via Socket.io if user is online
      SocketService.emitToUser(userId, 'new-notification', notification);

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications for a user as read
   */
  static async markAllAsRead(userId: string) {
    return Notification.updateMany({ userId, isRead: false }, { isRead: true });
  }

  /**
   * Mark a single notification as read
   */
  static async markAsRead(notificationId: string) {
    return Notification.findByIdAndUpdate(notificationId, { isRead: true });
  }
}
