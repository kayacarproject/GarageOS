// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'superadmin';
}

// ─── Company ──────────────────────────────────────────────────────────────────

export type SubscriptionPlan = 'Free' | 'Starter' | 'Pro' | 'Enterprise';
export type CompanyStatus = 'Active' | 'Suspended' | 'Trial';

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  ifsc: string;
  bank: string;
}

export interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  gst?: string;
  bankDetails?: BankDetails;
  plan: SubscriptionPlan;
  status: CompanyStatus;
  usersCount: number;
  activeJobs: number;
  totalJobCards: number;
  totalVehicles: number;
  totalRevenue: number;
  createdAt: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export type UserRole = 'OWNER' | 'MANAGER' | 'MECHANIC' | 'RECEPTIONIST';

export interface CompanyUser {
  id: string;
  companyId: string;
  name: string;
  mobile: string;
  email?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

// ─── Subscription ─────────────────────────────────────────────────────────────

export interface PlanFeature {
  label: string;
  included: boolean;
}

export interface Plan {
  id: SubscriptionPlan;
  price: number;
  priceLabel: string;
  features: PlanFeature[];
  userLimit: number;
  jobCardLimit: number;
  colorClass: string;
  highlight?: boolean;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface MonthlyDataPoint {
  month: string;
  companies: number;
  revenue: number;
  jobs: number;
}
