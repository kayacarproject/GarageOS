// ─── Customer ─────────────────────────────────────────────────────────────────

export interface Customer {
  id: string;
  company_id?: string;
  /** @deprecated use company_id */
  companyId?: string;
  name: string;
  /** Always 10-digit mobile number */
  mobile: string;
  /** @deprecated use mobile */
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  created_at: string;
  /** @deprecated use created_at */
  createdAt?: string;

  // Computed / joined fields
  total_services?: number;
  last_service_date?: string;
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface CreateCustomerPayload {
  name: string;
  mobile: string;
  email?: string;
  address?: string;
  city?: string;
}

export type UpdateCustomerPayload = Partial<CreateCustomerPayload>;

// ─── Slim reference used in relations ─────────────────────────────────────────

export type CustomerRef = Pick<Customer, 'id' | 'name' | 'mobile'>;
