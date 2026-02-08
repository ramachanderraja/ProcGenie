'use client';

import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: 'indigo' | 'green' | 'amber' | 'red';
  trend?: string;
  trendUp?: boolean;
}

const colorMap = {
  indigo: {
    bg: 'bg-indigo-50',
    icon: 'text-indigo-600',
    trend: 'text-indigo-600',
  },
  green: {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-600',
    trend: 'text-emerald-600',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'text-amber-600',
    trend: 'text-amber-600',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    trend: 'text-red-600',
  },
};

export function StatCard({ label, value, icon: Icon, color, trend, trendUp }: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 text-sm font-medium ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
              {trendUp ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className={`rounded-xl p-3 ${colors.bg}`}>
          <Icon className={`h-6 w-6 ${colors.icon}`} />
        </div>
      </div>
    </div>
  );
}
