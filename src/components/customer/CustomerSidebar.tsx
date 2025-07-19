import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  Shield, 
  Settings, 
  FileText, 
  Download, 
  ChevronRight,
  Menu,
  X 
} from 'lucide-react';

interface CustomerSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const CustomerSidebar: React.FC<CustomerSidebarProps> = ({ 
  activeSection, 
  onSectionChange, 
  isOpen, 
  onToggle 
}) => {
  const { t } = useTranslation();
  
  const navigationItems = [
    {
      id: 'dashboard',
      label: t('customerDashboard.navigation.dashboard'),
      icon: Home,
      description: t('customerDashboard.navigation.dashboardDesc')
    },
    {
      id: 'consent-center',
      label: t('customerDashboard.navigation.consentCenter'),
      icon: Shield,
      description: t('customerDashboard.navigation.consentCenterDesc')
    },
    {
      id: 'preferences',
      label: t('customerDashboard.navigation.preferences'),
      icon: Settings,
      description: t('customerDashboard.navigation.preferencesDesc')
    },
    {
      id: 'privacy-notices',
      label: t('customerDashboard.navigation.privacyNotices'),
      icon: FileText,
      description: t('customerDashboard.navigation.privacyNoticesDesc')
    },
    {
      id: 'dsar-requests',
      label: t('customerDashboard.navigation.dsarRequests'),
      icon: Download,
      description: t('customerDashboard.navigation.dsarRequestsDesc')
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300"
          onClick={onToggle}
        />
      )}
      
      {/* Mobile menu button */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-20 left-4 z-50 p-3 rounded-xl bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200"
        aria-label="Toggle navigation menu"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-gray-600" />
        ) : (
          <Menu className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative left-0 top-0 h-full w-64 bg-white z-40 
        transform transition-all duration-300 ease-in-out shadow-xl lg:shadow-none
        border-r border-gray-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header - Match main header height exactly */}
          <div className="px-4 sm:px-6 bg-gradient-to-r from-blue-50 to-indigo-50 h-16 flex items-center justify-center border-b border-gray-200">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center justify-center w-full">
                <img 
                  src="/SLTMobitel_Logo.svg.png" 
                  alt="SLT Mobitel" 
                  className="h-10 w-auto"
                />
                {/* Navigation text removed as requested */}
              </div>
              {/* Close button for mobile */}
              <button
                onClick={onToggle}
                className="lg:hidden p-2 rounded-lg hover:bg-white/60 transition-colors absolute right-4"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-3 sm:px-4 py-6 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSectionChange(item.id);
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                  className={`
                    w-full flex items-start space-x-3 sm:space-x-4 px-3 sm:px-4 py-4 rounded-xl text-left 
                    transition-all duration-200 group hover:shadow-sm
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-blue-700 shadow-sm' 
                      : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900 border-2 border-transparent hover:border-gray-100'
                    }
                  `}
                >
                  <div className={`
                    flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-100 text-blue-600 shadow-sm' 
                      : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700'
                    }
                  `}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`
                        font-semibold text-sm sm:text-base truncate
                        ${isActive ? 'text-blue-700' : 'text-gray-900'}
                      `}>
                        {item.label}
                      </h3>
                      <ChevronRight className={`
                        flex-shrink-0 w-4 h-4 transition-all duration-200
                        ${isActive 
                          ? 'text-blue-600 transform rotate-90' 
                          : 'text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1'
                        }
                      `} />
                    </div>
                    <p className={`
                      text-xs sm:text-sm leading-relaxed line-clamp-2
                      ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-600'}
                    `}>
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-4 bg-gray-50/50">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">{t('customerDashboard.sidebar.privacyTitle')}</h4>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    {t('customerDashboard.sidebar.privacyDesc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default CustomerSidebar;
