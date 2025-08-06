import React from 'react';
import { LogOut, User, Settings, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LanguageSelector from '../LanguageSelector';
import NotificationBell from '../shared/NotificationBell';

interface CSRHeaderProps {
  className?: string;
  onSettingsClick?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const CSRHeader: React.FC<CSRHeaderProps> = ({ 
  className = '', 
  onSettingsClick,
  onRefresh,
  isRefreshing = false
}) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const handleSettingsClick = () => {
    if (onSettingsClick) {
      onSettingsClick();
    } else {
      // Show settings panel or redirect to settings
      console.log('Opening settings');
    }
  };

  return (
    <header className={`bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40 ${className}`}>
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Text - Logo kept in sidebar */}
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-shrink-0">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">ConsentHub</h1>
              <p className="text-xs sm:text-sm text-gray-500">CSR Dashboard</p>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Language Selector - Hidden on mobile to save space */}
            <div className="hidden sm:flex items-center">
              <LanguageSelector />
            </div>

            {/* Refresh Button */}
            <div className="flex items-center">
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className={`p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors ${
                  isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title="Refresh Dashboard"
              >
                <RefreshCw className={`w-5 h-5 sm:w-6 sm:h-6 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Notifications */}
            <NotificationBell />

            {/* Settings */}
            <div className="flex items-center">
              <button 
                onClick={handleSettingsClick}
                className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[8rem] lg:max-w-[12rem]">Sarah Johnson</p>
                <p className="text-xs text-gray-500">Customer Service Rep</p>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
            </div>

            {/* Logout Button */}
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 sm:gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Language Selector */}
        <div className="sm:hidden pb-3 border-t border-gray-100 pt-3">
          <div className="flex items-center justify-center">
            <LanguageSelector />
          </div>
        </div>
      </div>
    </header>
  );
};

export default CSRHeader;
