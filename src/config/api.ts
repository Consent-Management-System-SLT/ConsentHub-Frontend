// API Configuration for ConsentHub - Using Comprehensive Backend
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

export const API_ENDPOINTS = {
  // All services point to comprehensive backend
  AUTH_SERVICE: 'http://localhost:3001/api/v1/auth',
  ADMIN_SERVICE: 'http://localhost:3001/api/v1/admin',
  CONSENT_SERVICE: 'http://localhost:3001/api/v1/consent',
  PREFERENCE_SERVICE: 'http://localhost:3001/api/v1/preference', 
  PARTY_SERVICE: 'http://localhost:3001/api/v1/party',
  DSAR_SERVICE: 'http://localhost:3001/api/v1/dsar',
  ANALYTICS_SERVICE: 'http://localhost:3001/api/v1/analytics',
  EVENT_SERVICE: 'http://localhost:3001/api/v1/event',
  PRIVACY_NOTICE_SERVICE: 'http://localhost:3001/api/v1/privacy-notices',
  CSR_SERVICE: 'http://localhost:3001/api/v1/csr',
  CUSTOMER_SERVICE: 'http://localhost:3001/api/v1/customer',
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
