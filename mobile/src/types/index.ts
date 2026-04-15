// ─── Auth ─────────────────────────────────────────────────────────────────────
export type {
  UserRole,
  PrivilegedRole,
  SubscriptionPlan,
  BankDetails,
  Company,
  User,
  AuthState,
  LoginPayload,
  LoginResponse,
} from './auth.types';

// ─── Customer ─────────────────────────────────────────────────────────────────
export type {
  Customer,
  CustomerRef,
  CreateCustomerPayload,
  UpdateCustomerPayload,
} from './customer.types';

// ─── Vehicle ──────────────────────────────────────────────────────────────────
export type {
  FuelType,
  Vehicle,
  VehicleRef,
  CreateVehiclePayload,
  UpdateVehiclePayload,
} from './vehicle.types';

// ─── Inspection ───────────────────────────────────────────────────────────────
export type {
  InspectionType,
  InspectionRating,
  InspectionComponents,
  Inspection,
  CreateInspectionPayload,
} from './inspection.types';

// ─── Job Card ─────────────────────────────────────────────────────────────────
export type {
  JobCardStatus,
  WorkType,
  Priority,
  PhotoType,
  GPSPoint,
  JobPhoto,
  WorkLog,
  MechanicRef,
  JobCard,
  CreateJobCardPayload,
  AssignMechanicPayload,
  UpdateJobStatusPayload,
} from './jobCard.types';

// ─── Estimate ─────────────────────────────────────────────────────────────────
export type {
  EstimateStatus,
  EstimateItemType,
  EstimateItem,
  Estimate,
  CreateEstimateItemPayload,
  CreateEstimatePayload,
  ApproveEstimatePayload,
} from './estimate.types';

// ─── Invoice ──────────────────────────────────────────────────────────────────
export type {
  InvoiceStatus,
  Invoice,
  CreateInvoicePayload,
} from './invoice.types';

// ─── Payment ──────────────────────────────────────────────────────────────────
export type {
  PaymentMode,
  PaymentStatus,
  PaymentPurpose,
  Payment,
  CreatePaymentPayload,
} from './payment.types';

// ─── Booking ──────────────────────────────────────────────────────────────────
export type {
  BookingStatus,
  ServiceTypeHint,
  Booking,
  CreateBookingPayload,
  UpdateBookingPayload,
} from './booking.types';

// ─── Legacy aliases (keep existing screens/stores compiling) ──────────────────
import type { UserRole } from './auth.types';
import type { JobCardStatus } from './jobCard.types';
import type { PaymentMode } from './payment.types';

/** @deprecated use UserRole */
export type Role = UserRole;

/** @deprecated use JobCardStatus */
export type JobStatus = JobCardStatus;

/** @deprecated use PaymentMode */
export type PaymentMethod = PaymentMode;
