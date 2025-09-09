const axios = require('axios');

async function testCustomerVAS() {
    try {
        console.log('🔧 Testing Customer VAS API...');
        
        // First, login as customer
        console.log('1. Logging in as customer...');
        const loginResponse = await axios.post('http://localhost:3001/api/v1/auth/login', {
            email: 'customer@sltmobitel.lk',
            password: 'customer123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful, token obtained');
        
        // Get all VAS services available to customers
        console.log('2. Getting customer VAS services...');
        const servicesResponse = await axios.get('http://localhost:3001/api/customer/vas/services', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const services = servicesResponse.data.data || servicesResponse.data;
        console.log(`✅ Found ${services.length} VAS services available to customers`);
        
        // Show service details
        services.forEach((service, index) => {
            console.log(`\n   ${index + 1}. ${service.name}`);
            console.log(`      Description: ${service.description}`);
            console.log(`      Price: ${service.price} (${service.priceNumeric})`);
            console.log(`      Category: ${service.category}`);
            console.log(`      Status: ${service.status}`);
            console.log(`      Provider: ${service.provider}`);
            if (service.features && service.features.length > 0) {
                console.log(`      Features: ${service.features.join(', ')}`);
            }
        });
        
        console.log('\n✅ Customer can now see the new VAS services in their dashboard!');
        
    } catch (error) {
        console.error('❌ Error testing customer VAS:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

testCustomerVAS();
