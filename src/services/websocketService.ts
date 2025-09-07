import { io, Socket } from 'socket.io-client';

export interface ConsentUpdateEvent {
  type: 'granted' | 'revoked';
  consent: any;
  timestamp: Date;
  user: {
    id: string;
    email: string;
  };
}

export interface PreferenceUpdateEvent {
  customerId: string;
  preferences: any;
  updatedBy: string;
  timestamp: string;
  source: 'customer' | 'csr';
}

export interface VASSubscriptionUpdate {
  type: string;
  customerId: string;
  customerEmail: string;
  serviceId: string;
  serviceName: string;
  isSubscribed: boolean;
  action: string;
  timestamp: string;
  subscriptionId: string;
}

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private customerId: string | null = null;

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      // Use environment variable for WebSocket URL, fallback to localhost
      const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3001';
      
      this.socket = io(wsUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionDelay: this.reconnectDelay,
        reconnectionAttempts: this.maxReconnectAttempts,
        // Add CORS configuration for cross-origin connections
        withCredentials: false,
        forceNew: true
      });

      this.socket.on('connect', () => {
        console.log(`Connected to WebSocket server at ${wsUrl}`);
        console.log('Socket ID:', this.socket?.id);
        console.log('Socket connected:', this.socket?.connected);
        this.reconnectAttempts = 0;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from WebSocket server:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('Max reconnection attempts reached');
        }
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('Reconnected to WebSocket server after', attemptNumber, 'attempts');
        this.reconnectAttempts = 0;
      });

    } catch (error) {
      console.error('Failed to initialize WebSocket connection:', error);
    }
  }

  // Join CSR dashboard room to receive real-time updates
  joinCSRDashboard(): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('join-csr-dashboard');
      console.log('Joined CSR dashboard room for real-time updates');
      console.log('Socket status:', this.socket.connected ? 'Connected' : 'Disconnected');
    } else {
      console.warn('Cannot join CSR dashboard - WebSocket not connected');
      console.log('Socket status:', this.socket ? (this.socket.connected ? 'Connected' : 'Disconnected') : 'Not initialized');
    }
  }

  // Leave CSR dashboard room
  leaveCSRDashboard(): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('leave-csr-dashboard');
      console.log('Left CSR dashboard room');
    }
  }

  // Listen for consent updates
  onConsentUpdate(callback: (event: ConsentUpdateEvent) => void): void {
    if (this.socket) {
      console.log('Setting up consent-updated listener');
      this.socket.on('consent-updated', (event: ConsentUpdateEvent) => {
        console.log('Received real-time consent update:', event);
        console.log('Event type:', event.type);
        console.log('Consent ID:', event.consent?.id);
        console.log('User email:', event.user?.email);
        callback(event);
      });
    } else {
      console.error('Cannot set up consent listener - WebSocket not initialized');
    }
  }

  // Remove consent update listener
  offConsentUpdate(): void {
    if (this.socket) {
      this.socket.off('consent-updated');
    }
  }

  // Listen for customer preference updates (when customer updates their own preferences)
  onCustomerPreferenceUpdate(callback: (event: PreferenceUpdateEvent) => void): void {
    if (this.socket) {
      console.log('Setting up customerPreferencesUpdated listener for CSR dashboard');
      this.socket.on('customerPreferencesUpdated', (event: PreferenceUpdateEvent) => {
        console.log('Received real-time customer preference update:', event);
        console.log('Customer ID:', event.customerId);
        console.log('Updated by:', event.updatedBy);
        console.log('Source:', event.source);
        callback(event);
      });
    } else {
      console.error('Cannot set up customer preference listener - WebSocket not initialized');
    }
  }

  // Remove customer preference update listener
  offCustomerPreferenceUpdate(): void {
    if (this.socket) {
      this.socket.off('customerPreferencesUpdated');
    }
  }

  // Listen for CSR preference updates (when CSR updates customer preferences)
  onCSRPreferenceUpdate(callback: (event: PreferenceUpdateEvent) => void): void {
    if (this.socket) {
      console.log('Setting up csrPreferencesUpdated listener for customer dashboard');
      this.socket.on('csrPreferencesUpdated', (event: PreferenceUpdateEvent) => {
        console.log('Received real-time CSR preference update:', event);
        console.log('Customer ID:', event.customerId);
        console.log('Updated by:', event.updatedBy);
        console.log('Source:', event.source);
        callback(event);
      });
    } else {
      console.error('Cannot set up CSR preference listener - WebSocket not initialized');
    }
  }

  // Remove CSR preference update listener
  offCSRPreferenceUpdate(): void {
    if (this.socket) {
      this.socket.off('csrPreferencesUpdated');
    }
  }

  // VAS WEBSOCKET METHODS - Real-time subscription updates
  
  // Join customer room for VAS updates
  joinCustomerRoom(customerId: string): void {
    if (this.socket && this.socket.connected) {
      this.customerId = customerId;
      this.socket.emit('join-customer-room', customerId);
      console.log('WebSocket: Joining customer room for VAS updates:', customerId);
    } else {
      console.warn('WebSocket: Cannot join customer room - not connected');
    }
  }

  // Leave customer room
  leaveCustomerRoom(): void {
    if (this.socket && this.customerId) {
      this.socket.emit('leave-customer-room', this.customerId);
      console.log('WebSocket: Leaving customer room:', this.customerId);
      this.customerId = null;
    }
  }

  // Authenticate customer for VAS updates
  authenticateCustomer(customerId: string, token?: string): void {
    if (this.socket && this.socket.connected) {
      this.customerId = customerId;
      this.socket.emit('authenticate-customer', { customerId, token });
      console.log('WebSocket: Authenticating customer:', customerId);
    } else {
      console.warn('WebSocket: Cannot authenticate - not connected');
    }
  }

  // Listen for VAS subscription updates
  onVASUpdate(callback: (event: VASSubscriptionUpdate) => void): void {
    if (this.socket) {
      console.log('WebSocket: Setting up VAS subscription update listener');
      
      this.socket.on('vasSubscriptionUpdate', (event: VASSubscriptionUpdate) => {
        console.log('WebSocket: Received VAS subscription update:', event);
        console.log('   - Service:', event.serviceName);
        console.log('   - Action:', event.action);
        console.log('   - Status:', event.isSubscribed ? 'SUBSCRIBED' : 'UNSUBSCRIBED');
        callback(event);
      });

      // Also listen for room join confirmations
      this.socket.on('room-joined', (data) => {
        console.log('WebSocket: Room joined successfully:', data);
      });

      this.socket.on('authentication-success', (data) => {
        console.log('WebSocket: Customer authentication successful:', data);
      });

      this.socket.on('authentication-failed', (data) => {
        console.error('WebSocket: Customer authentication failed:', data);
      });
    } else {
      console.error('WebSocket: Cannot set up VAS listener - not initialized');
    }
  }

  // Remove VAS update listener
  offVASUpdate(): void {
    if (this.socket) {
      this.socket.off('vasSubscriptionUpdate');
      this.socket.off('room-joined');
      this.socket.off('authentication-success');
      this.socket.off('authentication-failed');
      console.log('WebSocket: Removed VAS update listeners');
    }
  }

  // CSR VAS WEBSOCKET METHODS - Real-time VAS updates for CSR dashboard
  
  // Listen for VAS updates on CSR dashboard (all customer VAS changes)
  onCSRVASUpdate(callback: (event: VASSubscriptionUpdate) => void): void {
    if (this.socket) {
      console.log('WebSocket: Setting up CSR VAS subscription update listener');
      
      this.socket.on('csrVasUpdate', (event: VASSubscriptionUpdate) => {
        console.log('WebSocket: Received CSR VAS subscription update:', event);
        console.log('   - Customer:', event.customerEmail);
        console.log('   - Service:', event.serviceName);
        console.log('   - Action:', event.action);
        console.log('   - Status:', event.isSubscribed ? 'SUBSCRIBED' : 'UNSUBSCRIBED');
        callback(event);
      });
    } else {
      console.error('WebSocket: Cannot set up CSR VAS listener - not initialized');
    }
  }

  // Remove CSR VAS update listener
  offCSRVASUpdate(): void {
    if (this.socket) {
      this.socket.off('csrVasUpdate');
      console.log('WebSocket: Removed CSR VAS update listeners');
    }
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket ? this.socket.connected : false;
  }

  // Get connection status
  getConnectionStatus(): string {
    if (!this.socket) return 'not-initialized';
    if (this.socket.connected) return 'connected';
    if (this.socket.disconnected) return 'disconnected';
    return 'connecting';
  }

  // Disconnect
  disconnect(): void {
    if (this.socket) {
      this.leaveCSRDashboard();
      this.leaveCustomerRoom();
      this.offVASUpdate();
      this.offCSRVASUpdate();
      this.socket.disconnect();
      this.socket = null;
      this.customerId = null;
    }
  }

  // Reconnect manually
  reconnect(): void {
    if (this.socket) {
      this.socket.connect();
    } else {
      this.connect();
    }
  }
}

// Create singleton instance
export const websocketService = new WebSocketService();
export default websocketService;
