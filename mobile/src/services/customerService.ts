import api from './api';
import env from '../config/env';
import { dummyCustomers } from '../dummy/customers';
import { dummyVehicles } from '../dummy/vehicles';
import { dummyJobCards } from '../dummy/jobCards';
import type { Customer, Vehicle, JobCard, CreateCustomerPayload, UpdateCustomerPayload } from '../types';

// ─── Mobile masking ───────────────────────────────────────────────────────────

type MaskRole = 'OWNER' | 'SUPER_ADMIN' | 'MANAGER' | 'MECHANIC' | 'RECEPTIONIST';
const FULL_MOBILE_ROLES = new Set<MaskRole>(['OWNER', 'SUPER_ADMIN', 'MANAGER']);

function maskMobileForRole(mobile: string, role?: MaskRole): string {
  if (!role || FULL_MOBILE_ROLES.has(role)) return mobile;
  return `XXXXXX${mobile.slice(-4)}`;
}

function applyMobileMask(customer: Customer, role?: MaskRole): Customer {
  if (!role || FULL_MOBILE_ROLES.has(role)) return customer;
  return { ...customer, mobile: maskMobileForRole(customer.mobile, role), phone: undefined };
}

// ─── Search logic ─────────────────────────────────────────────────────────────

function searchDummy(customers: Customer[], query: string): Customer[] {
  const q = query.trim();
  if (!q) return customers;
  // 10-digit number → exact mobile match
  if (/^\d{10}$/.test(q)) return customers.filter((c) => c.mobile === q || c.phone === q);
  // text → name ILIKE
  const lower = q.toLowerCase();
  return customers.filter((c) => c.name.toLowerCase().includes(lower));
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const customerService = {
  async getAll(search?: string, role?: MaskRole): Promise<Customer[]> {
    if (env.USE_DUMMY_DATA) {
      const results = searchDummy(dummyCustomers, search ?? '');
      return results.map((c) => applyMobileMask(c, role));
    }
    const { data } = await api.get<Customer[]>('/customers', { params: { search } });
    return data;
  },

  async getById(id: string, role?: MaskRole): Promise<Customer> {
    if (env.USE_DUMMY_DATA) {
      const c = dummyCustomers.find((c) => c.id === id);
      if (!c) throw new Error(`Customer not found: ${id}`);
      return applyMobileMask(c, role);
    }
    const { data } = await api.get<Customer>(`/customers/${id}`);
    return data;
  },

  async create(payload: CreateCustomerPayload): Promise<Customer> {
    if (env.USE_DUMMY_DATA) {
      const now = new Date().toISOString();
      const newC: Customer = {
        ...payload,
        id: `cust-${Date.now()}`,
        company_id: 'c1',
        companyId: 'c1',
        created_at: now,
        createdAt: now,
        total_services: 0,
      };
      dummyCustomers.push(newC);
      return newC;
    }
    const { data } = await api.post<Customer>('/customers', payload);
    return data;
  },

  async update(id: string, payload: UpdateCustomerPayload): Promise<Customer> {
    if (env.USE_DUMMY_DATA) {
      const idx = dummyCustomers.findIndex((c) => c.id === id);
      if (idx === -1) throw new Error(`Customer not found: ${id}`);
      dummyCustomers[idx] = { ...dummyCustomers[idx], ...payload };
      return dummyCustomers[idx];
    }
    const { data } = await api.put<Customer>(`/customers/${id}`, payload);
    return data;
  },

  /** Returns all vehicles owned by a customer */
  async getVehicles(customerId: string): Promise<Vehicle[]> {
    if (env.USE_DUMMY_DATA) {
      return dummyVehicles.filter(
        (v) => v.customer_id === customerId || v.customerId === customerId,
      );
    }
    const { data } = await api.get<Vehicle[]>(`/customers/${customerId}/vehicles`);
    return data;
  },

  /** Returns all job cards for a customer, newest first */
  async getJobCards(customerId: string): Promise<JobCard[]> {
    if (env.USE_DUMMY_DATA) {
      return dummyJobCards
        .filter((j) => j.customer_id === customerId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    const { data } = await api.get<JobCard[]>(`/customers/${customerId}/job-cards`);
    return data;
  },
};
