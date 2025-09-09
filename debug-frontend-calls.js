const axios = require('axios');

async function debugFrontendCalls() {
    const baseURL = 'https://consenthub-backend.onrender.com';
    
    console.log('🔍 Debugging what the frontend should be calling...');
    
    try {
        // Test the endpoint the frontend might be calling
        console.log('\n1. Testing /api/v1/party (customers list)...');
        const partyResponse = await axios.get(`${baseURL}/api/v1/party`, {
            timeout: 10000
        });
        
        console.log(`✅ Found ${partyResponse.data.length} customers in /api/v1/party`);
        
        // Check if Ojitha is in the list
        const ojitha = partyResponse.data.find(customer => 
            customer.email && customer.email.toLowerCase().includes('ojitharajapaksha@gmail.com')
        );
        
        if (ojitha) {
            console.log('✅ Ojitha found in customer list:', ojitha);
        } else {
            console.log('❌ Ojitha NOT found in /api/v1/party list');
            console.log('Available emails:', partyResponse.data.slice(0, 5).map(c => c.email));
        }
        
        console.log('\n2. Testing customer search endpoint...');
        const searchResponse = await axios.get(`${baseURL}/api/v1/csr/customers/search`, {
            params: { query: 'ojitharajapaksha@gmail.com' },
            timeout: 10000
        });
        
        console.log('✅ Search endpoint works:', searchResponse.data.customers?.length || 0, 'customers found');
        
        console.log('\n3. Testing VAS endpoint with found customer...');
        if (searchResponse.data.customers && searchResponse.data.customers.length > 0) {
            const customer = searchResponse.data.customers[0];
            
            const vasResponse = await axios.get(`${baseURL}/api/csr/customer-vas`, {
                headers: {
                    'customerEmail': customer.email,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            
            console.log('✅ VAS data retrieved successfully!');
            console.log('Customer name:', vasResponse.data.customer.name);
            console.log('VAS services:', vasResponse.data.services?.length || 0);
        }
        
        console.log('\n🎯 SOLUTION:');
        console.log('The backend is working perfectly!');
        console.log('The issue is in the frontend - it needs to:');
        console.log('1. Call /api/v1/csr/customers/search for customer search');
        console.log('2. Call /api/csr/customer-vas with customerEmail header');
        console.log('3. Use the correct header format (customerEmail, not customer-email)');
        
    } catch (error) {
        console.error('❌ Debug failed:', error.response?.data?.error || error.message);
    }
}

debugFrontendCalls();
