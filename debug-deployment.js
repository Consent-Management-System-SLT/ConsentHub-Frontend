const axios = require('axios');

async function debugDeployedVersion() {
    const baseURL = 'https://consenthub-backend.onrender.com';
    
    console.log('🔍 Debugging what version is actually deployed...');
    
    try {
        // Test if the endpoint even exists
        console.log('\n🌐 Testing if /api/csr/customer-vas endpoint exists...');
        
        try {
            const response = await axios.get(`${baseURL}/api/csr/customer-vas`, {
                timeout: 5000
            });
            console.log('✅ Endpoint exists - got response');
        } catch (error) {
            if (error.response?.status === 404) {
                console.log('❌ Endpoint not found (404) - VAS endpoints not deployed');
                return;
            } else if (error.response?.status === 400) {
                console.log('✅ Endpoint exists (400 = bad request, which is expected without headers)');
                console.log('Error message:', error.response?.data?.error);
            } else {
                console.log('❓ Unexpected response:', error.response?.status, error.response?.data);
            }
        }
        
        // Check if there are any CORS issues
        console.log('\n🔒 Testing CORS with OPTIONS request...');
        try {
            const optionsResponse = await axios.options(`${baseURL}/api/csr/customer-vas`, {
                headers: {
                    'Origin': 'https://consent-management-system-api.vercel.app',
                    'Access-Control-Request-Method': 'GET',
                    'Access-Control-Request-Headers': 'customerEmail, Content-Type'
                },
                timeout: 5000
            });
            console.log('✅ CORS preflight successful');
        } catch (corsError) {
            console.log('❌ CORS issue:', corsError.response?.status, corsError.message);
        }
        
        // Try to check what headers the server expects by examining error details
        console.log('\n📋 Testing with various header combinations to see server response...');
        
        const testHeaders = [
            { 'customerEmail': 'test@test.com' },
            { 'customer-email': 'test@test.com' },
            { 'customerId': '123' },
            { 'customer-id': '123' }
        ];
        
        for (const headers of testHeaders) {
            console.log(`\nTesting:`, Object.keys(headers)[0]);
            try {
                const response = await axios.get(`${baseURL}/api/csr/customer-vas`, {
                    headers: {
                        ...headers,
                        'Content-Type': 'application/json'
                    },
                    timeout: 3000
                });
                console.log('✅ Success!');
                break;
            } catch (error) {
                console.log(`Response: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
            }
        }
        
        // Test the customer search to make sure that works
        console.log('\n🔍 Verifying customer search still works...');
        try {
            const searchResponse = await axios.get(`${baseURL}/api/v1/csr/customers/search`, {
                params: { query: 'customer@sltmobitel.lk' },
                timeout: 5000
            });
            console.log('✅ Customer search works:', searchResponse.data.customers?.length || 0, 'customers found');
        } catch (searchError) {
            console.log('❌ Customer search failed:', searchError.response?.data?.error || searchError.message);
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}

debugDeployedVersion();
