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
    { id: 'consents', label: 'Consent Management', icon: Shield },
    { id: 'preferences', label: 'Communication Preferences', icon: Settings },
    { id: 'notices', label: 'Privacy Notices', icon: FileText },
    { id: 'audit', label: 'Audit Trail', icon: Activity },
    { id: 'dsar', label: 'DSAR Requests', icon: Database },
    { id: 'search', label: 'Customer Search', icon: Search },
  ];

  // ✅ Automatically select default tab "consents"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3">
          <img
            src="/SLTMobitel_Logo.svg.png"
            alt="Logo"
            className="h-10 w-auto"
          />
          <h1 className="text-2xl font-bold text-gray-900">
            Consent Management Hub - CSR Dashboard
          </h1>
        </div>

        {/* Logout Button */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex space-x-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
