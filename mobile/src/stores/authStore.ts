import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Company } from '../types';
import { hasPermission } from '../constants/permissions';
import { UserRole } from '../types';

// ─── State & Actions ──────────────────────────────────────────────────────────

interface AuthState {
  // State
  user: User | null;
  company: Company | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;

  // Actions
  login: (user: User, company: Company | null, token: string, refreshToken?: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHydrated: () => void;

  // Permission helpers — all derived from centralized matrix
  canSeeFullMobile: () => boolean;
  canViewFinancials: () => boolean;
  canApproveEstimate: () => boolean;
  canAssignMechanic: () => boolean;
  canManageUsers: () => boolean;
  canCreateJobCard: () => boolean;
  canCreateBooking: () => boolean;
  canViewAllJobs: () => boolean;
  canDeleteRecords: () => boolean;
  canUpdateOwnJobOnly: () => boolean;
}

// ─── Custom AsyncStorage adapter ─────────────────────────────────────────────

const asyncStorageAdapter = createJSONStorage(() => AsyncStorage);

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      company: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,
      error: null,

      // ── Actions ──────────────────────────────────────────────────────────

      login: (user, company, token, refreshToken) =>
        set({ user, company, token, refreshToken: refreshToken ?? null, isAuthenticated: true, error: null }),

      logout: () =>
        set({ user: null, company: null, token: null, refreshToken: null, isAuthenticated: false }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      setHydrated: () => set({ isHydrated: true }),

      // ── Permission helpers ────────────────────────────────────────────────

      canSeeFullMobile: () => {
        const role = get().user?.role as UserRole | undefined;
        return role ? hasPermission(role, 'seeFullMobile') : false;
      },

      canViewFinancials: () => {
        const role = get().user?.role as UserRole | undefined;
        return role ? hasPermission(role, 'viewFinancials') : false;
      },

      canApproveEstimate: () => {
        const role = get().user?.role as UserRole | undefined;
        return role ? hasPermission(role, 'approveEstimate') : false;
      },

      canAssignMechanic: () => {
        const role = get().user?.role as UserRole | undefined;
        return role ? hasPermission(role, 'assignMechanic') : false;
      },

      canManageUsers: () => {
        const role = get().user?.role as UserRole | undefined;
        return role ? hasPermission(role, 'manageUsers') : false;
      },

      canCreateJobCard: () => {
        const role = get().user?.role as UserRole | undefined;
        return role ? hasPermission(role, 'createJobCard') : false;
      },

      canCreateBooking: () => {
        const role = get().user?.role as UserRole | undefined;
        return role ? hasPermission(role, 'createBooking') : false;
      },

      canViewAllJobs: () => {
        const role = get().user?.role as UserRole | undefined;
        return role ? hasPermission(role, 'viewAllJobs') : false;
      },

      canDeleteRecords: () => {
        const role = get().user?.role as UserRole | undefined;
        return role ? hasPermission(role, 'deleteRecords') : false;
      },

      canUpdateOwnJobOnly: () => {
        const role = get().user?.role as UserRole | undefined;
        return role === 'MECHANIC';
      },
    }),
    {
      name: 'garageos-auth',
      storage: asyncStorageAdapter,
      // Only persist these fields — never persist loading/error state
      partialize: (state) => ({
        user: state.user,
        company: state.company,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state, error) => {
        // Mark hydrated on success OR on error so the app never gets stuck
        if (state) {
          state.setHydrated();
        } else {
          // AsyncStorage failed — reset to logged-out state and unblock the UI
          useAuthStore.setState({ isHydrated: true, isAuthenticated: false, user: null, token: null });
        }
      },
    },
  ),
);
