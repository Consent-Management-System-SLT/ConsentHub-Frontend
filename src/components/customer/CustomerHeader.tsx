import React from 'react';
import { LogOut, User, Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../LanguageSelector';
import NotificationBell from '../shared/NotificationBell';
interface CustomerHeaderProps {
  customerName: string;
  onLogout: () => void;
  onProfileClick?: () => void;
  onMenuToggle?: () => void;
  sidebarOpen?: boolean;
}
const CustomerHeader: React.FC<CustomerHeaderProps> = ({ customerName, onLogout, onProfileClick, onMenuToggle, sidebarOpen = false }) => {
  const { t } = useTranslation();
  return (
    <header className="bg-white shadow-lg sticky top-0 z-40 border-b border-slate-200">
      <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Brand Text - Logo moved to sidebar */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-shrink-0">
            <button
              type="button"
              onClick={onMenuToggle}
              aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={sidebarOpen}
              aria-controls="customer-nav"
              className="lg:hidden p-2 -ml-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <Menu className="w-6 h-6" aria-hidden="true" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 truncate">
                <span className="hidden sm:inline">{t('customerDashboard.brand')}</span>
                <span className="sm:hidden">ConsentHub</span>
              </h1>
              <p className="text-xs text-slate-600">
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
                <p className="text-sm font-medium text-slate-900 truncate max-w-[8rem] xl:max-w-[12rem]">{customerName}</p>
                <p className="text-xs text-slate-600">{t('customerDashboard.userRole')}</p>
              </div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                <button aria-label="Account menu" type="button" onClick={onProfileClick} className="w-full h-full bg-blue-50 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-blue-50/80 transition-all duration-200">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-slate-900" />
                </button>
              </div>
            </div>
            {/* Logout Button */}
            <div className="flex items-center">
              <button aria-label="Sign out"
                onClick={onLogout}
                className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-slate-900 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t('common.logout')}</span>
              </button>
            </div>
          </div>
        </div>
        {/* Mobile Language Selector */}
        <div className="md:hidden pb-2 pt-2 border-t border-slate-200/10">
          <div className="flex items-center justify-center">
            <LanguageSelector />
          </div>
        </div>
      </div>
    </header>
  );
};
export default CustomerHeader;
