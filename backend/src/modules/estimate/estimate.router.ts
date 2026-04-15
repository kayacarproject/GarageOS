import { Router, Response } from 'express';
import prisma from '../../prisma';
import { authenticate, AuthRequest } from '../../common/guards/auth.guard';

export const estimateRouter = Router();
estimateRouter.use(authenticate);

estimateRouter.get('/', async (req: AuthRequest, res: Response) => {
  const estimates = await prisma.estimate.findMany({
    where: { companyId: req.user!.companyId },
    include: { jobCard: { include: { vehicle: { include: { customer: { select: { name: true } } } } } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(estimates);
});

estimateRouter.post('/', async (req: AuthRequest, res: Response) => {
  const { jobCardId, items, tax = 0 } = req.body;
  const subtotal = items.reduce((sum: number, i: any) => sum + i.qty * i.unitPrice, 0);
  const total = subtotal + (subtotal * tax) / 100;
  const estimate = await prisma.estimate.create({
    data: { companyId: req.user!.companyId, jobCardId, items, subtotal, tax, total },
  });
  res.status(201).json(estimate);
});

estimateRouter.patch('/:id/approve', async (req: AuthRequest, res: Response) => {
  const existing = await prisma.estimate.findFirst({ where: { id: req.params.id, companyId: req.user!.companyId } });
  if (!existing) return res.status(404).json({ message: 'Not found' });
  const estimate = await prisma.estimate.update({
    where: { id: req.params.id },
    data: { status: 'APPROVED', approvedAt: new Date() },
  });
  res.json(estimate);
});
