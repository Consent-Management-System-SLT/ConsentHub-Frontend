import React from 'react';
import { LogOut, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../LanguageSelector';
import NotificationBell from '../shared/NotificationBell';

interface CustomerHeaderProps {
  customerName: string;
  onLogout: () => void;
  onProfileClick?: () => void;
}

const CustomerHeader: React.FC<CustomerHeaderProps> = ({ customerName, onLogout, onProfileClick }) => {
  const { t } = useTranslation();
  
  return (
    <header className="bg-myslt-primary shadow-lg sticky top-0 z-40 border-b border-myslt-accent/20">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Text - Logo moved to sidebar */}
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-shrink-0">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-myslt-text-primary truncate">{t('customerDashboard.brand')}</h1>
              <p className="text-xs sm:text-sm text-myslt-text-secondary">{t('customerDashboard.subtitle')}</p>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Language Selector - Hidden on mobile to save space */}
            <div className="hidden sm:flex items-center">
              <LanguageSelector />
            </div>

            {/* Notifications */}
            <NotificationBell size="sm" />

            {/* User Profile */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right min-w-0">
                <p className="text-sm font-medium text-myslt-text-primary truncate max-w-[8rem] lg:max-w-[12rem]">{customerName}</p>
                <p className="text-xs text-myslt-text-secondary">{t('customerDashboard.userRole')}</p>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-myslt-accent rounded-full flex items-center justify-center flex-shrink-0">
                <button type="button" onClick={onProfileClick} className="w-8 h-8 sm:w-9 sm:h-9 bg-myslt-accent rounded-full flex items-center justify-center flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-myslt-success hover:bg-myslt-accent/80 transition-all duration-200">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-myslt-text-primary" />
                </button>
              </div>
            </div>

            {/* Logout Button */}
            <div className="flex items-center">
              <button
                onClick={onLogout}
                className="flex items-center gap-1 sm:gap-2 px-3 py-2 text-sm font-medium text-myslt-text-primary bg-myslt-card hover:bg-myslt-accent rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-myslt-success"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t('common.logout')}</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Language Selector */}
        <div className="sm:hidden pb-3 pt-3">
          <div className="flex items-center justify-center">
            <LanguageSelector />
          </div>
        </div>
      </div>
    </header>
  );
};

export default CustomerHeader;
