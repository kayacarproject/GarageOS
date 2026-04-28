import apiClient from './client';

const APP_NAME = 'garageosapp.hanaplatform.com';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HanaEstimateItem {
  name: string;
  hsn_sac?: string;
  type?: string;
  quantity: number;
  unit: string;
  unit_price: number;
  amount: number;
  gst_percent?: number;
}

export interface HanaEstimate {
  _id: string;
  id?: string;
  jobcardId: string;
  vehicleId?: string;
  vehicleName?: string;
  registrationNumber?: string;
  items: HanaEstimateItem[];
  subtotal: number;
  discount: number;
  tax?: number;
  total: number;
  notes?: string;
  version: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'revised' | 'invoice_generated' | 'paid' | string;
  createdBy?: string;
  createdAt?: string;
  sentForApprovalAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedReason?: string;
  rejectedAt?: string;
  requestedByRole?: string;
  requestedByUserId?: string;
  requestedAt?: string;
  invoiceId?: string;
}

export interface CreateEstimatePayload {
  jobcardId: string;
  vehicleId?: string;
  items: HanaEstimateItem[];
  subtotal: number;
  discount: number;
  tax?: number;
  total: number;
  notes?: string;
  version: number;
  status: 'draft' | 'pending_approval' | 'revised';
  createdBy?: string;
  sentForApprovalAt?: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const estimateApi = {
  async getByJobCard(jobcardId: string): Promise<HanaEstimate[]> {
    const { data } = await apiClient.post('/api/v1/mongo/getdata', {
      appName:    APP_NAME,
      moduleName: 'estimate',
      query:      { jobcardId },
      limit:      0,
      skip:       0,
    });
    return Array.isArray(data?.data) ? data.data : [];
  },

  async create(payload: CreateEstimatePayload): Promise<HanaEstimate> {
    const { data } = await apiClient.post('/api/v1/mongo/submitdata', {
      appName:    APP_NAME,
      moduleName: 'estimate',
      body:       payload,
    });
    return data?.data ?? data;
  },

  async update(id: string, payload: Partial<CreateEstimatePayload>): Promise<void> {
    await apiClient.post('/api/v1/mongo/submitdata', {
      appName:    APP_NAME,
      moduleName: 'estimate',
      query:      { _id: id },
      body:       payload,
    });
  },

  async updateStatus(id: string, status: string, extra: object = {}): Promise<void> {
    await apiClient.post('/api/v1/mongo/submitdata', {
      appName:    APP_NAME,
      moduleName: 'estimate',
      query:      { _id: id },
      body:       { status, ...extra },
    });
  },

  // Sends an existing estimate for owner approval.
  // Also saves latest items/totals so the record is up-to-date when owner reviews it.
  async sendForApproval(
    id: string,
    payload: {
      items: HanaEstimateItem[];
      subtotal: number;
      discount: number;
      tax?: number;
      total: number;
      notes?: string;
      version: number;
      createdBy?: string;
      requestedByRole?: string;
      requestedByUserId?: string;
    },
  ): Promise<void> {
    await apiClient.post('/api/v1/mongo/submitdata', {
      appName:    APP_NAME,
      moduleName: 'estimate',
      query:      { _id: id },
      body: {
        ...payload,
        status:            'pending_approval',
        sentForApprovalAt: new Date().toISOString(),
        requestedAt:       new Date().toISOString(),
      },
    });
  },

  async getPendingApprovals(): Promise<HanaEstimate[]> {
    const { data } = await apiClient.post('/api/v1/mongo/getdata', {
      appName:    APP_NAME,
      moduleName: 'estimate',
      query:      { status: 'pending_approval' },
      limit:      0,
      skip:       0,
    });
    return Array.isArray(data?.data) ? data.data : [];
  },

  async approve(id: string, approvedBy: string): Promise<void> {
    await apiClient.post('/api/v1/mongo/submitdata', {
      appName:    APP_NAME,
      moduleName: 'estimate',
      query:      { _id: id },
      body:       { status: 'approved', approvedBy, approvedAt: new Date().toISOString() },
    });
  },

  async reject(id: string, rejectedBy: string, reason?: string): Promise<void> {
    await apiClient.post('/api/v1/mongo/submitdata', {
      appName:    APP_NAME,
      moduleName: 'estimate',
      query:      { _id: id },
      body: {
        status:         'rejected',
        rejectedBy,
        rejectedReason: reason ?? '',
        rejectedAt:     new Date().toISOString(),
      },
    });
  },

  async revise(id: string, payload: Partial<CreateEstimatePayload>): Promise<void> {
    await apiClient.post('/api/v1/mongo/submitdata', {
      appName:    APP_NAME,
      moduleName: 'estimate',
      query:      { _id: id },
      body:       { ...payload, status: 'pending_approval' },
    });
  },
};
