import type { Estimate } from '../../types';

export const dummyEstimates: Estimate[] = [
  // ── est1 · jc1 · approved · Full service + brakes ─────────────────────────
  {
    id: 'est1', company_id: 'c1', companyId: 'c1',
    job_card_id: 'jc1', jobCardId: 'jc1',
    version: 2, status: 'approved',
    approved_at: '2024-03-10T10:00:00Z',
    created_by: 'u2', created_at: '2024-03-10T09:45:00Z',
    items: [
      { id: 'ei1', estimate_id: 'est1', name: 'Engine Oil 5W-30 (Castrol GTX)',  type: 'part',   quantity: 4, unit: 'L',   unit_price: 480,  amount: 1920, gst_percent: 18, qty: 4, unitPrice: 480 },
      { id: 'ei2', estimate_id: 'est1', name: 'Oil Filter (Genuine)',             type: 'part',   quantity: 1, unit: 'pcs', unit_price: 280,  amount: 280,  gst_percent: 18, qty: 1, unitPrice: 280 },
      { id: 'ei3', estimate_id: 'est1', name: 'Air Filter',                       type: 'part',   quantity: 1, unit: 'pcs', unit_price: 420,  amount: 420,  gst_percent: 18, qty: 1, unitPrice: 420 },
      { id: 'ei4', estimate_id: 'est1', name: 'Brake Pads Front (Bosch)',         type: 'part',   quantity: 1, unit: 'set', unit_price: 1850, amount: 1850, gst_percent: 18, qty: 1, unitPrice: 1850 },
      { id: 'ei5', estimate_id: 'est1', name: 'Service Labour',                   type: 'labour', quantity: 1, unit: 'job', unit_price: 600,  amount: 600,  qty: 1, unitPrice: 600 },
      { id: 'ei6', estimate_id: 'est1', name: 'Brake Pad Replacement Labour',     type: 'labour', quantity: 1, unit: 'job', unit_price: 350,  amount: 350,  qty: 1, unitPrice: 350 },
    ],
    subtotal: 5420, discount: 200, gst_amount: 795, total: 6015, tax: 795,
  },

  // ── est1_v1 · jc1 · superseded · Original estimate before revision ─────────
  {
    id: 'est1v1', company_id: 'c1', companyId: 'c1',
    job_card_id: 'jc1', jobCardId: 'jc1',
    version: 1, status: 'superseded',
    created_by: 'u2', created_at: '2024-03-10T09:30:00Z',
    items: [
      { id: 'ei1v1', estimate_id: 'est1v1', name: 'Engine Oil 5W-30', type: 'part',   quantity: 4, unit: 'L',   unit_price: 450, amount: 1800, gst_percent: 18, qty: 4, unitPrice: 450 },
      { id: 'ei2v1', estimate_id: 'est1v1', name: 'Oil Filter',        type: 'part',   quantity: 1, unit: 'pcs', unit_price: 250, amount: 250,  gst_percent: 18, qty: 1, unitPrice: 250 },
      { id: 'ei3v1', estimate_id: 'est1v1', name: 'Service Labour',    type: 'labour', quantity: 1, unit: 'job', unit_price: 600, amount: 600,  qty: 1, unitPrice: 600 },
    ],
    subtotal: 2650, discount: 0, gst_amount: 369, total: 3019, tax: 369,
  },

  // ── est2 · jc2 · draft · AC repair ────────────────────────────────────────
  {
    id: 'est2', company_id: 'c1', companyId: 'c1',
    job_card_id: 'jc2', jobCardId: 'jc2',
    version: 1, status: 'draft',
    created_by: 'u2', created_at: '2024-03-11T11:00:00Z',
    items: [
      { id: 'ei7',  estimate_id: 'est2', name: 'AC Gas Refill R134a (500g)',  type: 'part',   quantity: 1, unit: 'job', unit_price: 2800, amount: 2800, gst_percent: 18, qty: 1, unitPrice: 2800 },
      { id: 'ei8',  estimate_id: 'est2', name: 'AC Cabin Filter',             type: 'part',   quantity: 1, unit: 'pcs', unit_price: 650,  amount: 650,  gst_percent: 18, qty: 1, unitPrice: 650 },
      { id: 'ei9',  estimate_id: 'est2', name: 'Compressor Belt',             type: 'part',   quantity: 1, unit: 'pcs', unit_price: 480,  amount: 480,  gst_percent: 18, qty: 1, unitPrice: 480 },
      { id: 'ei10', estimate_id: 'est2', name: 'AC Diagnosis & Labour',       type: 'labour', quantity: 1, unit: 'job', unit_price: 700,  amount: 700,  qty: 1, unitPrice: 700 },
    ],
    subtotal: 4630, discount: 0, gst_amount: 709, total: 5339, tax: 709,
  },

  // ── est3 · jc3 · approved · Engine overhaul ───────────────────────────────
  {
    id: 'est3', company_id: 'c1', companyId: 'c1',
    job_card_id: 'jc3', jobCardId: 'jc3',
    version: 1, status: 'approved',
    approved_at: '2024-03-08T10:30:00Z',
    created_by: 'u2', created_at: '2024-03-08T09:00:00Z',
    items: [
      { id: 'ei11', estimate_id: 'est3', name: 'OEM Head Gasket Kit (Toyota)',  type: 'part',   quantity: 1, unit: 'set', unit_price: 8500,  amount: 8500,  gst_percent: 18, qty: 1, unitPrice: 8500 },
      { id: 'ei12', estimate_id: 'est3', name: 'Engine Oil 15W-40 (5L)',        type: 'part',   quantity: 1, unit: 'can', unit_price: 1200,  amount: 1200,  gst_percent: 18, qty: 1, unitPrice: 1200 },
      { id: 'ei13', estimate_id: 'est3', name: 'Coolant (1L)',                  type: 'part',   quantity: 2, unit: 'L',   unit_price: 350,   amount: 700,   gst_percent: 18, qty: 2, unitPrice: 350 },
      { id: 'ei14', estimate_id: 'est3', name: 'Timing Belt',                   type: 'part',   quantity: 1, unit: 'pcs', unit_price: 2200,  amount: 2200,  gst_percent: 18, qty: 1, unitPrice: 2200 },
      { id: 'ei15', estimate_id: 'est3', name: 'Engine Overhaul Labour',        type: 'labour', quantity: 1, unit: 'job', unit_price: 6000,  amount: 6000,  qty: 1, unitPrice: 6000 },
    ],
    subtotal: 18600, discount: 600, gst_amount: 2700, total: 20700, tax: 2700,
  },

  // ── est4 · jc4 · approved · Routine service ───────────────────────────────
  {
    id: 'est4', company_id: 'c1', companyId: 'c1',
    job_card_id: 'jc4', jobCardId: 'jc4',
    version: 1, status: 'approved',
    approved_at: '2024-03-05T09:30:00Z',
    created_by: 'u2', created_at: '2024-03-05T09:20:00Z',
    items: [
      { id: 'ei16', estimate_id: 'est4', name: 'Engine Oil (EV Grade)',  type: 'part',   quantity: 1, unit: 'L',   unit_price: 950, amount: 950,  gst_percent: 18, qty: 1, unitPrice: 950 },
      { id: 'ei17', estimate_id: 'est4', name: 'Cabin Air Filter',       type: 'part',   quantity: 1, unit: 'pcs', unit_price: 480, amount: 480,  gst_percent: 18, qty: 1, unitPrice: 480 },
      { id: 'ei18', estimate_id: 'est4', name: 'Service Labour',         type: 'labour', quantity: 1, unit: 'job', unit_price: 500, amount: 500,  qty: 1, unitPrice: 500 },
    ],
    subtotal: 1930, discount: 0, gst_amount: 263, total: 2193, tax: 263,
  },

  // ── est5 · jc5 · approved · Suspension repair ─────────────────────────────
  {
    id: 'est5', company_id: 'c1', companyId: 'c1',
    job_card_id: 'jc5', jobCardId: 'jc5',
    version: 1, status: 'approved',
    approved_at: '2024-03-12T09:30:00Z',
    created_by: 'u2', created_at: '2024-03-12T09:00:00Z',
    items: [
      { id: 'ei19', estimate_id: 'est5', name: 'Lower Arm Bush Set (Front L)', type: 'part',   quantity: 1, unit: 'set', unit_price: 1200, amount: 1200, gst_percent: 18, qty: 1, unitPrice: 1200 },
      { id: 'ei20', estimate_id: 'est5', name: 'Suspension Labour',            type: 'labour', quantity: 1, unit: 'job', unit_price: 800,  amount: 800,  qty: 1, unitPrice: 800 },
      { id: 'ei21', estimate_id: 'est5', name: 'Wheel Alignment',              type: 'labour', quantity: 1, unit: 'job', unit_price: 500,  amount: 500,  qty: 1, unitPrice: 500 },
    ],
    subtotal: 2500, discount: 0, gst_amount: 216, total: 2716, tax: 216,
  },

  // ── est6 · jc8 · approved · Tyre + alignment ──────────────────────────────
  {
    id: 'est6', company_id: 'c1', companyId: 'c1',
    job_card_id: 'jc8', jobCardId: 'jc8',
    version: 1, status: 'approved',
    approved_at: '2024-03-14T11:30:00Z',
    created_by: 'u2', created_at: '2024-03-14T11:20:00Z',
    items: [
      { id: 'ei22', estimate_id: 'est6', name: 'Tyre Rotation',       type: 'labour', quantity: 1, unit: 'job', unit_price: 300, amount: 300,  qty: 1, unitPrice: 300 },
      { id: 'ei23', estimate_id: 'est6', name: 'Wheel Alignment',     type: 'labour', quantity: 1, unit: 'job', unit_price: 600, amount: 600,  qty: 1, unitPrice: 600 },
      { id: 'ei24', estimate_id: 'est6', name: 'Wheel Balancing (4)', type: 'labour', quantity: 4, unit: 'pcs', unit_price: 150, amount: 600,  qty: 4, unitPrice: 150 },
    ],
    subtotal: 1500, discount: 0, gst_amount: 162, total: 1662, tax: 162,
  },
];
