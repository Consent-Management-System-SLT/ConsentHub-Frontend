// Simple debug test for API configuration
import { authApi } from './services/multiServiceApiClient';

console.log('authApi baseURL:', authApi.defaults.baseURL);
console.log('authApi config:', authApi.defaults);

export const debugApiConfig = () => {
  console.log('Debug API Config:');
  console.log('authApi baseURL:', authApi.defaults.baseURL);
  
  // Test URL construction
  const testEndpoint = '/api/v1/auth/register';
  console.log('Test endpoint:', testEndpoint);
  console.log('Would combine to:', authApi.defaults.baseURL + testEndpoint);
};
