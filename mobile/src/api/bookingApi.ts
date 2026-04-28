import apiClient from './client';
import type { Booking, BookingStatus, ServiceTypeHint } from '../types';

const APP_NAME = 'garageosapp.hanaplatform.com';

// ─── Payload types ────────────────────────────────────────────────────────────

export interface CreateHanaBookingPayload {
  customerId: string;
  customerName: string;
  mobile: string;
  serviceType: string;
  bookingDate: string;   // "YYYY-MM-DD"
  timeSlot: string;      // "HH:MM"
  vehicleId?: string;
  vehicleNumber?: string;
  vehicleName?: string;
  notes?: string;
  status: string;
  createdBy: string;
}

// ─── Normalize Hana doc → app Booking type ───────────────────────────────────

function normalize(doc: any): Booking {
  return {
    id:                doc._id ?? doc.id ?? '',
    customer_id:       doc.customerId ?? '',
    customerId:        doc.customerId,
    vehicle_id:        doc.vehicleId,
    vehicleId:         doc.vehicleId,
    scheduled_date:    doc.bookingDate ?? '',
    scheduled_time:    doc.timeSlot ?? '',
    service_type_hint: (doc.serviceType ?? 'service') as ServiceTypeHint,
    serviceType:       doc.serviceType,
    notes:             doc.notes,
    status:            (doc.status ?? 'pending') as BookingStatus,
    created_by:        doc.createdBy ?? '',
    created_at:        doc.createdAt ?? new Date().toISOString(),
    customer: {
      id:     doc.customerId ?? '',
      name:   doc.customerName ?? '',
      mobile: doc.mobile ?? '',
    },
    vehicle: doc.vehicleId
      ? {
          id:                  doc.vehicleId,
          registration_number: doc.vehicleNumber ?? '',
          brand:               '',
          model:               doc.vehicleName ?? '',
        }
      : undefined,
  };
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const bookingApi = {
  async getAll(): Promise<Booking[]> {
    const { data } = await apiClient.post('/api/v1/mongo/getdata', {
      appName:    APP_NAME,
      moduleName: 'booking',
      query:      {},
      limit:      0,
      skip:       0,
    });
    const docs: any[] = Array.isArray(data?.data) ? data.data : [];
    return docs
      .map(normalize)
      .sort((a, b) => {
        if (a.scheduled_date !== b.scheduled_date) {
          return b.scheduled_date.localeCompare(a.scheduled_date);
        }
        return a.scheduled_time.localeCompare(b.scheduled_time);
      });
  },

  async getByDate(date: string): Promise<Booking[]> {
    const { data } = await apiClient.post('/api/v1/mongo/getdata', {
      appName:    APP_NAME,
      moduleName: 'booking',
      query:      { bookingDate: date },
      limit:      0,
      skip:       0,
    });
    const docs: any[] = Array.isArray(data?.data) ? data.data : [];
    return docs
      .map(normalize)
      .sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time));
  },

  async getBookedSlots(date: string): Promise<string[]> {
    try {
      const bookings = await this.getByDate(date);
      return bookings
        .filter(b => b.status !== 'cancelled')
        .map(b => b.scheduled_time)
        .filter(Boolean);
    } catch {
      return [];
    }
  },

  async create(payload: CreateHanaBookingPayload): Promise<Booking> {
    const { data } = await apiClient.post('/api/v1/mongo/submitdata', {
      appName:    APP_NAME,
      moduleName: 'booking',
      body:       payload,
    });
    return normalize(data?.data ?? data ?? {});
  },

  async updateStatus(id: string, status: BookingStatus): Promise<void> {
    await apiClient.post('/api/v1/mongo/submitdata', {
      appName:    APP_NAME,
      moduleName: 'booking',
      query:      { _id: id },
      body:       { status },
    });
  },

  async update(id: string, payload: Partial<CreateHanaBookingPayload>): Promise<void> {
    await apiClient.post('/api/v1/mongo/submitdata', {
      appName:    APP_NAME,
      moduleName: 'booking',
      query:      { _id: id },
      body:       payload,
    });
  },
};
