import apiClient from './client';

const APP_NAME = 'garageosapp.hanaplatform.com';

// ─── Hana MongoDB shapes ──────────────────────────────────────────────────────

export interface HanaInspectionData {
  completed: boolean;
  checkedAt?: string;
  checkedBy?: string;
  notes?: string;
  photos?: string[];
  // Component ratings (matches InspectionRating: 'good' | 'average' | 'poor' | 'na')
  engine?: string;
  brakes?: string;
  clutch?: string;
  ac?: string;
  battery?: string;
  tyres?: string;
  lights?: string;
  steering?: string;
  road_test_done?: boolean;
}

export interface HanaMechanic {
  _id: string;
  id?: string;
  name: string;
  legalname?: string;
  mobile?: string;
  email?: string;
  roleData?: { role: string };
}

export interface HanaJobCard {
  _id: string;
  vehicleId: string;
  // Denormalized for list display (avoids extra fetch per card)
  registrationNumber?: string;
  brand?: string;
  model?: string;
  // Job details
  workType: string;
  currentKM?: string;
  description?: string;
  photos?: string[];
  status: 'open' | 'assigned' | 'in_progress' | 'awaiting_approval' | 'approved_for_invoice' | 'revision_requested' | 'completed' | 'cancelled' | string;
  createdBy?: string;
  createdAt?: string;
  // Pricing snapshot (captured at job creation — frozen against future price changes)
  serviceName?: string;
  basePrice?: number;
  taxPercent?: number;
  taxAmount?: number;
  estimatedTotal?: number;
  // Mechanic assignment
  assignedMechanicId?: string;
  assignedMechanicName?: string;
  assignedAt?: string;
  assignedBy?: string;
  // Approval workflow
  approvalStatus?: 'none' | 'pending' | 'approved' | 'rejected' | 'revision_requested';
  approvalStatusUpdatedAt?: string;
  approvalUpdatedBy?: string;
  // Inspections (nested inside jobcard document)
  inspections?: {
    preTrial?: HanaInspectionData;
    postTrial?: HanaInspectionData;
  };
}

export interface CreateJobCardPayload {
  vehicleId: string;
  registrationNumber?: string;  // denormalized display field
  brand?: string;               // denormalized display field
  model?: string;               // denormalized display field
  workType: string;
  currentKM?: string;
  description?: string;
  photos?: string[];
  createdBy?: string;
  // Pricing snapshot at job creation time
  serviceName?: string;
  basePrice?: number;
  taxPercent?: number;
  taxAmount?: number;
  estimatedTotal?: number;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const jobcardApi = {
  async create(payload: CreateJobCardPayload): Promise<HanaJobCard> {
    const { data } = await apiClient.post('/api/v1/mongo/submitdata', {
      appName: APP_NAME,
      moduleName: 'jobcard',
      body: { ...payload, status: 'open' },
    });
    return data?.data ?? data;
  },

  async getAll(query: Record<string, any> = {}): Promise<HanaJobCard[]> {
    const { data } = await apiClient.post('/api/v1/mongo/getdata', {
      appName: APP_NAME,
      moduleName: 'jobcard',
      query,
      limit: 0,
      skip: 0,
    });
    return Array.isArray(data?.data) ? data.data : [];
  },

  async getById(id: string): Promise<HanaJobCard | null> {
    const { data } = await apiClient.post('/api/v1/mongo/getdata', {
      appName: APP_NAME,
      moduleName: 'jobcard',
      query: { _id: id },
      limit: 1,
      skip: 0,
    });
    const arr = Array.isArray(data?.data) ? data.data : [];
    return arr[0] ?? null;
  },

  async updateStatus(id: string, status: string): Promise<void> {
    await apiClient.post('/api/v1/mongo/submitdata', {
      appName: APP_NAME,
      moduleName: 'jobcard',
      query: { _id: id },
      body:  { status },
    });
  },

  async assignMechanic(
    id: string,
    payload: {
      assignedMechanicId: string;
      assignedMechanicName: string;
      assignedAt: string;
      assignedBy: string;
    },
  ): Promise<void> {
    await apiClient.post('/api/v1/mongo/submitdata', {
      appName: APP_NAME,
      moduleName: 'jobcard',
      query: { _id: id },
      body:  { ...payload, status: 'assigned' },
    });
  },

  async updateInspection(
    id: string,
    type: 'preTrial' | 'postTrial',
    data: HanaInspectionData,
  ): Promise<void> {
    // MongoDB $set with dot notation updates only this nested field
    await apiClient.post('/api/v1/mongo/submitdata', {
      appName: APP_NAME,
      moduleName: 'jobcard',
      query: { _id: id },
      body:  { [`inspections.${type}`]: data },
    });
  },

  async getMechanics(): Promise<HanaMechanic[]> {
    const { data } = await apiClient.post('/api/v1/mongo/getdata', {
      appName: APP_NAME,
      moduleName: 'appuser',
      query: { role: '1777267982585', status: 'active' },
      limit: 0,
      skip: 0,
    });
    return Array.isArray(data?.data) ? data.data : [];
  },

  async getByVehicle(vehicleId: string): Promise<HanaJobCard[]> {
    return jobcardApi.getAll({ vehicleId });
  },

  async getByMechanic(mechanicId: string): Promise<HanaJobCard[]> {
    return jobcardApi.getAll({ assignedMechanicId: mechanicId });
  },

  async updateJobCard(id: string, payload: Partial<HanaJobCard>): Promise<void> {
    await apiClient.post('/api/v1/mongo/submitdata', {
      appName:    APP_NAME,
      moduleName: 'jobcard',
      query:      { _id: id },
      body:       payload,
    });
  },
};
