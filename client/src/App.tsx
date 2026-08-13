import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';

import { Navbar } from './components/common/Navbar';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { UserDashboardPage } from './pages/user/UserDashboardPage';
import { OwnerDashboardPage } from './pages/owner/OwnerDashboardPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

// Protected Route Component for Authenticated Users
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: ('ADMIN' | 'USER' | 'STORE_OWNER')[];
}> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'STORE_OWNER') return <Navigate to="/owner" replace />;
    return <Navigate to="/stores" replace />;
  }

  return <>{children}</>;
};

// Root index redirector
const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/stores" replace />;
  }

  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user.role === 'STORE_OWNER') return <Navigate to="/owner" replace />;
  return <Navigate to="/stores" replace />;
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-150">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Root Redirection */}
                  <Route path="/" element={<RootRedirect />} />

                  {/* Public & Auth Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />

                  {/* Stores Discovery (Public or Logged in User) */}
                  <Route path="/stores" element={<UserDashboardPage />} />

                  {/* System Admin Dashboard */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AdminDashboardPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Store Owner Dashboard */}
                  <Route
                    path="/owner"
                    element={
                      <ProtectedRoute allowedRoles={['STORE_OWNER', 'ADMIN']}>
                        <OwnerDashboardPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* User Profile & Password Change */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 Fallback */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>

              {/* Platform Footer */}
              <footer className="border-t border-slate-200/80 bg-white/50 dark:border-slate-800 dark:bg-slate-900/50 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                  <p>© {new Date().getFullYear()} StoreRate Pro. All rights reserved.</p>
                  <p className="font-medium text-slate-400">
                    Built with Express.js, PostgreSQL (Prisma), React & Tailwind CSS
                  </p>
                </div>
              </footer>

              {/* Notification Toaster */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#1e293b',
                    color: '#f8fafc',
                    fontSize: '13px',
                    borderRadius: '12px',
                    padding: '12px 16px',
                  },
                  success: {
                    iconTheme: {
                      primary: '#22c55e',
                      secondary: '#ffffff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#ffffff',
                    },
                  },
                }}
              />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
