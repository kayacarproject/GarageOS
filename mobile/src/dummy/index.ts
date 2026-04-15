// ─── Central Dummy Data Exports ───────────────────────────────────────────────
// Replace each import with an API call when moving to production.
// All service functions follow the same signature so swapping is a one-line change.

export { dummyCustomers }  from './customers';
export { dummyVehicles }   from './vehicles';
export { dummyJobCards }   from './jobCards';
export { dummyBookings }   from './bookings';
export { dummyEstimates }  from './estimates';
export { dummyInvoices }   from './invoices';
export { dummyPayments }   from './payments';
export { dummyUsers, dummyCompany, DEV_LOGIN_MAP } from './users';

// ─── Imports for helpers ──────────────────────────────────────────────────────

import { dummyCustomers }  from './customers';
import { dummyVehicles }   from './vehicles';
import { dummyJobCards }   from './jobCards';
import { dummyEstimates }  from './estimates';
import { dummyInvoices }   from './invoices';
import { dummyPayments }   from './payments';
import { dummyBookings }   from './bookings';

import type { Vehicle, JobCard, Estimate, Invoice, Payment, Booking } from '../types';

// ─── Helper: getCustomerVehicles ──────────────────────────────────────────────

/**
 * Returns all vehicles owned by a customer.
 * API equivalent: GET /api/v1/vehicles?customerId=:id
 */
export function getCustomerVehicles(customerId: string): Vehicle[] {
  return dummyVehicles.filter(
    (v) => v.customer_id === customerId || v.customerId === customerId,
  );
}

// ─── Helper: getJobCardFullDetails ────────────────────────────────────────────

export interface JobCardFullDetails {
  jobCard:   JobCard;
  estimate:  Estimate | undefined;
  invoice:   Invoice  | undefined;
  payments:  Payment[];
}

/**
 * Returns a job card with its linked estimate, invoice, and payments.
 * API equivalent: GET /api/v1/job-cards/:id?include=estimate,invoice,payments
 */
export function getJobCardFullDetails(jobCardId: string): JobCardFullDetails | null {
  const jobCard = dummyJobCards.find((j) => j.id === jobCardId);
  if (!jobCard) return null;

  const estimate = dummyEstimates.find(
    (e) => (e.job_card_id === jobCardId || e.jobCardId === jobCardId) && e.status === 'approved',
  );
  const invoice  = dummyInvoices.find(
    (i) => i.job_card_id === jobCardId || i.jobCardId === jobCardId,
  );
  const payments = dummyPayments.filter((p) => p.job_card_id === jobCardId);

  return { jobCard, estimate, invoice, payments };
}

// ─── Helper: getPendingInvoices ───────────────────────────────────────────────

/**
 * Returns all invoices with an outstanding balance, sorted by balance descending.
 * API equivalent: GET /api/v1/invoices?status=issued,partially_paid
 */
export function getPendingInvoices(): Invoice[] {
  return dummyInvoices
    .filter((i) => !i.is_locked && i.balance_due > 0)
    .sort((a, b) => b.balance_due - a.balance_due);
}

// ─── Helper: getCustomerJobHistory ────────────────────────────────────────────

/**
 * Returns all job cards for a customer, newest first.
 * API equivalent: GET /api/v1/job-cards?customerId=:id&sort=-createdAt
 */
export function getCustomerJobHistory(customerId: string): JobCard[] {
  return dummyJobCards
    .filter((j) => j.customer_id === customerId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// ─── Helper: getTodayBookings ─────────────────────────────────────────────────

/**
 * Returns bookings scheduled for today, sorted by time.
 * API equivalent: GET /api/v1/bookings?date=:today
 */
export function getTodayBookings(dateStr?: string): Booking[] {
  const today = dateStr ?? new Date().toISOString().split('T')[0];
  return dummyBookings
    .filter((b) => b.scheduled_date === today)
    .sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time));
}

// ─── Helper: getJobsByMechanic ────────────────────────────────────────────────

/**
 * Returns active job cards assigned to a mechanic.
 * API equivalent: GET /api/v1/job-cards?mechanicId=:id&status=active
 */
export function getJobsByMechanic(mechanicId: string): JobCard[] {
  const terminal = new Set(['delivered', 'cancelled']);
  return dummyJobCards.filter(
    (j) =>
      (j.mechanic_id === mechanicId || j.mechanicId === mechanicId) &&
      !terminal.has(j.status as string),
  );
}

/*
 * ─── Migration Guide ──────────────────────────────────────────────────────────
 *
 * REST API (Express + PostgreSQL / MongoDB):
 *
 *   Each helper maps 1:1 to an API endpoint:
 *
 *   getCustomerVehicles(id)      → GET  /api/v1/vehicles?customerId=:id
 *   getJobCardFullDetails(id)    → GET  /api/v1/job-cards/:id?include=estimate,invoice,payments
 *   getPendingInvoices()         → GET  /api/v1/invoices?status=issued,partially_paid
 *   getCustomerJobHistory(id)    → GET  /api/v1/job-cards?customerId=:id&sort=-createdAt
 *   getTodayBookings(date)       → GET  /api/v1/bookings?date=:date
 *   getJobsByMechanic(id)        → GET  /api/v1/job-cards?mechanicId=:id&status=active
 *
 * To migrate a service (e.g. jobCardService.ts):
 *   1. Change `if (env.USE_DUMMY_DATA)` block to call the API instead
 *   2. The return types stay identical — no component changes needed
 *   3. Set USE_DUMMY_DATA = false in env.ts
 *
 * PostgreSQL schema hints:
 *   - All tables have company_id (UUID) for multi-tenancy row-level security
 *   - Use JSONB for work_logs, photos, gps_created, gps_delivered
 *   - Add GIN index on work_logs for fast status history queries
 *   - Invoices: add CHECK (balance_due >= 0) constraint
 *   - Payments: add CHECK (amount > 0) constraint
 *
 * MongoDB collection hints:
 *   - Embed work_logs and photos inside job_cards document
 *   - Embed items inside estimates and invoices
 *   - Reference customers and vehicles by ID (no embedding — they change)
 *   - Index: { company_id: 1, status: 1 } on job_cards
 *   - Index: { company_id: 1, scheduled_date: 1 } on bookings
 */
