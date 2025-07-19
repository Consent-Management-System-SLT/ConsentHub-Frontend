// Customer-specific API Client for ConsentHub
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface CustomerApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface CustomerApiError {
  error: string;
  message?: string;
  details?: any;
}

class CustomerApiClient {
  private axiosInstance: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_CUSTOMER_API_URL || 'http://localhost:3011';
    
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add correlation ID for tracing
        config.headers['X-Correlation-ID'] = this.generateCorrelationId();
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private getAuthToken(): string | null {
    // Try to get token from localStorage first
    const token = localStorage.getItem('authToken');
    if (token) {
      return token;
    }
    
    // Fallback to legacy token storage
    return localStorage.getItem('authToken');
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleError(error: any): CustomerApiError {
    if (error.response) {
      // Server responded with error status
      return {
        error: error.response.data?.error || 'An error occurred',
        message: error.response.data?.message,
        details: error.response.data?.details,
      };
    } else if (error.request) {
      // Request was made but no response
      return {
        error: 'Network error - please check your connection',
      };
    } else {
      // Something else happened
      return {
        error: error.message || 'An unexpected error occurred',
      };
    }
  }

  // Generic request method
  async request<T>(config: AxiosRequestConfig): Promise<CustomerApiResponse<T>> {
    try {
      const response = await this.axiosInstance.request<CustomerApiResponse<T>>(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // GET request
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<CustomerApiResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  // POST request
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<CustomerApiResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  // PUT request
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<CustomerApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  // DELETE request
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<CustomerApiResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  // Dashboard APIs - Using available backend endpoints
  async getDashboardOverview() {
    // Since backend doesn't have customer dashboard, aggregate from available endpoints
    try {
      const [consents, preferences, dsarRequests] = await Promise.all([
        this.get<any>('/api/v1/consent'),
        this.get<any>('/api/v1/preference'),
        this.get<any>('/api/v1/dsar/dsarRequest')
      ]);
      
      return {
        success: true,
        data: {
          consents: consents.data || [],
          preferences: preferences.data || [],
          dsarRequests: dsarRequests.data || []
        }
      };
    } catch (error) {
      return {
        success: false,
        data: { consents: [], preferences: [], dsarRequests: [] },
        message: 'Dashboard data unavailable'
      };
    }
  }

  async getCustomerProfile() {
    // Use party endpoint for profile data
    return this.get<any>('/api/v1/party/party');
  }

  async updateCustomerProfile(data: any) {
    // Use party endpoint for profile updates
    return this.put<any>('/api/v1/party/party', data);
  }

  async getActivityHistory(params?: { page?: number; limit?: number }) {
    // Use event endpoint for activity history
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    return this.get<any>(`/api/v1/event?${queryParams.toString()}`);
  }

  async getCustomerSummary() {
    // Aggregate summary from available endpoints
    return this.getDashboardOverview();
  }

  // Consent APIs
  async getConsents(params?: { page?: number; limit?: number; status?: string; purpose?: string; consentType?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.purpose) queryParams.append('purpose', params.purpose);
    if (params?.consentType) queryParams.append('consentType', params.consentType);
    
    return this.get<any>(`/api/v1/consent?${queryParams.toString()}`);
  }

  async getConsentById(id: string) {
    return this.get<any>(`/api/v1/consent/${id}`);
  }

  async grantConsent(data: any) {
    return this.post<any>('/api/v1/consent', data);
  }

  async revokeConsent(id: string) {
    return this.post<any>(`/api/v1/consent/${id}/revoke`);
  }

  async getConsentHistory(id: string) {
    return this.get<any>(`/api/v1/consent/${id}/history`);
  }

  async getConsentSummary() {
    return this.get<any>('/api/v1/consent/summary');
  }

  // Preference APIs
  async getPreferences(params?: { page?: number; limit?: number; preferenceType?: string; channelType?: string; isAllowed?: boolean }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.preferenceType) queryParams.append('preferenceType', params.preferenceType);
    if (params?.channelType) queryParams.append('channelType', params.channelType);
    if (params?.isAllowed !== undefined) queryParams.append('isAllowed', params.isAllowed.toString());
    
    return this.get<any>(`/api/v1/preference?${queryParams.toString()}`);
  }

  async getPreferenceById(id: string) {
    return this.get<any>(`/api/v1/preference/${id}`);
  }

  async createOrUpdatePreference(data: any) {
    return this.post<any>('/api/v1/preference', data);
  }

  async updatePreference(id: string, data: any) {
    return this.put<any>(`/api/v1/preference/${id}`, data);
  }

  async deletePreference(id: string) {
    return this.delete<any>(`/api/v1/preference/${id}`);
  }

  async getPreferenceSummary() {
    return this.get<any>('/api/v1/preference/summary');
  }

  async getPreferencesByChannel() {
    return this.get<any>('/api/v1/preference/by-channel');
  }

  // DSAR APIs
  async getDSARRequests(params?: { page?: number; limit?: number; status?: string; requestType?: string; category?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.requestType) queryParams.append('requestType', params.requestType);
    if (params?.category) queryParams.append('category', params.category);
    
    return this.get<any>(`/api/v1/dsar/dsarRequest?${queryParams.toString()}`);
  }

  async getDSARRequestById(id: string) {
    return this.get<any>(`/api/v1/dsar/dsarRequest/${id}`);
  }

  async createDSARRequest(data: any) {
    return this.post<any>('/api/v1/dsar/dsarRequest', data);
  }

  async cancelDSARRequest(id: string, reason: string) {
    return this.post<any>(`/api/v1/dsar/dsarRequest/${id}/cancel`, { reason });
  }

  async getDSARRequestHistory(id: string) {
    return this.get<any>(`/api/v1/dsar/dsarRequest/${id}/history`);
  }

  async getDSARRequestSummary() {
    return this.get<any>('/api/v1/dsar/dsarRequest/summary');
  }

  async getDSARRequestTypes() {
    return this.get<any>('/api/v1/dsar/dsarRequest/types');
  }
}

export const customerApiClient = new CustomerApiClient();
export default customerApiClient;
