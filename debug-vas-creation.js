const axios = require('axios');

async function testVASCreation() {
    try {
        console.log('🔧 Testing VAS Creation API...');
        
        // First, login to get token
        console.log('1. Logging in as admin...');
        const loginResponse = await axios.post('http://localhost:3001/api/v1/auth/login', {
            email: 'admin@sltmobitel.lk',
            password: 'admin123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful, token obtained');
        
        // Now try to create a VAS service
        console.log('2. Creating test VAS service...');
        const vasData = {
            name: 'Debug Test Service',
            description: 'Test service for debugging VAS creation',
            category: 'entertainment',
            provider: 'Test Provider',
            price: '15000',
            features: ['Feature 1', 'Feature 2'],
            benefits: ['Benefit 1', 'Benefit 2'],
            status: 'active'
        };
        
        console.log('VAS Data:', JSON.stringify(vasData, null, 2));
        
        const createResponse = await axios.post('http://localhost:3001/api/admin/vas/services', vasData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ VAS Service created successfully!');
        console.log('Response:', JSON.stringify(createResponse.data, null, 2));
        
    } catch (error) {
        console.error('❌ Error testing VAS creation:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
            console.error('Headers:', error.response.headers);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testVASCreation();
