import { Router, Response } from 'express';
import prisma from '../../prisma';
import { authenticate, authorize, AuthRequest } from '../../common/guards/auth.guard';

export const customerRouter = Router();
customerRouter.use(authenticate);

customerRouter.get('/', async (req: AuthRequest, res: Response) => {
  const { companyId } = req.user!;
  const { search } = req.query;
  const customers = await prisma.customer.findMany({
    where: {
      companyId,
      ...(search ? { OR: [{ name: { contains: String(search), mode: 'insensitive' } }, { phone: { contains: String(search) } }] } : {}),
    },
    include: { _count: { select: { vehicles: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(customers);
});

customerRouter.get('/:id', async (req: AuthRequest, res: Response) => {
  const customer = await prisma.customer.findFirst({
    where: { id: req.params.id, companyId: req.user!.companyId },
    include: { vehicles: true },
  });
  if (!customer) return res.status(404).json({ message: 'Not found' });
  res.json(customer);
});

customerRouter.post('/', async (req: AuthRequest, res: Response) => {
  const { name, email, phone, address } = req.body;
  const customer = await prisma.customer.create({
    data: { companyId: req.user!.companyId, name, email, phone, address },
  });
  res.status(201).json(customer);
});

customerRouter.put('/:id', async (req: AuthRequest, res: Response) => {
  const existing = await prisma.customer.findFirst({ where: { id: req.params.id, companyId: req.user!.companyId } });
  if (!existing) return res.status(404).json({ message: 'Not found' });
  const customer = await prisma.customer.update({ where: { id: req.params.id }, data: req.body });
  res.json(customer);
});

customerRouter.delete('/:id', authorize('OWNER', 'MANAGER'), async (req: AuthRequest, res: Response) => {
  const existing = await prisma.customer.findFirst({ where: { id: req.params.id, companyId: req.user!.companyId } });
  if (!existing) return res.status(404).json({ message: 'Not found' });
  await prisma.customer.delete({ where: { id: req.params.id } });
  res.json({ message: 'Deleted' });
});
