import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../prisma';

export const authRouter = Router();

authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password, companyId } = req.body;
    if (!email || !password || !companyId) {
      return res.status(400).json({ message: 'email, password and companyId are required' });
    }

    const user = await prisma.user.findFirst({
      where: { email, companyId, isActive: true },
      include: { company: { select: { name: true, isActive: true } } },
    });

    if (!user || !user.company.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { sub: user.id, companyId: user.companyId, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, companyId: user.companyId, companyName: user.company.name },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

authRouter.post('/forgot-password', async (req: Request, res: Response) => {
  // In production: send reset email
  res.json({ message: 'If that email exists, a reset link has been sent.' });
});
