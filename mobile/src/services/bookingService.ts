import api from './api';
import env from '../config/env';
import { dummyBookings } from '../dummy/bookings';
import { dummyCustomers } from '../dummy/customers';
import { dummyVehicles } from '../dummy/vehicles';
import {
  Booking,
  BookingStatus,
  CreateBookingPayload,
  UpdateBookingPayload,
  CustomerRef,
  VehicleRef,
} from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const attachRelations = (booking: Booking): Booking => {
  const customer = dummyCustomers.find(c => c.id === booking.customer_id);
  const vehicle  = dummyVehicles.find(v => v.id === booking.vehicle_id);

  const customerRef: CustomerRef | undefined = customer
    ? { id: customer.id, name: customer.name, mobile: customer.mobile }
    : booking.customer;

  const vehicleRef: VehicleRef | undefined = vehicle
    ? { id: vehicle.id, registration_number: vehicle.registration_number, brand: vehicle.brand, model: vehicle.model }
    : booking.vehicle;

  return { ...booking, customer: customerRef, vehicle: vehicleRef };
};

const sortByTime = (bookings: Booking[]): Booking[] =>
  [...bookings].sort((a, b) => (a.scheduled_time ?? '').localeCompare(b.scheduled_time ?? ''));

// ─── Service ──────────────────────────────────────────────────────────────────

export const bookingService = {

  /** Fetch all bookings (used by store) */
  async getAll(): Promise<Booking[]> {
    if (env.USE_DUMMY_DATA) return sortByTime(dummyBookings.map(attachRelations));
    const { data } = await api.get('/bookings');
    return data;
  },

  /** Fetch bookings for a specific date, sorted by time, with customer/vehicle attached */
  async getByDate(date: string): Promise<Booking[]> {
    if (env.USE_DUMMY_DATA) {
      const filtered = dummyBookings
        .filter(b => b.scheduled_date === date)
        .map(attachRelations);
      return sortByTime(filtered);
    }
    const { data } = await api.get('/bookings', { params: { date } });
    return data;
  },

  /** Create a new booking with auto-generated fields */
  async create(payload: CreateBookingPayload & { created_by: string }): Promise<Booking> {
    if (env.USE_DUMMY_DATA) {
      const now = new Date().toISOString();
      const customer = dummyCustomers.find(c => c.id === payload.customer_id);
      const vehicle  = dummyVehicles.find(v => v.id === payload.vehicle_id);

      const newBooking: Booking = {
        id: `b${Date.now()}`,
        customer_id: payload.customer_id,
        customerId: payload.customer_id,
        vehicle_id: payload.vehicle_id,
        vehicleId: payload.vehicle_id,
        scheduled_date: payload.scheduled_date,
        scheduled_time: payload.scheduled_time,
        scheduledAt: `${payload.scheduled_date}T${payload.scheduled_time}:00Z`,
        service_type_hint: payload.service_type_hint,
        serviceType: payload.service_type_hint,
        notes: payload.notes,
        status: 'confirmed',
        created_by: payload.created_by,
        created_at: now,
        customer: customer
          ? { id: customer.id, name: customer.name, mobile: customer.mobile }
          : undefined,
        vehicle: vehicle
          ? { id: vehicle.id, registration_number: vehicle.registration_number, brand: vehicle.brand, model: vehicle.model }
          : undefined,
      };

      dummyBookings.push(newBooking);
      return newBooking;
    }

    const { data } = await api.post('/bookings', payload);
    return data;
  },

  /** Link a booking to a job card and mark it as arrived */
  async linkToJobCard(bookingId: string, jobCardId: string): Promise<Booking> {
    if (env.USE_DUMMY_DATA) {
      const idx = dummyBookings.findIndex(b => b.id === bookingId);
      if (idx === -1) throw new Error('Booking not found');
      dummyBookings[idx] = {
        ...dummyBookings[idx],
        job_card_id: jobCardId,
        status: 'arrived',
      };
      return attachRelations(dummyBookings[idx]);
    }
    const { data } = await api.patch(`/bookings/${bookingId}/link`, { job_card_id: jobCardId });
    return data;
  },

  /** Update booking status */
  async updateStatus(bookingId: string, status: BookingStatus): Promise<Booking> {
    if (env.USE_DUMMY_DATA) {
      const idx = dummyBookings.findIndex(b => b.id === bookingId);
      if (idx === -1) throw new Error('Booking not found');
      dummyBookings[idx] = { ...dummyBookings[idx], status };
      return attachRelations(dummyBookings[idx]);
    }
    const { data } = await api.patch(`/bookings/${bookingId}/status`, { status });
    return data;
  },

  /** Get confirmed bookings for a customer that are not yet linked to a job card */
  async getPendingForCustomer(customerId: string): Promise<Booking[]> {
    if (env.USE_DUMMY_DATA) {
      return dummyBookings
        .filter(b =>
          b.customer_id === customerId &&
          !b.job_card_id &&
          (b.status === 'confirmed' || b.status === 'CONFIRMED'),
        )
        .map(attachRelations);
    }
    const { data } = await api.get('/bookings', {
      params: { customer_id: customerId, status: 'confirmed', unlinked: true },
    });
    return data;
  },

  /** Generic update (used by store) */
  async update(id: string, payload: UpdateBookingPayload): Promise<Booking> {
    if (env.USE_DUMMY_DATA) {
      const idx = dummyBookings.findIndex(b => b.id === id);
      if (idx === -1) throw new Error('Booking not found');
      dummyBookings[idx] = { ...dummyBookings[idx], ...payload };
      return attachRelations(dummyBookings[idx]);
    }
    const { data } = await api.put(`/bookings/${id}`, payload);
    return data;
  },
};
