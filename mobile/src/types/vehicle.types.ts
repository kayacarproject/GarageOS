import type { CustomerRef } from './customer.types';

// ─── Enumerations ─────────────────────────────────────────────────────────────

export type FuelType = 'petrol' | 'diesel' | 'cng' | 'electric' | 'hybrid';

// ─── Vehicle ──────────────────────────────────────────────────────────────────

export interface Vehicle {
  id: string;
  company_id?: string;
  /** @deprecated use company_id */
  companyId?: string;
  customer_id: string;
  /** @deprecated use customer_id */
  customerId?: string;

  registration_number: string;
  /** @deprecated use registration_number */
  licensePlate?: string;

  brand: string;
  /** @deprecated use brand */
  make?: string;

  model: string;
  variant?: string;
  year?: number;
  color?: string;
  fuel_type: FuelType;

  /** Current odometer reading in km */
  current_kms: number;
  /** @deprecated use current_kms */
  mileage?: number;

  chassis_number?: string;
  /** @deprecated use chassis_number */
  vin?: string;

  engine_number?: string;
  image_url?: string;
  /** @deprecated use image_url */
  imageUrl?: string;

  created_at: string;

  // Relations
  customer?: CustomerRef;
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface CreateVehiclePayload {
  customer_id: string;
  registration_number: string;
  brand: string;
  model: string;
  variant?: string;
  year?: number;
  color?: string;
  fuel_type: FuelType;
  current_kms: number;
  chassis_number?: string;
  engine_number?: string;
}

export type UpdateVehiclePayload = Partial<Omit<CreateVehiclePayload, 'customer_id'>>;

// ─── Slim reference used in relations ─────────────────────────────────────────

export type VehicleRef = Pick<Vehicle, 'id' | 'registration_number' | 'brand' | 'model'>;
