// ─── Roles ────────────────────────────────────────────────────────────────────

export type UserRole =
  | 'SUPER_ADMIN'
  | 'OWNER'
  | 'MANAGER'
  | 'MECHANIC'
  | 'RECEPTIONIST';

/** Roles that can see full mobile numbers and sensitive data */
export type PrivilegedRole = Extract<UserRole, 'SUPER_ADMIN' | 'OWNER' | 'MANAGER'>;

// ─── Subscription ─────────────────────────────────────────────────────────────

export type SubscriptionPlan = 'free' | 'starter' | 'pro' | 'enterprise';

// ─── Bank Details ─────────────────────────────────────────────────────────────

export interface BankDetails {
  account_name: string;
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  branch?: string;
  upi_id?: string;
}

// ─── Company ──────────────────────────────────────────────────────────────────

export interface Company {
  id: string;
  name: string;
  address: string;
  mobile: string;
  email: string;
  gst_number?: string;
  logo?: string;
  bank_details?: BankDetails;
  subscription_plan: SubscriptionPlan;
  is_active: boolean;
  created_at: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  /** Primary contact number */
  mobile: string;
  /** @deprecated use mobile — kept for backward compat */
  phone?: string;
  email?: string;
  role: UserRole;
  /** @deprecated use role — kept for backward compat */
  companyName?: string;
  avatar?: string;
  is_active: boolean;
  created_at: string;
}

// ─── Auth State ───────────────────────────────────────────────────────────────

export interface AuthState {
  user: User | null;
  company: Company | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ─── Auth Payloads ────────────────────────────────────────────────────────────

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  company: Company;
}
