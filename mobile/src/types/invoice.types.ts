import type { EstimateItem } from './estimate.types';
import type { Payment } from './payment.types';

// ─── Enumerations ─────────────────────────────────────────────────────────────

export type InvoiceStatus =
  | 'draft'
  | 'issued'
  | 'partially_paid'
  | 'paid'
  // Legacy (backward compat)
  | 'UNPAID'
  | 'PARTIAL'
  | 'PAID'
  | 'OVERDUE';

// ─── Invoice ──────────────────────────────────────────────────────────────────

export interface Invoice {
  id: string;
  invoice_number: string;
  job_card_id: string;
  /** @deprecated use job_card_id */
  jobCardId?: string;
  company_id: string;
  /** @deprecated use company_id */
  companyId?: string;
  estimate_id?: string;

  status: InvoiceStatus;

  /** Once locked, no edits allowed */
  is_locked: boolean;

  items: EstimateItem[];
  subtotal: number;
  discount: number;
  gst_amount: number;
  total: number;

  /** @deprecated use gst_amount */
  tax?: number;

  advance_paid: number;
  balance_due: number;

  /** e.g. "2024-25" */
  financial_year: string;

  pdf_url?: string;
  /** @deprecated use pdf_url */
  pdfUrl?: string;

  issued_at?: string;
  /** @deprecated use issued_at */
  dueDate?: string;
  created_at: string;

  // Relations
  payments?: Payment[];
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface CreateInvoicePayload {
  job_card_id: string;
  estimate_id?: string;
  discount?: number;
  advance_paid?: number;
}
