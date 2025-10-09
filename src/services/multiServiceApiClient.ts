// Multi-service API client configuration for ConsentHub
import axios, { AxiosInstance } from 'axios';
import { logApiRequest, logApiResponse, secureLog } from '../utils/secureLogger';

// Service configurations - Updated for local development
const SERVICES = {
  AUTH: import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3001/api/v1',
  CUSTOMER: import.meta.env.VITE_CUSTOMER_API_URL || 'http://localhost:3001',
  CSR: import.meta.env.VITE_CSR_API_URL || 'http://localhost:3001',
  GATEWAY: import.meta.env.VITE_GATEWAY_API_URL || 'http://localhost:3001',
  CONSENT: import.meta.env.VITE_CONSENT_API_URL || 'http://localhost:3001',
  PREFERENCE: import.meta.env.VITE_PREFERENCE_API_URL || 'http://localhost:3001',
  PRIVACY_NOTICE: import.meta.env.VITE_PRIVACY_NOTICE_API_URL || 'http://localhost:3001',
  DSAR: import.meta.env.VITE_DSAR_API_URL || 'http://localhost:3001',
  PARTY: import.meta.env.VITE_PARTY_API_URL || 'http://localhost:3001',
  EVENT: import.meta.env.VITE_EVENT_API_URL || 'http://localhost:3001',
  CATALOG: import.meta.env.VITE_CATALOG_API_URL || 'http://localhost:3001',
};

// Debug logging for service URLs
secureLog.log('Service URLs Configuration:', SERVICES);

// Service-specific API clients
export const customerApi = axios.create({
  baseURL: SERVICES.CUSTOMER,
  timeout: 30000, // Increased timeout for registration
  headers: {
    'Content-Type': 'application/json'
    // Authorization will be added dynamically in makeRequest
  }
});

export const authApi = axios.create({
  baseURL: SERVICES.AUTH,
  timeout: 30000, // Increased timeout for registration
  headers: {
    'Content-Type': 'application/json'
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
  baseURL: SERVICES.CONSENT,
  timeout: 30000, // Increased timeout to prevent ECONNABORTED errors
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer admin-demo-token-123'
  }
});

export const preferenceApi = axios.create({
  baseURL: SERVICES.PREFERENCE,
  timeout: 30000, // Increased timeout
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer admin-demo-token-123'
  }
});

export const privacyNoticeApi = axios.create({
  baseURL: SERVICES.PRIVACY_NOTICE,
  timeout: 30000, // Increased timeout
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer admin-demo-token-123'
  }
});

export const partyApi = axios.create({
  baseURL: SERVICES.PARTY,
  timeout: 30000, // Increased timeout
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer admin-demo-token-123'
  }
});

export const dsarApi = axios.create({
  baseURL: SERVICES.DSAR,
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

export const catalogApi = axios.create({
  baseURL: SERVICES.CATALOG,
  timeout: 30000, // Increased timeout
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer admin-demo-token-123'
  }
});

// Enhanced API response handler
const handleApiResponse = (response: any) => {
  logApiResponse(response, 'handleApiResponse - Raw response');
  logApiResponse(response.data, 'handleApiResponse - Response data');
  return response.data;
};

const handleApiError = (error: any) => {
  console.error('API Error:', error);
  
  // Extract error information from different response structures
  const errorData = error.response?.data;
  let errorMessage = 'An error occurred';
  let errorCode = null;
  
  if (errorData) {
    if (errorData.error) {
      // Structure: { error: { code: "...", message: "..." } }
      errorMessage = errorData.error.message || errorMessage;
      errorCode = errorData.error.code;
    } else if (errorData.message) {
      // Structure: { message: "..." }
      errorMessage = errorData.message;
    }
  } else {
    errorMessage = error.message || errorMessage;
  }
  
  return {
    error: true,
    message: errorMessage,
    code: errorCode,
    status: error.response?.status || 500,
    details: error.response?.data || null
  };
};

// Add response/error interceptors to all APIs
[authApi, customerApi, csrApi, adminApi, consentApi, preferenceApi, privacyNoticeApi, partyApi, dsarApi, eventApi, catalogApi].forEach(api => {
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
  private catalogClient: AxiosInstance;

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
    this.catalogClient = catalogApi;
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

  getCatalogClient(): AxiosInstance {
    return this.catalogClient;
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
      { name: 'Event', client: this.eventClient },
      { name: 'Catalog', client: this.catalogClient }
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
      
      // Get auth token for authenticated requests
      const token = localStorage.getItem('authToken');
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Choose specific service client if provided
      if (service) {
        switch (service) {
          case 'auth':
            // Auth service - strip /api/v1 prefix since base URL now includes it
            client = authApi;
            fullEndpoint = endpoint.replace('/api/v1', '') || endpoint;
            break;
          case 'csr':
            // CSR service needs full path including /api/v1
            client = this.csrClient;
            fullEndpoint = endpoint;
            break;
          case 'consent':
            // Extract just the path part since clients now have full base URLs
            const pathPartConsent = endpoint.replace('/api/v1', '');
            fullEndpoint = pathPartConsent;
            client = this.consentClient;
            break;
          case 'preference':
            const pathPartPreference = endpoint.replace('/api/v1', '');
            fullEndpoint = pathPartPreference;
            client = this.preferenceClient;
            break;
          case 'privacy-notice':
            const pathPartPrivacy = endpoint.replace('/api/v1', '');
            fullEndpoint = pathPartPrivacy;
            client = this.privacyNoticeClient;
            break;
          case 'party':
            const pathPartParty = endpoint.replace('/api/v1', '');
            fullEndpoint = pathPartParty;
            client = this.partyClient;
            break;
          case 'dsar':
            const pathPartDsar = endpoint.replace('/api/v1', '');
            fullEndpoint = pathPartDsar;
            client = this.dsarClient;
            break;
          case 'event':
            const pathPartEvent = endpoint.replace('/api/v1', '');
            fullEndpoint = pathPartEvent;
            client = this.eventClient;
            break;
          case 'catalog':
            const pathPartCatalog = endpoint.replace('/api/v1', '');
            fullEndpoint = pathPartCatalog;
            client = this.catalogClient;
            break;
          default:
            client = this.getApiClient(role);
            fullEndpoint = endpoint;
            fullEndpoint = endpoint;
        }
      } else {
        client = this.getApiClient(role);
        fullEndpoint = endpoint;
      }

      logApiRequest(method, fullEndpoint, data, headers);

      let response;
      switch (method) {
        case 'GET':
          response = await client.get(fullEndpoint, { headers });
          break;
        case 'POST':
          response = await client.post(fullEndpoint, data, { headers });
          break;
        case 'PUT':
          response = await client.put(fullEndpoint, data, { headers });
          break;
        case 'DELETE':
          response = await client.delete(fullEndpoint, { headers });
          break;
      }
      
      logApiResponse(response, 'makeRequest - Raw response');
      logApiResponse(response, 'makeRequest - Response data after interceptors');
      
      // The interceptors have already processed the response, so response IS the final data
      return response;
      
    } catch (error) {
      const errorResult = handleApiError(error);
      secureLog.error('makeRequest - Error result:', errorResult);
      
      // Throw the error instead of returning it so authService can catch it properly
      const errorToThrow = new Error(errorResult.message);
      (errorToThrow as any).response = {
        status: errorResult.status,
        data: errorResult.details
      };
      (errorToThrow as any).code = errorResult.code;
      throw errorToThrow;
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
