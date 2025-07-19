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
  ChevronRight
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
    { id: 'preferences', label: 'Preferences', icon: Settings, description: 'View customer preferences' },
    { id: 'privacy-notices', label: 'Privacy Notices', icon: FileText, description: 'Manage privacy policies' },
    { id: 'dsar-requests', label: 'DSAR Requests', icon: Database, description: 'Data subject access requests' },
    { id: 'audit-logs', label: 'Audit Logs', icon: Activity, description: 'System audit trail' },
    { id: 'bulk-import', label: 'Bulk Import', icon: Upload, description: 'Import customer data' },
    { id: 'event-listeners', label: 'Event Listeners', icon: Webhook, description: 'Manage webhooks' },
    { id: 'user-management', label: 'User Management', icon: Users, description: 'Manage users and roles' },
    { id: 'compliance-rules', label: 'Compliance Rules', icon: AlertTriangle, description: 'Configure compliance settings' }
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
        fixed lg:relative left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40 
        transform transition-all duration-300 ease-in-out shadow-xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header - Match main header height exactly */}
          <div className="px-4 sm:px-6 bg-gradient-to-r from-red-50 to-red-100 h-16 flex items-center justify-center border-b border-gray-200">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center justify-center w-full">
                <img 
                  src="/SLTMobitel_Logo.svg.png" 
                  alt="SLT Mobitel" 
                  className="h-10 w-auto"
                />
                {/* Admin Portal text removed as requested */}
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
                      ? 'bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 text-red-700 shadow-sm' 
                      : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900 border-2 border-transparent hover:border-gray-100'
                    }
                  `}
                >
                  <div className={`
                    flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all duration-200
                    ${isActive 
                      ? 'bg-red-100 text-red-600 shadow-sm' 
                      : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700'
                    }
                  `}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`
                        font-semibold text-sm sm:text-base truncate
                        ${isActive ? 'text-red-700' : 'text-gray-900'}
                      `}>
                        {item.label}
                      </h3>
                      <ChevronRight className={`
                        flex-shrink-0 w-4 h-4 transition-all duration-200
                        ${isActive 
                          ? 'text-red-600 transform rotate-90' 
                          : 'text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1'
                        }
                      `} />
                    </div>
                    <p className={`
                      text-xs sm:text-sm leading-relaxed line-clamp-2
                      ${isActive ? 'text-red-600' : 'text-gray-500 group-hover:text-gray-600'}
                    `}>
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50/50">
            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4 border border-red-100">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-red-900 mb-1">Admin Access</h4>
                  <p className="text-xs text-red-700 leading-relaxed">
                    Full system privileges - use responsibly
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
