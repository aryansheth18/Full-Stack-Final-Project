import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { User, Store, AdminDashboardData, UserRole } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { DataTable, Column } from '../../components/common/DataTable';
import { StarRating } from '../../components/common/StarRating';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { exportToCsv } from '../../utils/exportCsv';
import { AddUserModal } from './AddUserModal';
import { EditUserModal } from './EditUserModal';
import { AddStoreModal } from './AddStoreModal';
import { EditStoreModal } from './EditStoreModal';
import { UserDetailModal } from './UserDetailModal';
import {
  Users,
  Store as StoreIcon,
  Star,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  Shield,
  Layers,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'stores' | 'overview'>('overview');

  // Stats state
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userSortBy, setUserSortBy] = useState('createdAt');
  const [userSortOrder, setUserSortOrder] = useState<'asc' | 'desc'>('desc');

  // Stores state
  const [stores, setStores] = useState<Store[]>([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const [storeSearch, setStoreSearch] = useState('');
  const [storeSortBy, setStoreSortBy] = useState('createdAt');
  const [storeSortOrder, setStoreSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [selectedEditUser, setSelectedEditUser] = useState<User | null>(null);
  const [isDetailUserOpen, setIsDetailUserOpen] = useState(false);
  const [selectedDetailUserId, setSelectedDetailUserId] = useState<string | null>(null);

  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [isEditStoreOpen, setIsEditStoreOpen] = useState(false);
  const [selectedEditStore, setSelectedEditStore] = useState<Store | null>(null);

  // Deletion confirm state
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'user' | 'store'; id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load Dashboard Stats
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await api.get('/admin/dashboard');
      if (res.data.success) {
        setDashboardData(res.data.data);
      }
    } catch (e: any) {
      toast.error('Failed to load stats');
    } finally {
      setStatsLoading(false);
    }
  };

  // Load Users
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const params: any = {
        sortBy: userSortBy,
        sortOrder: userSortOrder,
      };
      if (userSearch) params.search = userSearch;
      if (userRoleFilter !== 'ALL') params.role = userRoleFilter;

      const res = await api.get('/admin/users', { params });
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (e: any) {
      toast.error('Failed to load users list');
    } finally {
      setUsersLoading(false);
    }
  };

  // Load Stores
  const fetchStores = async () => {
    setStoresLoading(true);
    try {
      const params: any = {
        sortBy: storeSortBy,
        sortOrder: storeSortOrder,
      };
      if (storeSearch) params.search = storeSearch;

      const res = await api.get('/admin/stores', { params });
      if (res.data.success) {
        setStores(res.data.stores);
      }
    } catch (e: any) {
      toast.error('Failed to load stores list');
    } finally {
      setStoresLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchStores();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [userRoleFilter, userSortBy, userSortOrder]);

  useEffect(() => {
    fetchStores();
  }, [storeSortBy, storeSortOrder]);

  const handleUserSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleStoreSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStores();
  };

  const handleUserSort = (key: string) => {
    if (userSortBy === key) {
      setUserSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setUserSortBy(key);
      setUserSortOrder('asc');
    }
  };

  const handleStoreSort = (key: string) => {
    if (storeSortBy === key) {
      setStoreSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setStoreSortBy(key);
      setStoreSortOrder('asc');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      if (deleteTarget.type === 'user') {
        const res = await api.delete(`/admin/users/${deleteTarget.id}`);
        if (res.data.success) {
          toast.success(res.data.message);
          fetchUsers();
          fetchStats();
        }
      } else {
        const res = await api.delete(`/admin/stores/${deleteTarget.id}`);
        if (res.data.success) {
          toast.success(res.data.message);
          fetchStores();
          fetchStats();
        }
      }
      setIsDeleteConfirmOpen(false);
      setDeleteTarget(null);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Delete operation failed';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportUsersCsv = () => {
    if (!users.length) return;
    const rows = users.map((u) => ({
      ID: u.id,
      Name: u.name,
      Email: u.email,
      Role: u.role,
      Address: u.address,
      StoreOwnerRating: u.storeRating !== null && u.storeRating !== undefined ? u.storeRating : 'N/A',
      CreatedAt: u.createdAt,
    }));
    exportToCsv('StoreRate_Users_Report', rows);
    toast.success('Users report exported to CSV!');
  };

  const handleExportStoresCsv = () => {
    if (!stores.length) return;
    const rows = stores.map((s) => ({
      ID: s.id,
      StoreName: s.name,
      Email: s.email,
      Address: s.address,
      OverallRating: s.rating,
      TotalReviews: s.totalRatings,
      OwnerName: s.owner?.name || 'Unassigned',
      OwnerEmail: s.owner?.email || 'N/A',
      CreatedAt: s.createdAt,
    }));
    exportToCsv('StoreRate_Stores_Report', rows);
    toast.success('Stores report exported to CSV!');
  };

  const availableOwners = users.filter((u) => u.role === 'STORE_OWNER');

  // Columns for Users Table
  const userColumns: Column<User>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (u) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{u.name}</p>
          <p className="text-xs text-slate-400 font-mono sm:hidden">{u.email}</p>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      className: 'hidden sm:table-cell',
      render: (u) => <span className="font-medium">{u.email}</span>,
    },
    {
      key: 'address',
      header: 'Address',
      sortable: true,
      className: 'hidden md:table-cell max-w-xs',
      render: (u) => <p className="truncate text-xs text-slate-500 dark:text-slate-400">{u.address}</p>,
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (u) => {
        if (u.role === 'ADMIN') {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
              Admin
            </span>
          );
        }
        if (u.role === 'STORE_OWNER') {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
              Store Owner
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300">
            User
          </span>
        );
      },
    },
    {
      key: 'storeRating',
      header: 'Owner Rating',
      sortable: false,
      render: (u) => {
        if (u.role !== 'STORE_OWNER') {
          return <span className="text-xs text-slate-400">N/A</span>;
        }
        if (u.storeRating !== null && u.storeRating !== undefined) {
          return (
            <div className="flex items-center gap-1">
              <StarRating rating={u.storeRating} size="sm" showNumber totalReviews={u.totalStoreRatings} />
            </div>
          );
        }
        return <span className="text-xs text-slate-400">No ratings</span>;
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      className: 'text-right',
      render: (u) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => {
              setSelectedDetailUserId(u.id);
              setIsDetailUserOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedEditUser(u);
              setIsEditUserOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Edit User"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setDeleteTarget({ type: 'user', id: u.id, name: u.name });
              setIsDeleteConfirmOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Delete User"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Columns for Stores Table
  const storeColumns: Column<Store>[] = [
    {
      key: 'name',
      header: 'Store Name',
      sortable: true,
      render: (s) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{s.name}</p>
          <p className="text-xs text-slate-400 sm:hidden">{s.email}</p>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      className: 'hidden sm:table-cell',
      render: (s) => <span className="font-medium">{s.email}</span>,
    },
    {
      key: 'address',
      header: 'Address',
      sortable: true,
      className: 'hidden md:table-cell max-w-xs',
      render: (s) => <p className="truncate text-xs text-slate-500 dark:text-slate-400">{s.address}</p>,
    },
    {
      key: 'rating',
      header: 'Overall Rating',
      sortable: true,
      render: (s) => (
        <div className="flex items-center gap-1">
          <StarRating rating={s.rating || 0} size="sm" showNumber totalReviews={s.totalRatings} />
        </div>
      ),
    },
    {
      key: 'owner',
      header: 'Owner',
      sortable: false,
      render: (s) =>
        s.owner ? (
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            {s.owner.name}
          </span>
        ) : (
          <span className="text-xs text-slate-400 italic">Unassigned</span>
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      className: 'text-right',
      render: (s) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => {
              setSelectedEditStore(s);
              setIsEditStoreOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Edit Store"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setDeleteTarget({ type: 'store', id: s.id, name: s.name });
              setIsDeleteConfirmOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Delete Store"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-600 text-white">
              <Shield className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              System Administration
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Control users, manage retail store entities, and monitor submitted ratings platform-wide
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsAddUserOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
          <button
            onClick={() => setIsAddStoreOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Store</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Users"
          value={dashboardData?.totalUsers ?? '...'}
          icon={<Users className="w-6 h-6" />}
          color="indigo"
          description="Admins, owners & users"
        />
        <StatCard
          title="Total Stores"
          value={dashboardData?.totalStores ?? '...'}
          icon={<StoreIcon className="w-6 h-6" />}
          color="emerald"
          description="Registered businesses"
        />
        <StatCard
          title="Submitted Ratings"
          value={dashboardData?.totalRatings ?? '...'}
          icon={<Star className="w-6 h-6" />}
          color="amber"
          description="Total customer reviews"
        />
        <StatCard
          title="Avg Store Rating"
          value={dashboardData?.avgRating ? `${dashboardData.avgRating} / 5` : '0 / 5'}
          icon={<Layers className="w-6 h-6" />}
          color="purple"
          description="Platform satisfaction score"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Analytics Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'users'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Users Management ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('stores')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'stores'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Stores Management ({stores.length})
          </button>
        </nav>
      </div>

      {/* Tab: Analytics Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Recently Registered Users
              </h3>
              <button
                onClick={() => setActiveTab('users')}
                className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
              >
                View all
              </button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
              {dashboardData?.recentUsers?.map((u) => (
                <div key={u.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{u.name}</p>
                    <p className="text-slate-400">{u.email}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Ratings */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Customer Reviews
              </h3>
              <button
                onClick={() => setActiveTab('stores')}
                className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
              >
                View stores
              </button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
              {dashboardData?.recentRatings?.map((r) => (
                <div key={r.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{r.store.name}</p>
                    <p className="text-slate-400">By {r.user.name}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <StarRating rating={r.rating} size="sm" />
                    <span className="font-bold text-slate-700 dark:text-slate-300">{r.rating}/5</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Users Management */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <form onSubmit={handleUserSearchSubmit} className="flex items-center gap-2 w-full sm:w-80">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by name, email, or address..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                Search
              </button>
            </form>

            <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
              <button
                onClick={handleExportUsersCsv}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <div className="flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="text-xs py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                >
                  <option value="ALL">All Roles</option>
                  <option value="ADMIN">Administrators</option>
                  <option value="STORE_OWNER">Store Owners</option>
                  <option value="USER">Normal Users</option>
                </select>
              </div>
            </div>
          </div>

          <DataTable
            columns={userColumns}
            data={users}
            sortBy={userSortBy}
            sortOrder={userSortOrder}
            onSort={handleUserSort}
            isLoading={usersLoading}
            emptyMessage="No users found matching current filters."
            keyExtractor={(u) => u.id}
          />
        </div>
      )}

      {/* Tab: Stores Management */}
      {activeTab === 'stores' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <form onSubmit={handleStoreSearchSubmit} className="flex items-center gap-2 w-full sm:w-80">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={storeSearch}
                  onChange={(e) => setStoreSearch(e.target.value)}
                  placeholder="Search stores by name or address..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                Search
              </button>
            </form>

            <button
              onClick={handleExportStoresCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <DataTable
            columns={storeColumns}
            data={stores}
            sortBy={storeSortBy}
            sortOrder={storeSortOrder}
            onSort={handleStoreSort}
            isLoading={storesLoading}
            emptyMessage="No stores found matching current filters."
            keyExtractor={(s) => s.id}
          />
        </div>
      )}

      {/* Modals */}
      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onSuccess={() => {
          fetchUsers();
          fetchStats();
        }}
        availableStores={stores}
      />

      <EditUserModal
        isOpen={isEditUserOpen}
        onClose={() => {
          setIsEditUserOpen(false);
          setSelectedEditUser(null);
        }}
        onSuccess={() => {
          fetchUsers();
          fetchStats();
        }}
        user={selectedEditUser}
        availableStores={stores}
      />

      <AddStoreModal
        isOpen={isAddStoreOpen}
        onClose={() => setIsAddStoreOpen(false)}
        onSuccess={() => {
          fetchStores();
          fetchStats();
        }}
        availableOwners={availableOwners}
      />

      <EditStoreModal
        isOpen={isEditStoreOpen}
        onClose={() => {
          setIsEditStoreOpen(false);
          setSelectedEditStore(null);
        }}
        onSuccess={() => {
          fetchStores();
          fetchStats();
        }}
        store={selectedEditStore}
        availableOwners={availableOwners}
      />

      <UserDetailModal
        isOpen={isDetailUserOpen}
        onClose={() => {
          setIsDetailUserOpen(false);
          setSelectedDetailUserId(null);
        }}
        userId={selectedDetailUserId}
      />

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${deleteTarget?.type === 'user' ? 'User Account' : 'Store Entity'}`}
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        isLoading={isDeleting}
      />
    </div>
  );
};
