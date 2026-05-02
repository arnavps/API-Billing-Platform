import { Request, Response } from 'express';
import { Notification } from '../models/Notification';
import { NotificationService } from '../services/notification.service';

/**
 * Get all notifications for current user
 */
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ userId }),
      Notification.countDocuments({ userId, isRead: false })
    ]);

    res.status(200).json({
      notifications,
      total,
      unreadCount,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error: any) {
    res.status(500).json({ error: { message: error.message } });
  }
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const notification = await NotificationService.markAsRead(req.params.id as string);
    if (!notification) {
      return res.status(404).json({ error: { message: 'Notification not found' } });
    }
    res.status(200).json(notification);
  } catch (error: any) {
    res.status(500).json({ error: { message: error.message } });
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    await NotificationService.markAllAsRead(userId);
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ error: { message: error.message } });
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const notification = await NotificationService.delete(req.params.id as string);
    if (!notification) {
      return res.status(404).json({ error: { message: 'Notification not found' } });
    }
    res.status(200).json({ message: 'Notification deleted' });
  } catch (error: any) {
    res.status(500).json({ error: { message: error.message } });
  }
};
