import React from 'react';

type Variant = 'plan' | 'status' | 'role';

const PLAN_CLASSES: Record<string, string> = {
  Free:       'bg-gray-100 text-gray-600',
  Starter:    'bg-blue-50 text-blue-600',
  Pro:        'bg-violet-50 text-violet-700',
  Enterprise: 'bg-amber-50 text-amber-700',
};

const STATUS_CLASSES: Record<string, string> = {
  Active:    'bg-emerald-50 text-emerald-700',
  Trial:     'bg-amber-50 text-amber-700',
  Suspended: 'bg-red-50 text-red-600',
};

const ROLE_CLASSES: Record<string, string> = {
  OWNER:        'bg-violet-50 text-violet-700',
  MANAGER:      'bg-blue-50 text-blue-600',
  MECHANIC:     'bg-amber-50 text-amber-700',
  RECEPTIONIST: 'bg-emerald-50 text-emerald-700',
};

interface Props {
  value: string;
  variant: Variant;
  className?: string;
}

export const Badge: React.FC<Props> = ({ value, variant, className = '' }) => {
  const map = variant === 'plan' ? PLAN_CLASSES : variant === 'status' ? STATUS_CLASSES : ROLE_CLASSES;
  const cls = map[value] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${cls} ${className}`}>
      {value}
    </span>
  );
};
