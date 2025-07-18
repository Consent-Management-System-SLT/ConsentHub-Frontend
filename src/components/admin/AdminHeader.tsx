import React, { useState } from 'react';
import { LogOut, User, Bell, Settings, Menu, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LanguageSelector from '../LanguageSelector';

interface AdminHeaderProps {
  onMenuToggle: () => void;
  className?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuToggle, className = '' }) => {
  const { logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(5);

  const notifications = [
    {
      id: 1,
      type: 'urgent',
      title: 'GDPR Compliance Alert',
      message: 'New GDPR update requires immediate attention',
      time: '5 minutes ago',
      read: false
    },
    {
      id: 2,
      type: 'warning',
      title: 'Bulk Import Failed',
      message: 'Customer data import failed - check error logs',
      time: '30 minutes ago',
      read: false
    },
    {
      id: 3,
      type: 'info',
      title: 'System Maintenance',
      message: 'Scheduled maintenance window tonight at 2 AM',
      time: '2 hours ago',
      read: true
    }
  ];

  const handleLogout = () => {
    logout();
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    setNotificationCount(0);
  };

  return (
    <header className={`bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40 ${className}`}>
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex items-center space-x-3">
              <img 
                src="/SLTMobitel_Logo.svg.png" 
                alt="SLT Mobitel" 
                className="h-8 sm:h-10 w-auto flex-shrink-0"
              />
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">ConsentHub Admin</h1>
                <p className="text-xs sm:text-sm text-gray-500">System Administration</p>
              </div>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Language Selector */}
            <div className="hidden sm:flex items-center">
              <LanguageSelector />
            </div>

            {/* Notifications */}
            <div className="relative flex items-center">
              <button 
                onClick={handleNotificationClick}
                className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 block h-5 w-5 rounded-full bg-red-500 ring-2 ring-white text-xs font-bold text-white flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </button>
              
              {/* Notification Panel */}
              {showNotifications && (
                <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Admin Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                          !notification.read ? 'bg-red-50' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {notification.type === 'urgent' && (
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            )}
                            {notification.type === 'warning' && (
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            )}
                            {notification.type === 'info' && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="flex items-center">
              <button className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Admin Profile */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  System Administrator
                </p>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-red-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>
            </div>

            {/* Logout Button */}
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 sm:gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
