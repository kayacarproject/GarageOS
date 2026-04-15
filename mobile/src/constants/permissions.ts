import { UserRole } from '../types';

/**
 * Central permission matrix for GarageOS.
 * All role-based access decisions must reference this file.
 * Never hardcode role checks in UI components.
 */

type PermissionKey =
  | 'seeFullMobile'
  | 'viewFinancials'
  | 'approveEstimate'
  | 'assignMechanic'
  | 'manageUsers'
  | 'manageCompany'
  | 'createJobCard'
  | 'updateOwnJobOnly'
  | 'createBooking'
  | 'viewAllJobs'
  | 'deleteRecords';

const PERMISSIONS: Record<UserRole, PermissionKey[]> = {
  SUPER_ADMIN: [
    'seeFullMobile', 'viewFinancials', 'approveEstimate', 'assignMechanic',
    'manageUsers', 'manageCompany', 'createJobCard', 'createBooking',
    'viewAllJobs', 'deleteRecords',
  ],
  OWNER: [
    'seeFullMobile', 'viewFinancials', 'approveEstimate', 'assignMechanic',
    'manageUsers', 'createJobCard', 'createBooking', 'viewAllJobs', 'deleteRecords',
  ],
  MANAGER: [
    'approveEstimate', 'assignMechanic', 'createJobCard',
    'createBooking', 'viewAllJobs',
  ],
  MECHANIC: [
    'updateOwnJobOnly',
  ],
  RECEPTIONIST: [
    'createBooking', 'createJobCard',
  ],
};

export const hasPermission = (role: UserRole, permission: PermissionKey): boolean =>
  PERMISSIONS[role]?.includes(permission) ?? false;
