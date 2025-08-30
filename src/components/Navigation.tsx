import React, { useEffect } from 'react';
import {
  Shield,
  Settings,
  FileText,
  Activity,
  Database,
  Search,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const navItems = [
        { id: 'search', label: 'Customer Search', icon: Search },
    { id: 'consents', label: 'Consent Management', icon: Shield },
    { id: 'preferences', label: 'Communication Preferences', icon: Settings },
    { id: 'audit', label: 'Audit Trail', icon: Activity },
    { id: 'dsar', label: 'DSAR Requests', icon: Database },
        { id: 'notices', label: 'Privacy Notices', icon: FileText }
  ];

  // Automatically select default tab "consents"
  useEffect(() => {
    if (!activeTab) {
      onTabChange('consents');
    }
  }, [activeTab, onTabChange]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      {/* Header Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <img
            src="/Logo-SLT.png"
            alt="Logo"
            className="h-8 sm:h-10 w-auto"
          />
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
            <span className="hidden md:inline">Consent Management Hub - CSR Dashboard</span>
            <span className="md:hidden">CSR Dashboard</span>
          </h1>
        </div>

        {/* Logout Button */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-1.5 sm:py-2 flex space-x-0.5 sm:space-x-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline lg:inline">{item.label}</span>
                <span className="sm:hidden">
                  {item.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
