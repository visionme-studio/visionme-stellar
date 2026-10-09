import { Request, Response, NextFunction } from 'express';
const jwt = require('jsonwebtoken');
import { ENV } from '../config/env';

export interface AuthRequest extends Request {
  userId?: string;
  stellarPublicKey?: string;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.slice('Bearer '.length);

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as {
      userId?: string;
      stellarPublicKey?: string;
    };

    if (!decoded || typeof decoded.userId !== 'string' || !decoded.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (
      typeof decoded.stellarPublicKey !== 'string' ||
      !decoded.stellarPublicKey
    ) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.userId = decoded.userId;
    req.stellarPublicKey = decoded.stellarPublicKey;
    return next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};
