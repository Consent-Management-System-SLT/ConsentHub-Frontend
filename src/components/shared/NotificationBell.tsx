import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, Trash2 } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

interface NotificationBellProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  maxDisplayed?: number;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ 
  className = '',
  size = 'md',
  showLabel = false,
  maxDisplayed = 10
}) => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification 
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          bell: 'w-4 h-4',
          button: 'p-1.5',
          badge: 'h-4 w-4 text-xs'
        };
      case 'lg':
        return {
          bell: 'w-7 h-7',
          button: 'p-3',
          badge: 'h-6 w-6 text-sm'
        };
      default:
        return {
          bell: 'w-5 h-5 sm:w-6 sm:h-6',
          button: 'p-2',
          badge: 'h-5 w-5 text-xs'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  const getNotificationIcon = (_type: string, category: string) => {
    if (category === 'urgent') {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    if (category === 'success') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (category === 'warning') {
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
    return <Info className="w-4 h-4 text-blue-500" />;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const displayedNotifications = notifications.slice(0, maxDisplayed);

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative ${sizeClasses.button} text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors`}
        title="Notifications"
      >
        <Bell className={sizeClasses.bell} />
        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 ${sizeClasses.badge} rounded-full bg-red-500 ring-2 ring-white font-bold text-white flex items-center justify-center`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showLabel && (
        <span className="ml-2 text-sm text-gray-600">
          Notifications {unreadCount > 0 && `(${unreadCount})`}
        </span>
      )}

      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[80vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-1 text-xs font-medium text-white bg-red-500 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {displayedNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No notifications</p>
                <p className="text-gray-400 text-sm mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {displayedNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer group ${
                      !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type, notification.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate pr-2">
                            {notification.title}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className="flex-shrink-0 p-1 hover:bg-gray-200 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-400">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              notification.category === 'urgent' ? 'bg-red-100 text-red-800' :
                              notification.category === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                              notification.category === 'success' ? 'bg-green-100 text-green-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {notification.category}
                            </span>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > maxDisplayed && (
            <div className="p-3 border-t border-gray-100 text-center">
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                View all {notifications.length} notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
