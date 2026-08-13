import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { PasswordInput } from '../../components/common/PasswordInput';
import { KeyRound, CheckCircle2, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export const ResetPasswordPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [location]);

  // Validation
  const isPasswordLengthValid = newPassword.length >= 8 && newPassword.length <= 16;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
  const isPasswordValid = isPasswordLengthValid && hasUppercase && hasSpecialChar;
  const doPasswordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!token.trim()) {
      setErrorMessage('Reset token is required.');
      return;
    }
    if (!isPasswordValid) {
      setErrorMessage('Password must be 8-16 characters and contain at least 1 uppercase letter and 1 special character.');
      return;
    }
    if (!doPasswordsMatch) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/reset-password', {
        token: token.trim(),
        newPassword,
      });

      if (response.data.success) {
        toast.success('Password reset successfully! Please log in.');
        navigate('/login');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to reset password. Token may be invalid or expired.';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Set new password
          </h2>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            Create a secure new password for your account
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Token Field */}
            <div className="space-y-1.5">
              <label htmlFor="token" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Security Reset Token
              </label>
              <input
                id="token"
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste your 64-character token"
                className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-xs font-mono placeholder-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
              />
            </div>

            {/* New Password with Eye Toggle */}
            <PasswordInput
              id="new-password"
              label="New Password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />

            {/* Confirm Password with Eye Toggle */}
            <PasswordInput
              id="confirm-password"
              label="Confirm New Password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              error={confirmPassword && !doPasswordsMatch ? 'Passwords do not match' : undefined}
            />

            {/* Password criteria checklist */}
            <div className="rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
              <p className="font-semibold text-slate-700 dark:text-slate-300">Password requirements:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
                <div className="flex items-center gap-1.5">
                  {isPasswordLengthValid ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span className={isPasswordLengthValid ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-500'}>
                    8 to 16 characters ({newPassword.length})
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {hasUppercase ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span className={hasUppercase ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-500'}>
                    1+ Uppercase letter
                  </span>
                </div>
                <div className="flex items-center gap-1.5 sm:col-span-2">
                  {hasSpecialChar ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span className={hasSpecialChar ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-500'}>
                    1+ Special character (!@#$%^&*...)
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isPasswordValid || !doPasswordsMatch || !token}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 px-4 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 hover:bg-indigo-700 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <span>Update Password & Sign In</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
