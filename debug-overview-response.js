const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';

async function debugCustomerOverview() {
    console.log('🔍 Debugging Customer Dashboard Overview Response...\n');

    try {
        // Login as customer
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'ojitharajapaksha@gmail.com',
            password: 'ABcd123#'
        });

        const token = loginResponse.data.token;
        console.log('✅ Logged in successfully\n');

        // Get dashboard overview and show raw response
        const overviewResponse = await axios.get(`${BASE_URL}/customer/dashboard/overview`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('📊 RAW DASHBOARD OVERVIEW RESPONSE:');
        console.log('=' .repeat(50));
        console.log(JSON.stringify(overviewResponse.data, null, 2));

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

debugCustomerOverview();
