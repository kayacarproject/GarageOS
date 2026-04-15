import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { DataTable } from '../components/tables/DataTable';
import { useCompanyStore } from '../stores/companyStore';
import { plans } from '../dummy/companies';
import type { SubscriptionPlan } from '../types';

const PLAN_HEADER_COLORS: Record<string, string> = {
  Free:       'bg-gray-50  border-gray-200',
  Starter:    'bg-blue-50  border-blue-200',
  Pro:        'bg-violet-50 border-violet-300',
  Enterprise: 'bg-amber-50 border-amber-200',
};

const PLAN_BTN_COLORS: Record<string, string> = {
  Free:       'bg-gray-600  hover:bg-gray-700',
  Starter:    'bg-blue-600  hover:bg-blue-700',
  Pro:        'bg-violet-600 hover:bg-violet-700',
  Enterprise: 'bg-amber-500 hover:bg-amber-600',
};

export const Subscriptions: React.FC = () => {
  const { companies, updatePlan } = useCompanyStore();

  const [assignModal, setAssignModal] = useState<{ companyId: string; companyName: string; current: SubscriptionPlan } | null>(null);
  const [newPlan, setNewPlan]         = useState<SubscriptionPlan>('Starter');

  const mrr = companies.reduce((sum, c) => {
    const price = plans.find((p) => p.id === c.plan)?.price ?? 0;
    return sum + (c.status !== 'Suspended' ? price : 0);
  }, 0);

  const planCounts = plans.map((p) => ({
    ...p,
    count: companies.filter((c) => c.plan === p.id && c.status !== 'Suspended').length,
  }));

  const subRows = companies.map((c) => ({
    id: c.id,
    company: c.name,
    plan: c.plan,
    status: c.status,
    amount: plans.find((p) => p.id === c.plan)?.priceLabel ?? '—',
    renewal: '2025-04-10',
  }));

  const columns = [
    { key: 'company', header: 'Company',  render: (r: typeof subRows[0]) => <span className="font-semibold text-gray-900">{r.company}</span> },
    { key: 'plan',    header: 'Plan',     render: (r: typeof subRows[0]) => <Badge value={r.plan} variant="plan" /> },
    { key: 'amount',  header: 'Amount',   render: (r: typeof subRows[0]) => <span className="font-semibold text-gray-800">{r.amount}</span> },
    { key: 'status',  header: 'Status',   render: (r: typeof subRows[0]) => <Badge value={r.status} variant="status" /> },
    { key: 'renewal', header: 'Renewal',  render: (r: typeof subRows[0]) => <span className="text-gray-400">{r.renewal}</span> },
    {
      key: 'actions', header: '',
      render: (r: typeof subRows[0]) => (
        <button
          onClick={() => { setAssignModal({ companyId: r.id, companyName: r.company, current: r.plan as SubscriptionPlan }); setNewPlan(r.plan as SubscriptionPlan); }}
          className="text-xs text-blue-600 font-semibold hover:underline"
        >
          Change Plan
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Subscriptions</h2>
          <p className="text-sm text-gray-500">
            MRR: <span className="font-bold text-emerald-600">₹{mrr.toLocaleString('en-IN')}</span>
          </p>
        </div>
      </div>

      {/* Plan summary cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {planCounts.map((p) => (
          <div key={p.id} className={`rounded-2xl border p-5 ${PLAN_HEADER_COLORS[p.id]}`}>
            <p className="text-2xl font-bold text-gray-900">{p.count}</p>
            <p className="text-sm font-semibold text-gray-600 mt-0.5">{p.id}</p>
            <p className="text-xs text-gray-400 mt-1">{p.priceLabel}</p>
          </div>
        ))}
      </div>

      {/* Plan feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {plans.map((p) => (
          <div key={p.id} className={`bg-white rounded-2xl border shadow-card overflow-hidden ${p.highlight ? 'ring-2 ring-violet-400' : 'border-gray-100'}`}>
            {p.highlight && (
              <div className="bg-violet-600 text-white text-xs font-bold text-center py-1.5 tracking-wide">MOST POPULAR</div>
            )}
            <div className="p-5">
              <h3 className="text-base font-bold text-gray-900">{p.id}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{p.priceLabel}</p>
              <ul className="mt-4 space-y-2">
                {p.features.map((f) => (
                  <li key={f.label} className="flex items-center gap-2 text-sm">
                    {f.included
                      ? <Check size={14} className="text-emerald-500 flex-shrink-0" />
                      : <X size={14} className="text-gray-300 flex-shrink-0" />}
                    <span className={f.included ? 'text-gray-700' : 'text-gray-400'}>{f.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Subscriptions table */}
      <DataTable data={subRows} columns={columns as any} />

      {/* Assign plan modal */}
      <Modal open={!!assignModal} title={`Change Plan — ${assignModal?.companyName}`} onClose={() => setAssignModal(null)}>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Current: <strong>{assignModal?.current}</strong></p>
          <div className="grid grid-cols-2 gap-2">
            {plans.map((p) => (
              <button
                key={p.id}
                onClick={() => setNewPlan(p.id)}
                className={`px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${newPlan === p.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
              >
                <span className="block">{p.id}</span>
                <span className="text-xs font-normal text-gray-400">{p.priceLabel}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setAssignModal(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
            <button
              onClick={() => { if (assignModal) { updatePlan(assignModal.companyId, newPlan); setAssignModal(null); } }}
              className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors ${PLAN_BTN_COLORS[newPlan]}`}
            >
              Assign {newPlan}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
