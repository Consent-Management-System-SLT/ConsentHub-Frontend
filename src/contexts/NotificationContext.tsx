import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface Notification {
  id: string;
  type: 'consent' | 'preference' | 'privacy-notice' | 'dsar' | 'user' | 'system';
  category: 'urgent' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  userId?: string;
  metadata?: Record<string, any>;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearNotifications: () => void;
  getNotificationsByType: (type: Notification['type']) => Notification[];
  getNotificationsByCategory: (category: Notification['category']) => Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('consentHub_notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        setNotifications(parsed);
      } catch (error) {
        console.error('Error loading notifications:', error);
        // Add some sample notifications for demo
        setNotifications([
          {
            id: 'sample-1',
            type: 'dsar',
            category: 'urgent',
            title: 'New DSAR Request',
            message: 'Customer John Doe has submitted a data deletion request.',
            timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
            read: false
          },
          {
            id: 'sample-2',
            type: 'preference',
            category: 'info',
            title: 'Preference Updated',
            message: 'Customer updated marketing preferences.',
            timestamp: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
            read: false
          }
        ]);
      }
    } else {
      // Add some sample notifications for demo
      setNotifications([
        {
          id: 'sample-1',
          type: 'dsar',
          category: 'urgent',
          title: 'New DSAR Request',
          message: 'Customer John Doe has submitted a data deletion request.',
          timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
          read: false
        },
        {
          id: 'sample-2',
          type: 'preference',
          category: 'info',
          title: 'Preference Updated',
          message: 'Customer updated marketing preferences.',
          timestamp: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
          read: false
        }
      ]);
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('consentHub_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);
    
    // Emit custom event for real-time updates
    window.dispatchEvent(new CustomEvent('notification:added', { 
      detail: newNotification 
    }));
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    ));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notification => ({
      ...notification,
      read: true
    })));
  }, []);

  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const getNotificationsByType = useCallback((type: Notification['type']) => {
    return notifications.filter(notification => notification.type === type);
  }, [notifications]);

  const getNotificationsByCategory = useCallback((category: Notification['category']) => {
    return notifications.filter(notification => notification.category === category);
  }, [notifications]);

  const unreadCount = notifications.filter(notification => !notification.read).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications,
    getNotificationsByType,
    getNotificationsByCategory,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};