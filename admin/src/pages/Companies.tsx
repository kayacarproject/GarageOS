import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, Filter } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Modal } from '../components/ui/Modal';
import { DataTable } from '../components/tables/DataTable';
import { useCompanyStore } from '../stores/companyStore';
import type { Company, CompanyStatus, SubscriptionPlan } from '../types';

type SortKey = 'name' | 'plan' | 'usersCount' | 'activeJobs' | 'status' | 'createdAt';
type SortDir = 'asc' | 'desc';

const PLANS: SubscriptionPlan[] = ['Free', 'Starter', 'Pro', 'Enterprise'];

const SortIcon: React.FC<{ col: SortKey; active: SortKey; dir: SortDir }> = ({ col, active, dir }) => {
  if (col !== active) return <ChevronsUpDown size={13} className="text-gray-300 ml-1" />;
  return dir === 'asc'
    ? <ChevronUp size={13} className="text-blue-500 ml-1" />
    : <ChevronDown size={13} className="text-blue-500 ml-1" />;
};

export const Companies: React.FC = () => {
  const navigate = useNavigate();
  const { companies, updateStatus, updatePlan } = useCompanyStore();

  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState<CompanyStatus | 'All'>('All');
  const [planFilter, setPlan]       = useState<SubscriptionPlan | 'All'>('All');
  const [sortKey, setSortKey]       = useState<SortKey>('createdAt');
  const [sortDir, setSortDir]       = useState<SortDir>('desc');
  const [confirmId, setConfirmId]   = useState<string | null>(null);
  const [planModal, setPlanModal]   = useState<Company | null>(null);
  const [newPlan, setNewPlan]       = useState<SubscriptionPlan>('Starter');

  const confirmCompany = companies.find((c) => c.id === confirmId);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    let list = companies.filter((c) => {
      const q = search.toLowerCase();
      return (
        (c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.city.toLowerCase().includes(q)) &&
        (statusFilter === 'All' || c.status === statusFilter) &&
        (planFilter === 'All' || c.plan === planFilter)
      );
    });
    list = [...list].sort((a, b) => {
      const av = a[sortKey] as string | number;
      const bv = b[sortKey] as string | number;
      const cmp = typeof av === 'number' ? av - (bv as number) : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [companies, search, statusFilter, planFilter, sortKey, sortDir]);

  const handleToggleStatus = () => {
    if (!confirmCompany) return;
    updateStatus(confirmCompany.id, confirmCompany.status === 'Active' ? 'Suspended' : 'Active');
    setConfirmId(null);
  };

  const handlePlanSave = () => {
    if (!planModal) return;
    updatePlan(planModal.id, newPlan);
    setPlanModal(null);
  };

  const SortTh: React.FC<{ col: SortKey; label: string }> = ({ col, label }) => (
    <th
      className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none"
      onClick={() => toggleSort(col)}
    >
      <span className="inline-flex items-center">
        {label}<SortIcon col={col} active={sortKey} dir={sortDir} />
      </span>
    </th>
  );

  const columns = [
    {
      key: 'name', header: 'Company',
      render: (c: Company) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">{c.name[0]}</div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
            <p className="text-xs text-gray-400">{c.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'city',       header: 'Location',   render: (c: Company) => <span className="text-gray-500 text-sm">{c.city}, {c.state}</span> },
    { key: 'plan',       header: 'Plan',        render: (c: Company) => <Badge value={c.plan} variant="plan" /> },
    { key: 'usersCount', header: 'Users',       render: (c: Company) => <span className="font-semibold text-gray-700">{c.usersCount}</span> },
    { key: 'activeJobs', header: 'Active Jobs', render: (c: Company) => <span className="font-semibold text-gray-700">{c.activeJobs}</span> },
    { key: 'status',     header: 'Status',      render: (c: Company) => <Badge value={c.status} variant="status" /> },
    { key: 'createdAt',  header: 'Joined',      render: (c: Company) => <span className="text-gray-400 text-sm">{c.createdAt}</span> },
    {
      key: 'actions', header: '',
      render: (c: Company) => (
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(`/companies/${c.id}`)} className="text-xs text-blue-600 font-semibold hover:underline px-2 py-1">View</button>
          <button
            onClick={() => { setPlanModal(c); setNewPlan(c.plan); }}
            className="text-xs text-violet-600 font-semibold hover:underline px-2 py-1"
          >Plan</button>
          <button
            onClick={() => setConfirmId(c.id)}
            className={`text-xs font-semibold hover:underline px-2 py-1 ${c.status === 'Active' ? 'text-red-500' : 'text-emerald-600'}`}
          >
            {c.status === 'Active' ? 'Suspend' : 'Activate'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Companies</h2>
          <p className="text-sm text-gray-500">{filtered.length} of {companies.length} garages</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 w-64 shadow-sm">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search companies..." className="bg-transparent text-sm text-gray-700 outline-none w-full placeholder-gray-400" />
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm">
          <Filter size={14} className="text-gray-400" />
          <select value={statusFilter} onChange={(e) => setStatus(e.target.value as any)} className="text-sm text-gray-700 outline-none bg-transparent">
            <option value="All">All Status</option>
            <option>Active</option><option>Trial</option><option>Suspended</option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm">
          <Filter size={14} className="text-gray-400" />
          <select value={planFilter} onChange={(e) => setPlan(e.target.value as any)} className="text-sm text-gray-700 outline-none bg-transparent">
            <option value="All">All Plans</option>
            {PLANS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Sortable table header wrapper */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <SortTh col="name"       label="Company" />
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</th>
                <SortTh col="plan"       label="Plan" />
                <SortTh col="usersCount" label="Users" />
                <SortTh col="activeJobs" label="Active Jobs" />
                <SortTh col="status"     label="Status" />
                <SortTh col="createdAt"  label="Joined" />
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-gray-400">No companies found</td></tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    {columns.map((col) => (
                      <td key={col.key} className="px-5 py-4 text-sm text-gray-700">
                        {col.render(c)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suspend/Activate confirm */}
      <ConfirmDialog
        open={!!confirmId}
        title={confirmCompany?.status === 'Active' ? 'Suspend Company' : 'Activate Company'}
        message={`Are you sure you want to ${confirmCompany?.status === 'Active' ? 'suspend' : 'activate'} ${confirmCompany?.name}?`}
        confirmLabel={confirmCompany?.status === 'Active' ? 'Suspend' : 'Activate'}
        danger={confirmCompany?.status === 'Active'}
        onConfirm={handleToggleStatus}
        onCancel={() => setConfirmId(null)}
      />

      {/* Edit Plan modal */}
      <Modal open={!!planModal} title={`Change Plan — ${planModal?.name}`} onClose={() => setPlanModal(null)}>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Current plan: <strong>{planModal?.plan}</strong></p>
          <div className="grid grid-cols-2 gap-2">
            {PLANS.map((p) => (
              <button
                key={p}
                onClick={() => setNewPlan(p)}
                className={`px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                  newPlan === p ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setPlanModal(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={handlePlanSave} className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">Save</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
