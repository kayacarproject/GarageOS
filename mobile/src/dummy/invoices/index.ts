import type { Invoice } from '../../types';

export const dummyInvoices: Invoice[] = [
  // ── inv1 · jc4 · paid & locked · Routine service ──────────────────────────
  {
    id: 'inv1', invoice_number: 'AC/00001', company_id: 'c1', companyId: 'c1',
    job_card_id: 'jc4', jobCardId: 'jc4', estimate_id: 'est4',
    status: 'paid', is_locked: true,
    items: [
      { id: 'ii1', estimate_id: 'inv1', name: 'Engine Oil (EV Grade)', type: 'part',   quantity: 1, unit: 'L',   unit_price: 950, amount: 950,  gst_percent: 18 },
      { id: 'ii2', estimate_id: 'inv1', name: 'Cabin Air Filter',      type: 'part',   quantity: 1, unit: 'pcs', unit_price: 480, amount: 480,  gst_percent: 18 },
      { id: 'ii3', estimate_id: 'inv1', name: 'Service Labour',        type: 'labour', quantity: 1, unit: 'job', unit_price: 500, amount: 500 },
    ],
    subtotal: 1930, discount: 0, gst_amount: 263, total: 2193,
    advance_paid: 2193, balance_due: 0, financial_year: '2024-25',
    issued_at: '2024-03-05T13:05:00Z', created_at: '2024-03-05T13:05:00Z',
    payments: [
      { id: 'pay1', invoice_id: 'inv1', job_card_id: 'jc4', company_id: 'c1', amount: 2193, mode: 'upi', purpose: 'full', status: 'completed', reference: 'UPI9876543210', collected_by: 'u4', created_at: '2024-03-05T13:30:00Z' },
    ],
  },

  // ── inv2 · jc1 · partially_paid · Full service + brakes ───────────────────
  {
    id: 'inv2', invoice_number: 'AC/00002', company_id: 'c1', companyId: 'c1',
    job_card_id: 'jc1', jobCardId: 'jc1', estimate_id: 'est1',
    status: 'partially_paid', is_locked: false,
    items: [
      { id: 'ii4', estimate_id: 'inv2', name: 'Engine Oil 5W-30 (Castrol GTX)', type: 'part',   quantity: 4, unit: 'L',   unit_price: 480,  amount: 1920, gst_percent: 18 },
      { id: 'ii5', estimate_id: 'inv2', name: 'Oil Filter (Genuine)',            type: 'part',   quantity: 1, unit: 'pcs', unit_price: 280,  amount: 280,  gst_percent: 18 },
      { id: 'ii6', estimate_id: 'inv2', name: 'Air Filter',                      type: 'part',   quantity: 1, unit: 'pcs', unit_price: 420,  amount: 420,  gst_percent: 18 },
      { id: 'ii7', estimate_id: 'inv2', name: 'Brake Pads Front (Bosch)',        type: 'part',   quantity: 1, unit: 'set', unit_price: 1850, amount: 1850, gst_percent: 18 },
      { id: 'ii8', estimate_id: 'inv2', name: 'Service Labour',                  type: 'labour', quantity: 1, unit: 'job', unit_price: 600,  amount: 600 },
      { id: 'ii9', estimate_id: 'inv2', name: 'Brake Pad Replacement Labour',    type: 'labour', quantity: 1, unit: 'job', unit_price: 350,  amount: 350 },
    ],
    subtotal: 5420, discount: 200, gst_amount: 795, total: 6015,
    advance_paid: 2000, balance_due: 4015, financial_year: '2024-25',
    issued_at: '2024-03-10T12:00:00Z', created_at: '2024-03-10T12:00:00Z',
    payments: [
      { id: 'pay2', invoice_id: 'inv2', job_card_id: 'jc1', company_id: 'c1', amount: 2000, mode: 'cash', purpose: 'advance', status: 'completed', collected_by: 'u4', created_at: '2024-03-10T09:00:00Z' },
    ],
  },

  // ── inv3 · jc5 · issued · Suspension repair ───────────────────────────────
  {
    id: 'inv3', invoice_number: 'AC/00003', company_id: 'c1', companyId: 'c1',
    job_card_id: 'jc5', jobCardId: 'jc5', estimate_id: 'est5',
    status: 'issued', is_locked: false,
    items: [
      { id: 'ii10', estimate_id: 'inv3', name: 'Lower Arm Bush Set (Front L)', type: 'part',   quantity: 1, unit: 'set', unit_price: 1200, amount: 1200, gst_percent: 18 },
      { id: 'ii11', estimate_id: 'inv3', name: 'Suspension Labour',            type: 'labour', quantity: 1, unit: 'job', unit_price: 800,  amount: 800 },
      { id: 'ii12', estimate_id: 'inv3', name: 'Wheel Alignment',              type: 'labour', quantity: 1, unit: 'job', unit_price: 500,  amount: 500 },
    ],
    subtotal: 2500, discount: 0, gst_amount: 216, total: 2716,
    advance_paid: 0, balance_due: 2716, financial_year: '2024-25',
    issued_at: '2024-03-12T16:00:00Z', created_at: '2024-03-12T16:00:00Z',
    payments: [],
  },

  // ── inv4 · jc8 · issued · Tyre + alignment ────────────────────────────────
  {
    id: 'inv4', invoice_number: 'AC/00004', company_id: 'c1', companyId: 'c1',
    job_card_id: 'jc8', jobCardId: 'jc8', estimate_id: 'est6',
    status: 'issued', is_locked: false,
    items: [
      { id: 'ii13', estimate_id: 'inv4', name: 'Tyre Rotation',       type: 'labour', quantity: 1, unit: 'job', unit_price: 300, amount: 300 },
      { id: 'ii14', estimate_id: 'inv4', name: 'Wheel Alignment',     type: 'labour', quantity: 1, unit: 'job', unit_price: 600, amount: 600 },
      { id: 'ii15', estimate_id: 'inv4', name: 'Wheel Balancing (4)', type: 'labour', quantity: 4, unit: 'pcs', unit_price: 150, amount: 600 },
    ],
    subtotal: 1500, discount: 0, gst_amount: 162, total: 1662,
    advance_paid: 0, balance_due: 1662, financial_year: '2024-25',
    issued_at: '2024-03-14T16:00:00Z', created_at: '2024-03-14T16:00:00Z',
    payments: [],
  },

  // ── inv5 · jc3 · partially_paid · Engine overhaul (large advance) ─────────
  {
    id: 'inv5', invoice_number: 'AC/00005', company_id: 'c1', companyId: 'c1',
    job_card_id: 'jc3', jobCardId: 'jc3', estimate_id: 'est3',
    status: 'partially_paid', is_locked: false,
    items: [
      { id: 'ii16', estimate_id: 'inv5', name: 'OEM Head Gasket Kit (Toyota)', type: 'part',   quantity: 1, unit: 'set', unit_price: 8500, amount: 8500,  gst_percent: 18 },
      { id: 'ii17', estimate_id: 'inv5', name: 'Engine Oil 15W-40 (5L)',       type: 'part',   quantity: 1, unit: 'can', unit_price: 1200, amount: 1200,  gst_percent: 18 },
      { id: 'ii18', estimate_id: 'inv5', name: 'Coolant (1L)',                 type: 'part',   quantity: 2, unit: 'L',   unit_price: 350,  amount: 700,   gst_percent: 18 },
      { id: 'ii19', estimate_id: 'inv5', name: 'Timing Belt',                  type: 'part',   quantity: 1, unit: 'pcs', unit_price: 2200, amount: 2200,  gst_percent: 18 },
      { id: 'ii20', estimate_id: 'inv5', name: 'Engine Overhaul Labour',       type: 'labour', quantity: 1, unit: 'job', unit_price: 6000, amount: 6000 },
    ],
    subtotal: 18600, discount: 600, gst_amount: 2700, total: 20700,
    advance_paid: 10000, balance_due: 10700, financial_year: '2024-25',
    issued_at: '2024-03-08T11:00:00Z', created_at: '2024-03-08T11:00:00Z',
    payments: [
      { id: 'pay5', invoice_id: 'inv5', job_card_id: 'jc3', company_id: 'c1', amount: 10000, mode: 'bank_transfer', purpose: 'advance', status: 'completed', reference: 'NEFT20240308001', collected_by: 'u4', created_at: '2024-03-08T10:00:00Z' },
    ],
  },
];
