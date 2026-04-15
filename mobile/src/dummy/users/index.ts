import type { User, Company } from '../../types';
import { CREDENTIALS } from '../../config/credentials';

// ─── Dummy Company ────────────────────────────────────────────────────────────

export const dummyCompany: Company = {
  id: 'company-1',
  name: 'Kumar Auto Works',
  address: '12 MG Road, Bangalore, Karnataka 560001',
  mobile: '9876500000',
  email: 'info@kumarauto.com',
  gst_number: '29AABCU9603R1ZX',
  subscription_plan: 'pro',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  bank_details: {
    account_name: 'Kumar Auto Works',
    account_number: '1234567890',
    ifsc_code: 'SBIN0001234',
    bank_name: 'State Bank of India',
    branch: 'MG Road, Bangalore',
    upi_id: 'kumarauto@sbi',
  },
};

// ─── Dummy Users — generated from CREDENTIALS (single source of truth) ───────

export const dummyUsers: (User & { password: string })[] = CREDENTIALS.map((c, i) => ({
  id: `u${i + 1}`,
  name: c.name,
  mobile: c.mobile,
  phone: c.mobile,
  email: `${c.label.toLowerCase()}@garage.com`,
  role: c.role,
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  password: c.password,
}));

// ─── DEV Login Map ────────────────────────────────────────────────────────────

type DevRoleKey = 'owner' | 'manager' | 'mechanic' | 'receptionist';

export const DEV_LOGIN_MAP: Record<DevRoleKey, User & { password: string }> = {
  owner:        dummyUsers[0],
  manager:      dummyUsers[1],
  mechanic:     dummyUsers[2],
  receptionist: dummyUsers[3],
};
