import React from 'react';
import { 
  Home, 
  Search, 
  FileText, 
  Settings, 
  Database, 
  Shield, 
  Activity,
  ChevronRight,
  Menu,
  X,
  UserCheck,
  Bell
} from 'lucide-react';

interface SidebarNavProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ 
  activeSection, 
  onSectionChange, 
  isOpen, 
  onToggle 
}) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Home, description: 'Dashboard overview and statistics' },
    { id: 'customer-search', label: 'Customer Search', icon: Search, description: 'Search and manage customers' },
    { id: 'consent-history', label: 'Consent History', icon: FileText, description: 'View customer consent history' },
    { id: 'consent-management', label: 'Consent Management', icon: Shield, description: 'Search customers and update their consents' },
    { id: 'preference-editor', label: 'Preferences', icon: Settings, description: 'Manage customer preferences' },
    { id: 'notification-center', label: 'Notification Center', icon: Bell, description: 'Send notifications and manage campaigns' },
    { id: 'dsar-requests', label: 'DSAR Requests', icon: Database, description: 'Handle data subject access requests' },
    { id: 'guardian-consent', label: 'Guardian Consent', icon: UserCheck, description: 'Manage guardian consent forms' },
    { id: 'audit-logs', label: 'Audit Logs', icon: Activity, description: 'View system audit logs' }
  ];

  return (
    <>
      {/* Mobile overlay - solid background */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-myslt-background z-30 transition-opacity duration-300"
          onClick={onToggle}
        />
      )}
      
      {/* Mobile menu button */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-20 left-4 z-50 p-3 rounded-xl bg-myslt-card shadow-lg border border-myslt-accent/20 hover:shadow-xl transition-all duration-200"
        aria-label="Toggle navigation menu"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-myslt-text-secondary" />
        ) : (
          <Menu className="w-5 h-5 text-myslt-text-secondary" />
        )}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative left-0 top-0 h-full w-64 bg-myslt-card border-r border-myslt-accent/20 z-40 
        transform transition-all duration-300 ease-in-out shadow-xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header - Match main header height exactly */}
          <div className="px-4 sm:px-6 bg-myslt-gradient h-16 flex items-center justify-center border-b border-myslt-accent/20">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center justify-center w-full">
                <img 
                  src="/Logo-SLT.png" 
                  alt="SLT Mobitel" 
                  className="h-10 w-auto"
                />
                {/* ConsentHub CSR Portal text removed as requested */}
              </div>
              {/* Close button for mobile */}
              <button
                onClick={onToggle}
                className="lg:hidden p-2 rounded-lg hover:bg-myslt-accent/10 transition-colors absolute right-4"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5 text-myslt-text-secondary" />
              </button>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-3 sm:px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
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
                      ? 'bg-myslt-accent border-2 border-myslt-success/50 text-myslt-text-primary shadow-sm' 
                      : 'hover:bg-myslt-accent/50 text-myslt-text-secondary hover:text-myslt-text-primary border-2 border-transparent hover:border-myslt-accent/30'
                    }
                  `}
                >
                  <div className={`
                    flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all duration-200
                    ${isActive 
                      ? 'bg-myslt-success text-white shadow-sm' 
                      : 'bg-myslt-accent text-myslt-text-muted group-hover:bg-myslt-accent/80 group-hover:text-myslt-text-primary'
                    }
                  `}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`
                        font-semibold text-sm sm:text-base truncate
                        ${isActive ? 'text-myslt-text-primary' : 'text-myslt-text-primary'}
                      `}>
                        {item.label}
                      </h3>
                      <ChevronRight className={`
                        flex-shrink-0 w-4 h-4 transition-all duration-200
                        ${isActive 
                          ? 'text-myslt-success transform rotate-90' 
                          : 'text-myslt-text-muted group-hover:text-myslt-text-secondary group-hover:translate-x-1'
                        }
                      `} />
                    </div>
                    <p className={`
                      text-xs sm:text-sm leading-relaxed line-clamp-2
                      ${isActive ? 'text-myslt-text-secondary' : 'text-myslt-text-muted group-hover:text-myslt-text-secondary'}
                    `}>
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-4 bg-myslt-service-card">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-myslt-primary" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">Privacy Protected</h4>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Your data is secure and encrypted
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

export default SidebarNav;
