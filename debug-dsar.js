const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function debugDSAR() {
    try {
        console.log('🔧 Debug DSAR Creation...\n');

        // First, login as existing user customer@sltmobitel.lk
        console.log('1. Logging in as existing customer...');
        const loginResponse = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
            email: 'customer@sltmobitel.lk',
            password: 'customer123'
        });

        const token = loginResponse.data.token;
        console.log('✅ Login successful');

        // Test simple DSAR creation
        console.log('\n2. Creating DSAR request...');
        const dsarData = {
            type: 'data_access',
            description: 'Please provide me access to all my personal data'
        };

        console.log('Sending:', dsarData);
        const dsarResponse = await axios.post(`${BASE_URL}/api/v1/dsar/request`, dsarData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ DSAR request created!');
        console.log('Response:', dsarResponse.data);

    } catch (error) {
        console.error('❌ Error:', error.response ? error.response.data : error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
        }
    }
}

debugDSAR();
