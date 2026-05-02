import { Request, Response } from 'express';
import crypto from 'crypto';
import axios from 'axios';
import { API } from '../models/API';
import { APIKey } from '../models/APIKey';
import { APILog } from '../models/APILog';

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-'); // Replace multiple - with single -
};

const generateAPIKey = (type: 'live' | 'test') => {
  const prefix = type === 'live' ? 'mf_live_' : 'mf_test_';
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return prefix + randomBytes;
};

const hashAPIKey = (key: string) => {
  return crypto.createHash('sha256').update(key).digest('hex');
};

export const createAPI = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, baseUrl, category, pricing, configuration } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authorized' } });
      return;
    }

    // Validate baseUrl
    try {
      new URL(baseUrl);
    } catch (e) {
      res.status(400).json({ error: { code: 'INVALID_URL', message: 'Invalid base URL format' } });
      return;
    }

    let slug = slugify(name);
    let slugExists = await API.findOne({ slug });
    let counter = 1;

    while (slugExists) {
      slug = `${slugify(name)}-${counter}`;
      slugExists = await API.findOne({ slug });
      counter++;
    }

    const api = await API.create({
      userId,
      name,
      description,
      slug,
      baseUrl,
      category,
      pricing,
      configuration,
    });

    // Automatically generate first API key (test key)
    const rawKey = generateAPIKey('test');
    const hashedKey = hashAPIKey(rawKey);

    const apiKey = await APIKey.create({
      apiId: api._id,
      userId,
      name: 'Default Test Key',
      key: hashedKey,
      prefix: rawKey.substring(0, 8),
      lastFour: rawKey.substring(rawKey.length - 4),
      type: 'test',
      status: 'active',
      permissions: { read: true, write: true, delete: false },
    });

    res.status(201).json({
      data: {
        api,
        initialApiKey: {
          ...apiKey.toJSON(),
          key: rawKey, // Show only once
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message || 'Server error creating API' } });
  }
};

export const getAPIs = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { category, status, search, page = 1, limit = 10 } = req.query;

    const query: any = { userId };

    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const apis = await API.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await API.countDocuments(query);

    // Get key counts for each API
    const apiIds = apis.map((a) => a._id);
    const keyCounts = await APIKey.aggregate([
      { $match: { apiId: { $in: apiIds }, status: 'active' } },
      { $group: { _id: '$apiId', count: { $sum: 1 } } },
    ]);

    const apisWithMeta = apis.map((api) => {
      const keyCount = keyCounts.find((k) => k._id.toString() === api._id.toString())?.count || 0;
      return {
        ...api.toJSON(),
        activeKeysCount: keyCount,
      };
    });

    res.json({
      data: {
        apis: apisWithMeta,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const getAPIDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const api = await API.findOne({ _id: id, userId });
    if (!api) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'API not found' } });
      return;
    }

    const apiKeys = await APIKey.find({ apiId: id }).sort({ createdAt: -1 });

    res.json({
      data: {
        api,
        apiKeys: apiKeys.map((k) => {
          const { key, ...keyJson } = k.toJSON();
          return keyJson;
        }),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const updateAPI = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const updates = req.body;

    const api = await API.findOneAndUpdate({ _id: id, userId }, updates, { new: true });
    if (!api) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'API not found' } });
      return;
    }

    res.json({ data: api });
  } catch (error: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const deleteAPI = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const api = await API.findOne({ _id: id, userId });
    if (!api) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'API not found' } });
      return;
    }

    // Revoke all keys
    await APIKey.updateMany({ apiId: id }, { status: 'revoked' });

    // Soft delete or archive (here we just remove for simplicity, or we could add an isDeleted field)
    await API.findByIdAndDelete(id);

    res.json({ data: { message: 'API deleted and keys revoked successfully' } });
  } catch (error: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const testAPIConnection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { baseUrl, endpoint = '', method = 'GET', headers = {}, body = {} } = req.body;

    const startTime = Date.now();
    try {
      const fullUrl = new URL(endpoint, baseUrl).toString();
      const response = await axios({
        method,
        url: fullUrl,
        headers,
        data: method !== 'GET' ? body : undefined,
        timeout: 10000,
      });

      const responseTime = Date.now() - startTime;

      res.json({
        data: {
          status: response.status,
          statusText: response.statusText,
          data: response.data,
          responseTime,
        },
      });
    } catch (err: any) {
      const responseTime = Date.now() - startTime;
      res.status(err.response?.status || 500).json({
        data: {
          status: err.response?.status || 500,
          statusText: err.response?.statusText || 'Error',
          error: err.message,
          data: err.response?.data,
          responseTime,
        },
      });
    }
  } catch (error: any) {
    res.status(400).json({ error: { code: 'INVALID_INPUT', message: error.message } });
  }
};

export const getAPILogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const { limit = 50, page = 1, search, status } = req.query;

    const api = await API.findOne({ _id: id, userId });
    if (!api) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'API not found' } });
      return;
    }

    const query: any = { apiId: id };

    if (search) {
      query.$or = [
        { path: { $regex: search, $options: 'i' } },
        { method: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      if (status === '2xx') query.status = { $gte: 200, $lt: 300 };
      else if (status === '4xx') query.status = { $gte: 400, $lt: 500 };
      else if (status === '5xx') query.status = { $gte: 500 };
      else if (!isNaN(Number(status))) query.status = Number(status);
    }

    const logs = await APILog.find(query)
      .sort({ timestamp: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await APILog.countDocuments(query);

    res.json({
      data: {
        logs,
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const getAPIAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const { days = 7 } = req.query;

    const api = await API.findOne({ _id: id, userId });
    if (!api) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'API not found' } });
      return;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const analytics = await APILog.aggregate([
      { 
        $match: { 
          apiId: api._id, 
          timestamp: { $gte: startDate } 
        } 
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
          },
          requests: { $sum: 1 },
          errors: {
            $sum: { $cond: [{ $gte: ["$status", 400] }, 1, 0] }
          },
          avgLatency: { $avg: "$latency" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Fill in missing days with zeros
    const result = [];
    const curr = new Date(startDate);
    const end = new Date();
    
    while (curr <= end) {
      const dateStr = curr.toISOString().split('T')[0];
      const found = analytics.find(a => a._id === dateStr);
      
      result.push(found || {
        _id: dateStr,
        requests: 0,
        errors: 0,
        avgLatency: 0
      });
      
      curr.setDate(curr.getDate() + 1);
    }

    res.json({ data: result });
  } catch (error: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
};
