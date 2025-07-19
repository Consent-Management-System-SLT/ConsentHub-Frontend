// Multi-service API client configuration for ConsentHub
import axios, { AxiosInstance } from 'axios';

// Service configurations
const SERVICES = {
  CUSTOMER: import.meta.env.VITE_CUSTOMER_API_URL || 'https://consenthub-backend.onrender.com/api/v1',
  CSR: import.meta.env.VITE_CSR_API_URL || 'https://consenthub-backend.onrender.com/api/v1', 
  GATEWAY: import.meta.env.VITE_GATEWAY_API_URL || 'https://consenthub-backend.onrender.com',
  CONSENT: import.meta.env.VITE_CONSENT_API_URL || 'https://consenthub-backend.onrender.com/api/v1/consent',
  PREFERENCE: import.meta.env.VITE_PREFERENCE_API_URL || 'https://consenthub-backend.onrender.com/api/v1/preference',
  PRIVACY_NOTICE: import.meta.env.VITE_PRIVACY_NOTICE_API_URL || 'https://consenthub-backend.onrender.com/api/v1/privacy-notice',
  PARTY: import.meta.env.VITE_PARTY_API_URL || 'https://consenthub-backend.onrender.com/api/v1/party',
  DSAR: import.meta.env.VITE_DSAR_API_URL || 'https://consenthub-backend.onrender.com/api/v1/dsar',
  EVENT: import.meta.env.VITE_EVENT_API_URL || 'https://consenthub-backend.onrender.com/api/v1/event',
};

// Service-specific API clients
export const customerApi = axios.create({
  baseURL: SERVICES.CUSTOMER,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer customer-demo-token-123'
  }
});

export const csrApi = axios.create({
  baseURL: SERVICES.CSR,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer csr-demo-token-123'
  }
});

export const adminApi = axios.create({
  baseURL: SERVICES.GATEWAY,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer admin-demo-token-123'
  }
});

// Specific service APIs for Admin/CSR dashboards - Route through API Gateway
export const consentApi = axios.create({
  baseURL: SERVICES.GATEWAY,
  timeout: 30000, // Increased timeout to prevent ECONNABORTED errors
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer admin-demo-token-123'
  }
});

export const preferenceApi = axios.create({
  baseURL: SERVICES.GATEWAY,
  timeout: 30000, // Increased timeout
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer admin-demo-token-123'
  }
});

export const privacyNoticeApi = axios.create({
  baseURL: SERVICES.GATEWAY,
  timeout: 30000, // Increased timeout
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer admin-demo-token-123'
  }
});

export const partyApi = axios.create({
  baseURL: SERVICES.GATEWAY,
  timeout: 30000, // Increased timeout
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer admin-demo-token-123'
  }
});

export const dsarApi = axios.create({
  baseURL: SERVICES.GATEWAY,
  timeout: 30000, // Increased timeout
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer admin-demo-token-123'
  }
});

export const eventApi = axios.create({
  baseURL: SERVICES.GATEWAY,
  timeout: 30000, // Increased timeout
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer admin-demo-token-123'
  }
});

// Enhanced API response handler
const handleApiResponse = (response: any) => {
  return response.data;
};

const handleApiError = (error: any) => {
  console.error('API Error:', error);
  return {
    error: true,
    message: error.response?.data?.message || error.message || 'An error occurred',
    status: error.response?.status || 500,
    details: error.response?.data?.details || null
  };
};

// Add response/error interceptors to all APIs
[customerApi, csrApi, adminApi, consentApi, preferenceApi, privacyNoticeApi, partyApi, dsarApi, eventApi].forEach(api => {
  api.interceptors.response.use(handleApiResponse, handleApiError);
});

// Export service endpoints for direct usage
export const SERVICE_ENDPOINTS = SERVICES;

// Role-based API selector with proper typing
export const getApiForRole = (role: string): AxiosInstance => {
  switch (role) {
    case 'customer':
      return customerApi;
    case 'csr':
      return csrApi;
    case 'admin':
      return adminApi;
    default:
      return customerApi;
  }
};

// Multi-Service API Client Class
export class MultiServiceApiClient {
  private customerClient: AxiosInstance;
  private csrClient: AxiosInstance;
  private adminClient: AxiosInstance;
  private consentClient: AxiosInstance;
  private preferenceClient: AxiosInstance;
  private privacyNoticeClient: AxiosInstance;
  private partyClient: AxiosInstance;
  private dsarClient: AxiosInstance;
  private eventClient: AxiosInstance;

  constructor() {
    this.customerClient = customerApi;
    this.csrClient = csrApi;
    this.adminClient = adminApi;
    this.consentClient = consentApi;
    this.preferenceClient = preferenceApi;
    this.privacyNoticeClient = privacyNoticeApi;
    this.partyClient = partyApi;
    this.dsarClient = dsarApi;
    this.eventClient = eventApi;
  }

  // Get API client for role-based requests
  getApiClient(role: string = 'customer'): AxiosInstance {
    switch (role) {
      case 'admin':
        return this.adminClient;
      case 'csr':
        return this.csrClient;
      default:
        return this.customerClient;
    }
  }

  // Service-specific API clients
  getConsentClient(): AxiosInstance {
    return this.consentClient;
  }

  getPreferenceClient(): AxiosInstance {
    return this.preferenceClient;
  }

  getPrivacyNoticeClient(): AxiosInstance {
    return this.privacyNoticeClient;
  }

  getPartyClient(): AxiosInstance {
    return this.partyClient;
  }

  getDsarClient(): AxiosInstance {
    return this.dsarClient;
  }

  getEventClient(): AxiosInstance {
    return this.eventClient;
  }

  // Health check for all services
  async checkAllServicesHealth(): Promise<any> {
    const services = [
      { name: 'Customer', client: this.customerClient },
      { name: 'CSR', client: this.csrClient },
      { name: 'Admin', client: this.adminClient },
      { name: 'Consent', client: this.consentClient },
      { name: 'Preference', client: this.preferenceClient },
      { name: 'Privacy Notice', client: this.privacyNoticeClient },
      { name: 'Party', client: this.partyClient },
      { name: 'DSAR', client: this.dsarClient },
      { name: 'Event', client: this.eventClient }
    ];

    const results: any = {};
    
    for (const service of services) {
      try {
        const response = await service.client.get('/health');
        results[service.name] = {
          status: 'healthy',
          data: response.data
        };
      } catch (error: any) {
        results[service.name] = {
          status: 'error',
          error: error.message
        };
      }
    }

    return results;
  }

  // Generic API request method with role-based routing
  async makeRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    role: string = 'customer',
    service?: string
  ): Promise<any> {
    try {
      let client: AxiosInstance;
      let fullEndpoint: string;
      
      // Choose specific service client if provided
      if (service) {
        // Format endpoint for API Gateway routing
        fullEndpoint = `/api/v1/${service}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
        
        switch (service) {
          case 'consent':
            client = this.consentClient;
            break;
          case 'preference':
            client = this.preferenceClient;
            break;
          case 'privacy-notice':
            client = this.privacyNoticeClient;
            break;
          case 'party':
            client = this.partyClient;
            break;
          case 'dsar':
            client = this.dsarClient;
            break;
          case 'event':
            client = this.eventClient;
            break;
          default:
            client = this.getApiClient(role);
            fullEndpoint = endpoint;
        }
      } else {
        client = this.getApiClient(role);
        fullEndpoint = endpoint;
      }

      console.log(`Making ${method} request to: ${fullEndpoint}`);

      let response;
      switch (method) {
        case 'GET':
          response = await client.get(fullEndpoint);
          break;
        case 'POST':
          response = await client.post(fullEndpoint, data);
          break;
        case 'PUT':
          response = await client.put(fullEndpoint, data);
          break;
        case 'DELETE':
          response = await client.delete(fullEndpoint);
          break;
      }
      
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  }
}

// Create instance for export
export const multiServiceApiClient = new MultiServiceApiClient();

export default {
  customerApi,
  csrApi, 
  adminApi,
  consentApi,
  preferenceApi,
  privacyNoticeApi,
  partyApi,
  dsarApi,
  eventApi,
  SERVICES,
  getApiForRole
};
