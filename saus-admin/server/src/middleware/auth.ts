import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string; name: string };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, name: true, isActive: true },
    });
    if (!user || !user.isActive) return res.status(401).json({ error: 'Invalid or inactive account' });
    req.user = { id: user.id, email: user.email, role: user.role, name: user.name };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (...roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};

export const logActivity = (action: string, resource: string) =>
  async (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (req.user) {
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          action,
          resource,
          resourceId: req.params.id || null,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      }).catch(() => {});
    }
    next();
  };
