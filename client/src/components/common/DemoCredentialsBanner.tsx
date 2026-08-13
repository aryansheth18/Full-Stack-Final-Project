import React from 'react';
import { Shield, Store, User, Sparkles } from 'lucide-react';

interface DemoCredentialsBannerProps {
  onSelect: (email: string, pass: string) => void;
}

export const DemoCredentialsBanner: React.FC<DemoCredentialsBannerProps> = ({ onSelect }) => {
  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 dark:border-indigo-950/60 dark:bg-indigo-950/20">
      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 mb-2.5">
        <Sparkles className="w-3.5 h-3.5" />
        <span>1-Click Test Credentials for Reviewers</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onSelect('admin@storerating.com', 'Admin@2026!')}
          className="flex flex-col items-start p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all text-left group cursor-pointer shadow-2xs"
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 group-hover:text-indigo-600">
            <Shield className="w-3 h-3" />
            <span>System Admin</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate w-full mt-0.5">
            admin@storerating.com
          </p>
        </button>

        <button
          type="button"
          onClick={() => onSelect('alexander.hamilton@stores.com', 'Owner@2026!')}
          className="flex flex-col items-start p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all text-left group cursor-pointer shadow-2xs"
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:text-indigo-600">
            <Store className="w-3 h-3" />
            <span>Store Owner</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate w-full mt-0.5">
            alexander.hamilton@stores.com
          </p>
        </button>

        <button
          type="button"
          onClick={() => onSelect('user@storerating.com', 'User@2026!')}
          className="flex flex-col items-start p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all text-left group cursor-pointer shadow-2xs"
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 group-hover:text-indigo-600">
            <User className="w-3 h-3" />
            <span>Normal User</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate w-full mt-0.5">
            user@storerating.com
          </p>
        </button>
      </div>
    </div>
  );
};
