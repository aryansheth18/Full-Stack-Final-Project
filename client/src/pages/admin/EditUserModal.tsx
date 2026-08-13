import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { PasswordInput } from '../../components/common/PasswordInput';
import { User, UserRole, Store } from '../../types';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User | null;
  availableStores: Store[];
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  user,
  availableStores,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState<UserRole>('USER');
  const [newPassword, setNewPassword] = useState('');
  const [storeId, setStoreId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setAddress(user.address || '');
      setRole(user.role || 'USER');
      setNewPassword('');
      setStoreId(user.storeDetails?.id || (user.stores && user.stores[0]?.id) || '');
      setError('');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');

    if (name.trim().length < 20 || name.trim().length > 60) {
      setError('Name must be between 20 and 60 characters.');
      return;
    }
    if (address.trim().length > 400) {
      setError('Address cannot exceed 400 characters.');
      return;
    }
    if (newPassword) {
      const isValidPass =
        newPassword.length >= 8 &&
        newPassword.length <= 16 &&
        /[A-Z]/.test(newPassword) &&
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
      if (!isValidPass) {
        setError('New password must be 8-16 chars with at least 1 uppercase and 1 special symbol.');
        return;
      }
    }

    setIsLoading(true);
    try {
      const payload: any = {
        name: name.trim(),
        email: email.trim(),
        address: address.trim(),
        role,
      };
      if (newPassword) {
        payload.password = newPassword;
      }
      if (role === 'STORE_OWNER') {
        payload.storeId = storeId || null;
      }

      const response = await api.put(`/admin/users/${user.id}`, payload);
      if (response.data.success) {
        toast.success('User updated successfully!');
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update user';
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
      title="Edit User"
      subtitle={`Modify details and permissions for ${user?.name || 'User'}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs rounded-lg bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1 sm:col-span-2">
            <div className="flex justify-between text-xs">
              <label className="font-medium text-slate-700 dark:text-slate-200">Full Name</label>
              <span className={name.length < 20 || name.length > 60 ? 'text-amber-600' : 'text-emerald-600'}>
                {name.length}/60 (20-60 chars)
              </span>
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-200">Role</label>
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
              Assigned Store
            </label>
            <select
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="">-- No store assigned --</option>
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
            <label className="font-medium text-slate-700 dark:text-slate-200">Address</label>
            <span className="text-slate-400">{address.length}/400</span>
          </div>
          <textarea
            required
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white resize-none"
          />
        </div>

        <PasswordInput
          id="admin-edit-password"
          label="Reset Password (leave empty to keep unchanged)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New password (optional)"
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
            disabled={isLoading}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm cursor-pointer"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
