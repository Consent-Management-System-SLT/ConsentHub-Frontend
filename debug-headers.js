const axios = require('axios');

async function debugHeaderIssue() {
    const baseURL = 'https://consenthub-backend.onrender.com';
    
    console.log('🔍 Debugging header issue...');
    
    try {
        // Test different header variations
        const headerVariations = [
            { 'customer-email': 'ojitharajapaksha@gmail.com' },
            { 'customerId': '68b689f4d945be3295ad8ec8' },
            { 'customer-id': '68b689f4d945be3295ad8ec8' },
            { 'customerEmail': 'ojitharajapaksha@gmail.com' },
            { 'Customer-Email': 'ojitharajapaksha@gmail.com' },
            { 'CUSTOMER-EMAIL': 'ojitharajapaksha@gmail.com' }
        ];
        
        for (const headers of headerVariations) {
            console.log(`\n🧪 Testing headers:`, headers);
            
            try {
                const response = await axios.get(`${baseURL}/api/csr/customer-vas`, {
                    headers: {
                        ...headers,
                        'Content-Type': 'application/json'
                    },
                    timeout: 5000
                });
                
                console.log('✅ SUCCESS! This header variation works:');
                console.log('Customer:', response.data.customer?.name);
                console.log('Services:', response.data.services?.length || 0);
                break; // Stop on first success
                
            } catch (error) {
                console.log(`❌ Failed: ${error.response?.data?.error || error.message}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}

debugHeaderIssue();
