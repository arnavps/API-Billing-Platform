import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { PredictiveService } from '../services/predictive.service';

export class AnalyticsController {
  /**
   * GET /api/analytics/overview
   */
  static async getOverview(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const period = (req.query.period as any) || '24h';

      const stats = await AnalyticsService.getUserOverview(userId, period);
      
      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * GET /api/analytics/series
   */
  static async getTimeSeries(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { apiId, period } = req.query;

      const data = await AnalyticsService.getTimeSeriesData(
        userId, 
        apiId as string, 
        (period as any) || '24h'
      );
      
      res.json({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * GET /api/analytics/endpoints
   */
  static async getTopEndpoints(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { apiId, limit } = req.query;

      const endpoints = await AnalyticsService.getTopEndpoints(
        userId, 
        apiId as string, 
        limit ? parseInt(limit as string) : 5
      );
      
      res.json({
        success: true,
        data: endpoints,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * GET /api/analytics/errors
   */
  static async getErrors(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { apiId } = req.query;

      const errors = await AnalyticsService.getErrorBreakdown(
        userId, 
        apiId as string
      );
      
      res.json({
        success: true,
        data: errors,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * GET /api/analytics/forecast
   */
  static async getForecast(req: Request, res: Response) {
    try {
      const { apiId, days } = req.query;
      if (!apiId) {
        return res.status(400).json({ success: false, message: 'apiId is required' });
      }

      const forecast = await PredictiveService.forecastUsage(
        apiId as string,
        days ? parseInt(days as string) : 7
      );

      res.json({
        success: true,
        data: forecast,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
