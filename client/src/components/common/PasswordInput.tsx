import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showIcon?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  error,
  helperText,
  showIcon = true,
  className = '',
  id,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        {showIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Lock className="h-4 w-4" />
          </div>
        )}
        <input
          id={inputId}
          type={showPassword ? 'text' : 'password'}
          className={`block w-full rounded-lg border py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent ${
            showIcon ? 'pl-9.5' : 'pl-3.5'
          } pr-10 ${
            error
              ? 'border-red-400 bg-red-50/40 text-red-900 placeholder-red-400 focus:ring-red-500 dark:bg-red-950/20 dark:border-red-800 dark:text-red-300'
              : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500'
          } ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none cursor-pointer"
          tabIndex={-1}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          title={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-slate-500 dark:text-slate-400 transition-transform active:scale-90" />
          ) : (
            <Eye className="h-4 w-4 text-slate-500 dark:text-slate-400 transition-transform active:scale-90" />
          )}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>}
    </div>
  );
};
