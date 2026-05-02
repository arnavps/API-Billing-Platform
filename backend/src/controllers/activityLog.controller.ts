import { Request, Response } from 'express';
import { ActivityLogService } from '../services/activityLog.service';
import mongoose from 'mongoose';

export const getActivityLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authorized' } });
      return;
    }

    const { entityType, entityId, page, limit } = req.query;

    const query: any = { userId };
    
    if (entityType) {
      query.entityType = entityType;
    }
    
    if (entityId) {
      query.entityId = new mongoose.Types.ObjectId(entityId as string);
    }

    const result = await ActivityLogService.getLogs(query, {
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 20
    });

    res.json({ data: result });
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch activity logs' } });
  }
};

export const getTeamActivityLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const teamId = req.user?.teamId; // Assuming teamId is on req.user
    if (!teamId) {
      res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'No team context found' } });
      return;
    }

    const { entityType, page, limit } = req.query;

    const query: any = { teamId };
    
    if (entityType) {
      query.entityType = entityType;
    }

    const result = await ActivityLogService.getLogs(query, {
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 20
    });

    res.json({ data: result });
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch team activity logs' } });
  }
};
