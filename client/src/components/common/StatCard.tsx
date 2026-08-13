import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'indigo' | 'emerald' | 'amber' | 'purple' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  color = 'indigo',
}) => {
  const colorMap = {
    indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-500/20 text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400',
    emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-500/20 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400',
    amber: 'from-amber-500 to-amber-600 shadow-amber-500/20 text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400',
    purple: 'from-purple-500 to-purple-600 shadow-purple-500/20 text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400',
    rose: 'from-rose-500 to-rose-600 shadow-rose-500/20 text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400',
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
          {description && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>
          )}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
