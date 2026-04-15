import type { CustomerRef } from './customer.types';
import type { VehicleRef } from './vehicle.types';

// ─── Enumerations ─────────────────────────────────────────────────────────────

export type BookingStatus =
  | 'confirmed'
  | 'arrived'
  | 'cancelled'
  | 'no_show'
  // Legacy (backward compat)
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'COMPLETED';

export type ServiceTypeHint = 'service' | 'repair' | 'inspection' | 'other';

// ─── Booking ──────────────────────────────────────────────────────────────────

export interface Booking {
  id: string;
  company_id?: string;
  /** @deprecated use company_id */
  companyId?: string;

  customer_id: string;
  /** @deprecated use customer_id */
  customerId?: string;

  vehicle_id?: string;
  /** @deprecated use vehicle_id */
  vehicleId?: string;

  /** Linked once job card is created from this booking */
  job_card_id?: string;

  /** ISO date string e.g. "2024-12-25" */
  scheduled_date: string;
  /** 24h time string e.g. "10:30" */
  scheduled_time: string;
  /** @deprecated use scheduled_date + scheduled_time */
  scheduledAt?: string;

  service_type_hint: ServiceTypeHint;
  /** @deprecated use service_type_hint */
  serviceType?: string;

  notes?: string;
  status: BookingStatus;
  created_by: string;
  created_at: string;

  // Relations
  customer?: CustomerRef;
  vehicle?: VehicleRef;
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface CreateBookingPayload {
  customer_id: string;
  vehicle_id?: string;
  scheduled_date: string;
  scheduled_time: string;
  service_type_hint: ServiceTypeHint;
  notes?: string;
}

export type UpdateBookingPayload = Partial<
  Pick<CreateBookingPayload, 'scheduled_date' | 'scheduled_time' | 'service_type_hint' | 'notes'>
> & { status?: BookingStatus };
