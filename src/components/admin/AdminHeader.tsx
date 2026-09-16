import React from 'react';
import { LogOut, User, Settings, Menu, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LanguageSelector from '../LanguageSelector';
import NotificationBell from '../shared/NotificationBell';
interface AdminHeaderProps {
  onMenuToggle: () => void;
  sidebarOpen?: boolean;
  className?: string;
}
const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuToggle, sidebarOpen = false, className = '' }) => {
  const { logout } = useAuth();
  const handleLogout = () => {
    logout();
  };
  return (
    <header className={`bg-white shadow-lg border-b border-slate-200 sticky top-0 z-40 ${className}`}>
      <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Brand Text - Logo moved to sidebar */}
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
            {/* Mobile menu button */}
            <button
              type="button"
              onClick={onMenuToggle}
              aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={sidebarOpen}
              aria-controls="admin-nav"
              className="lg:hidden p-2 -ml-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <Menu className="w-6 h-6" aria-hidden="true" />
            </button>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-slate-900">
                  <span className="hidden sm:inline">ConsentHub</span>
                  <span className="sm:hidden">CHub</span>
                </h1>
                <p className="text-xs text-slate-600">
                  <span className="hidden sm:inline">Admin Dashboard</span>
                  <span className="sm:hidden">Admin</span>
                </p>
              </div>
            </div>
          </div>
          {/* Right Side Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4">
            {/* Language Selector */}
            <div className="hidden md:flex items-center">
              <LanguageSelector />
            </div>
            {/* Notifications */}
            <NotificationBell />
            {/* Settings */}
            <div className="flex items-center">
              <button aria-label="Settings" className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </button>
            </div>
            {/* Admin Profile */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="hidden lg:flex flex-col text-right">
                <p className="text-sm font-medium text-slate-900">Admin User</p>
                <p className="text-xs text-slate-600 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  System Administrator
                </p>
              </div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 bg-blue-50 rounded-full flex items-center justify-center">
                <User className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-slate-900" />
              </div>
            </div>
            {/* Logout Button */}
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-slate-900 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
export default AdminHeader;
