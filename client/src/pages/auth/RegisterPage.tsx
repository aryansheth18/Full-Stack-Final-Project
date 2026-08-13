import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { PasswordInput } from '../../components/common/PasswordInput';
import { User, Mail, MapPin, UserPlus, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  // Validation rules checks
  const isNameLengthValid = name.trim().length >= 20 && name.trim().length <= 60;
  const isAddressValid = address.trim().length > 0 && address.trim().length <= 400;
  const isPasswordLengthValid = password.length >= 8 && password.length <= 16;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const isPasswordValid = isPasswordLengthValid && hasUppercase && hasSpecialChar;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const isFormValid = isNameLengthValid && isAddressValid && isPasswordValid && isEmailValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isNameLengthValid) {
      setErrorMessage('Name must be between 20 and 60 characters.');
      return;
    }
    if (!isEmailValid) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!isAddressValid) {
      setErrorMessage('Address is required and cannot exceed 400 characters.');
      return;
    }
    if (!isPasswordValid) {
      setErrorMessage('Password must be 8-16 characters and contain at least 1 uppercase letter and 1 special character.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim(),
        address: address.trim(),
        password,
      });

      if (response.data.success) {
        login(response.data.token, response.data.user);
        toast.success('Registration successful! Welcome to StoreRate Pro.');
        navigate('/stores');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
            <UserPlus className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Create your account
          </h2>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            Sign up to rate stores, submit reviews, and share your experience
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

            {/* Name Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Full Name
                </label>
                <span className={`text-[11px] ${name.length < 20 || name.length > 60 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {name.length}/60 (Min 20 chars)
                </span>
              </div>
              <div className="relative rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jonathan Edward Henderson Jr."
                  className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9.5 pr-3 text-sm placeholder-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Rule: Must be between 20 and 60 characters in length.
              </p>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Email Address
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9.5 pr-3 text-sm placeholder-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
                />
              </div>
            </div>

            {/* Address Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="address" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Residential Address
                </label>
                <span className={`text-[11px] ${address.length > 400 ? 'text-red-500' : 'text-slate-400'}`}>
                  {address.length}/400 chars
                </span>
              </div>
              <div className="relative rounded-lg shadow-sm">
                <div className="pointer-events-none absolute top-3 left-3 text-slate-400">
                  <MapPin className="h-4 w-4" />
                </div>
                <textarea
                  id="address"
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Market Street, Suite 400, City, State, ZIP"
                  className="block w-full rounded-lg border border-slate-300 bg-white py-2 pl-9.5 pr-3 text-sm placeholder-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 resize-none"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Rule: Maximum 400 characters allowed.
              </p>
            </div>

            {/* Password Field with Eye Toggle */}
            <div className="space-y-2">
              <PasswordInput
                id="password"
                label="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a strong password"
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
                      8 to 16 characters ({password.length})
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
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 px-4 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 hover:bg-indigo-700 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Already registered?{' '}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 hover:underline"
            >
              Sign in to your account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
