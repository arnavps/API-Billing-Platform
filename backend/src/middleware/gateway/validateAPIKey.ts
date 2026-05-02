import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { APIKey } from '../../models/APIKey';
import { API } from '../../models/API';
import { redisClient } from '../../config/redis';

export const validateAPIKey = async (req: Request, res: Response, next: NextFunction) => {
  const rawKey = req.apiKey;
  const slug = req.params.slug;

  if (!rawKey) {
    return res.status(401).json({
      error: {
        code: 'MISSING_API_KEY',
        message: 'X-MF-API-Key header is missing'
      }
    });
  }

  try {
    // 1. Hash the key for lookup
    const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');
    const cacheKey = `mf:apikey:${hashedKey}`;

    // 2. Check Cache
    const cachedData = await redisClient.get(cacheKey);
    let apiKeyDoc;
    let apiDoc;

    if (cachedData) {
      const data = JSON.parse(cachedData);
      apiKeyDoc = data.apiKeyDoc;
      apiDoc = data.apiDoc;
    } else {
      // 3. Check DB
      apiKeyDoc = await APIKey.findOne({ key: hashedKey }).populate('apiId');
      if (!apiKeyDoc) {
        return res.status(401).json({
          error: {
            code: 'INVALID_API_KEY',
            message: 'The API key is invalid or has been revoked'
          }
        });
      }

      apiDoc = await API.findById(apiKeyDoc.apiId);
      if (!apiDoc) {
        return res.status(404).json({
          error: {
            code: 'API_NOT_FOUND',
            message: 'The associated API configuration was not found'
          }
        });
      }

      // 4. Cache it for 5 minutes
      await redisClient.set(cacheKey, JSON.stringify({ apiKeyDoc, apiDoc }), 'EX', 300);
    }

    // 5. Verify Slug matching
    if (apiDoc.slug !== slug) {
      return res.status(403).json({
        error: {
          code: 'INVALID_API_TARGET',
          message: 'This API key is not authorized for the requested API slug'
        }
      });
    }

    // 6. Validation Logic
    if (apiKeyDoc.status !== 'active') {
      return res.status(401).json({
        error: {
          code: 'REVOKED_API_KEY',
          message: 'This API key has been revoked or expired'
        }
      });
    }

    // IP Restrictions
    const clientIp = req.ip || req.socket.remoteAddress || '';
    if (apiKeyDoc.restrictions?.allowedIPs?.length > 0) {
      if (!apiKeyDoc.restrictions.allowedIPs.includes(clientIp)) {
        return res.status(403).json({
          error: {
            code: 'IP_NOT_ALLOWED',
            message: 'Your IP address is not allowed to use this API key'
          }
        });
      }
    }

    // Method Restrictions
    if (apiKeyDoc.restrictions?.allowedMethods?.length > 0) {
      if (!apiKeyDoc.restrictions.allowedMethods.includes(req.method as any)) {
        return res.status(403).json({
          error: {
            code: 'METHOD_NOT_ALLOWED',
            message: `The ${req.method} method is not allowed for this API key`
          }
        });
      }
    }

    // Attach to request
    req.apiKeyDoc = apiKeyDoc;
    req.api = apiDoc;
    req.requestId = crypto.randomUUID();
    req.startTime = Date.now();

    next();
  } catch (error: any) {
    console.error('API Key Validation Error:', error);
    res.status(500).json({
      error: {
        code: 'GATEWAY_ERROR',
        message: 'An internal error occurred in the gateway'
      }
    });
  }
};
