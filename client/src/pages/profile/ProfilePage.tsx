import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { PasswordInput } from '../../components/common/PasswordInput';
import { User as UserIcon, Mail, MapPin, KeyRound, Shield, CheckCircle2, XCircle, AlertCircle, Store } from 'lucide-react';
import toast from 'react-hot-toast';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Password validation checks
  const isPasswordLengthValid = newPassword.length >= 8 && newPassword.length <= 16;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
  const isPasswordValid = isPasswordLengthValid && hasUppercase && hasSpecialChar;
  const doPasswordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!oldPassword) {
      setErrorMessage('Please enter your current password');
      return;
    }
    if (!isPasswordValid) {
      setErrorMessage('New password must be 8-16 characters and contain at least 1 uppercase letter and 1 special character.');
      return;
    }
    if (!doPasswordsMatch) {
      setErrorMessage('New password and confirmation password do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.put('/auth/change-password', {
        oldPassword,
        newPassword,
      });

      if (response.data.success) {
        toast.success('Password updated successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update password';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-3xl">
          Account Profile & Security
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your personal details and update your login credentials
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Details Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-extrabold text-2xl shadow-lg shadow-indigo-500/20">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
                {user.name}
              </h2>
              <span className="mt-1 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
                <Shield className="w-3 h-3" />
                {user.role}
              </span>
            </div>

            <div className="mt-6 space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-500 dark:text-slate-400">Email</p>
                  <p className="text-slate-800 dark:text-slate-200 mt-0.5 break-all">{user.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-500 dark:text-slate-400">Address</p>
                  <p className="text-slate-800 dark:text-slate-200 mt-0.5 leading-relaxed">{user.address}</p>
                </div>
              </div>

              {user.stores && user.stores.length > 0 && (
                <div className="flex items-start gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Store className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-500 dark:text-slate-400">Managed Store</p>
                    <p className="text-slate-800 dark:text-slate-200 mt-0.5 font-medium">{user.stores[0].name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <KeyRound className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Update Account Password
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ensure your account is using a strong password conforming to security guidelines
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
              {errorMessage && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Current Password */}
              <PasswordInput
                id="old-password"
                label="Current Password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
              />

              {/* New Password */}
              <PasswordInput
                id="new-password"
                label="New Password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new strong password"
              />

              {/* Confirm New Password */}
              <PasswordInput
                id="confirm-new-password"
                label="Confirm New Password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                error={confirmPassword && !doPasswordsMatch ? 'Passwords do not match' : undefined}
              />

              {/* Requirements checklist */}
              <div className="rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                <p className="font-semibold text-slate-700 dark:text-slate-300">New Password Requirements:</p>
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

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || !isPasswordValid || !doPasswordsMatch || !oldPassword}
                  className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 px-6 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 hover:bg-indigo-700 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? 'Updating Password...' : 'Save New Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
