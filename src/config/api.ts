// API Configuration for ConsentHub - Using Environment Variables
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://consenthub-backend.onrender.com/api/v1';

// Get base URL from environment
const BASE_URL = import.meta.env.VITE_API_URL || 'https://consenthub-backend.onrender.com';
const API_PATH = '/api/v1';

export const API_ENDPOINTS = {
  // All services point to deployed backend
  AUTH_SERVICE: `${BASE_URL}${API_PATH}/auth`,
  ADMIN_SERVICE: `${BASE_URL}${API_PATH}/admin`,
  CONSENT_SERVICE: `${BASE_URL}${API_PATH}/consent`,
  PREFERENCE_SERVICE: `${BASE_URL}${API_PATH}/preference`, 
  PARTY_SERVICE: `${BASE_URL}${API_PATH}/party`,
  DSAR_SERVICE: `${BASE_URL}${API_PATH}/dsar`,
  ANALYTICS_SERVICE: `${BASE_URL}${API_PATH}/analytics`,
  EVENT_SERVICE: `${BASE_URL}${API_PATH}/event`,
  PRIVACY_NOTICE_SERVICE: `${BASE_URL}${API_PATH}/privacy-notices`,
  CSR_SERVICE: `${BASE_URL}${API_PATH}/csr`,
  CUSTOMER_SERVICE: `${BASE_URL}${API_PATH}/customer`,
  LEGACY: `${BASE_URL}${API_PATH}`
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
