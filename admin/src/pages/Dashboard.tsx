import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, Briefcase, CreditCard, TrendingUp } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { StatCard } from '../components/ui/StatCard';
import { Badge } from '../components/ui/Badge';
import { useCompanyStore } from '../stores/companyStore';
import { monthlyData } from '../dummy/companies';

const fmt = (n: number) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}K`;

export const Dashboard: React.FC = () => {
  const { companies } = useCompanyStore();

  const totalUsers    = useMemo(() => companies.reduce((s, c) => s + c.usersCount, 0), [companies]);
  const activeJobs    = useMemo(() => companies.reduce((s, c) => s + c.activeJobs, 0), [companies]);
  const totalRevenue  = useMemo(() => companies.reduce((s, c) => s + c.totalRevenue, 0), [companies]);
  const activeCount   = useMemo(() => companies.filter((c) => c.status === 'Active').length, [companies]);
  const pendingPayment = useMemo(() => companies.filter((c) => c.status === 'Trial').length, [companies]);

  const recentCompanies = useMemo(
    () => [...companies].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
    [companies],
  );

  const revenueChartData = monthlyData.map((d) => ({ ...d, revenue: d.revenue / 1000 }));
  const growthChartData  = monthlyData.map((d) => ({ ...d, jobs: Math.round(d.jobs / 10) }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Platform Overview</h2>
        <p className="text-sm text-gray-500 mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Active Companies"  value={activeCount}       icon={Building2}   iconColor="text-blue-600"    iconBg="bg-blue-50"    trend={{ value: '+6 this month', positive: true }} />
        <StatCard label="Total Users"       value={totalUsers}        icon={Users}       iconColor="text-violet-600"  iconBg="bg-violet-50"  trend={{ value: '+24 this month', positive: true }} />
        <StatCard label="Active Jobs"       value={activeJobs}        icon={Briefcase}   iconColor="text-amber-600"   iconBg="bg-amber-50"   />
        <StatCard label="Platform Revenue"  value={fmt(totalRevenue)} icon={CreditCard}  iconColor="text-emerald-600" iconBg="bg-emerald-50" trend={{ value: '+18% vs last month', positive: true }} />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Trial Companies"   value={pendingPayment}                                icon={TrendingUp} iconColor="text-amber-600"   iconBg="bg-amber-50"   />
        <StatCard label="Suspended"         value={companies.filter(c => c.status === 'Suspended').length} icon={Building2} iconColor="text-red-500" iconBg="bg-red-50" />
        <StatCard label="Total Job Cards"   value={companies.reduce((s, c) => s + c.totalJobCards, 0).toLocaleString('en-IN')} icon={Briefcase} iconColor="text-blue-600" iconBg="bg-blue-50" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <h3 className="text-base font-bold text-gray-900 mb-1">Revenue Trend</h3>
          <p className="text-xs text-gray-400 mb-5">Monthly platform revenue (₹ thousands)</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 12 }}
                formatter={(v: any) => [`₹${Number(v ?? 0)}K`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} fill="url(#revGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Company Growth */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <h3 className="text-base font-bold text-gray-900 mb-1">Company Growth</h3>
          <p className="text-xs text-gray-400 mb-5">Cumulative registered companies</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={growthChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="companies" name="Companies" fill="#7C3AED" radius={[6, 6, 0, 0]} />
              <Bar dataKey="jobs" name="Jobs (÷10)" fill="#2563EB" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Companies */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Recently Added</h3>
          <Link to="/companies" className="text-sm text-blue-600 font-semibold hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                {['Company', 'Plan', 'Users', 'Active Jobs', 'Status', 'Joined'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentCompanies.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{c.name[0]}</div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.city}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><Badge value={c.plan} variant="plan" /></td>
                  <td className="px-6 py-4 text-sm text-gray-600">{c.usersCount}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{c.activeJobs}</td>
                  <td className="px-6 py-4"><Badge value={c.status} variant="status" /></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
