import api from './api';
import env from '../config/env';
import { dummyPayments } from '../dummy/payments';
import {
  invoiceService,
  type CollectPaymentParams,
  type CollectPaymentResult,
} from './invoiceService';
import type { Payment } from '../types';

export const paymentService = {
  /** POST /payments — delegates to invoiceService for full business logic */
  async collectPayment(params: CollectPaymentParams): Promise<CollectPaymentResult> {
    return invoiceService.collectPayment(params);
  },

  /** GET /job-cards/:id/payments */
  async getPaymentsByJob(jobCardId: string): Promise<Payment[]> {
    return invoiceService.getPaymentsByJob(jobCardId);
  },

  // ─── Legacy ────────────────────────────────────────────────────────────────

  async getAll(): Promise<Payment[]> {
    if (env.USE_DUMMY_DATA) return [...dummyPayments];
    const { data } = await api.get<Payment[]>('/payments');
    return data;
  },

  async create(payload: Partial<Payment>): Promise<Payment> {
    if (env.USE_DUMMY_DATA) {
      const newP: Payment = {
        ...payload,
        id: `pay-${Date.now()}`,
        company_id: payload.company_id ?? 'c1',
        companyId: 'c1',
        status: 'completed',
        created_at: new Date().toISOString(),
        paidAt: new Date().toISOString(),
      } as Payment;
      dummyPayments.push(newP);
      return newP;
    }
    const { data } = await api.post<Payment>('/payments', payload);
    return data;
  },
};
