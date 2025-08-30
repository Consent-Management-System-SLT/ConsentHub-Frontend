const axios = require('axios');

async function debugCSRCustomers() {
  try {
    console.log('🔍 Debugging CSR customers endpoint...\n');
    
    const baseURL = 'http://localhost:3001/api/v1';
    
    const csrLogin = await axios.post(`${baseURL}/auth/login`, {
      email: 'csr@sltmobitel.lk',
      password: 'csr123'
    });
    const csrToken = csrLogin.data.token;
    console.log('✅ CSR logged in');
    
    // Check CSR customers endpoint
    const customersResponse = await axios.get(`${baseURL}/csr/customers`, {
      headers: { 'Authorization': `Bearer ${csrToken}` }
    });
    
    console.log('CSR customers response structure:');
    console.log('Type:', typeof customersResponse.data);
    console.log('Is Array:', Array.isArray(customersResponse.data));
    console.log('Data:', JSON.stringify(customersResponse.data, null, 2));
    
    // Try different endpoints
    console.log('\n📋 Trying different endpoints...');
    
    try {
      const partyResponse = await axios.get(`${baseURL}/party`, {
        headers: { 'Authorization': `Bearer ${csrToken}` }
      });
      console.log('Party endpoint:', typeof partyResponse.data, Array.isArray(partyResponse.data));
    } catch (e) {
      console.log('Party endpoint error:', e.response?.status);
    }
    
    try {
      const customersAltResponse = await axios.get(`${baseURL}/customers`, {
        headers: { 'Authorization': `Bearer ${csrToken}` }
      });
      console.log('Customers endpoint:', typeof customersAltResponse.data, Array.isArray(customersAltResponse.data));
    } catch (e) {
      console.log('Customers endpoint error:', e.response?.status);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
  }
}

debugCSRCustomers();
