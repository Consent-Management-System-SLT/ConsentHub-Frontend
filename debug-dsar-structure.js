// Debug DSAR Request Structure
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function debugDsarStructure() {
    try {
        // Login as CSR
        const csrLogin = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
            email: 'csr@sltmobitel.lk',
            password: 'csr123'
        });
        const csrToken = csrLogin.data.token;
        
        // Get CSR DSAR requests
        const csrDsarResponse = await axios.get(`${BASE_URL}/api/dsar-requests`, {
            headers: { 'Authorization': `Bearer ${csrToken}` }
        });
        
        console.log('🔍 First CSR DSAR Request Structure:');
        console.log(JSON.stringify(csrDsarResponse.data[0], null, 2));
        
        // Login as Customer
        const customerLogin = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
            email: 'customer@sltmobitel.lk',
            password: 'customer123'
        });
        const customerToken = customerLogin.data.token;
        
        // Get Customer DSAR requests
        const customerDsarResponse = await axios.get(`${BASE_URL}/api/v1/customer/dsar`, {
            headers: { 'Authorization': `Bearer ${customerToken}` }
        });
        
        console.log('\n🔍 First Customer DSAR Request Structure:');
        console.log(JSON.stringify(customerDsarResponse.data.data.requests[0], null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

debugDsarStructure();
