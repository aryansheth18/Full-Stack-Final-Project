import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Store } from '../../types';
import { StarRating } from '../../components/common/StarRating';
import { DataTable, Column } from '../../components/common/DataTable';
import { RateStoreModal } from './RateStoreModal';
import {
  Search,
  Store as StoreIcon,
  Star,
  MapPin,
  Mail,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Sparkles,
  Edit3,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const UserDashboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Rate Modal state
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const fetchStores = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        sortBy,
        sortOrder,
      };
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const response = await api.get('/stores', { params });
      if (response.data.success) {
        setStores(response.data.stores);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to retrieve stores');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStores();
  };

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const handleOpenRateModal = (store: Store) => {
    setSelectedStore(store);
    setIsRateModalOpen(true);
  };

  // Filter stores in memory by minimum overall rating if selected
  const filteredStores = stores.filter((s) => {
    if (minRatingFilter === 0) return true;
    return (s.overallRating || 0) >= minRatingFilter;
  });

  // Table columns for list view
  const columns: Column<Store>[] = [
    {
      key: 'name',
      header: 'Store Name',
      sortable: true,
      render: (s) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{s.name}</p>
          <p className="text-xs text-slate-400 font-mono sm:hidden">{s.address}</p>
        </div>
      ),
    },
    {
      key: 'address',
      header: 'Address',
      sortable: true,
      className: 'hidden sm:table-cell max-w-sm',
      render: (s) => (
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          <span className="truncate">{s.address}</span>
        </div>
      ),
    },
    {
      key: 'overallRating',
      header: 'Overall Rating',
      sortable: true,
      render: (s) => (
        <div className="flex items-center gap-1.5">
          <StarRating rating={s.overallRating || 0} size="sm" showNumber totalReviews={s.totalRatings} />
        </div>
      ),
    },
    {
      key: 'userRating',
      header: 'Your Rating',
      sortable: false,
      render: (s) =>
        s.userRating ? (
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/50">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {s.userRating} / 5
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">Not rated yet</span>
        ),
    },
    {
      key: 'action',
      header: 'Action',
      sortable: false,
      className: 'text-right',
      render: (s) => (
        <button
          onClick={() => handleOpenRateModal(s)}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            s.userRating
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs shadow-indigo-500/20'
          }`}
        >
          {s.userRating ? (
            <>
              <Edit3 className="w-3.5 h-3.5" />
              <span>Modify Rating</span>
            </>
          ) : (
            <>
              <Star className="w-3.5 h-3.5" />
              <span>Submit Rating</span>
            </>
          )}
        </button>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md text-indigo-200 border border-white/10 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Registered Retail Stores
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Discover & Rate Local Stores
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100/80 leading-relaxed pt-1">
            Search across registered retail stores by name or address, check community ratings, and submit or modify your personal reviews.
          </p>
        </div>
      </div>

      {/* Controls / Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Search Input Form */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-96">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by store name or address..."
              className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Filter and View Toggles */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3 flex-wrap">
          {/* Rating filter */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <select
              value={minRatingFilter}
              onChange={(e) => setMinRatingFilter(Number(e.target.value))}
              className="text-xs py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <option value={0}>All Ratings</option>
              <option value={4}>4.0+ Stars</option>
              <option value={3}>3.0+ Stars</option>
              <option value={2}>2.0+ Stars</option>
            </select>
          </div>

          {/* Sort select */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order as 'asc' | 'desc');
            }}
            className="text-xs py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            <option value="name-asc">Sort: Name (A-Z)</option>
            <option value="name-desc">Sort: Name (Z-A)</option>
            <option value="overallRating-desc">Sort: Rating (High to Low)</option>
            <option value="overallRating-asc">Sort: Rating (Low to High)</option>
            <option value="address-asc">Sort: Address (A-Z)</option>
          </select>

          {/* View mode toggle */}
          <div className="flex items-center p-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stores Display */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent"></div>
          <p className="text-xs text-slate-400 font-medium">Loading store listings...</p>
        </div>
      ) : filteredStores.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center">
          <StoreIcon className="w-10 h-10 mx-auto text-slate-400 mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No stores found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Try adjusting your search query or rating filter criteria.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store) => (
            <div
              key={store.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                    <StoreIcon className="h-5 w-5" />
                  </div>
                  <div className="text-right">
                    <StarRating
                      rating={store.overallRating || 0}
                      size="sm"
                      showNumber
                      totalReviews={store.totalRatings}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {store.name}
                  </h3>
                  <div className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
                      <span className="leading-relaxed">{store.address}</span>
                    </div>
                    {store.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{store.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer with User Rating & Action */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="text-xs">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Your Rating
                  </p>
                  {store.userRating ? (
                    <div className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{store.userRating} / 5</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-xs italic">Not rated</span>
                  )}
                </div>

                <button
                  onClick={() => handleOpenRateModal(store)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
                    store.userRating
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20'
                  }`}
                >
                  {store.userRating ? (
                    <>
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Modify</span>
                    </>
                  ) : (
                    <>
                      <Star className="w-3.5 h-3.5" />
                      <span>Rate Store</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredStores}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          emptyMessage="No stores found matching current filters."
          keyExtractor={(s) => s.id}
        />
      )}

      {/* Rate Store Modal */}
      <RateStoreModal
        isOpen={isRateModalOpen}
        onClose={() => {
          setIsRateModalOpen(false);
          setSelectedStore(null);
        }}
        onSuccess={fetchStores}
        store={selectedStore}
      />
    </div>
  );
};
