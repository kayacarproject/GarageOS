import { Router, Response } from 'express';
import prisma from '../../prisma';
import { authenticate, AuthRequest } from '../../common/guards/auth.guard';

export const invoiceRouter = Router();
invoiceRouter.use(authenticate);

invoiceRouter.get('/', async (req: AuthRequest, res: Response) => {
  const invoices = await prisma.invoice.findMany({
    where: { companyId: req.user!.companyId },
    include: {
      jobCard: { include: { vehicle: { include: { customer: { select: { name: true } } } } } },
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(invoices);
});

invoiceRouter.get('/:id', async (req: AuthRequest, res: Response) => {
  const invoice = await prisma.invoice.findFirst({
    where: { id: req.params.id, companyId: req.user!.companyId },
    include: { jobCard: { include: { vehicle: { include: { customer: true } } } }, payments: true },
  });
  if (!invoice) return res.status(404).json({ message: 'Not found' });
  res.json(invoice);
});

invoiceRouter.post('/', async (req: AuthRequest, res: Response) => {
  const { jobCardId, items, tax = 0, dueDate } = req.body;
  const subtotal = items.reduce((sum: number, i: any) => sum + i.qty * i.unitPrice, 0);
  const total = subtotal + (subtotal * tax) / 100;
  const invoice = await prisma.invoice.create({
    data: { companyId: req.user!.companyId, jobCardId, items, subtotal, tax, total, dueDate },
  });
  res.status(201).json(invoice);
});
