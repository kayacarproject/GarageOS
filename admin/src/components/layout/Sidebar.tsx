import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, CreditCard, Settings, Wrench, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const navItems = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/companies',     icon: Building2,       label: 'Companies' },
  { to: '/subscriptions', icon: CreditCard,      label: 'Subscriptions' },
  { to: '/settings',      icon: Settings,        label: 'Settings' },
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="w-60 bg-white border-r border-gray-100 flex flex-col shadow-sm flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
          <Wrench size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 leading-tight">GarageOS</p>
          <p className="text-xs text-gray-400">Super Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.name?.[0] ?? 'S'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.name ?? 'Super Admin'}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
};
