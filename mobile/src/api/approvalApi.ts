import apiClient from './client';

const APP_NAME = 'garageosapp.hanaplatform.com';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ApprovalType =
  | 'estimate'
  | 'payment'
  | 'job_completion'
  | 'booking'
  | 'expense'
  | 'leave';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Approval {
  _id: string;
  type: ApprovalType;
  title: string;
  description?: string;
  /** ID of the related document (jobcard, estimate, booking, …) */
  referenceId?: string;
  referenceType?: string;
  requestedBy?: string;
  requestedByName?: string;
  status: ApprovalStatus;
  createdAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  metadata?: Record<string, any>;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const approvalApi = {
  /** Fetch all approvals with status: pending (max 10 for dashboard). */
  async getPending(): Promise<Approval[]> {
    const { data } = await apiClient.post('/api/v1/mongo/getdata', {
      appName:    APP_NAME,
      moduleName: 'approvals',
      query:      { status: 'pending' },
      limit:      10,
      skip:       0,
    });
    return Array.isArray(data?.data) ? data.data : [];
  },

  /** Fetch all approvals, optionally filtered. */
  async getAll(query: Record<string, any> = {}): Promise<Approval[]> {
    const { data } = await apiClient.post('/api/v1/mongo/getdata', {
      appName:    APP_NAME,
      moduleName: 'approvals',
      query,
      limit:      0,
      skip:       0,
    });
    return Array.isArray(data?.data) ? data.data : [];
  },

  /** Approve an approval request. */
  async approve(id: string, approvedBy: string): Promise<void> {
    await apiClient.post('/api/v1/mongo/submitdata', {
      appName:    APP_NAME,
      moduleName: 'approvals',
      query:      { _id: id },
      body: {
        status:     'approved',
        approvedBy,
        approvedAt: new Date().toISOString(),
      },
    });
  },

  /** Reject an approval request. */
  async reject(id: string, rejectedBy: string, reason?: string): Promise<void> {
    await apiClient.post('/api/v1/mongo/submitdata', {
      appName:    APP_NAME,
      moduleName: 'approvals',
      query:      { _id: id },
      body: {
        status:          'rejected',
        rejectedBy,
        rejectedAt:      new Date().toISOString(),
        ...(reason ? { rejectionReason: reason } : {}),
      },
    });
  },
};
