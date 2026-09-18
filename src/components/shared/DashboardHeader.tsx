import React, { useEffect, useRef, useState } from 'react';
import { Menu, User, LogOut, Settings, Bell, ChevronDown, RefreshCw, Sun, Moon, Monitor } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useTheme, Theme } from '../../contexts/ThemeContext';
import LanguageSelector from '../LanguageSelector';
import NotificationsModal from './NotificationsModal';
import UserProfile from '../UserProfile';

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

const ROLE_LABELS: Record<string, string> = {
  admin: 'System Administrator',
  csr: 'Customer Service Rep',
  customer: 'Customer',
  enterprise: 'Enterprise',
  guardian: 'Guardian',
};

interface DashboardHeaderProps {
  /** e.g. "Admin Dashboard" */
  subtitle: string;
  /** id of the <nav> this header's menu button controls */
  navId: string;
  sidebarOpen: boolean;
  onMenuToggle: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  /** only rendered when the dashboard has somewhere for it to go */
  onOpenSettings?: () => void;
}

/**
 * The top bar shared by all three dashboards.
 *
 * Left: the product name. Right: refresh, language, then a single profile
 * control that opens a menu holding notifications, settings and sign out —
 * rather than four separate icons competing for attention.
 */
const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  subtitle,
  navId,
  sidebarOpen,
  onMenuToggle,
  onRefresh,
  isRefreshing = false,
  onOpenSettings,
}) => {
  const { user, logout } = useAuth();
  const userName = user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Signed in';
  const userRole = ROLE_LABELS[user?.role || ''] || user?.role || '';
  const { unreadCount } = useNotifications();
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // close on outside click or Escape, as a menu should
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const itemClass =
    'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 ' +
    'focus:outline-none focus-visible:bg-slate-50 transition-colors';

  return (
    <header className="bg-white border-b border-slate-200 shrink-0 z-30">
      <div className="h-16 px-3 sm:px-5 flex items-center justify-between gap-3">
        {/* Left: menu (small screens) + product name */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onMenuToggle}
            aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={sidebarOpen}
            aria-controls={navId}
            className="lg:hidden p-2 -ml-1 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <Menu className="w-6 h-6" aria-hidden="true" />
          </button>
          <img src="/Logo-SLT.png" alt="SLT Mobitel" className="hidden lg:block h-8 w-auto shrink-0" />
          <div className="min-w-0 lg:pl-3 lg:ml-1 lg:border-l lg:border-slate-200">
            <h1 className="text-base sm:text-lg font-semibold text-slate-900 leading-tight truncate">
              ConsentHub
            </h1>
            <p className="text-[11px] text-slate-500 leading-tight truncate">{subtitle}</p>
          </div>
        </div>

        {/* Right: refresh, language, profile menu */}
        <div className="flex items-center gap-1 sm:gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Refresh"
              aria-busy={isRefreshing}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
            </button>
          )}

          <LanguageSelector />

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Account menu"
              className="flex items-center gap-2 pl-1.5 pr-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <span className="relative w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-blue-800" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-semibold leading-4 text-center ring-2 ring-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </span>
              <span className="hidden md:block text-left leading-tight">
                <span className="block text-[13px] font-medium text-slate-900">{userName}</span>
                <span className="block text-[11px] text-slate-500">{userRole}</span>
              </span>
              <ChevronDown className="w-4 h-4 text-slate-500 hidden md:block" aria-hidden="true" />
            </button>

            {menuOpen && (
              <div
                role="menu"
                aria-label="Account"
                className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50"
              >
                <div className="px-3 py-2 border-b border-slate-100 md:hidden">
                  <p className="text-[13px] font-medium text-slate-900">{userName}</p>
                  <p className="text-[11px] text-slate-500">{userRole}</p>
                </div>

                <button
                  role="menuitem"
                  type="button"
                  className={itemClass}
                  onClick={() => {
                    setMenuOpen(false);
                    setNotificationsOpen(true);
                  }}
                >
                  <Bell className="w-4 h-4 text-slate-500" aria-hidden="true" />
                  <span className="flex-1 text-left">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-semibold">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                <button
                  role="menuitem"
                  type="button"
                  className={itemClass}
                  onClick={() => {
                    setMenuOpen(false);
                    setProfileOpen(true);
                  }}
                >
                  <User className="w-4 h-4 text-slate-500" aria-hidden="true" />
                  My profile
                </button>

                {onOpenSettings && (
                  <button
                    role="menuitem"
                    type="button"
                    className={itemClass}
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenSettings();
                    }}
                  >
                    <Settings className="w-4 h-4 text-slate-500" aria-hidden="true" />
                    Settings
                  </button>
                )}

                {/* Appearance. A segmented control rather than three menu
                    items, so the current choice is visible at a glance. */}
                <div className="border-t border-slate-100 mt-1 pt-2 px-3 pb-2">
                  <p id="theme-label" className="text-[11px] font-medium text-slate-500 mb-1.5">
                    Appearance
                  </p>
                  <div
                    role="radiogroup"
                    aria-labelledby="theme-label"
                    className="flex gap-1 rounded-lg bg-slate-100 p-1"
                  >
                    {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
                      const active = theme === value;
                      return (
                        <button
                          key={value}
                          role="radio"
                          type="button"
                          aria-checked={active}
                          onClick={() => setTheme(value)}
                          className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[11px] font-medium transition-colors
                            focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                              active ? 'bg-white text-blue-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                          <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    role="menuitem"
                    type="button"
                    className={`${itemClass} text-red-700`}
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <NotificationsModal isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
      <UserProfile isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </header>
  );
};

export default DashboardHeader;
