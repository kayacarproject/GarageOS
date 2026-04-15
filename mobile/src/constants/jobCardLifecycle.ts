import type { JobCardStatus } from '../types';

// ─── Status Labels ─────────────────────────────────────────────────────────────

export const JOB_STATUS_LABELS: Record<string, string> = {
  created:           'Created',
  inspection_done:   'Inspection Done',
  estimate_created:  'Estimate Created',
  estimate_approved: 'Estimate Approved',
  assigned:          'Assigned',
  in_progress:       'In Progress',
  waiting_parts:     'Waiting Parts',
  work_completed:    'Work Completed',
  qc_pending:        'QC Pending',
  qc_failed:         'QC Failed',
  qc_passed:         'QC Passed',
  invoiced:          'Invoiced',
  paid:              'Paid',
  delivered:         'Delivered',
  cancelled:         'Cancelled',
};

// ─── Status Colors ─────────────────────────────────────────────────────────────
// { bg, text, dot } — hex values usable in RN StyleSheet

export interface StatusColorConfig {
  bg: string;
  text: string;
  dot: string;
}

export const JOB_STATUS_COLORS: Record<string, StatusColorConfig> = {
  created:           { bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF' },
  inspection_done:   { bg: '#EFF6FF', text: '#2563EB', dot: '#2563EB' },
  estimate_created:  { bg: '#FFF7ED', text: '#C2410C', dot: '#EA580C' },
  estimate_approved: { bg: '#ECFDF5', text: '#059669', dot: '#059669' },
  assigned:          { bg: '#EFF6FF', text: '#1D4ED8', dot: '#3B82F6' },
  in_progress:       { bg: '#EFF6FF', text: '#2563EB', dot: '#2563EB' },
  waiting_parts:     { bg: '#FFFBEB', text: '#D97706', dot: '#F59E0B' },
  work_completed:    { bg: '#F0FDF4', text: '#16A34A', dot: '#22C55E' },
  qc_pending:        { bg: '#F5F3FF', text: '#7C3AED', dot: '#8B5CF6' },
  qc_failed:         { bg: '#FEF2F2', text: '#DC2626', dot: '#EF4444' },
  qc_passed:         { bg: '#ECFDF5', text: '#059669', dot: '#10B981' },
  invoiced:          { bg: '#EFF6FF', text: '#1D4ED8', dot: '#3B82F6' },
  paid:              { bg: '#F0FDF4', text: '#15803D', dot: '#16A34A' },
  delivered:         { bg: '#F0FDF4', text: '#15803D', dot: '#16A34A' },
  cancelled:         { bg: '#FEF2F2', text: '#DC2626', dot: '#EF4444' },
};

// ─── Allowed Transitions ───────────────────────────────────────────────────────

export const ALLOWED_TRANSITIONS: Partial<Record<string, JobCardStatus[]>> = {
  created:           ['inspection_done', 'cancelled'],
  inspection_done:   ['estimate_created', 'cancelled'],
  estimate_created:  ['estimate_approved', 'estimate_created', 'cancelled'],
  estimate_approved: ['assigned', 'cancelled'],
  assigned:          ['in_progress', 'cancelled'],
  in_progress:       ['waiting_parts', 'work_completed', 'cancelled'],
  waiting_parts:     ['in_progress', 'cancelled'],
  work_completed:    ['qc_pending'],
  qc_pending:        ['qc_passed', 'qc_failed'],
  qc_failed:         ['in_progress'],
  qc_passed:         ['invoiced'],
  invoiced:          ['paid'],
  paid:              ['delivered'],
  delivered:         [],
  cancelled:         [],
};

// ─── Utility ───────────────────────────────────────────────────────────────────

export function canTransition(from: JobCardStatus, to: JobCardStatus): boolean {
  const allowed = ALLOWED_TRANSITIONS[from as string];
  return Array.isArray(allowed) && (allowed as string[]).includes(to as string);
}

export function getStatusLabel(status: JobCardStatus): string {
  return JOB_STATUS_LABELS[status as string] ?? status;
}

export function getStatusColors(status: JobCardStatus): StatusColorConfig {
  return JOB_STATUS_COLORS[status as string] ?? JOB_STATUS_COLORS.created;
}
