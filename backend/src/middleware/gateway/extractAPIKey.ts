import { Request, Response, NextFunction } from 'express';

export const extractAPIKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-mf-api-key'] as string;

  if (!apiKey) {
    return res.status(401).json({
      error: {
        code: 'MISSING_API_KEY',
        message: 'X-MF-API-Key header is required'
      }
    });
  }

  req.apiKey = apiKey;
  next();
};
