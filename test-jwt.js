const axios = require('axios');

// Generate a simple demo token
const token = 'customer-demo-token-123';

async function testAPI() {
  try {
    console.log('Testing API with token:', token);
    const response = await axios.get('http://localhost:3011/api/v1/customer/dashboard/overview', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('API Response Status:', response.status);
    console.log('API Response Data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('API Error Status:', error.response?.status);
    console.error('API Error Data:', error.response?.data || error.message);
  }
}

testAPI();
