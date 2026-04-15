import { Router, Response } from 'express';
import prisma from '../../prisma';
import { authenticate, authorize, AuthRequest } from '../../common/guards/auth.guard';

export const jobCardRouter = Router();
jobCardRouter.use(authenticate);

jobCardRouter.get('/', async (req: AuthRequest, res: Response) => {
  const { companyId } = req.user!;
  const { status, mechanicId } = req.query;
  const jobCards = await prisma.jobCard.findMany({
    where: {
      companyId,
      ...(status ? { status: status as any } : {}),
      ...(mechanicId ? { mechanicId: String(mechanicId) } : {}),
    },
    include: {
      vehicle: { include: { customer: { select: { name: true, phone: true } } } },
      mechanic: { select: { name: true } },
      _count: { select: { inspections: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(jobCards);
});

jobCardRouter.get('/:id', async (req: AuthRequest, res: Response) => {
  const jobCard = await prisma.jobCard.findFirst({
    where: { id: req.params.id, companyId: req.user!.companyId },
    include: {
      vehicle: { include: { customer: true } },
      mechanic: { select: { id: true, name: true } },
      inspections: true,
      estimates: true,
      invoices: { include: { payments: true } },
    },
  });
  if (!jobCard) return res.status(404).json({ message: 'Not found' });
  res.json(jobCard);
});

jobCardRouter.post('/', async (req: AuthRequest, res: Response) => {
  const jobCard = await prisma.jobCard.create({
    data: { ...req.body, companyId: req.user!.companyId },
    include: { vehicle: { include: { customer: true } } },
  });
  res.status(201).json(jobCard);
});

jobCardRouter.put('/:id', async (req: AuthRequest, res: Response) => {
  const existing = await prisma.jobCard.findFirst({ where: { id: req.params.id, companyId: req.user!.companyId } });
  if (!existing) return res.status(404).json({ message: 'Not found' });
  const jobCard = await prisma.jobCard.update({ where: { id: req.params.id }, data: req.body });
  res.json(jobCard);
});

// Add inspection to job card
jobCardRouter.post('/:id/inspections', async (req: AuthRequest, res: Response) => {
  const existing = await prisma.jobCard.findFirst({ where: { id: req.params.id, companyId: req.user!.companyId } });
  if (!existing) return res.status(404).json({ message: 'Not found' });
  const inspection = await prisma.inspection.create({
    data: { ...req.body, jobCardId: req.params.id },
  });
  res.status(201).json(inspection);
});

// Assign mechanic
jobCardRouter.patch('/:id/assign', authorize('OWNER', 'MANAGER'), async (req: AuthRequest, res: Response) => {
  const { mechanicId } = req.body;
  const jobCard = await prisma.jobCard.updateMany({
    where: { id: req.params.id, companyId: req.user!.companyId },
    data: { mechanicId, status: 'IN_PROGRESS' },
  });
  res.json(jobCard);
});
