// Test script to verify API connectivity
const BASE_URL = 'http://localhost:3000';

async function testApiEndpoints() {
  const endpoints = [
    '/api/v1/consent',
    '/api/v1/party',
    '/api/v1/privacy-notice',
    '/api/v1/dsar',
    '/api/v1/audit',
    '/api/v1/bulk-import',
    '/api/v1/event-listener',
    '/api/v1/compliance-rule'
  ];

  console.log('🔍 Testing API endpoints...\n');

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`);
      if (response.ok) {
        const data = await response.json();
        
        // Count items based on endpoint response structure
        let count = 0;
        if (Array.isArray(data)) {
          count = data.length;
        } else if (data.notices) {
          count = data.notices.length;
        } else if (data.logs) {
          count = data.logs.length;
        } else if (data.imports) {
          count = data.imports.length;
        } else if (data.listeners) {
          count = data.listeners.length;
        } else if (data.rules) {
          count = data.rules.length;
        }
        
        console.log(`✅ ${endpoint}: ${count} items`);
      } else {
        console.log(`❌ ${endpoint}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }
}

testApiEndpoints();
