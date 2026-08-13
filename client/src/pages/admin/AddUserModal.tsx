import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { PasswordInput } from '../../components/common/PasswordInput';
import { Store, UserRole } from '../../types';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  availableStores: Store[];
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  availableStores,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState<UserRole>('USER');
  const [storeId, setStoreId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Validations
  const isNameValid = name.trim().length >= 20 && name.trim().length <= 60;
  const isAddressValid = address.trim().length > 0 && address.trim().length <= 400;
  const isPasswordValid =
    password.length >= 8 &&
    password.length <= 16 &&
    /[A-Z]/.test(password) &&
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isNameValid) {
      setError('Name must be between 20 and 60 characters long.');
      return;
    }
    if (!isAddressValid) {
      setError('Address is required and cannot exceed 400 characters.');
      return;
    }
    if (!isPasswordValid) {
      setError('Password must be 8-16 characters and contain 1 uppercase letter and 1 special symbol.');
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = {
        name: name.trim(),
        email: email.trim(),
        password,
        address: address.trim(),
        role,
      };

      if (role === 'STORE_OWNER' && storeId) {
        payload.storeId = storeId;
      }

      const response = await api.post('/admin/users', payload);
      if (response.data.success) {
        toast.success(`User ${name} created successfully!`);
        // Reset form
        setName('');
        setEmail('');
        setPassword('');
        setAddress('');
        setRole('USER');
        setStoreId('');
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to create user';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New User"
      subtitle="Create a new administrator, normal user, or store owner"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs rounded-lg bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900/50">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1 sm:col-span-2">
            <div className="flex justify-between text-xs">
              <label className="font-medium text-slate-700 dark:text-slate-200">Full Name</label>
              <span className={name.length < 20 || name.length > 60 ? 'text-amber-600' : 'text-emerald-600 font-semibold'}>
                {name.length}/60 (20-60 chars)
              </span>
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jonathan Edward Henderson Jr."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200">Assigned Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="USER">Normal User</option>
              <option value="STORE_OWNER">Store Owner</option>
              <option value="ADMIN">System Administrator</option>
            </select>
          </div>
        </div>

        {role === 'STORE_OWNER' && availableStores.length > 0 && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200">
              Assign Store (Optional)
            </label>
            <select
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="">-- No store currently assigned --</option>
              {availableStores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name} ({store.address})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <label className="font-medium text-slate-700 dark:text-slate-200">Residential Address</label>
            <span className="text-slate-400">{address.length}/400</span>
          </div>
          <textarea
            required
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main Street, Suite 200, City, State, ZIP"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white resize-none"
          />
        </div>

        <PasswordInput
          id="admin-user-password"
          label="Account Password (8-16 chars, 1 uppercase, 1 special char)"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="e.g. User@2026!"
        />

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !isNameValid || !isAddressValid || !isPasswordValid}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
