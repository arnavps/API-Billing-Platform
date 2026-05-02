import { Notification } from '../models/Notification';
import { SocketService } from './socket.service';
import { EmailService } from './email.service';
import { User } from '../models/User';

export class NotificationService {
  /**
   * Creates an in-app notification and alerts the user in real-time
   */
  static async create(userId: string, data: {
    type: 'info' | 'warning' | 'error' | 'success';
    category: 'usage' | 'billing' | 'security' | 'system';
    title: string;
    message: string;
    actionUrl?: string;
    actionText?: string;
    metadata?: any;
  }) {
    try {
      // 1. Save to MongoDB
      const notification = await Notification.create({
        userId,
        ...data,
      });

      // 2. Emit via Socket.io if user is online
      SocketService.emitToUser(userId, 'notification', notification);

      // 3. Send email for critical notifications (warning/error)
      if (data.type === 'error' || data.type === 'warning') {
        await this.sendEmailAlert(userId, notification);
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Sends an email alert if the user has notifications enabled
   */
  private static async sendEmailAlert(userId: string, notification: any) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.settings.notifications) return;

      await EmailService.send(user.email, notification.title, {
        type: 'notification',
        notification: {
          title: notification.title,
          message: notification.message,
          type: notification.type,
          actionUrl: notification.actionUrl,
          actionText: notification.actionText
        }
      });
    } catch (error) {
      console.error('Error sending email alert:', error);
    }
  }

  /**
   * Mark all notifications for a user as read
   */
  static async markAllAsRead(userId: string) {
    return Notification.updateMany(
      { userId, isRead: false }, 
      { isRead: true, readAt: new Date() }
    );
  }

  /**
   * Mark a single notification as read
   */
  static async markAsRead(notificationId: string) {
    return Notification.findByIdAndUpdate(
      notificationId, 
      { isRead: true, readAt: new Date() },
      { new: true }
    );
  }

  /**
   * Delete a notification
   */
  static async delete(notificationId: string) {
    return Notification.findByIdAndDelete(notificationId);
  }
}
