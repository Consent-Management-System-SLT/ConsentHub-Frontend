const axios = require('axios');

async function testVASDelete() {
    try {
        console.log('🔧 Testing VAS Delete API...');
        
        // First, login to get token
        console.log('1. Logging in as admin...');
        const loginResponse = await axios.post('http://localhost:3001/api/v1/auth/login', {
            email: 'admin@sltmobitel.lk',
            password: 'admin123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful, token obtained');
        
        // Get all VAS services first
        console.log('2. Getting all VAS services...');
        const servicesResponse = await axios.get('http://localhost:3001/api/admin/vas/services', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const services = servicesResponse.data.data;
        console.log(`Found ${services.length} VAS services`);
        
        // Find our test service
        const testService = services.find(s => s.name === 'Debug Test Service');
        if (!testService) {
            console.log('❌ Test service not found - create one first');
            return;
        }
        
        console.log(`3. Found test service: ${testService.name} (ID: ${testService.id})`);
        
        // Now try to delete it
        console.log('4. Deleting test VAS service...');
        const deleteResponse = await axios.delete(`http://localhost:3001/api/admin/vas/services/${testService.id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ VAS Service deleted successfully!');
        console.log('Response:', JSON.stringify(deleteResponse.data, null, 2));
        
    } catch (error) {
        console.error('❌ Error testing VAS deletion:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

testVASDelete();
