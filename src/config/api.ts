// API Configuration for ConsentHub
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

export const API_ENDPOINTS = {
  // Authentication Service (Port 3007)
  AUTH_SERVICE: 'http://localhost:3007/api/v1/auth',
  
  // Admin Service (Port 3009) - New dedicated admin service
  ADMIN_SERVICE: 'http://localhost:3009/api/v1/admin',
  
  // Core Services
  CONSENT_SERVICE: 'http://localhost:3002/api/v1/consent',
  PREFERENCE_SERVICE: 'http://localhost:3003/api/v1/preference', 
  PARTY_SERVICE: 'http://localhost:3004/api/v1/party',
  DSAR_SERVICE: 'http://localhost:3005/api/v1/dsar',
  ANALYTICS_SERVICE: 'http://localhost:3006/analytics',
  EVENT_SERVICE: 'http://localhost:3008/api/v1/events',
  PRIVACY_NOTICE_SERVICE: 'http://localhost:3010/api/v1/privacy-notice',
  
  // CSR Service for audit logs
  CSR_SERVICE: 'http://localhost:3011/api/v1/csr',
  
  // Customer Service
  CUSTOMER_SERVICE: 'http://localhost:3012/api/v1/customer',
  
  // Legacy comprehensive backend (fallback)
  LEGACY: 'http://localhost:3001/api/v1'
};

export const SERVICE_PORTS = {
  API_GATEWAY: 3001,
  CONSENT_SERVICE: 3002,
  PREFERENCE_SERVICE: 3003,
  PARTY_SERVICE: 3004,
  DSAR_SERVICE: 3005,
  ANALYTICS_SERVICE: 3006,
  AUTH_SERVICE: 3007,
  EVENT_SERVICE: 3008,
  ADMIN_SERVICE: 3009, // New admin service
  PRIVACY_NOTICE_SERVICE: 3010,
  CSR_SERVICE: 3011,
  CUSTOMER_SERVICE: 3012
};

// Request timeout settings
export const API_TIMEOUT = 30000; // 30 seconds

// API versioning
export const API_VERSION = 'v1';
