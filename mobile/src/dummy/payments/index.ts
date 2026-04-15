import type { Payment } from '../../types';

export const dummyPayments: Payment[] = [
  {
    id: 'pay1', invoice_id: 'inv1', invoiceId: 'inv1',
    job_card_id: 'jc4', company_id: 'c1', companyId: 'c1',
    amount: 2193, mode: 'upi', purpose: 'full', status: 'completed',
    reference: 'UPI9876543210', collected_by: 'u4',
    created_at: '2024-03-05T13:30:00Z', paidAt: '2024-03-05T13:30:00Z',
  },
  {
    id: 'pay2', invoice_id: 'inv2', invoiceId: 'inv2',
    job_card_id: 'jc1', company_id: 'c1', companyId: 'c1',
    amount: 2000, mode: 'cash', purpose: 'advance', status: 'completed',
    collected_by: 'u4',
    created_at: '2024-03-10T09:00:00Z', paidAt: '2024-03-10T09:00:00Z',
  },
  {
    id: 'pay3', invoice_id: 'inv5', invoiceId: 'inv5',
    job_card_id: 'jc3', company_id: 'c1', companyId: 'c1',
    amount: 10000, mode: 'bank_transfer', purpose: 'advance', status: 'completed',
    reference: 'NEFT20240308001', collected_by: 'u4',
    notes: 'Advance collected before parts ordered',
    created_at: '2024-03-08T10:00:00Z', paidAt: '2024-03-08T10:00:00Z',
  },
  {
    // Partial payment on inv2 after advance
    id: 'pay4', invoice_id: 'inv2', invoiceId: 'inv2',
    job_card_id: 'jc1', company_id: 'c1', companyId: 'c1',
    amount: 1500, mode: 'upi', purpose: 'partial', status: 'completed',
    reference: 'UPI1122334455', collected_by: 'u4',
    created_at: '2024-03-10T15:00:00Z', paidAt: '2024-03-10T15:00:00Z',
  },
  {
    // Cheque payment for large invoice
    id: 'pay5', invoice_id: 'inv5', invoiceId: 'inv5',
    job_card_id: 'jc3', company_id: 'c1', companyId: 'c1',
    amount: 5000, mode: 'cheque', purpose: 'partial', status: 'completed',
    reference: 'CHQ-00123456', collected_by: 'u4',
    notes: 'Cheque from HDFC Bank, clearing in 2 days',
    created_at: '2024-03-11T11:00:00Z', paidAt: '2024-03-11T11:00:00Z',
  },
];
