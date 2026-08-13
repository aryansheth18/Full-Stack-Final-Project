import React, { useEffect, useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { StarRating } from '../../components/common/StarRating';
import { User, Store } from '../../types';
import api from '../../services/api';
import { User as UserIcon, Mail, MapPin, Shield, Store as StoreIcon, Calendar, Star } from 'lucide-react';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  isOpen,
  onClose,
  userId,
}) => {
  const [userDetails, setUserDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      const fetchDetails = async () => {
        setIsLoading(true);
        try {
          const res = await api.get(`/admin/users/${userId}`);
          if (res.data.success) {
            setUserDetails(res.data.user);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetails();
    } else {
      setUserDetails(null);
    }
  }, [isOpen, userId]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Information & Profile"
      subtitle="Complete system record and associated store/rating statistics"
      maxWidth="lg"
    >
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
          <p className="text-xs text-slate-400">Loading user profile...</p>
        </div>
      ) : userDetails ? (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-extrabold text-xl shadow-md">
              {userDetails.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {userDetails.name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{userDetails.email}</p>
              <span className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                <Shield className="w-3 h-3" />
                {userDetails.role}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-500 dark:text-slate-400">
                <MapPin className="w-3.5 h-3.5" />
                <span>Registered Address</span>
              </div>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                {userDetails.address}
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-500 dark:text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>Joined On</span>
              </div>
              <p className="text-slate-800 dark:text-slate-200 font-medium">
                {new Date(userDetails.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Store Owner Special Section: Displays Rating */}
          {userDetails.role === 'STORE_OWNER' && (
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:border-emerald-950/60 dark:bg-emerald-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StoreIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h5 className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
                    Store Owner Rating Summary
                  </h5>
                </div>
                {userDetails.storeRating !== null ? (
                  <div className="flex items-center gap-2">
                    <StarRating rating={userDetails.storeRating} size="sm" showNumber totalReviews={userDetails.totalStoreRatings} />
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">No ratings yet</span>
                )}
              </div>

              {userDetails.stores && userDetails.stores.length > 0 ? (
                <div className="space-y-2 text-xs">
                  {userDetails.stores.map((s: any) => (
                    <div key={s.id} className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                      <p className="font-bold text-slate-900 dark:text-white">{s.name}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">{s.address}</p>
                      <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] mt-1">
                        Total Reviews Received: {s.ratings?.length || 0}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No stores linked to this owner account.</p>
              )}
            </div>
          )}

          {/* Submitted Ratings History */}
          {userDetails.submittedRatings && userDetails.submittedRatings.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Submitted Reviews History ({userDetails.submittedRatings.length})
              </h5>
              <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl">
                {userDetails.submittedRatings.map((r: any) => (
                  <div key={r.id} className="p-3 flex items-center justify-between text-xs bg-white dark:bg-slate-900">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{r.store?.name}</p>
                      <p className="text-slate-400 text-[11px]">{r.store?.address}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <StarRating rating={r.rating} size="sm" />
                      <span className="font-bold text-slate-700 dark:text-slate-300">{r.rating}/5</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};
