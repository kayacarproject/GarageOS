import { Router, Response } from 'express';
import prisma from '../../prisma';
import { authenticate, AuthRequest } from '../../common/guards/auth.guard';

export const paymentRouter = Router();
paymentRouter.use(authenticate);

paymentRouter.post('/', async (req: AuthRequest, res: Response) => {
  const { invoiceId, amount, method, reference } = req.body;
  const invoice = await prisma.invoice.findFirst({ where: { id: invoiceId, companyId: req.user!.companyId } });
  if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

  const payment = await prisma.payment.create({
    data: { companyId: req.user!.companyId, invoiceId, amount, method, reference },
  });

  const totalPaid = await prisma.payment.aggregate({ where: { invoiceId }, _sum: { amount: true } });
  const paid = totalPaid._sum.amount || 0;
  const newStatus = paid >= invoice.total ? 'PAID' : paid > 0 ? 'PARTIAL' : 'UNPAID';
  await prisma.invoice.update({ where: { id: invoiceId }, data: { status: newStatus as any } });

  res.status(201).json(payment);
});

paymentRouter.get('/', async (req: AuthRequest, res: Response) => {
  const payments = await prisma.payment.findMany({
    where: { companyId: req.user!.companyId },
    include: { invoice: { select: { total: true, jobCardId: true } } },
    orderBy: { paidAt: 'desc' },
  });
  res.json(payments);
});
