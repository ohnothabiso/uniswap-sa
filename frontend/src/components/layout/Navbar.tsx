import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { getUserAvatar } from '@/utils/avatar';
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '@/services/notificationService';
import { messagingService } from '@/services/messagingService';
import {
  ShieldCheck,
  PlusCircle,
  MessageSquare,
  Bookmark,
  Bell,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  BadgeAlert,
  Shield,
  Menu,
  X,
  Compass,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Real backend query for unread notifications count
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.getNotifications,
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const unreadNotifications = notifications.filter((n) => !n.is_read).length;

  // Real backend query for unread messages count
  const { data: threads = [] } = useQuery({
    queryKey: ['message-threads'],
    queryFn: messagingService.getThreads,
    enabled: isAuthenticated,
    refetchInterval: 15000,
  });

  const unreadMessages = threads.filter((m) => !m.is_read && m.receiver === user?.user_id).length;

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
      {/* SPU Safe Meetup Zone Security Bar */}
      <div className="bg-campus-primary text-white text-[11px] font-medium py-1.5 px-4 flex items-center justify-between overflow-hidden">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">
              <strong>SPU Safe Exchange Guarantee:</strong> Trade in monitored zones (Central Library, Luka Jantjie, Moroka Res).
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <span className="flex items-center gap-1.5 text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Security Active
            </span>
            <Link to="/campus-safety" className="text-slate-200 hover:text-white underline ml-2">
              Safety Protocol
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <img
            src="/assets/logo.png"
            alt="UniSwap SA Logo"
            className="w-8 h-8 rounded-lg object-contain transition-transform group-hover:scale-105"
            onError={(e) => {
              // Fallback if local image not found
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-lg tracking-tight text-campus-primary dark:text-white">
                UniSwap<span className="text-campus-secondary">SA</span>
              </span>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-campus-primary dark:bg-blue-900/60 dark:text-blue-300">
                SPU
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          <Link
            to="/explore"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isActive('/explore')
                ? 'bg-blue-50 text-campus-secondary dark:bg-blue-950/60 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            Explore
          </Link>

          {isAuthenticated && (
            <>
              <Link
                to="/my-listings"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive('/my-listings')
                    ? 'bg-blue-50 text-campus-secondary dark:bg-blue-950/60 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                My Wardrobe
              </Link>

              <Link
                to="/favourites"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isActive('/favourites')
                    ? 'bg-emerald-50 text-campus-accent dark:bg-emerald-950/60 dark:text-emerald-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Bookmark className="w-4 h-4 text-campus-accent" />
                Wishlist
              </Link>

              <Link
                to="/messages"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 relative transition-colors ${
                  isActive('/messages')
                    ? 'bg-blue-50 text-campus-secondary dark:bg-blue-950/60 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Messages
                {unreadMessages > 0 && (
                  <span className="bg-campus-secondary text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {unreadMessages}
                  </span>
                )}
              </Link>

              <Link
                to="/notifications"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 relative transition-colors ${
                  isActive('/notifications')
                    ? 'bg-blue-50 text-campus-secondary dark:bg-blue-950/60 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Bell className="w-4 h-4" />
                Alerts
                {unreadNotifications > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {unreadNotifications}
                  </span>
                )}
              </Link>
            </>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-purple-700 dark:text-purple-300 transition-colors ${
                location.pathname.startsWith('/admin')
                  ? 'bg-purple-100 dark:bg-purple-950/60'
                  : 'hover:bg-purple-50 dark:hover:bg-purple-950/30'
              }`}
            >
              <Shield className="w-4 h-4" />
              Staff Moderation
            </Link>
          )}
        </nav>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center gap-2.5">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* List an Item Action Button */}
          <Link
            to={isAuthenticated ? "/listings/create" : "/login"}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs bg-campus-primary hover:bg-campus-primaryDark text-white shadow-sm hover:shadow transition-all"
          >
            <PlusCircle className="w-4 h-4 text-emerald-300" />
            <span className="hidden sm:inline">List an Item</span>
          </Link>

          {/* Authentication State */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-full border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-campus-secondary transition-all"
                aria-expanded={isUserMenuOpen}
                aria-label="User menu"
              >
                <img
                  src={getUserAvatar(user)}
                  alt={user.full_name || 'Student avatar'}
                  className="w-7 h-7 rounded-full object-cover"
                />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {user.full_name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          Trust Score: {user.trust_score}%
                        </span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          {user.items_diverted} Diverted
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate('/profile');
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5"
                      >
                        <UserIcon className="w-4 h-4 text-campus-secondary" />
                        My SPU Profile
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate('/my-listings');
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5"
                      >
                        <BadgeAlert className="w-4 h-4 text-amber-500" />
                        Active Listings ({user.role})
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            navigate('/admin');
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 flex items-center gap-2.5"
                        >
                          <Shield className="w-4 h-4" />
                          Staff Administration
                        </button>
                      )}
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2.5"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-campus-primary transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-campus-secondary hover:bg-sky-600 text-white shadow-sm transition-all"
              >
                Join UniSwap
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-2 animate-in slide-in-from-top-4 duration-150">
          <Link
            to="/explore"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Explore Feed
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/my-listings"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                My Wardrobe
              </Link>
              <Link
                to="/favourites"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Wishlist
              </Link>
              <Link
                to="/messages"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span>Messages</span>
                {unreadMessages > 0 && (
                  <span className="bg-campus-secondary text-white text-xs px-2 py-0.5 rounded-full">
                    {unreadMessages}
                  </span>
                )}
              </Link>
              <Link
                to="/notifications"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span>Notifications</span>
                {unreadNotifications > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {unreadNotifications}
                  </span>
                )}
              </Link>
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                My Profile
              </Link>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-sm font-bold text-campus-primary dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-sm font-bold bg-campus-primary text-white rounded-xl"
              >
                Join UniSwap
              </Link>
            </div>
          )}

          <Link
            to="/campus-safety"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400"
          >
            Safe Meetup Zones & Campus Security Protocol
          </Link>
        </div>
      )}
    </header>
  );
};
