import React, { useState } from 'react';
import { User, Lock, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export const Settings: React.FC = () => {
  const { user } = useAuthStore();

  const [name, setName]         = useState(user?.name ?? '');
  const [email, setEmail]       = useState(user?.email ?? '');
  const [profileSaved, setProfileSaved] = useState(false);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw]         = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError]     = useState('');
  const [pwSaved, setPwSaved]     = useState(false);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Replace with: await api.patch('/admin/v1/profile', { name, email })
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (!currentPw || !newPw || !confirmPw) { setPwError('All fields are required.'); return; }
    if (newPw.length < 8) { setPwError('New password must be at least 8 characters.'); return; }
    if (newPw !== confirmPw) { setPwError('Passwords do not match.'); return; }
    // Replace with: await api.post('/admin/v1/change-password', { currentPw, newPw })
    setPwSaved(true);
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    setTimeout(() => setPwSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500">Manage your super admin account</p>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <User size={18} className="text-blue-600" />
          </div>
          <h3 className="text-base font-bold text-gray-900">Profile</h3>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
            <input value="Super Admin" disabled
              className="w-full border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-400 bg-gray-50 cursor-not-allowed" />
          </div>
          <button type="submit"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${profileSaved ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
            {profileSaved ? <><CheckCircle size={15} /> Saved!</> : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
            <Lock size={18} className="text-violet-600" />
          </div>
          <h3 className="text-base font-bold text-gray-900">Change Password</h3>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {pwError && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{pwError}</p>}
          {pwSaved && (
            <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
              <CheckCircle size={15} /> Password updated successfully
            </div>
          )}
          {[
            { label: 'Current Password', value: currentPw, onChange: setCurrentPw },
            { label: 'New Password',     value: newPw,     onChange: setNewPw },
            { label: 'Confirm Password', value: confirmPw, onChange: setConfirmPw },
          ].map(({ label, value, onChange }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              <input type="password" value={value} onChange={(e) => onChange(e.target.value)} placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all" />
            </div>
          ))}
          <button type="submit" className="px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors">
            Update Password
          </button>
        </form>
      </div>

      {/*
        ─── Suggested Backend API Endpoints ──────────────────────────────────
        GET    /admin/v1/companies              → paginated list with filters
        POST   /admin/v1/companies              → create company
        PATCH  /admin/v1/companies/:id/status   → suspend / activate
        PATCH  /admin/v1/companies/:id/plan     → change subscription plan
        GET    /admin/v1/companies/:id/users    → list users for company
        POST   /admin/v1/companies/:id/users    → add user to company
        PATCH  /admin/v1/users/:id/deactivate   → deactivate user
        GET    /admin/v1/subscriptions          → all subscriptions + MRR
        PATCH  /admin/v1/subscriptions/:id      → update plan
        GET    /admin/v1/analytics/dashboard    → KPIs + monthly data
        POST   /admin/v1/auth/login             → super admin login (role=superadmin)
        POST   /admin/v1/auth/change-password   → change password
      */}
    </div>
  );
};
