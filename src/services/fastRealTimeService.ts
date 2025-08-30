// Fast Real-time Service using rapid polling
import { apiClient } from './apiClient';

export class FastRealTimeService {
  private pollingInterval: NodeJS.Timeout | null = null;
  private callbacks: ((data: any) => void)[] = [];
  private isActive = false;
  private lastUpdateTimestamp: number = 0;

  constructor() {
    console.log('Fast Real-time Service initialized');
  }

  // Start rapid polling every 2 seconds
  start(callback: (data: any) => void): void {
    console.log('Starting fast real-time updates (2-second polling)');
    
    this.callbacks.push(callback);
    this.isActive = true;
    
    // Immediate first check
    this.checkForUpdates();
    
    // Set up rapid polling
    this.pollingInterval = setInterval(() => {
      if (this.isActive) {
        this.checkForUpdates();
      }
    }, 2000); // Check every 2 seconds for near-real-time updates
  }

  private async checkForUpdates(): Promise<void> {
    try {
      console.log('Fast polling: Checking for DSAR updates...');
      
      // Use the proper API client which handles authentication automatically
      const response = await apiClient.get<{ requests: any[] }>('/api/v1/customer/dsar');

      if (response.data && response.data.requests) {
        const currentTimestamp = Date.now();
        
        // Look for recent updates (within last 30 seconds)
        const recentUpdates = response.data.requests.filter((request: any) => {
          const updatedAt = new Date(request.updatedAt || request.createdAt).getTime();
          return updatedAt > (currentTimestamp - 30000); // Last 30 seconds
        });

        // Only notify if we have updates and some time has passed since last check
        if (recentUpdates.length > 0 && currentTimestamp > this.lastUpdateTimestamp + 5000) {
          console.log('Fast polling detected updates:', recentUpdates.length, 'recent changes');
          
          // Notify all callbacks
          this.callbacks.forEach(callback => {
            callback({
              type: 'dsar_updates',
              data: { requests: response.data.requests },
              recentUpdates: recentUpdates,
              timestamp: new Date().toISOString()
            });
          });
        }

        this.lastUpdateTimestamp = currentTimestamp;
      }
    } catch (error) {
      console.log('Fast polling API error:', error);
    }
  }

  stop(): void {
    console.log('Stopping fast real-time updates');
    this.isActive = false;
    
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    this.callbacks = [];
  }

  getStatus(): { connected: boolean; method: string; interval: string } {
    return {
      connected: this.isActive,
      method: 'Fast Polling',
      interval: '2 seconds'
    };
  }
}

export default new FastRealTimeService();
