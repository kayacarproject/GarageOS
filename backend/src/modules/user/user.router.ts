import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../../prisma';
import { authenticate, authorize, AuthRequest } from '../../common/guards/auth.guard';

export const userRouter = Router();
userRouter.use(authenticate);

userRouter.get('/', async (req: AuthRequest, res: Response) => {
  const users = await prisma.user.findMany({
    where: { companyId: req.user!.companyId },
    select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, createdAt: true },
  });
  res.json(users);
});

userRouter.post('/', authorize('OWNER', 'MANAGER'), async (req: AuthRequest, res: Response) => {
  const { name, email, phone, role, password } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { companyId: req.user!.companyId, name, email, phone, role, passwordHash },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });
  res.status(201).json(user);
});

userRouter.put('/:id', authorize('OWNER', 'MANAGER'), async (req: AuthRequest, res: Response) => {
  const { password, ...rest } = req.body;
  const data: any = { ...rest };
  if (password) data.passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.updateMany({
    where: { id: req.params.id, companyId: req.user!.companyId },
    data,
  });
  res.json(user);
});
