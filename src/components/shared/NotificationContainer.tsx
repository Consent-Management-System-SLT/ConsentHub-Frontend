import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  autoClose?: boolean;
  duration?: number; // in milliseconds
}

interface NotificationManagerProps {
  className?: string;
}

class NotificationManager {
  private static instance: NotificationManager;
  private listeners: Set<(notifications: NotificationData[]) => void> = new Set();
  private notifications: NotificationData[] = [];

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  addNotification(notification: Omit<NotificationData, 'id' | 'timestamp'>): string {
    const newNotification: NotificationData = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      autoClose: notification.autoClose ?? true,
      duration: notification.duration ?? 5000
    };

    this.notifications = [newNotification, ...this.notifications.slice(0, 4)]; // Keep only 5 notifications
    this.notifyListeners();

    // Auto close if enabled
    if (newNotification.autoClose) {
      setTimeout(() => {
        this.removeNotification(newNotification.id);
      }, newNotification.duration);
    }

    return newNotification.id;
  }

  removeNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  subscribe(callback: (notifications: NotificationData[]) => void): () => void {
    this.listeners.add(callback);
    callback(this.notifications); // Send current notifications immediately
    
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback([...this.notifications]));
  }

  // Convenience methods
  success(title: string, message: string): string {
    return this.addNotification({ type: 'success', title, message });
  }

  error(title: string, message: string): string {
    return this.addNotification({ type: 'error', title, message, autoClose: false });
  }

  warning(title: string, message: string): string {
    return this.addNotification({ type: 'warning', title, message });
  }

  info(title: string, message: string): string {
    return this.addNotification({ type: 'info', title, message });
  }
}

export const notificationManager = NotificationManager.getInstance();

const NotificationContainer: React.FC<NotificationManagerProps> = ({ className = '' }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  useEffect(() => {
    const unsubscribe = notificationManager.subscribe(setNotifications);
    return unsubscribe;
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 space-y-2 ${className}`}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-start p-4 rounded-lg border shadow-lg max-w-sm animate-in slide-in-from-right duration-300 ${getStyles(notification.type)}`}
        >
          <div className="flex-shrink-0">
            {getIcon(notification.type)}
          </div>
          <div className="ml-3 flex-1">
            <h4 className="text-sm font-medium">{notification.title}</h4>
            <p className="text-sm mt-1 opacity-90">{notification.message}</p>
            <p className="text-xs mt-2 opacity-75">
              {notification.timestamp.toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={() => notificationManager.removeNotification(notification.id)}
            className="ml-3 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
