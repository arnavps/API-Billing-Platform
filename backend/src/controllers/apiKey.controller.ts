import { Request, Response } from 'express';
import crypto from 'crypto';
import { APIKey } from '../models/APIKey';
import { API } from '../models/API';

const generateAPIKey = (type: 'live' | 'test') => {
  const prefix = type === 'live' ? 'mf_live_' : 'mf_test_';
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return prefix + randomBytes;
};

const hashAPIKey = (key: string) => {
  return crypto.createHash('sha256').update(key).digest('hex');
};

export const createAPIKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const { apiId } = req.params;
    const { name, type, permissions, rateLimit, expiresAt } = req.body;
    const userId = req.user?._id;

    const api = await API.findOne({ _id: apiId, userId });
    if (!api) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'API not found' } });
      return;
    }

    const rawKey = generateAPIKey(type || 'test');
    const hashedKey = hashAPIKey(rawKey);

    const apiKey = await APIKey.create({
      apiId: apiId as any,
      userId,
      name,
      key: hashedKey,
      prefix: rawKey.substring(0, 8),
      lastFour: rawKey.substring(rawKey.length - 4),
      type: type || 'test',
      status: 'active',
      permissions,
      rateLimit,
      expiresAt,
    });

    res.status(201).json({
      data: {
        ...(apiKey as any).toJSON(),
        key: rawKey, // Show only once
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const getAPIKeys = async (req: Request, res: Response): Promise<void> => {
  try {
    const { apiId } = req.params;
    const userId = req.user?._id;

    const api = await API.findOne({ _id: apiId, userId });
    if (!api) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'API not found' } });
      return;
    }

    const apiKeys = await APIKey.find({ apiId }).sort({ createdAt: -1 });

    res.json({
      data: {
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

export const updateAPIKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const { apiId, keyId } = req.params;
    const { name, status, permissions, rateLimit } = req.body;
    const userId = req.user?._id;

    const apiKey = await APIKey.findOneAndUpdate(
      { _id: keyId, apiId, userId },
      { name, status, permissions, rateLimit },
      { new: true }
    );

    if (!apiKey) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'API Key not found' } });
      return;
    }

    const { key, ...keyJson } = apiKey.toJSON();

    res.json({ data: keyJson });
  } catch (error: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const rotateAPIKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const { apiId, keyId } = req.params;
    const userId = req.user?._id;

    const oldKey = await APIKey.findOne({ _id: keyId, apiId, userId });
    if (!oldKey) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'API Key not found' } });
      return;
    }

    const rawKey = generateAPIKey(oldKey.type);
    const hashedKey = hashAPIKey(rawKey);

    // Create new key
    const newKey = await APIKey.create({
      apiId: apiId as any,
      userId,
      name: `${oldKey.name} (Rotated)`,
      key: hashedKey,
      prefix: rawKey.substring(0, 8),
      lastFour: rawKey.substring(rawKey.length - 4),
      type: oldKey.type,
      status: 'active',
      permissions: oldKey.permissions,
      rateLimit: oldKey.rateLimit,
      rotatedFrom: oldKey._id,
    });

    // Mark old key for expiration (grace period 7 days)
    const gracePeriod = 7 * 24 * 60 * 60 * 1000;
    oldKey.status = 'revoked'; // Or keep active but set expiresAt
    oldKey.expiresAt = new Date(Date.now() + gracePeriod);
    await oldKey.save();

    res.json({
      data: {
        newApiKey: {
          ...(newKey as any).toJSON(),
          key: rawKey,
        },
        oldKeyExpiresAt: oldKey.expiresAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const revokeAPIKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const { apiId, keyId } = req.params;
    const userId = req.user?._id;

    const apiKey = await APIKey.findOneAndUpdate(
      { _id: keyId, apiId, userId },
      { status: 'revoked' },
      { new: true }
    );

    if (!apiKey) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'API Key not found' } });
      return;
    }

    res.json({ data: { message: 'API key revoked successfully' } });
  } catch (error: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
};
