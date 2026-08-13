import React from 'react';
import { Link } from 'react-router-dom';
import { Store, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
          <Store className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            404
          </h1>
          <h2 className="mt-2 text-lg font-bold text-slate-800 dark:text-slate-200">
            Page Not Found
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            The destination URL or resource you requested could not be located on the platform.
          </p>
        </div>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            to="/stores"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Go to Stores</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
