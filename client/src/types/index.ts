export type UserRole = 'ADMIN' | 'USER' | 'STORE_OWNER';

export interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  role: UserRole;
  storeRating?: number | null;
  totalStoreRatings?: number;
  stores?: Store[];
  storeDetails?: {
    id: string;
    name: string;
    email: string;
    address: string;
  } | null;
  createdAt: string;
}

export interface Store {
  id: string;
  name: string;
  email: string;
  address: string;
  ownerId?: string | null;
  owner?: {
    id: string;
    name: string;
    email: string;
  } | null;
  rating?: number;
  overallRating?: number;
  totalRatings?: number;
  userRating?: number | null;
  userRatingId?: string | null;
  userComment?: string | null;
  ratings?: StoreReview[];
  createdAt: string;
}

export interface StoreReview {
  id: string;
  rating: number;
  comment?: string | null;
  ownerReply?: string | null;
  ownerRepliedAt?: string | null;
  userName?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    address: string;
  };
}

export interface AdminDashboardData {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
  avgRating: number;
  roleBreakdown: {
    ADMIN?: number;
    USER?: number;
    STORE_OWNER?: number;
  };
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: UserRole;
    createdAt: string;
  }>;
  recentRatings: Array<{
    id: string;
    rating: number;
    comment?: string | null;
    createdAt: string;
    user: { id: string; name: string; email: string };
    store: { id: string; name: string };
  }>;
}

export interface OwnerDashboardData {
  hasStore: boolean;
  message?: string;
  store: {
    id: string;
    name: string;
    email: string;
    address: string;
    createdAt: string;
  } | null;
  stats: {
    averageRating: number;
    totalRatings: number;
    distribution: Record<number, number>;
  };
  ratings: Array<{
    id: string;
    rating: number;
    comment?: string | null;
    ownerReply?: string | null;
    ownerRepliedAt?: string | null;
    createdAt: string;
    updatedAt: string;
    user: {
      id: string;
      name: string;
      email: string;
      address: string;
    };
  }>;
}
