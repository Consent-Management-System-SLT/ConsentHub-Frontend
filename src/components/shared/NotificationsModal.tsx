import React from 'react';
import { createPortal } from 'react-dom';
import { Bell, X, CheckCircle, AlertCircle, Info, Trash2 } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_STYLES: Record<string, { icon: React.ReactNode; chip: string }> = {
  urgent: { icon: <AlertCircle className="w-4 h-4 text-red-600" />, chip: 'bg-red-100 text-red-800' },
  warning: { icon: <AlertCircle className="w-4 h-4 text-amber-700" />, chip: 'bg-amber-100 text-amber-800' },
  success: { icon: <CheckCircle className="w-4 h-4 text-green-700" />, chip: 'bg-green-100 text-green-800' },
  info: { icon: <Info className="w-4 h-4 text-blue-600" />, chip: 'bg-blue-100 text-blue-800' },
};

const timeAgo = (timestamp: string) => {
  const diff = Date.now() - new Date(timestamp).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(diff / 3600000);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(diff / 86400000);
  if (d < 7) return `${d}d ago`;
  return new Date(timestamp).toLocaleDateString();
};

/**
 * Notifications, opened from the account menu.
 *
 * Rendered through a portal: the header is a flex item carrying a z-index, so
 * anything nested inside it is trapped in that stacking context and would be
 * painted underneath the navigation rail.
 */
const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();

  if (!isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Notifications"
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-4 sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-semibold text-white bg-red-600 rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-700 hover:text-blue-800 font-medium px-2 py-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* only this region scrolls */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {notifications.length === 0 ? (
            <div className="py-14 text-center">
              <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" aria-hidden="true" />
              <p className="text-slate-700 font-medium">No notifications</p>
              <p className="text-slate-500 text-sm mt-1">You're all caught up.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-200">
              {notifications.map((n) => {
                const style = CATEGORY_STYLES[n.category] || CATEGORY_STYLES.info;
                return (
                  <li
                    key={n.id}
                    className={`group px-5 py-4 hover:bg-slate-50 transition-colors ${
                      !n.read ? 'border-l-4 border-l-blue-600 bg-blue-50/40' : 'border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="shrink-0 mt-0.5" aria-hidden="true">{style.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <button
                            onClick={() => markAsRead(n.id)}
                            className="text-left text-sm font-medium text-slate-900 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
                          >
                            {n.title}
                            {!n.read && <span className="sr-only"> (unread)</span>}
                          </button>
                          <button
                            onClick={() => removeNotification(n.id)}
                            aria-label={`Dismiss ${n.title}`}
                            className="shrink-0 p-1.5 rounded text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{n.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${style.chip}`}>
                            {n.category}
                          </span>
                          <span className="text-xs text-slate-500">{timeAgo(n.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default NotificationsModal;
