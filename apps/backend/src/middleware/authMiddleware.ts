import { Request, Response, NextFunction } from 'express';

import jwt from 'jsonwebtoken';

import { ENV } from '../config/env';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = jwt.verify(token, ENV.JWT_SECRET) as {
      id: string;
      email?: string;
    };
    req.user = { id: payload.id, email: payload.email };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
