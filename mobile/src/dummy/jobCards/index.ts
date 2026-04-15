import type { JobCard } from '../../types';

export const dummyJobCards: JobCard[] = [
  // ── JC-0001 · in_progress · Full service + brakes ─────────────────────────
  {
    id: 'jc1', job_number: 'JC-0001', company_id: 'c1', companyId: 'c1',
    vehicle_id: 'v1', vehicleId: 'v1', customer_id: 'cust1',
    mechanic_id: 'u3', mechanicId: 'u3',
    work_type: 'both', status: 'in_progress', priority: 'HIGH',
    current_kms: 45200,
    description: 'Full service + brake pad replacement (front)',
    notes: 'Customer reported squealing noise on braking',
    gps_created: { latitude: 12.9716, longitude: 77.5946, timestamp: '2024-03-10T09:00:00Z', label: 'job_created' },
    photos: [
      { id: 'ph1', job_card_id: 'jc1', url: 'https://placehold.co/400x300?text=Front', type: 'front', uploaded_at: '2024-03-10T09:05:00Z' },
      { id: 'ph2', job_card_id: 'jc1', url: 'https://placehold.co/400x300?text=Dashboard', type: 'dashboard', uploaded_at: '2024-03-10T09:06:00Z' },
    ],
    created_at: '2024-03-10T09:00:00Z', updated_at: '2024-03-10T10:15:00Z',
    vehicle: { id: 'v1', registration_number: 'KA01AB1234', brand: 'Maruti', model: 'Swift', customer: { id: 'cust1', name: 'Amit Patel', mobile: '9811223344' } },
    mechanic: { id: 'u3', name: 'Suresh Mechanic' },
    work_logs: [
      { id: 'wl1', job_card_id: 'jc1', actor_id: 'u4', from_status: 'created',           to_status: 'inspection_done',   created_at: '2024-03-10T09:10:00Z' },
      { id: 'wl2', job_card_id: 'jc1', actor_id: 'u2', from_status: 'inspection_done',   to_status: 'estimate_created',  created_at: '2024-03-10T09:30:00Z' },
      { id: 'wl3', job_card_id: 'jc1', actor_id: 'u1', from_status: 'estimate_created',  to_status: 'estimate_approved', created_at: '2024-03-10T10:00:00Z' },
      { id: 'wl4', job_card_id: 'jc1', actor_id: 'u2', from_status: 'estimate_approved', to_status: 'assigned',          created_at: '2024-03-10T10:05:00Z' },
      { id: 'wl5', job_card_id: 'jc1', actor_id: 'u3', from_status: 'assigned',          to_status: 'in_progress',       created_at: '2024-03-10T10:15:00Z', notes: 'Started oil drain' },
    ],
  },

  // ── JC-0002 · estimate_created · AC repair ────────────────────────────────
  {
    id: 'jc2', job_number: 'JC-0002', company_id: 'c1', companyId: 'c1',
    vehicle_id: 'v3', vehicleId: 'v3', customer_id: 'cust2',
    work_type: 'repair', status: 'estimate_created', priority: 'NORMAL',
    current_kms: 18500,
    description: 'AC not cooling — check refrigerant and compressor',
    gps_created: { latitude: 12.9352, longitude: 77.6245, timestamp: '2024-03-11T10:00:00Z', label: 'job_created' },
    photos: [
      { id: 'ph3', job_card_id: 'jc2', url: 'https://placehold.co/400x300?text=AC+Unit', type: 'damage', uploaded_at: '2024-03-11T10:10:00Z' },
    ],
    created_at: '2024-03-11T10:00:00Z', updated_at: '2024-03-11T11:00:00Z',
    vehicle: { id: 'v3', registration_number: 'MH02EF9012', brand: 'Hyundai', model: 'Creta', customer: { id: 'cust2', name: 'Sunita Verma', mobile: '9822334455' } },
    work_logs: [
      { id: 'wl6', job_card_id: 'jc2', actor_id: 'u4', from_status: 'created',         to_status: 'inspection_done',  created_at: '2024-03-11T10:20:00Z' },
      { id: 'wl7', job_card_id: 'jc2', actor_id: 'u2', from_status: 'inspection_done', to_status: 'estimate_created', created_at: '2024-03-11T11:00:00Z', notes: 'Estimate sent to customer for approval' },
    ],
  },

  // ── JC-0003 · waiting_parts · Engine overhaul ─────────────────────────────
  {
    id: 'jc3', job_number: 'JC-0003', company_id: 'c1', companyId: 'c1',
    vehicle_id: 'v4', vehicleId: 'v4', customer_id: 'cust3',
    mechanic_id: 'u3', mechanicId: 'u3',
    work_type: 'repair', status: 'waiting_parts', priority: 'URGENT',
    current_kms: 96200,
    description: 'Engine overhaul — head gasket blown, requires full strip-down',
    notes: 'Waiting for OEM gasket kit from Toyota dealer. ETA 2 days.',
    gps_created: { latitude: 13.0827, longitude: 80.2707, timestamp: '2024-03-08T08:00:00Z', label: 'job_created' },
    photos: [
      { id: 'ph4', job_card_id: 'jc3', url: 'https://placehold.co/400x300?text=Engine', type: 'damage', uploaded_at: '2024-03-08T08:30:00Z' },
      { id: 'ph5', job_card_id: 'jc3', url: 'https://placehold.co/400x300?text=Gasket', type: 'work',   uploaded_at: '2024-03-09T10:00:00Z' },
    ],
    created_at: '2024-03-08T08:00:00Z', updated_at: '2024-03-09T14:00:00Z',
    vehicle: { id: 'v4', registration_number: 'TN03GH3456', brand: 'Toyota', model: 'Innova Crysta', customer: { id: 'cust3', name: 'Ravi Nair', mobile: '9833445566' } },
    mechanic: { id: 'u3', name: 'Suresh Mechanic' },
    work_logs: [
      { id: 'wl8',  job_card_id: 'jc3', actor_id: 'u4', from_status: 'created',           to_status: 'inspection_done',   created_at: '2024-03-08T08:20:00Z' },
      { id: 'wl9',  job_card_id: 'jc3', actor_id: 'u2', from_status: 'inspection_done',   to_status: 'estimate_created',  created_at: '2024-03-08T09:00:00Z' },
      { id: 'wl10', job_card_id: 'jc3', actor_id: 'u1', from_status: 'estimate_created',  to_status: 'estimate_approved', created_at: '2024-03-08T10:30:00Z' },
      { id: 'wl11', job_card_id: 'jc3', actor_id: 'u2', from_status: 'estimate_approved', to_status: 'assigned',          created_at: '2024-03-08T11:00:00Z' },
      { id: 'wl12', job_card_id: 'jc3', actor_id: 'u3', from_status: 'assigned',          to_status: 'in_progress',       created_at: '2024-03-08T11:30:00Z' },
      { id: 'wl13', job_card_id: 'jc3', actor_id: 'u3', from_status: 'in_progress',       to_status: 'waiting_parts',     created_at: '2024-03-09T14:00:00Z', notes: 'OEM gasket kit not in stock — ordered from dealer' },
    ],
  },

  // ── JC-0004 · delivered · Routine oil change ──────────────────────────────
  {
    id: 'jc4', job_number: 'JC-0004', company_id: 'c1', companyId: 'c1',
    vehicle_id: 'v5', vehicleId: 'v5', customer_id: 'cust4',
    work_type: 'service', status: 'delivered', priority: 'LOW',
    current_kms: 8200,
    description: 'Routine oil change, oil filter, air filter replacement',
    gps_created:   { latitude: 28.6139, longitude: 77.2090, timestamp: '2024-03-05T09:00:00Z', label: 'job_created' },
    gps_delivered: { latitude: 28.6139, longitude: 77.2090, timestamp: '2024-03-05T14:00:00Z', label: 'vehicle_delivered' },
    photos: [
      { id: 'ph6', job_card_id: 'jc4', url: 'https://placehold.co/400x300?text=Completed', type: 'completed', uploaded_at: '2024-03-05T13:45:00Z' },
    ],
    created_at: '2024-03-05T09:00:00Z', updated_at: '2024-03-05T14:00:00Z',
    delivered_at: '2024-03-05T14:00:00Z',
    vehicle: { id: 'v5', registration_number: 'DL04IJ7890', brand: 'Tata', model: 'Nexon EV', customer: { id: 'cust4', name: 'Deepa Singh', mobile: '9844556677' } },
    work_logs: [
      { id: 'wl14', job_card_id: 'jc4', actor_id: 'u4', from_status: 'created',           to_status: 'inspection_done',   created_at: '2024-03-05T09:10:00Z' },
      { id: 'wl15', job_card_id: 'jc4', actor_id: 'u2', from_status: 'inspection_done',   to_status: 'estimate_created',  created_at: '2024-03-05T09:20:00Z' },
      { id: 'wl16', job_card_id: 'jc4', actor_id: 'u1', from_status: 'estimate_created',  to_status: 'estimate_approved', created_at: '2024-03-05T09:30:00Z' },
      { id: 'wl17', job_card_id: 'jc4', actor_id: 'u2', from_status: 'estimate_approved', to_status: 'assigned',          created_at: '2024-03-05T09:35:00Z' },
      { id: 'wl18', job_card_id: 'jc4', actor_id: 'u3', from_status: 'assigned',          to_status: 'in_progress',       created_at: '2024-03-05T09:45:00Z' },
      { id: 'wl19', job_card_id: 'jc4', actor_id: 'u3', from_status: 'in_progress',       to_status: 'work_completed',    created_at: '2024-03-05T12:30:00Z' },
      { id: 'wl20', job_card_id: 'jc4', actor_id: 'u3', from_status: 'work_completed',    to_status: 'qc_pending',        created_at: '2024-03-05T12:35:00Z' },
      { id: 'wl21', job_card_id: 'jc4', actor_id: 'u2', from_status: 'qc_pending',        to_status: 'qc_passed',         created_at: '2024-03-05T13:00:00Z' },
      { id: 'wl22', job_card_id: 'jc4', actor_id: 'u2', from_status: 'qc_passed',         to_status: 'invoiced',          created_at: '2024-03-05T13:05:00Z' },
      { id: 'wl23', job_card_id: 'jc4', actor_id: 'u4', from_status: 'invoiced',          to_status: 'paid',              created_at: '2024-03-05T13:30:00Z' },
      { id: 'wl24', job_card_id: 'jc4', actor_id: 'u4', from_status: 'paid',              to_status: 'delivered',         created_at: '2024-03-05T14:00:00Z', notes: 'Vehicle handed over to customer' },
    ],
  },

  // ── JC-0005 · qc_pending · Suspension repair ──────────────────────────────
  {
    id: 'jc5', job_number: 'JC-0005', company_id: 'c1', companyId: 'c1',
    vehicle_id: 'v6', vehicleId: 'v6', customer_id: 'cust5',
    mechanic_id: 'u3', mechanicId: 'u3',
    work_type: 'repair', status: 'qc_pending', priority: 'HIGH',
    current_kms: 32800,
    description: 'Suspension noise — front left lower arm bush replacement',
    gps_created: { latitude: 17.3850, longitude: 78.4867, timestamp: '2024-03-12T08:00:00Z', label: 'job_created' },
    photos: [
      { id: 'ph7', job_card_id: 'jc5', url: 'https://placehold.co/400x300?text=Suspension', type: 'damage', uploaded_at: '2024-03-12T08:20:00Z' },
      { id: 'ph8', job_card_id: 'jc5', url: 'https://placehold.co/400x300?text=Work+Done', type: 'work',   uploaded_at: '2024-03-12T14:00:00Z' },
    ],
    created_at: '2024-03-12T08:00:00Z', updated_at: '2024-03-12T15:00:00Z',
    vehicle: { id: 'v6', registration_number: 'TS09KL5678', brand: 'Honda', model: 'City', customer: { id: 'cust5', name: 'Priya Shah', mobile: '9855667788' } },
    mechanic: { id: 'u3', name: 'Suresh Mechanic' },
    work_logs: [
      { id: 'wl25', job_card_id: 'jc5', actor_id: 'u4', from_status: 'created',           to_status: 'inspection_done',   created_at: '2024-03-12T08:15:00Z' },
      { id: 'wl26', job_card_id: 'jc5', actor_id: 'u2', from_status: 'inspection_done',   to_status: 'estimate_created',  created_at: '2024-03-12T09:00:00Z' },
      { id: 'wl27', job_card_id: 'jc5', actor_id: 'u1', from_status: 'estimate_created',  to_status: 'estimate_approved', created_at: '2024-03-12T09:30:00Z' },
      { id: 'wl28', job_card_id: 'jc5', actor_id: 'u2', from_status: 'estimate_approved', to_status: 'assigned',          created_at: '2024-03-12T09:35:00Z' },
      { id: 'wl29', job_card_id: 'jc5', actor_id: 'u3', from_status: 'assigned',          to_status: 'in_progress',       created_at: '2024-03-12T10:00:00Z' },
      { id: 'wl30', job_card_id: 'jc5', actor_id: 'u3', from_status: 'in_progress',       to_status: 'work_completed',    created_at: '2024-03-12T14:30:00Z' },
      { id: 'wl31', job_card_id: 'jc5', actor_id: 'u3', from_status: 'work_completed',    to_status: 'qc_pending',        created_at: '2024-03-12T15:00:00Z' },
    ],
  },

  // ── JC-0006 · created · New intake ────────────────────────────────────────
  {
    id: 'jc6', job_number: 'JC-0006', company_id: 'c1', companyId: 'c1',
    vehicle_id: 'v7', vehicleId: 'v7', customer_id: 'cust6',
    work_type: 'service', status: 'created', priority: 'NORMAL',
    current_kms: 22100,
    description: 'Periodic service — 20,000 km service due',
    gps_created: { latitude: 30.7333, longitude: 76.7794, timestamp: '2024-03-14T09:30:00Z', label: 'job_created' },
    created_at: '2024-03-14T09:30:00Z', updated_at: '2024-03-14T09:30:00Z',
    vehicle: { id: 'v7', registration_number: 'CH01MN2345', brand: 'Mahindra', model: 'Scorpio N', customer: { id: 'cust6', name: 'Harpreet Singh', mobile: '9866778899' } },
    work_logs: [
      { id: 'wl32', job_card_id: 'jc6', actor_id: 'u4', from_status: 'created', to_status: 'created', created_at: '2024-03-14T09:30:00Z', notes: 'Vehicle checked in at reception' },
    ],
  },

  // ── JC-0007 · qc_failed → back in_progress ────────────────────────────────
  {
    id: 'jc7', job_number: 'JC-0007', company_id: 'c1', companyId: 'c1',
    vehicle_id: 'v9', vehicleId: 'v9', customer_id: 'cust8',
    mechanic_id: 'u3', mechanicId: 'u3',
    work_type: 'repair', status: 'in_progress', priority: 'HIGH',
    current_kms: 41600,
    description: 'Clutch replacement — slipping at high RPM',
    notes: 'QC failed first attempt — clutch pedal free play not adjusted correctly. Rework in progress.',
    gps_created: { latitude: 17.4065, longitude: 78.4772, timestamp: '2024-03-09T08:00:00Z', label: 'job_created' },
    created_at: '2024-03-09T08:00:00Z', updated_at: '2024-03-13T11:00:00Z',
    vehicle: { id: 'v9', registration_number: 'TS07RS1122', brand: 'Kia', model: 'Seltos', customer: { id: 'cust8', name: 'Arjun Reddy', mobile: '9888990011' } },
    mechanic: { id: 'u3', name: 'Suresh Mechanic' },
    work_logs: [
      { id: 'wl33', job_card_id: 'jc7', actor_id: 'u4', from_status: 'created',        to_status: 'inspection_done',   created_at: '2024-03-09T08:20:00Z' },
      { id: 'wl34', job_card_id: 'jc7', actor_id: 'u2', from_status: 'inspection_done',to_status: 'estimate_created',  created_at: '2024-03-09T09:00:00Z' },
      { id: 'wl35', job_card_id: 'jc7', actor_id: 'u1', from_status: 'estimate_created',to_status: 'estimate_approved',created_at: '2024-03-09T10:00:00Z' },
      { id: 'wl36', job_card_id: 'jc7', actor_id: 'u2', from_status: 'estimate_approved',to_status: 'assigned',        created_at: '2024-03-09T10:10:00Z' },
      { id: 'wl37', job_card_id: 'jc7', actor_id: 'u3', from_status: 'assigned',       to_status: 'in_progress',       created_at: '2024-03-09T10:30:00Z' },
      { id: 'wl38', job_card_id: 'jc7', actor_id: 'u3', from_status: 'in_progress',    to_status: 'work_completed',    created_at: '2024-03-12T16:00:00Z' },
      { id: 'wl39', job_card_id: 'jc7', actor_id: 'u3', from_status: 'work_completed', to_status: 'qc_pending',        created_at: '2024-03-12T16:10:00Z' },
      { id: 'wl40', job_card_id: 'jc7', actor_id: 'u2', from_status: 'qc_pending',     to_status: 'qc_failed',         created_at: '2024-03-13T09:00:00Z', notes: 'Clutch pedal free play not within spec — 20mm required, found 35mm' },
      { id: 'wl41', job_card_id: 'jc7', actor_id: 'u3', from_status: 'qc_failed',      to_status: 'in_progress',       created_at: '2024-03-13T11:00:00Z', notes: 'Rework started — adjusting pedal free play' },
    ],
  },

  // ── JC-0008 · invoiced · Tyre + alignment ─────────────────────────────────
  {
    id: 'jc8', job_number: 'JC-0008', company_id: 'c1', companyId: 'c1',
    vehicle_id: 'v8', vehicleId: 'v8', customer_id: 'cust7',
    work_type: 'service', status: 'invoiced', priority: 'NORMAL',
    current_kms: 11400,
    description: 'Tyre rotation + wheel alignment + balancing',
    gps_created: { latitude: 18.5204, longitude: 73.8567, timestamp: '2024-03-14T11:00:00Z', label: 'job_created' },
    created_at: '2024-03-14T11:00:00Z', updated_at: '2024-03-14T16:00:00Z',
    vehicle: { id: 'v8', registration_number: 'MH12PQ6789', brand: 'Maruti', model: 'Baleno', customer: { id: 'cust7', name: 'Meena Iyer', mobile: '9877889900' } },
    work_logs: [
      { id: 'wl42', job_card_id: 'jc8', actor_id: 'u4', from_status: 'created',           to_status: 'inspection_done',   created_at: '2024-03-14T11:10:00Z' },
      { id: 'wl43', job_card_id: 'jc8', actor_id: 'u2', from_status: 'inspection_done',   to_status: 'estimate_created',  created_at: '2024-03-14T11:20:00Z' },
      { id: 'wl44', job_card_id: 'jc8', actor_id: 'u1', from_status: 'estimate_created',  to_status: 'estimate_approved', created_at: '2024-03-14T11:30:00Z' },
      { id: 'wl45', job_card_id: 'jc8', actor_id: 'u2', from_status: 'estimate_approved', to_status: 'assigned',          created_at: '2024-03-14T11:35:00Z' },
      { id: 'wl46', job_card_id: 'jc8', actor_id: 'u3', from_status: 'assigned',          to_status: 'in_progress',       created_at: '2024-03-14T12:00:00Z' },
      { id: 'wl47', job_card_id: 'jc8', actor_id: 'u3', from_status: 'in_progress',       to_status: 'work_completed',    created_at: '2024-03-14T14:30:00Z' },
      { id: 'wl48', job_card_id: 'jc8', actor_id: 'u3', from_status: 'work_completed',    to_status: 'qc_pending',        created_at: '2024-03-14T14:35:00Z' },
      { id: 'wl49', job_card_id: 'jc8', actor_id: 'u2', from_status: 'qc_pending',        to_status: 'qc_passed',         created_at: '2024-03-14T15:00:00Z' },
      { id: 'wl50', job_card_id: 'jc8', actor_id: 'u2', from_status: 'qc_passed',         to_status: 'invoiced',          created_at: '2024-03-14T16:00:00Z' },
    ],
  },
];
