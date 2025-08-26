import React from 'react';
import { 
  BarChart3, 
  Shield, 
  Settings, 
  FileText, 
  Database, 
  Activity, 
  Upload, 
  Webhook, 
  Users, 
  AlertTriangle,
  Menu,
  X,
  ChevronRight,
  UserCheck,
  MessageSquare,
  Zap
} from 'lucide-react';

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  activeSection, 
  onSectionChange, 
  isOpen, 
  onToggle 
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, description: 'Overview and analytics' },
    { id: 'consents', label: 'Consents', icon: Shield, description: 'Manage all customer consents' },
    { id: 'guardian-consent', label: 'Guardian Consent', icon: UserCheck, description: 'Manage guardian consent for minors' },
    { id: 'preferences', label: 'Preferences', icon: Settings, description: 'View customer preferences' },
    { id: 'topic-preferences', label: 'Topic Preferences', icon: MessageSquare, description: 'Manage topic-based communications' },
    { id: 'privacy-notices', label: 'Privacy Notices', icon: FileText, description: 'Manage privacy policies' },
    { id: 'dsar-requests', label: 'DSAR Requests', icon: Database, description: 'Data subject access requests' },
    { id: 'dsar-automation', label: 'DSAR Automation', icon: Zap, description: 'Automated DSAR processing' },
    { id: 'audit-logs', label: 'Audit Logs', icon: Activity, description: 'System audit trail' },
    { id: 'bulk-import', label: 'Bulk Import', icon: Upload, description: 'Import customer data' },
    { id: 'event-listeners', label: 'Event Listeners', icon: Webhook, description: 'Manage webhooks' },
    { id: 'user-management', label: 'User Management', icon: Users, description: 'Manage users and roles' },
    { id: 'customer-management', label: 'Customer Management', icon: UserCheck, description: 'Manage customer accounts and data' },
    { id: 'compliance-rules', label: 'Compliance Rules', icon: AlertTriangle, description: 'Configure compliance settings' }
  ];

  return (
    <>
      {/* Mobile overlay - solid background instead of transparent */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-myslt-background z-30 transition-opacity duration-300"
          onClick={onToggle}
        />
      )}
      
      {/* Mobile menu button */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-20 left-4 z-50 p-3 rounded-xl myslt-sidebar-mobile shadow-lg border-2 border-myslt-accent hover:shadow-xl transition-all duration-200"
        aria-label="Toggle navigation menu"
      >
        {isOpen ? (
          <X className="myslt-icon-md" />
        ) : (
          <Menu className="myslt-icon-md" />
        )}
      </button>

      {/* Sidebar - solid background for mobile */}
      <aside className={`
        fixed lg:relative left-0 top-0 h-full w-64 myslt-sidebar-mobile border-r-2 border-myslt-accent z-40 
        transform transition-all duration-300 ease-in-out shadow-xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header - solid background without transparency */}
          <div className="px-4 sm:px-6 bg-myslt-card-solid border-2 border-myslt-accent h-16 flex items-center justify-center">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center justify-center w-full">
                <img 
                  src="/Logo-SLT.png" 
                  alt="SLT Mobitel" 
                  className="h-10 w-auto"
                />
              </div>
              {/* Close button for mobile */}
              <button
                onClick={onToggle}
                className="lg:hidden p-2 rounded-lg hover:bg-myslt-accent/10 transition-colors absolute right-4"
                aria-label="Close navigation menu"
              >
                <X className="myslt-icon-md" />
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
          <div className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 border-t border-myslt-accent/20 bg-myslt-background/30">
            <div className="bg-myslt-gradient rounded-lg sm:rounded-xl p-3 sm:p-4 border border-myslt-success/20">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 bg-red-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-red-600" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-red-900 mb-0.5 sm:mb-1">Admin Access</h4>
                  <p className="text-xs text-red-700 leading-relaxed hidden sm:block">
                    Full system privileges - use responsibly
                  </p>
                  <p className="text-xs text-red-700 leading-relaxed sm:hidden">
                    Full privileges
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

export default AdminSidebar;
