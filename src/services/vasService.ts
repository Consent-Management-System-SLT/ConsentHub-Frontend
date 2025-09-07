// VAS (Value Added Services) API service
import { customerApi } from './multiServiceApiClient';

export interface VASService {
  id: string;
  name: string;
  provider: string;
  description: string;
  price: number;
  category: string;
  status: 'active' | 'inactive';
  isSubscribed?: boolean;
}

export interface VASSubscription {
  serviceId: string;
  action: 'subscribe' | 'unsubscribe';
}

export interface VASResponse {
  success: boolean;
  data: VASService[];
  message?: string;
}

export interface VASToggleResponse {
  success: boolean;
  data: {
    serviceId: string;
    serviceName: string;
    isSubscribed: boolean;
    action: string;
    timestamp: string;
    subscriptionId?: string;
    subscriptionHistory?: any[];
  };
  message?: string;
}

class VASServiceAPI {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    console.log('VAS Auth Debug: Token from localStorage:', token ? `${token.substring(0, 50)}...` : 'No token found');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Fetch all available VAS services for customer
   */
  async getVASServices(): Promise<VASResponse> {
    try {
      const response = await customerApi.get('/api/customer/vas/services', {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch VAS services:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch VAS services');
    }
  }

  /**
   * Toggle VAS subscription (subscribe/unsubscribe)
   */
  async toggleVASSubscription(serviceId: string, action: 'subscribe' | 'unsubscribe'): Promise<VASToggleResponse> {
    try {
      console.log(`VAS API: Starting ${action} request for service ${serviceId}`);
      console.log(`VAS API: Request URL: /api/customer/vas/services/${serviceId}/toggle`);
      console.log(`VAS API: Headers:`, this.getAuthHeaders());
      console.log(`VAS API: Body:`, { action });
      
      const response = await customerApi.post(`/api/customer/vas/services/${serviceId}/toggle`, {
        action
      }, {
        headers: this.getAuthHeaders()
      });
      
      console.log(`VAS API: Raw response:`, response);
      console.log(`VAS API: Response type:`, typeof response);
      console.log(`VAS API: Response keys:`, Object.keys(response || {}));
      
      // Check if the response is an error object from interceptor
      if (response && typeof response === 'object' && (response as any).error === true) {
        console.error(`VAS API: Interceptor error response:`, response);
        const errorMsg = (response as any).message || `Failed to ${action.toLowerCase()} VAS service`;
        console.error(`VAS API: Throwing error:`, errorMsg);
        throw new Error(errorMsg);
      }
      
      // Check if response has error property but error is not true (could be string or other value)
      if (response && typeof response === 'object' && (response as any).error) {
        console.error(`VAS API: Response has error property:`, (response as any).error);
        const errorMsg = (response as any).message || (response as any).error || `Failed to ${action.toLowerCase()} VAS service`;
        console.error(`VAS API: Throwing error from error property:`, errorMsg);
        throw new Error(errorMsg);
      }
      
      // Check if response indicates failure
      if (response && typeof response === 'object' && (response as any).success === false) {
        console.error(`VAS API: Response indicates failure:`, response);
        const errorMsg = (response as any).message || `Failed to ${action.toLowerCase()} VAS service`;
        console.error(`VAS API: Throwing error from success=false:`, errorMsg);
        throw new Error(errorMsg);
      }
      
      // Handle normal axios response
      if (response && (response as any).data) {
        console.log(`VAS API: Success response data:`, (response as any).data);
        return (response as any).data as VASToggleResponse;
      }
      
      // Handle interceptor success response (response is already the data)
      console.log(`VAS API: Interceptor success response:`, response);
      
      // Check if this is the actual subscription data (from backend)
      if (response && typeof response === 'object' && 
          (response as any).serviceId && (response as any).action) {
        console.log(`VAS API: Direct subscription data response`);
        // Wrap the subscription data in the expected format
        return {
          success: true,
          data: response as any,
          message: 'Successfully processed subscription'
        } as VASToggleResponse;
      }
      
      return response as unknown as VASToggleResponse;
    } catch (error: any) {
      console.error(`VAS API: Failed to ${action.toLowerCase()} VAS service:`, {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL
        }
      });
      
      const errorMessage = error.response?.data?.message || error.message || `Failed to ${action.toLowerCase()} VAS service`;
      throw new Error(errorMessage);
    }
  }

  /**
   * Get VAS subscription history for customer
   */
  async getVASHistory(): Promise<any> {
    try {
      const response = await customerApi.get('/api/customer/vas/history', {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch VAS history:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch VAS history');
    }
  }
}

// Export singleton instance
export const vasService = new VASServiceAPI();
export default vasService;
