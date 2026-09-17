import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Home,
  Shield,
  Settings,
  FileText,
  Download,
  ChevronRight,
  X,
  Zap,
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
  onToggle,
}) => {
  const { t } = useTranslation();
  const navRef = useRef<HTMLElement>(null);

  const navigationItems = [
    { id: 'dashboard', icon: Home, key: 'dashboard' },
    { id: 'consent-center', icon: Shield, key: 'consentCenter' },
    { id: 'preferences', icon: Settings, key: 'preferences' },
    { id: 'value-added-services', icon: Zap, key: 'valueAddedServices' },
    { id: 'privacy-notices', icon: FileText, key: 'privacyNotices' },
    { id: 'dsar-requests', icon: Download, key: 'dsarRequests' },
  ].map((item) => ({
    ...item,
    label: t(`customerDashboard.navigation.${item.key}`),
    description: t(`customerDashboard.navigation.${item.key}Desc`),
  }));

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onToggle();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onToggle]);

  useEffect(() => {
    if (isOpen && window.innerWidth < 1024) {
      navRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    }
  }, [isOpen]);

  const handleSelect = (id: string) => {
    onSectionChange(id);
    if (window.innerWidth < 1024) onToggle();
  };

  return (
    <>
      {/* Mobile scrim */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/50 z-40 transition-opacity duration-300"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}


      <aside
        className={`
          fixed lg:relative left-0 top-0 h-full w-64 sm:w-72 lg:w-64 bg-white border-r-2 border-slate-200 z-50
          transform transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="px-4 sm:px-6 bg-white border-b-2 border-slate-200 h-16 flex items-center justify-center">
            <div className="flex items-center justify-center w-full">
              <img src="/Logo-SLT.png" alt="SLT Mobitel" className="h-10 w-auto" />
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors absolute right-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5 text-slate-600" aria-hidden="true" />
            </button>
          </div>

          <nav
            ref={navRef}
            id="customer-nav"
            aria-label="Customer sections"
            className="flex-1 px-3 sm:px-4 py-6 space-y-2 overflow-y-auto"
          >
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              const descId = `customer-nav-${item.id}-desc`;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  aria-describedby={descId}
                  className={`
                    w-full flex items-start gap-3 sm:gap-4 px-3 sm:px-4 py-4 rounded-xl text-left
                    transition-all duration-200 group hover:shadow-sm border-2
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2
                    ${isActive
                      ? 'bg-blue-50 border-blue-200 text-slate-900 shadow-sm'
                      : 'border-transparent hover:bg-slate-50 hover:border-slate-200 text-slate-700'
                    }
                  `}
                >
                  <span
                    className={`
                      flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all duration-200
                      ${isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-900'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="flex flex-wrap items-start justify-between gap-2 mb-1">
                      <span className="font-semibold text-sm sm:text-base text-slate-900">
                        {item.label}
                      </span>
                      <ChevronRight
                        className={`
                          flex-shrink-0 w-4 h-4 transition-all duration-200
                          ${isActive
                            ? 'text-blue-600 rotate-90'
                            : 'text-slate-400 group-hover:text-slate-600'
                          }
                        `}
                        aria-hidden="true"
                      />
                    </span>
                    <span
                      id={descId}
                      className={`block text-xs sm:text-sm leading-relaxed line-clamp-2 ${
                        isActive ? 'text-slate-600' : 'text-slate-500 group-hover:text-slate-600'
                      }`}
                    >
                      {item.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="px-3 sm:px-4 py-4 border-t border-slate-200 bg-slate-50/60">
            <div className="bg-white rounded-xl p-3 sm:p-4 border border-blue-200">
              <div className="flex flex-wrap items-start gap-3">
                <span className="w-8 h-8 lg:w-9 lg:h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 lg:w-5 lg:h-5 text-blue-700" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-slate-900 mb-1">
                    {t('customerDashboard.sidebar.privacyTitle')}
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
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
