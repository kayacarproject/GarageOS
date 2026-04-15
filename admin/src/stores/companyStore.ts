import { create } from 'zustand';
import type { Company, CompanyUser, CompanyStatus, SubscriptionPlan } from '../types';
import { dummyCompanies, dummyUsers } from '../dummy/companies';

interface CompanyState {
  companies: Company[];
  users: CompanyUser[];
  selected: Company | null;

  // Company actions
  setSelected: (company: Company | null) => void;
  updateStatus: (id: string, status: CompanyStatus) => void;
  updatePlan: (id: string, plan: SubscriptionPlan) => void;

  // User actions
  getUsersByCompany: (companyId: string) => CompanyUser[];
  addUser: (user: Omit<CompanyUser, 'id' | 'createdAt'>) => void;
  deactivateUser: (userId: string) => void;
}

export const useCompanyStore = create<CompanyState>((set, get) => ({
  companies: dummyCompanies,
  users: dummyUsers,
  selected: null,

  setSelected: (company) => set({ selected: company }),

  updateStatus: (id, status) =>
    set((s) => ({
      companies: s.companies.map((c) => c.id === id ? { ...c, status } : c),
      selected: s.selected?.id === id ? { ...s.selected, status } : s.selected,
    })),

  updatePlan: (id, plan) =>
    set((s) => ({
      companies: s.companies.map((c) => c.id === id ? { ...c, plan } : c),
      selected: s.selected?.id === id ? { ...s.selected, plan } : s.selected,
    })),

  getUsersByCompany: (companyId) =>
    get().users.filter((u) => u.companyId === companyId),

  addUser: (user) =>
    set((s) => ({
      users: [
        ...s.users,
        { ...user, id: `u-${Date.now()}`, createdAt: new Date().toISOString().split('T')[0] },
      ],
    })),

  deactivateUser: (userId) =>
    set((s) => ({
      users: s.users.map((u) => u.id === userId ? { ...u, isActive: false } : u),
    })),
}));
