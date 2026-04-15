import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { DataTable } from '../components/tables/DataTable';

const mockUsers = [
  { id: 'u1', name: 'Rajesh Kumar', email: 'owner@garage.com', role: 'OWNER', company: 'Kumar Auto Works', status: 'Active', createdAt: '2024-01-10' },
  { id: 'u2', name: 'Priya Sharma', email: 'manager@garage.com', role: 'MANAGER', company: 'Kumar Auto Works', status: 'Active', createdAt: '2024-01-10' },
  { id: 'u3', name: 'Suresh Mechanic', email: 'mechanic@garage.com', role: 'MECHANIC', company: 'Kumar Auto Works', status: 'Active', createdAt: '2024-01-10' },
  { id: 'u4', name: 'Anita Reception', email: 'reception@garage.com', role: 'RECEPTIONIST', company: 'Kumar Auto Works', status: 'Active', createdAt: '2024-01-10' },
  { id: 'u5', name: 'Vikram Sharma', email: 'vikram@motors.com', role: 'OWNER', company: 'Sharma Motors', status: 'Active', createdAt: '2024-01-15' },
];

const roleColors: Record<string, string> = {
  OWNER: 'bg-violet-50 text-violet-600',
  MANAGER: 'bg-blue-50 text-blue-600',
  MECHANIC: 'bg-amber-50 text-amber-600',
  RECEPTIONIST: 'bg-emerald-50 text-emerald-600',
};

const getInitials = (name: string) => name.split(' ').map(n => n[0]).slice(0, 2).join('');

export const Users: React.FC = () => {
  const [search, setSearch] = useState('');
  const filtered = mockUsers.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    {
      key: 'name', header: 'User',
      render: (row: typeof mockUsers[0]) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{getInitials(row.name)}</div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{row.name}</p>
            <p className="text-xs text-gray-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role', header: 'Role',
      render: (row: typeof mockUsers[0]) => (
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleColors[row.role]}`}>{row.role}</span>
      ),
    },
    { key: 'company', header: 'Company', render: (row: typeof mockUsers[0]) => <span className="text-gray-600">{row.company}</span> },
    {
      key: 'status', header: 'Status',
      render: (row: typeof mockUsers[0]) => (
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">{row.status}</span>
      ),
    },
    { key: 'createdAt', header: 'Joined', render: (row: typeof mockUsers[0]) => <span className="text-gray-500">{row.createdAt}</span> },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Users</h2>
          <p className="text-sm text-gray-500">{mockUsers.length} total users across all companies</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors">
          <Plus size={16} /> Add User
        </button>
      </div>
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 w-72 shadow-sm">
        <Search size={15} className="text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="bg-transparent text-sm text-gray-700 outline-none w-full placeholder-gray-400" />
      </div>
      <DataTable data={filtered} columns={columns as any} />
    </div>
  );
};
