const axios = require('axios');

async function testBackendResponse() {
    try {
        console.log('🧪 Testing backend response structure...');
        
        // Login first
        const loginResponse = await axios.post('http://localhost:3001/api/v1/auth/login', {
            email: 'ojitharajapaksha@gmail.com',
            password: 'ABcd123#'
        });

        const token = loginResponse.data.token;
        console.log('✅ Logged in successfully');

        // Get dashboard overview
        const overviewResponse = await axios.get('http://localhost:3001/api/v1/customer/dashboard/overview', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('\n📊 BACKEND RESPONSE STRUCTURE:');
        console.log('=====================================');
        console.log(JSON.stringify(overviewResponse.data, null, 2));
        
        console.log('\n🔍 KEY DATA POINTS:');
        console.log('=====================================');
        const data = overviewResponse.data.data;
        
        console.log('Consents Structure:', {
            total: data.consents?.total,
            active: data.consents?.active, 
            revoked: data.consents?.revoked,
            expired: data.consents?.expired,
            pending: data.consents?.pending
        });

        console.log('Communication Channels:', {
            total: data.communicationChannels?.total,
            channels: data.communicationChannels?.channels,
            configured: data.communicationChannels?.configured
        });

        console.log('Privacy Notices:', {
            total: data.privacyNotices?.total,
            acknowledged: data.privacyNotices?.acknowledged,
            pending: data.privacyNotices?.pending
        });

        console.log('DSAR Requests:', {
            total: data.dsarRequests?.total,
            pending: data.dsarRequests?.pending,
            processing: data.dsarRequests?.processing,
            completed: data.dsarRequests?.completed
        });

        console.log('Recent Activity Count:', data.recentActivity?.length);

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

testBackendResponse();
