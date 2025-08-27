import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { websocketService } from '../../services/websocketService';

interface WebSocketStatusProps {
  className?: string;
}

const WebSocketStatus: React.FC<WebSocketStatusProps> = ({ className = '' }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('connecting');

  useEffect(() => {
    const checkConnection = () => {
      const connected = websocketService.isConnected();
      const status = websocketService.getConnectionStatus();
      
      setIsConnected(connected);
      setConnectionStatus(status);
    };

    // Check immediately
    checkConnection();
    
    // Check every 2 seconds
    const interval = setInterval(checkConnection, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'connecting':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'disconnected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Real-time Updates Active';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Real-time Updates Offline';
      default:
        return 'Initializing...';
    }
  };

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs border ${getStatusColor()} ${className}`}>
      {isConnected ? (
        <Wifi className="w-3 h-3 mr-1" />
      ) : (
        <WifiOff className="w-3 h-3 mr-1" />
      )}
      {getStatusText()}
    </div>
  );
};

export default WebSocketStatus;
