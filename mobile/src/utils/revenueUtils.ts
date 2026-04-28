import type { HanaPayment } from '../api/paymentApi';
import type { HanaInvoice } from '../api/invoiceApi';
import type { HanaJobCard } from '../api/jobcardApi';

// ─── Period ───────────────────────────────────────────────────────────────────

export type Period = 'today' | 'week' | 'month';

export interface DateRange {
  start: Date;
  end:   Date;
}

// ─── Computed output types ────────────────────────────────────────────────────

export interface PaymentBreakdownItem {
  mode:    string;
  amount:  number;
  percent: number; // 0-100
}

export interface JobStats {
  total:      number;
  completed:  number;
  inProgress: number;
  pending:    number;
}

export interface RevenueMetrics {
  totalRevenue:       number;
  pendingCollections: number;
  growthPercent:      number;
  breakdown:          PaymentBreakdownItem[];
  jobStats:           JobStats;
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function endOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(23, 59, 59, 999);
  return c;
}

export function getDateRange(period: Period): DateRange {
  const now = new Date();
  switch (period) {
    case 'today':
      return { start: startOfDay(now), end: now };

    case 'week': {
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Mon = 0
      return { start: startOfDay(monday), end: now };
    }

    case 'month': {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: startOfDay(first), end: now };
    }
  }
}

export function getPreviousRange(period: Period): DateRange {
  const now = new Date();
  switch (period) {
    case 'today': {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
    }

    case 'week': {
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
      const prevMonday = new Date(monday);
      prevMonday.setDate(monday.getDate() - 7);
      const prevSunday = new Date(monday);
      prevSunday.setDate(monday.getDate() - 1);
      return { start: startOfDay(prevMonday), end: endOfDay(prevSunday) };
    }

    case 'month': {
      const firstThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastPrevMonth  = new Date(firstThisMonth);
      lastPrevMonth.setDate(0); // last day of prev month
      const firstPrevMonth = new Date(lastPrevMonth.getFullYear(), lastPrevMonth.getMonth(), 1);
      return { start: startOfDay(firstPrevMonth), end: endOfDay(lastPrevMonth) };
    }
  }
}

export function getPeriodLabel(period: Period): string {
  switch (period) {
    case 'today': return 'yesterday';
    case 'week':  return 'last week';
    case 'month': return 'last month';
  }
}

function inRange(dateStr: string | undefined, range: DateRange): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return d >= range.start && d <= range.end;
}

// ─── Calculations ─────────────────────────────────────────────────────────────

/** Total received payments in the given range. All records in payment collection are received. */
export function calcRevenue(payments: HanaPayment[], range: DateRange): number {
  return payments
    .filter(p => inRange(p.collectedAt, range))
    .reduce((sum, p) => sum + (p.amount ?? 0), 0);
}

/** All outstanding invoice balances — not date-filtered (outstanding = still owed). */
export function calcPendingCollections(invoices: HanaInvoice[]): number {
  return invoices
    .filter(i => i.paymentStatus !== 'paid')
    .reduce((sum, i) => sum + (i.balanceDue ?? 0), 0);
}

/** Unpaid invoice count — useful for dashboard badge. */
export function calcPendingCount(invoices: HanaInvoice[]): number {
  return invoices.filter(i => i.paymentStatus !== 'paid').length;
}

/** Payment breakdown by mode with percentages, sorted largest first. */
export function calcBreakdown(payments: HanaPayment[], range: DateRange): PaymentBreakdownItem[] {
  const filtered = payments.filter(p => inRange(p.collectedAt, range));
  const total    = filtered.reduce((sum, p) => sum + (p.amount ?? 0), 0);

  const byMode: Record<string, number> = {};
  for (const p of filtered) {
    const mode = p.mode ?? 'other';
    byMode[mode] = (byMode[mode] ?? 0) + (p.amount ?? 0);
  }

  return Object.entries(byMode)
    .map(([mode, amount]) => ({
      mode,
      amount,
      percent: total > 0 ? Math.round((amount / total) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

/** Job card statistics for jobs created within the range. */
export function calcJobStats(jobcards: HanaJobCard[], range: DateRange): JobStats {
  const filtered = jobcards.filter(j => inRange(j.createdAt, range));
  return {
    total:      filtered.length,
    completed:  filtered.filter(j => j.status === 'completed').length,
    inProgress: filtered.filter(j => j.status === 'in_progress').length,
    pending:    filtered.filter(j => j.status === 'open').length,
  };
}

/**
 * Growth % of current vs previous.
 * Returns 100 if previous was 0 and current > 0; 0 if both are 0.
 */
export function calcGrowthPercent(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/** Compute all revenue metrics for a given period from raw API data. */
export function computeMetrics(
  payments: HanaPayment[],
  invoices: HanaInvoice[],
  jobcards: HanaJobCard[],
  period:   Period,
): RevenueMetrics {
  const range     = getDateRange(period);
  const prevRange = getPreviousRange(period);

  const totalRevenue  = calcRevenue(payments, range);
  const prevRevenue   = calcRevenue(payments, prevRange);

  return {
    totalRevenue,
    pendingCollections: calcPendingCollections(invoices),
    growthPercent:      calcGrowthPercent(totalRevenue, prevRevenue),
    breakdown:          calcBreakdown(payments, range),
    jobStats:           calcJobStats(jobcards, range),
  };
}

/** Format Indian rupee amount without decimals. */
export function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}
