/**
 * CREDENTIALS.ts
 * ─────────────────────────────────────────────────────────────
 * Single source of truth for all user login credentials.
 *
 * In production:  these come from your backend / database.
 * In development: these match dummyUsers in dummy/users/index.ts
 *
 * To add a new user:
 *   1. Add an entry here
 *   2. Add the matching user in dummy/users/index.ts
 *   3. That's it — login + role navigation works automatically
 * ─────────────────────────────────────────────────────────────
 */

export type AppRole = 'OWNER' | 'MANAGER' | 'MECHANIC' | 'RECEPTIONIST';

export interface UserCredential {
  role: AppRole;
  label: string;           // display name for the role
  name: string;            // person's name
  mobile: string;          // login identifier
  password: string;        // login password
  color: string;           // UI accent color for this role
  bg: string;              // light background for this role
  icon: string;            // Ionicons icon name
  description: string;     // one-line role description
  permissions: string[];   // what this role can do (shown in guide)
}

export const CREDENTIALS: UserCredential[] = [
  {
    role: 'OWNER',
    label: 'Owner',
    name: 'Rajesh Kumar',
    mobile: '9876543210',
    password: 'owner@123',
    color: '#2563EB',
    bg: '#EFF6FF',
    icon: 'shield-checkmark-outline',
    description: 'Garage business owner — full access to everything',
    permissions: [
      'Full revenue dashboard & reports',
      'Approve / reject estimates',
      'View all jobs across the garage',
      'Manage staff & mechanics',
      'Invoices & payment collection',
    ],
  },
  {
    role: 'MANAGER',
    label: 'Manager',
    name: 'Priya Sharma',
    mobile: '9876543211',
    password: 'manager@123',
    color: '#7C3AED',
    bg: '#F5F3FF',
    icon: 'briefcase-outline',
    description: 'Manages day-to-day garage operations',
    permissions: [
      'Assign mechanics to job cards',
      'Add & manage mechanic list',
      'View & filter all jobs',
      'Create new job cards',
      'Approve estimates',
    ],
  },
  {
    role: 'MECHANIC',
    label: 'Mechanic',
    name: 'Suresh Kumar',
    mobile: '9876543212',
    password: 'mechanic@123',
    color: '#059669',
    bg: '#ECFDF5',
    icon: 'construct-outline',
    description: 'Workshop technician — sees only their assigned jobs',
    permissions: [
      'View only jobs assigned to them',
      'Update job status (start / pause / complete)',
      'Log work notes & progress',
      'Upload before/after job photos',
    ],
  },
  {
    role: 'RECEPTIONIST',
    label: 'Receptionist',
    name: 'Anita Desai',
    mobile: '9876543213',
    password: 'reception@123',
    color: '#D97706',
    bg: '#FFFBEB',
    icon: 'person-circle-outline',
    description: 'Front desk — handles bookings & vehicle check-ins',
    permissions: [
      'Create & manage bookings',
      'Check-in vehicles & create job cards',
      'Search customers & vehicle history',
      'Add new customers & vehicles',
    ],
  },
];

/** Look up a credential by mobile number */
export const findByMobile = (mobile: string): UserCredential | undefined =>
  CREDENTIALS.find(c => c.mobile === mobile);

/** Look up a credential by role */
export const findByRole = (role: AppRole): UserCredential | undefined =>
  CREDENTIALS.find(c => c.role === role);
