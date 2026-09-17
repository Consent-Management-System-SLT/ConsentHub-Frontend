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
const STORAGE_KEY = 'consentHub_notifications';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  /**
   * Read straight from storage on the first render.
   *
   * This used to load in an effect while a second effect wrote the state back
   * out. Under StrictMode the effects run twice, so the empty initial state was
   * written to storage before the second load read it, and every notification
   * was lost on reload. It also seeded fabricated "DSAR request from John Doe"
   * entries, which look identical to real alerts.
   */
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch {
      /* storage blocked: notifications stay in memory for this session */
    }
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