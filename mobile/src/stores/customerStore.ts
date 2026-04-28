import { create } from 'zustand';
import type { Customer } from '../types';
import { customerApi, CreateCustomerPayload, UpdateCustomerPayload } from '../api/customerApi';

interface CustomerState {
  customers:  Customer[];
  isLoading:  boolean;
  fetchAll:   () => Promise<void>;
  create:     (payload: CreateCustomerPayload) => Promise<void>;
  update:     (id: string, payload: UpdateCustomerPayload) => Promise<void>;
  /** Local-only removal — no API call (delete API not yet implemented). */
  remove:     (id: string) => void;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  customers: [],
  isLoading: false,

  fetchAll: async () => {
    set({ isLoading: true });
    try {
      const customers = await customerApi.getAll();
      set({ customers });
    } finally {
      set({ isLoading: false });
    }
  },

  create: async (payload) => {
    const newCustomer = await customerApi.create(payload);
    set(s => ({ customers: [newCustomer, ...s.customers] }));
  },

  update: async (id, payload) => {
    await customerApi.update(id, payload);
    // Merge locally — avoids a second round-trip to the server
    set(s => ({
      customers: s.customers.map(c =>
        c.id === id
          ? { ...c, ...payload, phone: payload.mobile ?? c.phone }
          : c,
      ),
    }));
  },

  remove: (id) => {
    set(s => ({ customers: s.customers.filter(c => c.id !== id) }));
  },
}));
