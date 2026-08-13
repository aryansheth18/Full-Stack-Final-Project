import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { StarRating } from '../../components/common/StarRating';
import { Store } from '../../types';
import api from '../../services/api';
import { Store as StoreIcon, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

interface RateStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  store: Store | null;
}

export const RateStoreModal: React.FC<RateStoreModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  store,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (store && store.userRating) {
      setRating(store.userRating);
      setComment(store.userComment || '');
    } else {
      setRating(5);
      setComment('');
    }
  }, [store]);

  const ratingDescriptions: Record<number, string> = {
    1: '1 Star - Poor Experience',
    2: '2 Stars - Fair / Needs Improvement',
    3: '3 Stars - Good / Average',
    4: '4 Stars - Very Good Experience',
    5: '5 Stars - Outstanding & Recommended',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;

    if (rating < 1 || rating > 5) {
      toast.error('Rating must be between 1 and 5 stars');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/ratings', {
        storeId: store.id,
        rating: Number(rating),
        comment: comment.trim() || undefined,
      });

      if (response.data.success) {
        toast.success(
          store.userRating
            ? `Your rating for "${store.name}" was modified to ${rating} stars!`
            : `Thank you! Your ${rating}-star rating was submitted.`
        );
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit rating';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={store?.userRating ? 'Modify Your Store Rating' : 'Submit Store Rating'}
      subtitle={store ? `Share your customer experience for ${store.name}` : ''}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <StoreIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{store?.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{store?.address}</p>
          </div>
        </div>

        {/* Interactive Star Picker */}
        <div className="text-center py-4 space-y-2 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Select Rating (1 to 5 Stars)
          </p>
          <div className="flex justify-center">
            <StarRating
              rating={rating}
              size="xl"
              interactive
              onRate={(val) => setRating(val)}
            />
          </div>
          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            {ratingDescriptions[rating] || `${rating} Stars`}
          </p>
        </div>

        {/* Optional Review Comment */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="review-comment" className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>Review Feedback / Comment (Optional)</span>
            </label>
            <span className="text-slate-400">{comment.length}/500</span>
          </div>
          <textarea
            id="review-comment"
            rows={3}
            maxLength={500}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share details of your experience, staff service, product quality, or recommendations..."
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 px-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-lg shadow-sm shadow-indigo-500/20 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Saving...' : store?.userRating ? 'Update Rating' : 'Submit Rating'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
