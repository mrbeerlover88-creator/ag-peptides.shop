import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { env } from './env.js';
import { db } from './db.js';

export type AuthUser = {
  id: string;
  email: string;
  role: 'CLIENT' | 'ADMIN';
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function signToken(user: AuthUser) {
  return jwt.sign(user, env.JWT_SECRET, { expiresIn: '7d' });
}

export async function authOptional(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthUser;
    const user = await db.user.findUnique({ where: { id: payload.id } });
    if (user) req.user = { id: user.id, email: user.email, role: user.role };
  } catch {
    // Anonymous requests are allowed for catalog and guest checkout.
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
  next();
}
