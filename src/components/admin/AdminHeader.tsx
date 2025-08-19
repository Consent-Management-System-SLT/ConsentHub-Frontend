import React from 'react';
import { LogOut, User, Settings, Menu, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LanguageSelector from '../LanguageSelector';
import NotificationBell from '../shared/NotificationBell';

interface AdminHeaderProps {
  onMenuToggle: () => void;
  className?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuToggle, className = '' }) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className={`bg-myslt-primary shadow-lg border-b border-myslt-accent/20 sticky top-0 z-40 ${className}`}>
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Text - Logo moved to sidebar */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg text-myslt-text-muted hover:text-myslt-text-primary hover:bg-myslt-accent/10 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-myslt-text-primary">ConsentHub</h1>
                <p className="text-xs sm:text-sm text-myslt-text-secondary">Admin Dashboard</p>
              </div>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Language Selector */}
            <div className="hidden sm:flex items-center">
              <LanguageSelector />
            </div>

            {/* Notifications */}
            <NotificationBell />

            {/* Settings */}
            <div className="flex items-center">
              <button className="p-2 text-myslt-text-muted hover:text-myslt-text-primary focus:outline-none focus:ring-2 focus:ring-myslt-success rounded-lg transition-colors">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Admin Profile */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right">
                <p className="text-sm font-medium text-myslt-text-primary">Admin User</p>
                <p className="text-xs text-myslt-text-secondary flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  System Administrator
                </p>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-myslt-accent rounded-full flex items-center justify-center">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-myslt-text-primary" />
              </div>
            </div>

            {/* Logout Button */}
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 sm:gap-2 px-3 py-2 text-sm font-medium text-myslt-text-primary bg-myslt-card hover:bg-myslt-accent rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-myslt-success"
              >
                <LogOut className="w-4 h-4" />
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
