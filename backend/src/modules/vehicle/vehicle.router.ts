import { Router, Response } from 'express';
import prisma from '../../prisma';
import { authenticate, authorize, AuthRequest } from '../../common/guards/auth.guard';

export const vehicleRouter = Router();
vehicleRouter.use(authenticate);

vehicleRouter.get('/', async (req: AuthRequest, res: Response) => {
  const { companyId } = req.user!;
  const { customerId } = req.query;
  const vehicles = await prisma.vehicle.findMany({
    where: { companyId, ...(customerId ? { customerId: String(customerId) } : {}) },
    include: { customer: { select: { name: true, phone: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(vehicles);
});

vehicleRouter.get('/:id', async (req: AuthRequest, res: Response) => {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: req.params.id, companyId: req.user!.companyId },
    include: { customer: true, jobCards: { orderBy: { createdAt: 'desc' }, take: 10 } },
  });
  if (!vehicle) return res.status(404).json({ message: 'Not found' });
  res.json(vehicle);
});

vehicleRouter.post('/', async (req: AuthRequest, res: Response) => {
  const vehicle = await prisma.vehicle.create({
    data: { ...req.body, companyId: req.user!.companyId },
  });
  res.status(201).json(vehicle);
});

vehicleRouter.put('/:id', async (req: AuthRequest, res: Response) => {
  const existing = await prisma.vehicle.findFirst({ where: { id: req.params.id, companyId: req.user!.companyId } });
  if (!existing) return res.status(404).json({ message: 'Not found' });
  const vehicle = await prisma.vehicle.update({ where: { id: req.params.id }, data: req.body });
  res.json(vehicle);
});

vehicleRouter.delete('/:id', authorize('OWNER', 'MANAGER'), async (req: AuthRequest, res: Response) => {
  const existing = await prisma.vehicle.findFirst({ where: { id: req.params.id, companyId: req.user!.companyId } });
  if (!existing) return res.status(404).json({ message: 'Not found' });
  await prisma.vehicle.delete({ where: { id: req.params.id } });
  res.json({ message: 'Deleted' });
});
