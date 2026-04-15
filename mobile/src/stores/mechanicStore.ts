import { create } from 'zustand';
import type { User } from '../types';
import { userService } from '../services/userService';

interface MechanicState {
  mechanics: User[];
  isLoading: boolean;
  fetch: () => Promise<void>;
  add: (name: string, mobile: string, specialization?: string) => Promise<User>;
  update: (id: string, payload: { name?: string; mobile?: string }) => Promise<void>;
  deactivate: (id: string) => Promise<void>;
}

export const useMechanicStore = create<MechanicState>((set, get) => ({
  mechanics: [],
  isLoading: false,

  fetch: async () => {
    set({ isLoading: true });
    try {
      const all = await userService.getAll();
      set({ mechanics: all.filter(u => u.role === 'MECHANIC' && u.is_active) });
    } finally {
      set({ isLoading: false });
    }
  },

  add: async (name, mobile, specialization) => {
    const created = await userService.create({
      name,
      mobile,
      role: 'MECHANIC',
      password: 'mechanic123',
      email: specialization ? `${name.toLowerCase().replace(/\s+/g, '.')}@garage.local` : undefined,
    });
    set(s => ({ mechanics: [...s.mechanics, created] }));
    return created;
  },

  update: async (id, payload) => {
    const updated = await userService.update(id, payload);
    set(s => ({ mechanics: s.mechanics.map(m => m.id === id ? updated : m) }));
  },

  deactivate: async (id) => {
    await userService.deactivate(id);
    set(s => ({ mechanics: s.mechanics.filter(m => m.id !== id) }));
  },
}));
