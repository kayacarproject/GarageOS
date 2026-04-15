import { Router, Response } from 'express';
import prisma from '../../prisma';
import { authenticate, AuthRequest } from '../../common/guards/auth.guard';

export const bookingRouter = Router();
bookingRouter.use(authenticate);

bookingRouter.get('/', async (req: AuthRequest, res: Response) => {
  const bookings = await prisma.booking.findMany({
    where: { companyId: req.user!.companyId },
    include: { customer: { select: { name: true, phone: true } }, vehicle: { select: { make: true, model: true, licensePlate: true } } },
    orderBy: { scheduledAt: 'asc' },
  });
  res.json(bookings);
});

bookingRouter.post('/', async (req: AuthRequest, res: Response) => {
  const booking = await prisma.booking.create({
    data: { ...req.body, companyId: req.user!.companyId },
    include: { customer: true, vehicle: true },
  });
  res.status(201).json(booking);
});

bookingRouter.put('/:id', async (req: AuthRequest, res: Response) => {
  const existing = await prisma.booking.findFirst({ where: { id: req.params.id, companyId: req.user!.companyId } });
  if (!existing) return res.status(404).json({ message: 'Not found' });
  const booking = await prisma.booking.update({ where: { id: req.params.id }, data: req.body });
  res.json(booking);
});
