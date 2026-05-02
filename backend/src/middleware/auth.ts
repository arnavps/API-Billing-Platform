import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { User, IUser } from '../models/User';

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = verifyAccessToken(token) as { id: string, role: string };

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authorized, user not found' } });
        return;
      }
      
      if (!user.isActive) {
        res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authorized, user account is inactive' } });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authorized, token failed' } });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authorized, no token' } });
    return;
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: { code: 'FORBIDDEN', message: 'User role is not authorized to access this route' } });
      return;
    }
    next();
  };
};
