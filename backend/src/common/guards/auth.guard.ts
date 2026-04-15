import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: string; companyId: string; role: string };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = { id: payload.sub, companyId: payload.companyId, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const authorize = (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
