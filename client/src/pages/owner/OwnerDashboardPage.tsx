import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { OwnerDashboardData, StoreReview } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { StarRating } from '../../components/common/StarRating';
import { DataTable, Column } from '../../components/common/DataTable';
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
} from 'lucide-react';
import toast from 'react-hot-toast';

export const OwnerDashboardPage: React.FC = () => {
  const [data, setData] = useState<OwnerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchReviewer, setSearchReviewer] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

  // Filter & Sort reviews in memory
  let reviews = data?.ratings || [];

  if (searchReviewer.trim()) {
    const q = searchReviewer.toLowerCase();
    reviews = reviews.filter(
      (r) =>
        r.user.name.toLowerCase().includes(q) ||
        r.user.email.toLowerCase().includes(q) ||
        r.user.address.toLowerCase().includes(q)
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
      header: 'Customer Name',
      sortable: true,
      render: (r) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{r.user.name}</p>
          <p className="text-xs text-slate-400 sm:hidden">{r.user.email}</p>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      className: 'hidden sm:table-cell',
      render: (r) => <span className="font-medium text-xs text-slate-600 dark:text-slate-300">{r.user.email}</span>,
    },
    {
      key: 'address',
      header: 'Address',
      sortable: false,
      className: 'hidden md:table-cell max-w-xs',
      render: (r) => <p className="truncate text-xs text-slate-500 dark:text-slate-400">{r.user.address}</p>,
    },
    {
      key: 'rating',
      header: 'Rating Submitted',
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
      header: 'Date Submitted',
      sortable: true,
      className: 'text-right',
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
  const total = stats.totalRatings || 1;

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
        {/* KPI Stats */}
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
    </div>
  );
};
