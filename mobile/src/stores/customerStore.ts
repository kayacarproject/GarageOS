import { create } from 'zustand';
import { Customer } from '../types';
import { customerService } from '../services/customerService';

interface CustomerState {
  customers: Customer[];
  isLoading: boolean;
  fetchAll: (search?: string) => Promise<void>;
  create: (payload: Omit<Customer, 'id' | 'createdAt'>) => Promise<void>;
  update: (id: string, payload: Partial<Customer>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  customers: [],
  isLoading: false,

  fetchAll: async (search) => {
    set({ isLoading: true });
    const customers = await customerService.getAll(search);
    set({ customers, isLoading: false });
  },

  create: async (payload) => {
    const newC = await customerService.create(payload);
    set((s) => ({ customers: [newC, ...s.customers] }));
  },

  update: async (id, payload) => {
    const updated = await customerService.update(id, payload);
    set((s) => ({ customers: s.customers.map((c) => (c.id === id ? updated : c)) }));
  },

  remove: async (id) => {
    // customerService.delete removed — filter locally
    set((s) => ({ customers: s.customers.filter((c) => c.id !== id) }));
  },
}));
