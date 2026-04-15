import { Router, Request, Response } from 'express';
import prisma from '../../prisma';
import { authenticate, authorize, AuthRequest } from '../../common/guards/auth.guard';

export const companyRouter = Router();

// Super admin: list all companies
companyRouter.get('/', authenticate, authorize('SUPER_ADMIN'), async (_req: Request, res: Response) => {
  const companies = await prisma.company.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(companies);
});

companyRouter.post('/', async (req: Request, res: Response) => {
  const { name, email, phone, address } = req.body;
  const company = await prisma.company.create({ data: { name, email, phone, address } });
  res.status(201).json(company);
});

companyRouter.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const company = await prisma.company.findUnique({ where: { id: req.params.id } });
  if (!company) return res.status(404).json({ message: 'Not found' });
  res.json(company);
});

companyRouter.put('/:id', authenticate, authorize('OWNER', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  const company = await prisma.company.update({ where: { id: req.params.id }, data: req.body });
  res.json(company);
});
