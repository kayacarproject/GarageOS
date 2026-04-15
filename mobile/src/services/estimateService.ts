import api from './api';
import env from '../config/env';
import { dummyEstimates } from '../dummy/estimates';
import type {
  Estimate, EstimateItem, EstimateStatus,
  CreateEstimatePayload, CreateEstimateItemPayload,
} from '../types';

// ─── Totals calculator (exported — used by EstimateScreen) ────────────────────

export interface EstimateTotals {
  subtotal: number;
  discount: number;
  gst_amount: number;
  total: number;
}

export function calculateTotals(
  items: Pick<EstimateItem, 'amount' | 'gst_percent'>[],
  discount = 0,
): EstimateTotals {
  const subtotal    = items.reduce((s, i) => s + i.amount, 0);
  const gst_amount  = items.reduce(
    (s, i) => s + (i.gst_percent ? (i.amount * i.gst_percent) / 100 : 0),
    0,
  );
  return {
    subtotal,
    discount,
    gst_amount: Math.round(gst_amount * 100) / 100,
    total: Math.round((subtotal + gst_amount - discount) * 100) / 100,
  };
}

function buildItems(estimateId: string, raw: CreateEstimateItemPayload[]): EstimateItem[] {
  return raw.map((item, i) => ({
    ...item,
    id: `ei-${Date.now()}-${i}`,
    estimate_id: estimateId,
    amount: item.quantity * item.unit_price,
  }));
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const estimateService = {

  /** GET /job-cards/:id/estimates */
  async getByJobCard(jobCardId: string): Promise<Estimate[]> {
    if (env.USE_DUMMY_DATA) {
      return dummyEstimates.filter(
        (e) => e.job_card_id === jobCardId || e.jobCardId === jobCardId,
      );
    }
    const { data } = await api.get<Estimate[]>(`/job-cards/${jobCardId}/estimates`);
    return data;
  },

  /** POST /job-cards/:id/estimates */
  async create(
    payload: CreateEstimatePayload & { company_id: string; created_by: string },
  ): Promise<Estimate> {
    if (env.USE_DUMMY_DATA) {
      const existing = dummyEstimates.filter(
        (e) =>
          (e.job_card_id === payload.job_card_id || e.jobCardId === payload.job_card_id) &&
          e.status !== 'rejected',
      );
      existing.forEach((e) => {
        const idx = dummyEstimates.findIndex((x) => x.id === e.id);
        if (idx !== -1) dummyEstimates[idx].status = 'superseded';
      });

      const id = `est-${Date.now()}`;
      const items = buildItems(id, payload.items);
      const totals = calculateTotals(items, payload.discount ?? 0);
      const now = new Date().toISOString();

      const estimate: Estimate = {
        id,
        job_card_id: payload.job_card_id,
        jobCardId: payload.job_card_id,
        company_id: payload.company_id,
        companyId: payload.company_id,
        version: existing.length + 1,
        status: 'draft',
        items,
        ...totals,
        notes: payload.notes,
        created_by: payload.created_by,
        created_at: now,
      };
      dummyEstimates.push(estimate);
      return estimate;
    }
    const { data } = await api.post<Estimate>(
      `/job-cards/${payload.job_card_id}/estimates`,
      payload,
    );
    return data;
  },

  /** PUT /estimates/:id/status */
  async updateStatus(estimateId: string, status: EstimateStatus): Promise<Estimate> {
    if (env.USE_DUMMY_DATA) {
      const idx = dummyEstimates.findIndex((e) => e.id === estimateId);
      if (idx === -1) throw new Error(`Estimate not found: ${estimateId}`);
      dummyEstimates[idx] = {
        ...dummyEstimates[idx],
        status,
        ...(status === 'approved' ? { approved_at: new Date().toISOString() } : {}),
      };
      return dummyEstimates[idx];
    }
    const { data } = await api.put<Estimate>(`/estimates/${estimateId}/status`, { status });
    return data;
  },

  async approve(id: string): Promise<Estimate> {
    return estimateService.updateStatus(id, 'approved');
  },

  // Legacy alias
  async getAll(): Promise<Estimate[]> {
    if (env.USE_DUMMY_DATA) return [...dummyEstimates];
    const { data } = await api.get<Estimate[]>('/estimates');
    return data;
  },
};
