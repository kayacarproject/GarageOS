import api from './api';
import env from '../config/env';
import { dummyInvoices } from '../dummy/invoices';
import { dummyPayments } from '../dummy/payments';
import { dummyEstimates } from '../dummy/estimates';
import { jobCardService } from './jobCardService';
import type { Invoice, Payment, PaymentMode, PaymentPurpose } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function currentFinancialYear(): string {
  const now = new Date();
  const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return `${year}-${String(year + 1).slice(2)}`;
}

function generateInvoiceNumber(): string {
  const max = dummyInvoices.reduce((n, inv) => {
    const num = parseInt(inv.invoice_number.replace(/\D/g, ''), 10);
    return num > n ? num : n;
  }, 0);
  return `AC/${String(max + 1).padStart(5, '0')}`;
}

// ─── Params ───────────────────────────────────────────────────────────────────

export interface CollectPaymentParams {
  invoiceId: string;
  jobCardId: string;
  amount: number;
  mode: PaymentMode;
  purpose: PaymentPurpose;
  reference?: string;
  collectedBy: string;
}

export interface CollectPaymentResult {
  invoice: Invoice;
  payment: Payment;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const invoiceService = {

  /** POST /job-cards/:id/invoice — generates invoice from approved estimate */
  async generateFromEstimate(jobCardId: string, estimateId: string): Promise<Invoice> {
    if (env.USE_DUMMY_DATA) {
      const estimate = dummyEstimates.find((e) => e.id === estimateId);
      if (!estimate) throw new Error(`Estimate not found: ${estimateId}`);
      if (estimate.status !== 'approved') throw new Error('Estimate must be approved before invoicing');

      const existingAdvance = dummyPayments
        .filter((p) => p.job_card_id === jobCardId && p.purpose === 'advance' && p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);

      const balance_due = Math.max(0, estimate.total - existingAdvance);
      const now = new Date().toISOString();

      const invoice: Invoice = {
        id: `inv-${Date.now()}`,
        invoice_number: generateInvoiceNumber(),
        job_card_id: jobCardId,
        jobCardId: jobCardId,
        company_id: estimate.company_id,
        companyId: estimate.company_id,
        estimate_id: estimateId,
        status: existingAdvance > 0 ? 'partially_paid' : 'issued',
        is_locked: false,
        items: estimate.items.map((item) => ({ ...item })),
        subtotal: estimate.subtotal,
        discount: estimate.discount,
        gst_amount: estimate.gst_amount,
        total: estimate.total,
        advance_paid: existingAdvance,
        balance_due,
        financial_year: currentFinancialYear(),
        issued_at: now,
        created_at: now,
        payments: [],
      };
      dummyInvoices.push(invoice);
      return invoice;
    }
    const { data } = await api.post<Invoice>(`/job-cards/${jobCardId}/invoice`, {
      estimate_id: estimateId,
    });
    return data;
  },

  /** GET /job-cards/:id/invoice */
  async getByJobCard(jobCardId: string, invoiceId?: string): Promise<Invoice | undefined> {
    if (env.USE_DUMMY_DATA) {
      if (invoiceId) return dummyInvoices.find((i) => i.id === invoiceId);
      return dummyInvoices.find(
        (i) => i.job_card_id === jobCardId || i.jobCardId === jobCardId,
      );
    }
    const { data } = await api.get<Invoice>(`/job-cards/${jobCardId}/invoice`);
    return data;
  },

  /** GET /invoices/:id/pdf — returns a URL to the PDF */
  async getPdfUrl(invoiceId: string): Promise<string> {
    if (env.USE_DUMMY_DATA) {
      return `https://placehold.co/pdf?invoice=${invoiceId}`;
    }
    const { data } = await api.get<{ url: string }>(`/invoices/${invoiceId}/pdf`);
    return data.url;
  },

  /** POST /payments — collect a payment against an invoice */
  async collectPayment(params: CollectPaymentParams): Promise<CollectPaymentResult> {
    const { invoiceId, jobCardId, amount, mode, purpose, reference, collectedBy } = params;

    if (env.USE_DUMMY_DATA) {
      const invIdx = dummyInvoices.findIndex((i) => i.id === invoiceId);
      if (invIdx === -1) throw new Error(`Invoice not found: ${invoiceId}`);

      const invoice = dummyInvoices[invIdx];
      if (invoice.is_locked) throw new Error('Invoice is locked. No further payments accepted.');
      if (amount <= 0) throw new Error('Payment amount must be greater than zero.');
      if (amount > invoice.balance_due) {
        throw new Error(
          `Overpayment not allowed. Balance due is ₹${invoice.balance_due.toLocaleString('en-IN')}.`,
        );
      }

      const now = new Date().toISOString();
      const payment: Payment = {
        id: `pay-${Date.now()}`,
        invoice_id: invoiceId,
        invoiceId,
        job_card_id: jobCardId,
        company_id: invoice.company_id,
        companyId: invoice.company_id,
        amount,
        mode,
        purpose,
        status: 'completed',
        reference,
        collected_by: collectedBy,
        created_at: now,
        paidAt: now,
      };
      dummyPayments.push(payment);

      const newBalanceDue = Math.max(0, invoice.balance_due - amount);
      const isFullyPaid   = newBalanceDue <= 0;

      dummyInvoices[invIdx] = {
        ...invoice,
        advance_paid: invoice.advance_paid + amount,
        balance_due: newBalanceDue,
        status: isFullyPaid ? 'paid' : 'partially_paid',
        is_locked: isFullyPaid,
        payments: [...(invoice.payments ?? []), payment],
      };

      if (isFullyPaid) {
        try { await jobCardService.updateStatus(jobCardId, 'paid', 'Payment collected in full'); }
        catch { /* best-effort */ }
      }

      return { invoice: dummyInvoices[invIdx], payment };
    }

    const { data } = await api.post<CollectPaymentResult>('/payments', {
      invoice_id: invoiceId,
      job_card_id: jobCardId,
      amount,
      mode,
      purpose,
      reference,
      collected_by: collectedBy,
    });
    return data;
  },

  /** GET /job-cards/:id/payments */
  async getPaymentsByJob(jobCardId: string): Promise<Payment[]> {
    if (env.USE_DUMMY_DATA) {
      return dummyPayments
        .filter((p) => p.job_card_id === jobCardId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    const { data } = await api.get<Payment[]>(`/job-cards/${jobCardId}/payments`);
    return data;
  },
};
