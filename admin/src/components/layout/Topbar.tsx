import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const TITLES: Record<string, string> = {
  '/dashboard':     'Dashboard',
  '/companies':     'Companies',
  '/subscriptions': 'Subscriptions',
  '/settings':      'Settings',
};

export const Topbar: React.FC = () => {
  const { pathname } = useLocation();
  const { user } = useAuthStore();

  const title = Object.entries(TITLES).find(([path]) => pathname.startsWith(path))?.[1] ?? 'GarageOS Admin';

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-lg font-bold text-gray-900">{title}</h1>
      <div className="flex items-center gap-3">
        <button className="relative w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
          <Bell size={16} className="text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.[0] ?? 'S'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.name}</p>
            <p className="text-xs text-gray-400">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
};
