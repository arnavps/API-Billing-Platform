import { Request, Response, NextFunction } from 'express';
import { usageQueue } from '../../config/queues';

export const logUsage = async (req: Request, res: Response, next: NextFunction) => {
  const { api, apiKeyDoc, proxyResponse, requestId, startTime } = req;

  if (!api || !apiKeyDoc || !proxyResponse) return;

  const duration = Date.now() - (startTime || Date.now());

  const logData = {
    requestId,
    apiId: api._id,
    apiKeyId: apiKeyDoc._id,
    userId: api.userId,
    request: {
      method: req.method,
      path: req.params[0] || '/',
      query: req.query,
      headers: req.headers,
      body: req.body,
      ip: req.ip || req.socket.remoteAddress,
    },
    response: {
      status: proxyResponse.status,
      headers: proxyResponse.headers,
      body: proxyResponse.data,
      latency: duration,
    },
    timestamp: new Date(),
  };

  try {
    // Add to queue for background processing
    await usageQueue.add('log-request', logData, {
      removeOnComplete: true,
      removeOnFail: 1000,
    });
  } catch (error) {
    console.error('Failed to queue usage log:', error);
  }
};
