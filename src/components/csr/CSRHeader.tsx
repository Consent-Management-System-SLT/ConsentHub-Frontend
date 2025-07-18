import React, { useState } from 'react';
import { LogOut, User, Bell, Settings, X, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LanguageSelector from '../LanguageSelector';

interface CSRHeaderProps {
  className?: string;
  onNotificationClick?: () => void;
  onSettingsClick?: () => void;
}

const CSRHeader: React.FC<CSRHeaderProps> = ({ 
  className = '', 
  onNotificationClick, 
  onSettingsClick 
}) => {
  const { logout } = useAuth();
  const [notificationCount, setNotificationCount] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: 1,
      type: 'urgent',
      title: 'High Priority DSAR Request',
      message: 'Customer John Doe has submitted a new data deletion request.',
      time: '2 minutes ago',
      read: false
    },
    {
      id: 2,
      type: 'info',
      title: 'Consent Updated',
      message: 'Marketing consent has been updated for customer Jane Smith.',
      time: '15 minutes ago',
      read: false
    },
    {
      id: 3,
      type: 'success',
      title: 'Guardian Verification Complete',
      message: 'Guardian consent verification completed for minor customer.',
      time: '1 hour ago',
      read: true
    }
  ];

  const handleLogout = () => {
    logout();
  };

  const handleNotificationClick = () => {
    if (onNotificationClick) {
      onNotificationClick();
    } else {
      setShowNotifications(!showNotifications);
    }
    // Clear notification count after clicking
    setNotificationCount(0);
  };

  const handleSettingsClick = () => {
    if (onSettingsClick) {
      onSettingsClick();
    } else {
      // Show settings panel or redirect to settings
      console.log('Opening settings');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'info':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <header className={`bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40 ${className}`}>
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-shrink-0">
            <img 
              src="/SLTMobitel_Logo.svg.png" 
              alt="SLT Mobitel" 
              className="h-8 sm:h-10 w-auto flex-shrink-0"
            />
            <div className="hidden sm:block min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">ConsentHub</h1>
              <p className="text-xs sm:text-sm text-gray-500">CSR Dashboard</p>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Language Selector - Hidden on mobile to save space */}
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
                  <span className="absolute -top-1 -right-1 block h-5 w-5 rounded-full bg-red-400 ring-2 ring-white text-xs font-bold text-white flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </button>
              
              {/* Notification Panel */}
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
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
                  <div className="p-4 border-t border-gray-200">
                    <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium">
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="flex items-center">
              <button 
                onClick={handleSettingsClick}
                className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[8rem] lg:max-w-[12rem]">Sarah Johnson</p>
                <p className="text-xs text-gray-500">Customer Service Rep</p>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
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
        
        {/* Mobile Language Selector */}
        <div className="sm:hidden pb-3 border-t border-gray-100 pt-3">
          <div className="flex items-center justify-center">
            <LanguageSelector />
          </div>
        </div>
      </div>
    </header>
  );
};

export default CSRHeader;
