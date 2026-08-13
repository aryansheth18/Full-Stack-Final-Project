import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Store,
  Shield,
  User as UserIcon,
  LogOut,
  Sun,
  Moon,
  KeyRound,
  ChevronDown,
  Sparkles,
  Layers,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, isAdmin, isStoreOwner, isNormalUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = () => {
    if (!user) return null;
    switch (user.role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Shield className="w-3 h-3" />
            System Admin
          </span>
        );
      case 'STORE_OWNER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Store className="w-3 h-3" />
            Store Owner
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            <UserIcon className="w-3 h-3" />
            Verified User
          </span>
        );
    }
  };

  const getDashboardLink = () => {
    if (isAdmin) return '/admin';
    if (isStoreOwner) return '/owner';
    return '/stores';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to={isAuthenticated ? getDashboardLink() : '/'} className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-lg tracking-tight text-slate-900 dark:text-white">
              <span>StoreRate</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">Pro</span>
            </div>
            <p className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 dark:text-slate-500">
              Verified Ratings
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1 mr-2">
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === '/admin'
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                  }`}
                >
                  Admin Console
                </Link>
              )}
              {isStoreOwner && (
                <Link
                  to="/owner"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === '/owner'
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                  }`}
                >
                  Store Dashboard
                </Link>
              )}
              {(isNormalUser || isAdmin) && (
                <Link
                  to="/stores"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === '/stores'
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                  }`}
                >
                  Browse Stores
                </Link>
              )}
            </nav>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-indigo-600" />}
          </button>

          {/* Auth Controls */}
          {isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-2.5 pr-3 rounded-full border border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800/80 transition-all cursor-pointer"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block max-w-[140px]">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {user.email}
                  </p>
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-slate-900 p-2 shadow-xl ring-1 ring-black/5 dark:ring-white/10 border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">
                      Account
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate mt-0.5">
                      {user.name}
                    </p>
                    <div className="mt-1.5">{getRoleBadge()}</div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <KeyRound className="h-4 w-4 text-slate-400" />
                      Change Password
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors font-medium cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-lg shadow-sm shadow-indigo-500/30 transition-all"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
