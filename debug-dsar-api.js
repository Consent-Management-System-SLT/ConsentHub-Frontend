const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function debugDSARAPI() {
  try {
    console.log('Debugging DSAR API...\n');
    
    // Test the API response structure
    const response = await axios.get(`${BASE_URL}/api/v1/dsar/requests`);
    console.log('API Response Type:', typeof response.data);
    console.log('API Response Structure:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
  }
}

debugDSARAPI();
