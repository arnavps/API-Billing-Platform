import { Request, Response } from 'express';
import { Notification } from '../models/Notification';
import { NotificationService } from '../services/notification.service';

/**
 * Get user notifications
 */
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Mark notification as read
 */
export const markRead = async (req: Request, res: Response) => {
  try {
    await NotificationService.markAsRead(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Mark all notifications as read
 */
export const markAllRead = async (req: Request, res: Response) => {
  try {
    await NotificationService.markAllAsRead(req.user._id.toString());
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
