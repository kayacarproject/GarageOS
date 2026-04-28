// Estimate status lifecycle:
// draft → pending_approval → approved → invoice_generated → paid
//                         ↘ rejected → revised → pending_approval (loop)

export type EstimateStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'revised'
  | 'invoice_generated'
  | 'paid';

// ─── Display labels ───────────────────────────────────────────────────────────

export const ESTIMATE_STATUS_LABEL: Record<string, string> = {
  draft:             'Draft',
  pending_approval:  'Pending Approval',
  approved:          'Approved',
  rejected:          'Rejected',
  revised:           'Revised',
  invoice_generated: 'Invoice Generated',
  paid:              'Paid',
};

// ─── Ionicon names ────────────────────────────────────────────────────────────

export const ESTIMATE_STATUS_ICON: Record<string, string> = {
  draft:             'document-outline',
  pending_approval:  'time-outline',
  approved:          'checkmark-circle-outline',
  rejected:          'close-circle-outline',
  revised:           'refresh-outline',
  invoice_generated: 'receipt-outline',
  paid:              'checkmark-done-outline',
};

// ─── State checks (use these instead of comparing strings directly) ───────────

/** Estimate is editable by mechanic/receptionist */
export function isEditable(status: string): boolean {
  return status === 'draft' || status === 'revised';
}

/** Can be sent for owner approval */
export function canSendForApproval(status: string): boolean {
  return status === 'draft' || status === 'revised';
}

/** Owner can approve or reject */
export function isAwaitingApproval(status: string): boolean {
  return status === 'pending_approval';
}

/** Estimate is fully approved */
export function isApproved(status: string): boolean {
  return status === 'approved' || status === 'invoice_generated' || status === 'paid';
}

/** Estimate was rejected and needs revision */
export function isRejected(status: string): boolean {
  return status === 'rejected';
}

/** Invoice has been generated from this estimate */
export function isInvoiced(status: string): boolean {
  return status === 'invoice_generated' || status === 'paid';
}
