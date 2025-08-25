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
      <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Brand Text - Logo moved to sidebar */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-shrink-0">
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-myslt-text-primary truncate">
                <span className="hidden sm:inline">{t('customerDashboard.brand')}</span>
                <span className="sm:hidden">ConsentHub</span>
              </h1>
              <p className="text-xs text-myslt-text-secondary">
                <span className="hidden sm:inline">{t('customerDashboard.subtitle')}</span>
                <span className="sm:hidden">Customer</span>
              </p>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4">
            {/* Language Selector - Hidden on mobile to save space */}
            <div className="hidden md:flex items-center">
              <LanguageSelector />
            </div>

            {/* Notifications */}
            <NotificationBell size="sm" />

            {/* User Profile */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="hidden lg:flex flex-col text-right min-w-0">
                <p className="text-sm font-medium text-myslt-text-primary truncate max-w-[8rem] xl:max-w-[12rem]">{customerName}</p>
                <p className="text-xs text-myslt-text-secondary">{t('customerDashboard.userRole')}</p>
              </div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 bg-myslt-accent rounded-full flex items-center justify-center flex-shrink-0">
                <button type="button" onClick={onProfileClick} className="w-full h-full bg-myslt-accent rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-myslt-success hover:bg-myslt-accent/80 transition-all duration-200">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-myslt-text-primary" />
                </button>
              </div>
            </div>

            {/* Logout Button */}
            <div className="flex items-center">
              <button
                onClick={onLogout}
                className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-myslt-text-primary bg-myslt-card hover:bg-myslt-accent rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-myslt-success"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t('common.logout')}</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Language Selector */}
        <div className="md:hidden pb-2 pt-2 border-t border-myslt-accent/10">
          <div className="flex items-center justify-center">
            <LanguageSelector />
          </div>
        </div>
      </div>
    </header>
  );
};

export default CustomerHeader;
