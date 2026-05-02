import axios from 'axios';
import { API } from '../models/API';
import { HealthCheck } from '../models/HealthCheck';
import { NotificationService } from './notification.service';

export class HealthService {
  /**
   * Performs a health check for a single API
   */
  static async checkAPIHealth(apiId: string): Promise<void> {
    const api = await API.findById(apiId);
    if (!api || api.status !== 'active') return;

    const startTime = Date.now();
    let status: 'up' | 'down' | 'degraded' = 'up';
    let statusCode = 200;
    let errorMsg = '';

    try {
      const response = await axios.get(api.baseUrl, { timeout: 10000 });
      statusCode = response.status;
      if (statusCode >= 400) status = 'degraded';
    } catch (error: any) {
      status = 'down';
      statusCode = error.response?.status || 500;
      errorMsg = error.message;
    }

    const responseTime = Date.now() - startTime;

    await HealthCheck.create({
      apiId,
      status,
      responseTime,
      statusCode,
      error: errorMsg,
    });

    // Notify owner if API is down
    if (status === 'down') {
      await NotificationService.create(api.userId, {
        type: 'api.down',
        title: `API Down: ${api.name}`,
        message: `Your API '${api.name}' is currently unreachable. Error: ${errorMsg}`,
        metadata: { apiId: api._id },
      });
    }
  }

  /**
   * Runs health checks for all active APIs
   */
  static async checkAllAPIs(): Promise<void> {
    const apis = await API.find({ status: 'active' });
    for (const api of apis) {
      await this.checkAPIHealth(api._id.toString());
    }
  }
}
