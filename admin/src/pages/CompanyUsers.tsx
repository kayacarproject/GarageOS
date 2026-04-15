import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, UserX } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useCompanyStore } from '../stores/companyStore';
import type { UserRole } from '../types';

const ROLES: UserRole[] = ['OWNER', 'MANAGER', 'MECHANIC', 'RECEPTIONIST'];

export const CompanyUsers: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { companies, getUsersByCompany, addUser, deactivateUser } = useCompanyStore();

  const company = companies.find((c) => c.id === id);
  const users   = getUsersByCompany(id ?? '');

  const [addOpen, setAddOpen]         = useState(false);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [form, setForm]               = useState({ name: '', mobile: '', email: '', role: 'MECHANIC' as UserRole });
  const [formError, setFormError]     = useState('');

  const deactivateTarget = users.find((u) => u.id === deactivateId);

  const handleAdd = () => {
    if (!form.name.trim() || !form.mobile.trim()) { setFormError('Name and mobile are required.'); return; }
    if (!/^[6-9]\d{9}$/.test(form.mobile)) { setFormError('Enter a valid 10-digit mobile number.'); return; }
    addUser({ companyId: id!, ...form, isActive: true });
    setForm({ name: '', mobile: '', email: '', role: 'MECHANIC' });
    setFormError('');
    setAddOpen(false);
  };

  const handleDeactivate = () => {
    if (deactivateId) { deactivateUser(deactivateId); setDeactivateId(null); }
  };

  if (!company) return <p className="text-gray-500 p-6">Company not found.</p>;

  return (
    <div className="space-y-5 max-w-4xl">
      <button onClick={() => navigate(`/companies/${id}`)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors">
        <ArrowLeft size={16} /> Back to {company.name}
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Users — {company.name}</h2>
          <p className="text-sm text-gray-500">{users.filter((u) => u.isActive).length} active · {users.filter((u) => !u.isActive).length} inactive</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> Add User
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {['User', 'Mobile', 'Role', 'Status', 'Joined', ''].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">No users found</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className={`hover:bg-gray-50/50 transition-colors ${!u.isActive ? 'opacity-60' : ''}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {u.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                        {u.email && <p className="text-xs text-gray-400">{u.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 font-mono">{u.mobile}</td>
                  <td className="px-5 py-4"><Badge value={u.role} variant="role" /></td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-400">{u.createdAt}</td>
                  <td className="px-5 py-4">
                    {u.isActive && (
                      <button onClick={() => setDeactivateId(u.id)} className="flex items-center gap-1 text-xs text-red-500 font-semibold hover:underline">
                        <UserX size={13} /> Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      <Modal open={addOpen} title="Add New User" onClose={() => { setAddOpen(false); setFormError(''); }}>
        <div className="space-y-4">
          {formError && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>}
          {[
            { label: 'Full Name *', key: 'name', placeholder: 'e.g. Suresh Kumar', type: 'text' },
            { label: 'Mobile Number *', key: 'mobile', placeholder: '10-digit mobile', type: 'tel' },
            { label: 'Email (optional)', key: 'email', placeholder: 'user@example.com', type: 'email' },
          ].map(({ label, key, placeholder, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              <input
                type={type}
                value={(form as any)[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Role *</label>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all"
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => { setAddOpen(false); setFormError(''); }} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={handleAdd} className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">Add User</button>
          </div>
        </div>
      </Modal>

      {/* Deactivate confirm */}
      <ConfirmDialog
        open={!!deactivateId}
        title="Deactivate User"
        message={`Deactivate ${deactivateTarget?.name}? They will lose access immediately.`}
        confirmLabel="Deactivate"
        danger
        onConfirm={handleDeactivate}
        onCancel={() => setDeactivateId(null)}
      />
    </div>
  );
};
