// ─── Enumerations ─────────────────────────────────────────────────────────────

export type EstimateStatus =
  | 'draft'
  | 'sent'
  | 'approved'
  | 'rejected'
  | 'superseded'
  // Legacy (backward compat)
  | 'DRAFT'
  | 'SENT'
  | 'APPROVED'
  | 'REJECTED';

export type EstimateItemType = 'labour' | 'part';

// ─── Estimate Item ────────────────────────────────────────────────────────────

export interface EstimateItem {
  id: string;
  estimate_id: string;
  name: string;
  hsn_sac?: string;
  type: EstimateItemType;
  quantity: number;
  unit: string;
  unit_price: number;
  amount: number;
  gst_percent?: number;

  // Legacy fields (backward compat)
  /** @deprecated use name */
  description?: string;
  /** @deprecated use quantity */
  qty?: number;
  /** @deprecated use unit_price */
  unitPrice?: number;
}

// ─── Estimate ─────────────────────────────────────────────────────────────────

export interface Estimate {
  id: string;
  job_card_id: string;
  /** @deprecated use job_card_id */
  jobCardId?: string;
  company_id: string;
  /** @deprecated use company_id */
  companyId?: string;

  /** Increments on each revision — v1, v2, etc. */
  version: number;
  status: EstimateStatus;

  items: EstimateItem[];

  subtotal: number;
  discount: number;
  gst_amount: number;
  total: number;

  /** @deprecated use gst_amount */
  tax?: number;

  notes?: string;
  created_by: string;
  approved_at?: string;
  created_at: string;
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export type CreateEstimateItemPayload = Omit<EstimateItem, 'id' | 'estimate_id' | 'amount'>;

export interface CreateEstimatePayload {
  job_card_id: string;
  items: CreateEstimateItemPayload[];
  discount?: number;
  notes?: string;
}

export interface ApproveEstimatePayload {
  approved_by: string;
}
