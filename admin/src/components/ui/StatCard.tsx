import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface Props {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  trend?: { value: string; positive: boolean };
}

export const StatCard: React.FC<Props> = ({ label, value, subtext, icon: Icon, iconColor, iconBg, trend }) => (
  <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={20} className={iconColor} />
      </div>
      {trend && (
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trend.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
          {trend.positive ? '↑' : '↓'} {trend.value}
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-sm font-medium text-gray-500 mt-0.5">{label}</p>
    {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
  </div>
);
