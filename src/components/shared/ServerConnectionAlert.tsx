import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  AlertTriangle,
  RefreshCw,
  X
} from 'lucide-react';
interface ServerConnectionAlertProps {
  onClose?: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
}
const ServerConnectionAlert: React.FC<ServerConnectionAlertProps> = ({ 
  onClose, 
  autoHide = true, 
  autoHideDelay = 5000 
}) => {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'failed' | 'retrying'>('testing');
  const [isVisible, setIsVisible] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const BACKEND_URL = import.meta.env.VITE_GATEWAY_API_URL || 'http://localhost:3001';
  const MAX_RETRIES = 3;
  // Keep a ref to the AbortController so we can cancel on unmount
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const testServerConnection = useCallback(async (attempt = 1) => {
    // Cancel any previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    try {
      setConnectionStatus(attempt === 1 ? 'testing' : 'retrying');
      setErrorMessage('');
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      // Try health/lightweight endpoints first to avoid noisy 401s in the console,
      // then fall back to authenticated routes (a 401 still proves the server is alive).
      const endpoints = [
        '/api/health',     // Preferred: unauthenticated health endpoint
        '/health',         // Alternative health endpoint
        '/api/v1/health',  // Versioned health endpoint
        '/',               // Root endpoint
        '/api/v1/consent', // Falls back to an authenticated route — 401 = server alive
        '/api/v1/party',   // Additional authenticated fallback
      ];
      let lastError = null;
      let connected = false;
      for (const endpoint of endpoints) {
        if (controller.signal.aborted) break;
        try {
          const response = await fetch(`${BACKEND_URL}${endpoint}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal
          });
          // Any response under 500 (including 401 Unauthorized) means the server is alive
          if (response.status < 500) {
            connected = true;
            setConnectionStatus('connected');
            setRetryCount(0);
            if (autoHide) {
              hideTimerRef.current = setTimeout(() => setIsVisible(false), autoHideDelay);
            }
            break;
          }
        } catch (endpointError) {
          // Ignore abort errors mid-loop; rethrow so the outer catch handles them
          if ((endpointError as Error).name === 'AbortError') throw endpointError;
          lastError = endpointError;
        }
      }
      clearTimeout(timeoutId);
      if (!connected && !controller.signal.aborted) {
        throw lastError || new Error('All health check endpoints failed');
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') return; // Unmounted or superseded — ignore
      let errorMsg = 'Connection failed';
      if (error instanceof Error) {
        if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
          errorMsg = 'Network error - server may be offline';
        } else if (error.message.includes('CORS')) {
          errorMsg = 'CORS error - server is running but not configured for this domain';
        } else {
          errorMsg = error.message;
        }
      }
      setErrorMessage(errorMsg);
      if (attempt < MAX_RETRIES) {
        setRetryCount(attempt);
        retryTimerRef.current = setTimeout(() => testServerConnection(attempt + 1), 3000 * attempt);
      } else {
        setConnectionStatus('failed');
        setRetryCount(MAX_RETRIES);
      }
    }
  }, [BACKEND_URL, autoHide, autoHideDelay]);
  const handleManualRetry = () => {
    setRetryCount(0);
    testServerConnection(1);
  };
  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };
  useEffect(() => {
    testServerConnection(1);
    // Cleanup: cancel in-flight requests and pending timers on unmount
    return () => {
      abortControllerRef.current?.abort();
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [testServerConnection]);
  if (!isVisible) return null;
  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'testing':
        return {
          icon: <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          title: 'Testing Server Connection...',
          message: 'Connecting to ConsentHub Backend...'
        };
      case 'retrying':
        return {
          icon: <RefreshCw className="w-5 h-5 text-yellow-700 animate-spin" />,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          title: `Retrying Connection (${retryCount}/${MAX_RETRIES})`,
          message: 'Render server is starting up, this may take 30-60 seconds...'
        };
      case 'connected':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-700" />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          title: 'Server Connected Successfully!',
          message: 'ConsentHub backend is online and responding'
        };
        case 'failed':
        return {
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          title: 'Server Connection Failed',
          message: errorMessage || 'Unable to reach ConsentHub backend server'
        };
      default:
        return {
          icon: <AlertTriangle className="w-5 h-5 text-gray-600" />,
          bgColor: 'bg-white border border-slate-200',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          title: 'Unknown Status',
          message: 'Please refresh the page'
        };
    }
  };
  const config = getStatusConfig();
  return (
    <div className={`fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 ${config.bgColor} ${config.borderColor} border rounded-lg shadow-lg p-4 transition-all duration-300 ease-in-out`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-medium ${config.textColor} truncate`}>
            {config.title}
          </h3>
          <p className={`text-xs ${config.textColor} opacity-80 mt-1 break-words`}>
            {config.message}
          </p>
          {connectionStatus === 'failed' && (
            <div className="mt-3 flex flex-col space-y-2">
              <button
                onClick={handleManualRetry}
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry Connection
              </button>
              <span className="text-xs text-red-600 opacity-60">
                Render free servers sleep after inactivity and take 30-60s to wake up
              </span>
            </div>
          )}
        </div>
        <button aria-label="Close"
          onClick={handleClose}
          className="flex-shrink-0 p-1 hover:bg-gray-200 rounded-md transition-colors"
        >
          <X className="w-4 h-4 text-slate-500 hover:text-gray-600" />
        </button>
      </div>
      {/* Progress bar for testing/retrying states */}
      {(connectionStatus === 'testing' || connectionStatus === 'retrying') && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '60%' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ServerConnectionAlert;
