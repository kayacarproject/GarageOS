import apiClient from './client';
import type { Customer } from '../types';

const APP_NAME = 'garageosapp.hanaplatform.com';

// ─── Payload types ────────────────────────────────────────────────────────────

export interface CreateCustomerPayload {
  name: string;
  mobile: string;
  email?: string;
  address?: string;
  city?: string;
}

export type UpdateCustomerPayload = Partial<CreateCustomerPayload>;

// ─── Normalize Hana document → Customer ──────────────────────────────────────
// Hana stores "fullName"; our Customer type uses "name".
// "_id" (MongoDB ObjectId) maps to our "id" field.

function normalize(doc: any): Customer {
  return {
    id:         doc._id   ?? doc.id   ?? '',
    name:       doc.fullName ?? doc.name ?? '',
    mobile:     doc.mobile ?? '',
    phone:      doc.mobile ?? doc.phone,           // keep deprecated alias in sync
    email:      doc.email,
    address:    doc.address,
    city:       doc.city,
    created_at: doc.createdAt ?? doc.created_at ?? new Date().toISOString(),
  };
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const customerApi = {
  /** Fetch every customer record from the Hana MongoDB customer module. */
  async getAll(): Promise<Customer[]> {
    const { data } = await apiClient.post('/api/v1/mongo/getdata', {
      appName:    APP_NAME,
      moduleName: 'customer',
      query:      {},
      limit:      0,
      skip:       0,
    });
    const docs: any[] = Array.isArray(data?.data) ? data.data : [];
    return docs.map(normalize);
  },

  /** Fetch a single customer by MongoDB _id. */
  async getById(id: string): Promise<Customer | null> {
    const { data } = await apiClient.post('/api/v1/mongo/getdata', {
      appName:    APP_NAME,
      moduleName: 'customer',
      query:      { _id: id },
      limit:      1,
      skip:       0,
    });
    const docs: any[] = Array.isArray(data?.data) ? data.data : [];
    return docs[0] ? normalize(docs[0]) : null;
  },

  /** Create a new customer. Returns the normalized record (with _id). */
  async create(payload: CreateCustomerPayload): Promise<Customer> {
    const body: Record<string, any> = {
      fullName: payload.name,
      mobile:   payload.mobile,
    };
    if (payload.email)   body.email   = payload.email;
    if (payload.address) body.address = payload.address;
    if (payload.city)    body.city    = payload.city;

    const { data } = await apiClient.post('/api/v1/mongo/submitdata', {
      appName:    APP_NAME,
      moduleName: 'customer',
      body,
    });

    // Hana submitdata returns the created doc inside data.data
    return normalize(data?.data ?? data ?? {});
  },

  /**
   * Update an existing customer.
   * Uses query: { _id: id } per the project's update pattern.
   * Returns void — the caller merges state locally (no extra fetch needed).
   */
  async update(id: string, payload: UpdateCustomerPayload): Promise<void> {
    const body: Record<string, any> = {};
    if (payload.name    !== undefined) body.fullName = payload.name;
    if (payload.mobile  !== undefined) body.mobile   = payload.mobile;
    // Send null explicitly so the server clears optional fields when removed
    if (payload.email   !== undefined) body.email    = payload.email   ?? null;
    if (payload.address !== undefined) body.address  = payload.address ?? null;
    if (payload.city    !== undefined) body.city     = payload.city    ?? null;

    await apiClient.post('/api/v1/mongo/submitdata', {
      appName:    APP_NAME,
      moduleName: 'customer',
      query:      { _id: id },
      body,
    });
  },
};
