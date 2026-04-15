import api from './api';
import env from '../config/env';
import { dummyJobCards } from '../dummy/jobCards';
import { dummyVehicles } from '../dummy/vehicles';
import { dummyCustomers } from '../dummy/customers';
import { dummyUsers } from '../dummy/users';
import { canTransition } from '../constants/jobCardLifecycle';

import type {
  JobCard, JobCardStatus, CreateJobCardPayload,
  GPSPoint, WorkLog, JobPhoto,
  Inspection, CreateInspectionPayload,
} from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateJobNumber(): string {
  const max = dummyJobCards.reduce((n, j) => {
    const num = parseInt(j.job_number?.replace(/\D/g, '') ?? '0', 10);
    return num > n ? num : n;
  }, 0);
  return `JC-${String(max + 1).padStart(4, '0')}`;
}

function makeWorkLog(
  jobCardId: string,
  from: JobCardStatus,
  to: JobCardStatus,
  actorId = 'current-user',
  notes?: string,
): WorkLog {
  return {
    id: `wl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    job_card_id: jobCardId,
    actor_id: actorId,
    from_status: from,
    to_status: to,
    notes,
    created_at: new Date().toISOString(),
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const jobCardService = {

  async getAll(): Promise<JobCard[]> {
    if (env.USE_DUMMY_DATA) return dummyJobCards;
    const { data } = await api.get<JobCard[]>('/job-cards');
    return data;
  },

  async getById(id: string): Promise<JobCard> {
    if (env.USE_DUMMY_DATA) {
      const card = dummyJobCards.find((j) => j.id === id);
      if (!card) throw new Error(`Job card not found: ${id}`);
      return card;
    }
    const { data } = await api.get<JobCard>(`/job-cards/${id}`);
    return data;
  },

  async getByMechanic(mechanicId: string): Promise<JobCard[]> {
    if (env.USE_DUMMY_DATA) {
      return dummyJobCards.filter(
        (j) => j.mechanic_id === mechanicId || j.mechanicId === mechanicId,
      );
    }
    const { data } = await api.get<JobCard[]>('/job-cards', { params: { mechanic_id: mechanicId } });
    return data;
  },

  async create(payload: CreateJobCardPayload): Promise<JobCard> {
    if (env.USE_DUMMY_DATA) {
      const now = new Date().toISOString();
      const id = `jc-${Date.now()}`;

      // Attach vehicle + customer relations so list items render correctly
      const vehicleRecord  = dummyVehicles.find(v => v.id === payload.vehicle_id);
      const customerRecord = dummyCustomers.find(c => c.id === payload.customer_id);

      const vehicleRef = vehicleRecord
        ? {
            id: vehicleRecord.id,
            registration_number: vehicleRecord.registration_number,
            brand: vehicleRecord.brand,
            make: vehicleRecord.make,
            model: vehicleRecord.model,
            customer: customerRecord
              ? { id: customerRecord.id, name: customerRecord.name, mobile: customerRecord.mobile }
              : undefined,
          }
        : undefined;

      const newCard: JobCard = {
        ...payload,
        id,
        job_number: generateJobNumber(),
        status: 'created',
        work_type: payload.work_type ?? 'both',
        priority: payload.priority ?? 'NORMAL',
        current_kms: payload.current_kms ?? 0,
        created_at: now,
        updated_at: now,
        vehicle: vehicleRef as any,
        customer: customerRecord
          ? { id: customerRecord.id, name: customerRecord.name, mobile: customerRecord.mobile }
          : undefined,
        work_logs: [makeWorkLog(id, 'created', 'created', 'current-user', 'Job card created')],
      };
      dummyJobCards.push(newCard);
      return newCard;
    }
    const { data } = await api.post<JobCard>('/job-cards', payload);
    return data;
  },

  async updateStatus(
    id: string,
    newStatus: JobCardStatus,
    notes?: string,
    actorId?: string,
  ): Promise<JobCard> {
    if (env.USE_DUMMY_DATA) {
      const idx = dummyJobCards.findIndex((j) => j.id === id);
      if (idx === -1) throw new Error(`Job card not found: ${id}`);

      const card = dummyJobCards[idx];
      if (!canTransition(card.status, newStatus)) {
        throw new Error(`Invalid transition: ${card.status} → ${newStatus}`);
      }

      const log = makeWorkLog(id, card.status, newStatus, actorId, notes);
      dummyJobCards[idx] = {
        ...card,
        status: newStatus,
        updated_at: new Date().toISOString(),
        delivered_at: newStatus === 'delivered' ? new Date().toISOString() : card.delivered_at,
        work_logs: [...(card.work_logs ?? []), log],
      };
      return dummyJobCards[idx];
    }
    const { data } = await api.put<JobCard>(`/job-cards/${id}/status`, { status: newStatus, notes });
    return data;
  },

  async assignMechanic(id: string, mechanicId: string): Promise<JobCard> {
    if (env.USE_DUMMY_DATA) {
      const idx = dummyJobCards.findIndex((j) => j.id === id);
      if (idx === -1) throw new Error(`Job card not found: ${id}`);

      // Resolve the mechanic's display info so the UI can render name immediately
      const mechUser = dummyUsers.find((u) => u.id === mechanicId);
      const mechanicRef = mechUser ? { id: mechUser.id, name: mechUser.name } : undefined;

      dummyJobCards[idx] = {
        ...dummyJobCards[idx],
        mechanic_id: mechanicId,
        mechanicId,
        mechanic: mechanicRef ?? dummyJobCards[idx].mechanic,
        updated_at: new Date().toISOString(),
      };

      // Only advance to 'assigned' if the lifecycle allows it (requires estimate_approved).
      // For jobs already in_progress / waiting_parts etc., just update the mechanic field.
      if (canTransition(dummyJobCards[idx].status, 'assigned')) {
        return jobCardService.updateStatus(id, 'assigned');
      }
      return dummyJobCards[idx];
    }
    const { data } = await api.put<JobCard>(`/job-cards/${id}/mechanic`, { mechanic_id: mechanicId });
    return data;
  },

  async captureGPSDelivery(id: string): Promise<GPSPoint> {
    // Production: replace with expo-location getCurrentPositionAsync()
    const point: GPSPoint = {
      latitude: 12.9716 + (Math.random() - 0.5) * 0.01,
      longitude: 77.5946 + (Math.random() - 0.5) * 0.01,
      timestamp: new Date().toISOString(),
      label: 'vehicle_delivered',
    };
    if (env.USE_DUMMY_DATA) {
      const idx = dummyJobCards.findIndex((j) => j.id === id);
      if (idx !== -1) dummyJobCards[idx].gps_delivered = point;
      return point;
    }
    const { data } = await api.put<GPSPoint>(`/job-cards/${id}/gps-delivery`, point);
    return data;
  },

  /** @deprecated use captureGPSDelivery — kept for backward compat */
  async captureGPS(id: string, label: 'job_created' | 'vehicle_delivered'): Promise<GPSPoint> {
    if (label === 'vehicle_delivered') return jobCardService.captureGPSDelivery(id);
    const point: GPSPoint = {
      latitude: 12.9716 + (Math.random() - 0.5) * 0.01,
      longitude: 77.5946 + (Math.random() - 0.5) * 0.01,
      timestamp: new Date().toISOString(),
      label,
    };
    if (env.USE_DUMMY_DATA) {
      const idx = dummyJobCards.findIndex((j) => j.id === id);
      if (idx !== -1) dummyJobCards[idx].gps_created = point;
    }
    return point;
  },

  // ─── Photos ────────────────────────────────────────────────────────────────

  async uploadPhoto(
    id: string,
    file: { uri: string; name: string; type: string },
    photoType: JobPhoto['type'],
  ): Promise<JobPhoto> {
    if (env.USE_DUMMY_DATA) {
      const photo: JobPhoto = {
        id: `ph-${Date.now()}`,
        job_card_id: id,
        url: file.uri,
        type: photoType,
        uploaded_at: new Date().toISOString(),
      };
      const idx = dummyJobCards.findIndex((j) => j.id === id);
      if (idx !== -1) {
        dummyJobCards[idx].photos = [...(dummyJobCards[idx].photos ?? []), photo];
      }
      return photo;
    }
    const form = new FormData();
    form.append('photo', { uri: file.uri, name: file.name, type: file.type } as any);
    form.append('type', photoType);
    const { data } = await api.post<JobPhoto>(`/job-cards/${id}/photos`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async deletePhoto(jobCardId: string, photoId: string): Promise<void> {
    if (env.USE_DUMMY_DATA) {
      const idx = dummyJobCards.findIndex((j) => j.id === jobCardId);
      if (idx !== -1) {
        dummyJobCards[idx].photos = (dummyJobCards[idx].photos ?? []).filter(
          (p) => p.id !== photoId,
        );
      }
      return;
    }
    await api.delete(`/job-cards/${jobCardId}/photos/${photoId}`);
  },

  // ─── Inspections ───────────────────────────────────────────────────────────

  async createInspection(
    jobCardId: string,
    payload: CreateInspectionPayload,
  ): Promise<Inspection> {
    if (env.USE_DUMMY_DATA) {
      const inspection: Inspection = {
        ...payload,
        id: `insp-${Date.now()}`,
        job_card_id: jobCardId,
        inspected_by: 'current-user',
        created_at: new Date().toISOString(),
      };
      const idx = dummyJobCards.findIndex((j) => j.id === jobCardId);
      if (idx !== -1) {
        dummyJobCards[idx].inspections = [
          ...(dummyJobCards[idx].inspections ?? []),
          inspection,
        ];
      }
      return inspection;
    }
    const { data } = await api.post<Inspection>(`/job-cards/${jobCardId}/inspection`, payload);
    return data;
  },

  async getInspection(
    jobCardId: string,
    type: 'pre' | 'post',
  ): Promise<Inspection | undefined> {
    if (env.USE_DUMMY_DATA) {
      const card = dummyJobCards.find((j) => j.id === jobCardId);
      return card?.inspections?.find((i) => i.type === type);
    }
    const { data } = await api.get<Inspection>(`/job-cards/${jobCardId}/inspection`, {
      params: { type },
    });
    return data;
  },

  // ─── Legacy ────────────────────────────────────────────────────────────────

  async update(id: string, payload: Partial<JobCard>): Promise<JobCard> {
    if (env.USE_DUMMY_DATA) {
      const idx = dummyJobCards.findIndex((j) => j.id === id);
      if (idx === -1) throw new Error(`Job card not found: ${id}`);
      dummyJobCards[idx] = { ...dummyJobCards[idx], ...payload, updated_at: new Date().toISOString() };
      return dummyJobCards[idx];
    }
    const { data } = await api.put<JobCard>(`/job-cards/${id}`, payload);
    return data;
  },
};
