import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminUser } from '../types';

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Dummy super admin credentials — replace with real API call
const SUPER_ADMIN: AdminUser = { id: 'sa1', name: 'Super Admin', email: 'admin@garageos.in', role: 'superadmin' };

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        // Replace with: const { data } = await axios.post('/admin/v1/auth/login', { email, password })
        if (email === 'admin@garageos.in' && password === 'admin123') {
          set({ user: SUPER_ADMIN, token: 'dummy-superadmin-token', isAuthenticated: true });
        } else {
          throw new Error('Invalid credentials');
        }
      },

      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'garageos-admin-auth',
      partialize: (s) => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated }),
    },
  ),
);
