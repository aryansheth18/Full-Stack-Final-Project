import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { OwnerDashboardData, StoreReview } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { StarRating } from '../../components/common/StarRating';
import { DataTable, Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { exportToCsv } from '../../utils/exportCsv';
import {
  Store as StoreIcon,
  Star,
  Users,
  Award,
  Search,
  Calendar,
  MapPin,
  Mail,
  AlertCircle,
  Download,
  MessageSquare,
  Reply,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const OwnerDashboardPage: React.FC = () => {
  const [data, setData] = useState<OwnerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchReviewer, setSearchReviewer] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Reply Modal State
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/owner/dashboard');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (e: any) {
      toast.error('Failed to load store owner dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
  };

  const handleOpenReplyModal = (review: any) => {
    setSelectedReview(review);
    setReplyText(review.ownerReply || '');
    setReplyModalOpen(true);
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReview || !replyText.trim()) return;

    setIsSubmittingReply(true);
    try {
      const res = await api.post(`/owner/ratings/${selectedReview.id}/reply`, {
        reply: replyText.trim(),
      });
      if (res.data.success) {
        toast.success('Reply submitted to customer review!');
        setReplyModalOpen(false);
        fetchDashboardData();
      }
    } catch (e: any) {
      const msg = e.response?.data?.message || 'Failed to submit reply';
      toast.error(msg);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleExportCsv = () => {
    if (!data?.ratings || !data.ratings.length) {
      toast.error('No customer review records to export');
      return;
    }
    const rows = data.ratings.map((r) => ({
      CustomerName: r.user.name,
      CustomerEmail: r.user.email,
      Rating: r.rating,
      FeedbackComment: r.comment || 'N/A',
      StoreOwnerReply: r.ownerReply || 'N/A',
      SubmittedDate: new Date(r.createdAt).toISOString(),
    }));
    exportToCsv(`${data.store?.name.replace(/\s+/g, '_')}_Reviews_Report`, rows);
    toast.success('Customer reviews report exported to CSV!');
  };

  // Filter & Sort reviews in memory
  let reviews = data?.ratings || [];

  if (searchReviewer.trim()) {
    const q = searchReviewer.toLowerCase();
    reviews = reviews.filter(
      (r) =>
        r.user.name.toLowerCase().includes(q) ||
        r.user.email.toLowerCase().includes(q) ||
        r.user.address.toLowerCase().includes(q) ||
        (r.comment && r.comment.toLowerCase().includes(q))
    );
  }

  if (ratingFilter !== 'ALL') {
    reviews = reviews.filter((r) => r.rating === Number(ratingFilter));
  }

  // Sorting
  reviews.sort((a, b) => {
    const order = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'rating') {
      return (a.rating - b.rating) * order;
    }
    if (sortBy === 'name') {
      return a.user.name.localeCompare(b.user.name) * order;
    }
    if (sortBy === 'email') {
      return a.user.email.localeCompare(b.user.email) * order;
    }
    return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * order;
  });

  const columns: Column<any>[] = [
    {
      key: 'name',
      header: 'Customer Reviewer',
      sortable: true,
      render: (r) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{r.user.name}</p>
          <p className="text-xs text-slate-400">{r.user.email}</p>
          {r.comment && (
            <div className="mt-1 p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 italic border border-slate-100 dark:border-slate-800">
              "{r.comment}"
            </div>
          )}
          {r.ownerReply && (
            <div className="mt-1 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-xs text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/50">
              <span className="font-bold">Your Reply:</span> "{r.ownerReply}"
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <StarRating rating={r.rating} size="sm" />
          <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{r.rating} / 5</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      sortable: true,
      className: 'hidden sm:table-cell',
      render: (r) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {new Date(r.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      sortable: false,
      className: 'text-right',
      render: (r) => (
        <button
          onClick={() => handleOpenReplyModal(r)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 dark:bg-slate-800 dark:hover:bg-emerald-950/50 dark:text-slate-200 dark:hover:text-emerald-300 transition-colors cursor-pointer"
        >
          <Reply className="w-3.5 h-3.5" />
          <span>{r.ownerReply ? 'Edit Reply' : 'Reply'}</span>
        </button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-emerald-600 border-t-transparent"></div>
        <p className="text-xs text-slate-400 font-medium">Loading store dashboard...</p>
      </div>
    );
  }

  if (!data?.hasStore || !data.store) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center space-y-4">
        <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          No Store Assigned Yet
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Your account is registered as a Store Owner, but no retail store is currently linked to your profile. Please reach out to your platform administrator to connect your store.
        </p>
      </div>
    );
  }

  const { store, stats } = data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Store Header Hero */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
            <StoreIcon className="w-3.5 h-3.5" />
            Store Management Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {store.name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-100/80 pt-1">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{store.address}</span>
            </div>
            {store.email && (
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>{store.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Overall Score Badge */}
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10 shrink-0">
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              Average Rating
            </p>
            <p className="text-3xl sm:text-4xl font-extrabold mt-0.5 text-white">
              {stats.averageRating.toFixed(1)}
            </p>
            <div className="mt-1">
              <StarRating rating={stats.averageRating} size="sm" />
            </div>
            <p className="text-[10px] text-emerald-200/70 mt-1 font-medium">
              Based on {stats.totalRatings} {stats.totalRatings === 1 ? 'review' : 'reviews'}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards & Rating Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-5">
          <StatCard
            title="Average Score"
            value={`${stats.averageRating} / 5.0`}
            icon={<Award className="w-6 h-6" />}
            color="emerald"
            description="Cumulative score from verified users"
          />
          <StatCard
            title="Total Reviews Submitted"
            value={stats.totalRatings}
            icon={<Users className="w-6 h-6" />}
            color="indigo"
            description="Individual customers who rated your store"
          />
        </div>

        {/* Rating Breakdown Bars */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Customer Ratings Distribution
          </h3>
          <div className="space-y-2.5 pt-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = stats.distribution[stars] || 0;
              const percentage = stats.totalRatings > 0 ? Math.round((count / stats.totalRatings) * 100) : 0;

              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 w-16 shrink-0 font-semibold text-slate-700 dark:text-slate-300">
                    <span>{stars}</span>
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="flex-1 h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-16 text-right font-medium text-slate-500 dark:text-slate-400 shrink-0">
                    <span>{count} ({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Customer Reviews Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Customer Ratings & Reviews
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              List of all users who submitted ratings for your store
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchReviewer}
                onChange={(e) => setSearchReviewer(e.target.value)}
                placeholder="Search reviewer name or email..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="text-xs py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
            >
              <option value="ALL">All Stars</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={reviews}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          emptyMessage="No customer ratings submitted yet."
          keyExtractor={(r) => r.id}
        />
      </div>

      {/* Owner Reply Modal */}
      <Modal
        isOpen={replyModalOpen}
        onClose={() => setReplyModalOpen(false)}
        title="Reply to Customer Review"
        subtitle={`Response for ${selectedReview?.user?.name || 'Customer'}`}
        maxWidth="md"
      >
        <form onSubmit={handleReplySubmit} className="space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-2">
              <StarRating rating={selectedReview?.rating || 5} size="sm" />
              <span className="font-bold text-slate-900 dark:text-white">
                {selectedReview?.user?.name}
              </span>
            </div>
            {selectedReview?.comment && (
              <p className="text-slate-600 dark:text-slate-300 italic pt-1">
                "{selectedReview.comment}"
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Your Public Store Owner Reply
            </label>
            <textarea
              required
              rows={3}
              maxLength={500}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Thank you for visiting our store! We appreciate your feedback and hope to see you again soon..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 px-3 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
            />
            <div className="flex justify-end text-[11px] text-slate-400">
              {replyText.length}/500 chars
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setReplyModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingReply || !replyText.trim()}
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isSubmittingReply ? 'Posting...' : 'Post Reply'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
