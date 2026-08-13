import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { User } from '../../types';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface AddStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  availableOwners: User[];
}

export const AddStoreModal: React.FC<AddStoreModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  availableOwners,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      };
      if (ownerId) {
        payload.ownerId = ownerId;
      }

      const response = await api.post('/admin/stores', payload);
      if (response.data.success) {
        toast.success(`Store "${name}" created successfully!`);
        setName('');
        setEmail('');
        setAddress('');
        setOwnerId('');
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to create store';
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
      title="Add New Store"
      subtitle="Register a new retail store or business location"
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
            placeholder="e.g. Apex Fitness Gear & Performance Apparel"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-200">Store Contact Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contact@storename.com"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-200">Assign Store Owner (Optional)</label>
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
            <label className="font-medium text-slate-700 dark:text-slate-200">Store Physical Address</label>
            <span className="text-slate-400">{address.length}/400</span>
          </div>
          <textarea
            required
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="77 Athletic Way, Olympic Village, Denver, CO 80202"
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
            {isLoading ? 'Creating...' : 'Create Store'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
