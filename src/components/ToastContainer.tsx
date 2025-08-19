import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: number;
}

interface ToastNotificationProps {
  message: ToastMessage;
  onDismiss: (id: string) => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ message, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss(message.id), 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [message.id, onDismiss]);

  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-myslt-primary" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (message.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-myslt-service-card border-gray-200';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`
        ${getBackgroundColor()} 
        border rounded-lg p-4 shadow-lg transition-all duration-300 ease-in-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
    >
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-myslt-text-primary">
            {message.message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onDismiss(message.id), 300);
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleAlert = (event: CustomEvent) => {
      const { message, type } = event.detail;
      const newToast: ToastMessage = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        message,
        type,
        timestamp: Date.now()
      };
      
      setToasts(prev => [...prev, newToast]);
    };

    window.addEventListener('dashboard-alert', handleAlert as EventListener);
    
    return () => {
      window.removeEventListener('dashboard-alert', handleAlert as EventListener);
    };
  }, []);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          message={toast}
          onDismiss={dismissToast}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
