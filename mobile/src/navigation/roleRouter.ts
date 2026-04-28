import type { UserRole } from '../types';

// ─── Role → screen name mapping ───────────────────────────────────────────────
// Single source of truth — AppNavigator, guards, and deep-link handlers
// all reference this instead of inlining role strings.

export const ROLE_SCREEN: Record<UserRole, string> = {
  OWNER:        'OwnerDashboard',
  SUPER_ADMIN:  'OwnerDashboard',
  MANAGER:      'ManagerDashboard',
  MECHANIC:     'MechanicDashboard',
  RECEPTIONIST: 'ReceptionistDashboard',
} as const;

// ─── API role → UserRole ──────────────────────────────────────────────────────
// The Hana Platform returns lowercase role strings (e.g. "owner", "mechanic").
// This converts them to the internal uppercase enum used throughout the app.

export function mapApiRole(raw: string): UserRole {
  const normalized = raw.toLowerCase().trim();
  const table: Record<string, UserRole> = {
    owner:        'OWNER',
    super_admin:  'SUPER_ADMIN',
    admin:        'SUPER_ADMIN',
    manager:      'MANAGER',
    mechanic:     'MECHANIC',
    receptionist: 'RECEPTIONIST',
    staff:        'RECEPTIONIST', // 'staff' API role maps to receptionist access
  };
  return table[normalized] ?? 'OWNER';
}

// ─── Dashboard screen for a role (accepts both internal or raw API role) ──────

export function getDashboardScreen(role: UserRole | string): string {
  if (role in ROLE_SCREEN) return ROLE_SCREEN[role as UserRole];
  return ROLE_SCREEN[mapApiRole(role)] ?? 'OwnerDashboard';
}

// ─── Dev / dummy token detector ───────────────────────────────────────────────
// Used by AppNavigator to flush stale mock sessions on startup so that
// the user is forced to log in with real credentials.

export function isDevToken(token: string | null | undefined): boolean {
  if (!token) return false;
  return token.startsWith('dev-token-') || token === 'dummy-jwt-token';
}
