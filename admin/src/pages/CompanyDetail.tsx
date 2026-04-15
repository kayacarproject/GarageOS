import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Users, Car, FileText, CreditCard, MapPin, Mail, Phone, Building2 } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Modal } from '../components/ui/Modal';
import { useCompanyStore } from '../stores/companyStore';
import type { SubscriptionPlan } from '../types';

const PLANS: SubscriptionPlan[] = ['Free', 'Starter', 'Pro', 'Enterprise'];

const JOB_STATUS_MOCK = [
  { label: 'Created',          count: 4,  color: 'bg-gray-200' },
  { label: 'In Progress',      count: 8,  color: 'bg-blue-400' },
  { label: 'Waiting Parts',    count: 3,  color: 'bg-amber-400' },
  { label: 'QC Pending',       count: 2,  color: 'bg-violet-400' },
  { label: 'Invoiced',         count: 5,  color: 'bg-indigo-400' },
  { label: 'Delivered',        count: 12, color: 'bg-emerald-400' },
];

export const CompanyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { companies, updateStatus, updatePlan, getUsersByCompany } = useCompanyStore();

  const company = companies.find((c) => c.id === id);
  const users   = getUsersByCompany(id ?? '');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [planModal, setPlanModal]     = useState(false);
  const [newPlan, setNewPlan]         = useState<SubscriptionPlan>('Starter');

  useEffect(() => {
    if (company) setNewPlan(company.plan);
  }, [company]);

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Building2 size={40} className="text-gray-300" />
        <p className="text-gray-500 font-medium">Company not found</p>
        <button onClick={() => navigate('/companies')} className="text-sm text-blue-600 font-semibold hover:underline">← Back to Companies</button>
      </div>
    );
  }

  const handleToggleStatus = () => {
    updateStatus(company.id, company.status === 'Active' ? 'Suspended' : 'Active');
    setConfirmOpen(false);
  };

  const handlePlanSave = () => { updatePlan(company.id, newPlan); setPlanModal(false); };

  const totalJobs = JOB_STATUS_MOCK.reduce((s, j) => s + j.count, 0);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors">
        <ArrowLeft size={16} /> Back to Companies
      </button>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
        <div className="flex items-start gap-5 flex-wrap">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {company.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h2 className="text-xl font-bold text-gray-900">{company.name}</h2>
              <Badge value={company.plan} variant="plan" />
              <Badge value={company.status} variant="status" />
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><Mail size={13} />{company.email}</span>
              <span className="flex items-center gap-1.5"><Phone size={13} />{company.phone}</span>
              <span className="flex items-center gap-1.5"><MapPin size={13} />{company.address}, {company.city}, {company.state}</span>
            </div>
            {company.gst && <p className="text-xs text-gray-400 mt-1.5">GST: {company.gst}</p>}
            <p className="text-xs text-gray-400 mt-0.5">Member since {company.createdAt}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => setPlanModal(true)} className="text-sm font-semibold px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
              Change Plan
            </button>
            <button
              onClick={() => setConfirmOpen(true)}
              className={`text-sm font-semibold px-4 py-2 rounded-xl transition-colors ${
                company.status === 'Active' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
              }`}
            >
              {company.status === 'Active' ? 'Suspend' : 'Activate'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Users"         value={company.usersCount}   icon={Users}     iconColor="text-blue-600"    iconBg="bg-blue-50" />
        <StatCard label="Vehicles"      value={company.totalVehicles} icon={Car}       iconColor="text-violet-600"  iconBg="bg-violet-50" />
        <StatCard label="Total Job Cards" value={company.totalJobCards} icon={FileText} iconColor="text-amber-600"   iconBg="bg-amber-50" />
        <StatCard label="Total Revenue" value={`₹${(company.totalRevenue / 1000).toFixed(0)}K`} icon={CreditCard} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Subscription */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <h3 className="text-base font-bold text-gray-900 mb-4">Subscription</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Plan</p><p className="font-semibold text-gray-900">{company.plan}</p></div>
            <div><p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Billing</p><p className="font-semibold text-gray-900">Monthly</p></div>
            <div><p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Next Renewal</p><p className="font-semibold text-gray-900">Apr 10, 2025</p></div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Amount</p>
              <p className="font-semibold text-gray-900">
                {company.plan === 'Free' ? 'Free' : company.plan === 'Starter' ? '₹1,499/mo' : company.plan === 'Pro' ? '₹4,999/mo' : '₹12,999/mo'}
              </p>
            </div>
          </div>
          {company.bankDetails && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Bank Details</p>
              <div className="text-sm space-y-1 text-gray-600">
                <p>{company.bankDetails.accountName} · {company.bankDetails.bank}</p>
                <p className="font-mono text-xs text-gray-400">{company.bankDetails.accountNumber} · {company.bankDetails.ifsc}</p>
              </div>
            </div>
          )}
        </div>

        {/* Job Status Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <h3 className="text-base font-bold text-gray-900 mb-4">Job Cards by Status</h3>
          <div className="space-y-3">
            {JOB_STATUS_MOCK.map((j) => (
              <div key={j.label} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-32 flex-shrink-0">{j.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div className={`${j.color} h-2 rounded-full`} style={{ width: `${(j.count / totalJobs) * 100}%` }} />
                </div>
                <span className="text-sm font-semibold text-gray-700 w-6 text-right">{j.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Users Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Users ({users.length})</h3>
          <Link to={`/companies/${company.id}/users`} className="text-sm text-blue-600 font-semibold hover:underline">Manage Users →</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {users.slice(0, 4).map((u) => (
            <div key={u.id} className="flex items-center gap-4 px-6 py-3.5">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {u.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{u.name}</p>
                <p className="text-xs text-gray-400">{u.mobile}</p>
              </div>
              <Badge value={u.role} variant="role" />
              {!u.isActive && <span className="text-xs text-red-500 font-medium">Inactive</span>}
            </div>
          ))}
          {users.length > 4 && (
            <div className="px-6 py-3 text-sm text-gray-400 text-center">+{users.length - 4} more users</div>
          )}
        </div>
      </div>

      {/* Confirm suspend */}
      <ConfirmDialog
        open={confirmOpen}
        title={company.status === 'Active' ? 'Suspend Company' : 'Activate Company'}
        message={`This will ${company.status === 'Active' ? 'suspend access for all users of' : 'restore access for'} ${company.name}.`}
        confirmLabel={company.status === 'Active' ? 'Suspend' : 'Activate'}
        danger={company.status === 'Active'}
        onConfirm={handleToggleStatus}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* Plan modal */}
      <Modal open={planModal} title="Change Subscription Plan" onClose={() => setPlanModal(false)}>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Current: <strong>{company.plan}</strong></p>
          <div className="grid grid-cols-2 gap-2">
            {PLANS.map((p) => (
              <button key={p} onClick={() => setNewPlan(p)}
                className={`px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${newPlan === p ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                {p}
              </button>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setPlanModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={handlePlanSave} className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">Save</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
