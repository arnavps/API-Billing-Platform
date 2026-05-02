import { ActivityLog, IActivityLog } from '../models/ActivityLog';
import { Request } from 'express';
import mongoose from 'mongoose';

export class ActivityLogService {
  static async log(
    req: Request,
    action: string,
    entityType: 'api' | 'key' | 'billing' | 'team' | 'webhook',
    entityId: string | mongoose.Types.ObjectId,
    metadata: any = {}
  ) {
    try {
      const userId = req.user?._id;
      if (!userId) return;

      await ActivityLog.create({
        userId,
        teamId: req.user?.teamId, // Assuming teamId might be available on req.user
        action,
        entityType,
        entityId: new mongoose.Types.ObjectId(entityId),
        metadata,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });
    } catch (error) {
      console.error('Failed to create activity log:', error);
    }
  }

  static async getLogs(query: any, options: { page?: number; limit?: number } = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const logs = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'firstName lastName email');

    const total = await ActivityLog.countDocuments(query);

    return {
      logs,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }
}
