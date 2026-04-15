import type { CustomerRef } from './customer.types';
import type { VehicleRef } from './vehicle.types';
import type { Inspection } from './inspection.types';

// ─── Enumerations ─────────────────────────────────────────────────────────────

export type JobCardStatus =
  | 'created'
  | 'inspection_done'
  | 'estimate_created'
  | 'estimate_approved'
  | 'assigned'
  | 'in_progress'
  | 'waiting_parts'
  | 'work_completed'
  | 'qc_pending'
  | 'qc_failed'
  | 'qc_passed'
  | 'invoiced'
  | 'paid'
  | 'delivered'
  | 'cancelled'
  // Legacy statuses (backward compat)
  | 'CREATED'
  | 'CHECKED_IN'
  | 'IN_PROGRESS'
  | 'WAITING_PARTS'
  | 'QUALITY_CHECK'
  | 'READY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'PENDING'
  | 'COMPLETED';

export type WorkType = 'service' | 'repair' | 'both';

export type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type PhotoType =
  | 'front'
  | 'rear'
  | 'left'
  | 'right'
  | 'dashboard'
  | 'damage'
  | 'work'
  | 'completed';

// ─── GPS ──────────────────────────────────────────────────────────────────────

export interface GPSPoint {
  latitude: number;
  longitude: number;
  timestamp: string;
  label?: string;
}

// ─── Job Photo ────────────────────────────────────────────────────────────────

export interface JobPhoto {
  id: string;
  job_card_id: string;
  url: string;
  type: PhotoType;
  uploaded_at: string;
}

// ─── Work Log ─────────────────────────────────────────────────────────────────

export interface WorkLog {
  id: string;
  job_card_id: string;
  actor_id: string;
  from_status: JobCardStatus;
  to_status: JobCardStatus;
  notes?: string;
  created_at: string;
  /** @deprecated use actor_id */
  mechanic_id?: string;
  /** @deprecated use from_status/to_status */
  status?: JobCardStatus;
}

// ─── Mechanic Reference ───────────────────────────────────────────────────────

export interface MechanicRef {
  id: string;
  name: string;
}

// ─── Job Card ─────────────────────────────────────────────────────────────────

export interface JobCard {
  id: string;
  job_number: string;
  company_id?: string;
  /** @deprecated use company_id */
  companyId?: string;

  vehicle_id: string;
  /** @deprecated use vehicle_id */
  vehicleId?: string;

  customer_id: string;
  mechanic_id?: string;
  /** @deprecated use mechanic_id */
  mechanicId?: string;

  booking_id?: string;
  work_type: WorkType;
  status: JobCardStatus;
  priority: Priority;

  current_kms: number;

  gps_created?: GPSPoint;
  gps_delivered?: GPSPoint;

  photos?: JobPhoto[];
  description?: string;
  notes?: string;

  created_at: string;
  updated_at: string;
  delivered_at?: string;

  /** @deprecated use created_at */
  inDate?: string;
  /** @deprecated use delivered_at */
  outDate?: string;

  // Relations
  vehicle?: VehicleRef & { customer?: CustomerRef };
  customer?: CustomerRef;
  mechanic?: MechanicRef;
  inspections?: Inspection[];
  work_logs?: WorkLog[];
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface CreateJobCardPayload {
  vehicle_id: string;
  customer_id: string;
  mechanic_id?: string;
  booking_id?: string;
  work_type: WorkType;
  priority: Priority;
  current_kms: number;
  description?: string;
  notes?: string;
  gps_created?: GPSPoint;
}

export interface AssignMechanicPayload {
  mechanic_id: string;
}

export interface UpdateJobStatusPayload {
  status: JobCardStatus;
  notes?: string;
}
