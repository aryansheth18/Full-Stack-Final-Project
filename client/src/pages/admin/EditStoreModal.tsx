import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Store, User } from '../../types';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface EditStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  store: Store | null;
  availableOwners: User[];
}

export const EditStoreModal: React.FC<EditStoreModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  store,
  availableOwners,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (store) {
      setName(store.name || '');
      setEmail(store.email || '');
      setAddress(store.address || '');
      setOwnerId(store.owner?.id || store.ownerId || '');
      setError('');
    }
  }, [store]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;
    setError('');

    if (name.trim().length < 3 || name.trim().length > 60) {
      setError('Store name must be between 3 and 60 characters.');
      return;
    }
    if (!address.trim() || address.trim().length > 400) {
      setError('Address is required and cannot exceed 400 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = {
        name: name.trim(),
        email: email.trim(),
        address: address.trim(),
        ownerId: ownerId || null,
      };

      const response = await api.put(`/admin/stores/${store.id}`, payload);
      if (response.data.success) {
        toast.success(`Store "${name}" updated successfully!`);
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update store';
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
      title="Edit Store"
      subtitle={`Modify details for ${store?.name || 'Store'}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs rounded-lg bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-200">Store Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-200">Store Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-200">Assign Store Owner</label>
          <select
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="">-- No owner assigned --</option>
            {availableOwners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name} ({owner.email})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <label className="font-medium text-slate-700 dark:text-slate-200">Store Address</label>
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
