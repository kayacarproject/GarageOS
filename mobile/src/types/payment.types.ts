// ─── Enumerations ─────────────────────────────────────────────────────────────

export type PaymentMode = 'cash' | 'upi' | 'bank_transfer' | 'cheque';

export type PaymentStatus = 'pending' | 'completed' | 'failed';

export type PaymentPurpose = 'advance' | 'partial' | 'full' | 'balance';

// ─── Payment ──────────────────────────────────────────────────────────────────

export interface Payment {
  id: string;
  invoice_id: string;
  /** @deprecated use invoice_id */
  invoiceId?: string;
  job_card_id: string;
  company_id: string;
  /** @deprecated use company_id */
  companyId?: string;

  amount: number;
  mode: PaymentMode;
  purpose: PaymentPurpose;
  status: PaymentStatus;

  /** UPI ref, cheque number, transaction ID, etc. */
  reference?: string;
  notes?: string;

  collected_by: string;
  created_at: string;
  /** @deprecated use created_at */
  paidAt?: string;

  // Legacy
  /** @deprecated use mode */
  method?: string;
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface CreatePaymentPayload {
  invoice_id: string;
  job_card_id: string;
  amount: number;
  mode: PaymentMode;
  purpose: PaymentPurpose;
  reference?: string;
  notes?: string;
}
