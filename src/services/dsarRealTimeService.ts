class DSARRealTimeService {
  private eventSource: EventSource | null = null;
  private callbacks: Map<string, (data: any) => void> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.connect();
  }

  connect() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.warn('No auth token found for real-time connection');
        return;
      }

      // Close existing connection
      if (this.eventSource) {
        this.eventSource.close();
      }

      console.log('Establishing real-time DSAR updates connection...');

      // Create new EventSource connection
      this.eventSource = new EventSource(
        `http://localhost:3001/api/v1/dsar/updates/stream?token=${encodeURIComponent(token)}`
      );

      this.eventSource.onopen = () => {
        console.log('Real-time DSAR connection established');
        this.reconnectAttempts = 0;
        
        // Clear any pending reconnection
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = null;
        }
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received real-time update:', data);

          // Handle different types of updates
          switch (data.type) {
            case 'connected':
              console.log('Real-time connection confirmed');
              break;

            case 'dsar_status_update':
              console.log(`DSAR Status Update: ${data.oldStatus} → ${data.newStatus}`);
              this.notifyCallbacks('status_update', data);
              break;

            default:
              console.log('Unknown update type:', data.type);
          }
        } catch (error) {
          console.error('Failed to parse real-time update:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('Real-time connection error:', error);
        this.handleConnectionError();
      };

    } catch (error) {
      console.error('Failed to establish real-time connection:', error);
      this.handleConnectionError();
    }
  }

  private handleConnectionError() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    // Attempt reconnection with exponential backoff
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = Math.pow(2, this.reconnectAttempts) * 1000; // 1s, 2s, 4s, 8s, 16s
      console.log(`Attempting reconnection in ${delay / 1000}s (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
      
      this.reconnectTimeout = setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached. Real-time updates disabled.');
    }
  }

  // Subscribe to real-time updates
  onStatusUpdate(callback: (data: any) => void) {
    this.callbacks.set('status_update', callback);
  }

  // Remove callback
  off(type: string) {
    this.callbacks.delete(type);
  }

  // Notify all registered callbacks
  private notifyCallbacks(type: string, data: any) {
    const callback = this.callbacks.get(type);
    if (callback) {
      callback(data);
    }
  }

  // Disconnect and cleanup
  disconnect() {
    console.log('Disconnecting real-time updates...');
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.callbacks.clear();
    this.reconnectAttempts = 0;
  }

  // Check if connected
  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }

  // Get connection status
  getConnectionStatus(): string {
    if (!this.eventSource) return 'disconnected';
    
    switch (this.eventSource.readyState) {
      case EventSource.CONNECTING:
        return 'connecting';
      case EventSource.OPEN:
        return 'connected';
      case EventSource.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }
}

// Create singleton instance
export const dsarRealTimeService = new DSARRealTimeService();

// Export the class as well for testing
export { DSARRealTimeService };
