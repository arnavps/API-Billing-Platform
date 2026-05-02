import { Request, Response, NextFunction } from 'express';
import { JobService } from '../../services/job.service';

export const logUsage = async (req: Request, res: Response, next: NextFunction) => {
  const { api, apiKeyDoc, proxyResponse, requestId, startTime } = req;

  if (!api || !apiKeyDoc || !proxyResponse) return;

  const duration = Date.now() - (startTime || Date.now());

  const logData = {
    requestId,
    apiId: api._id,
    apiKeyId: apiKeyDoc._id,
    userId: api.userId,
    method: req.method,
    path: req.params[0] || '/',
    status: proxyResponse.status,
    latency: duration,
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
    request: {
      headers: req.headers,
      body: req.body,
    },
    response: {
      headers: proxyResponse.headers,
      body: proxyResponse.data,
    },
    timestamp: new Date(),
  };

  try {
    // Add to queue for background processing
    await JobService.queueLogRequest(logData);
  } catch (error) {
    console.error('Failed to queue usage log:', error);
  }
};
