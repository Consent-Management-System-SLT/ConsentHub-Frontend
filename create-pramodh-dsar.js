const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function createPramodhUser() {
    try {
        console.log('🔧 Creating pramodhtest@gmail.com user and DSAR request...\n');

        // Step 1: Register pramodhtest@gmail.com
        console.log('1. Registering pramodhtest@gmail.com...');
        const registerData = {
            firstName: 'Pramodh',
            lastName: 'Test',
            email: 'pramodhtest@gmail.com',
            password: 'pramodh123',
            phone: '+94771234567',
            role: 'customer'
        };

        try {
            const registerResponse = await axios.post(`${BASE_URL}/api/v1/auth/register`, registerData);
            console.log('✅ User registered successfully:', registerResponse.data.message || 'Success');
        } catch (registerError) {
            if (registerError.response && registerError.response.status === 400 && registerError.response.data.message.includes('already exists')) {
                console.log('ℹ️ User already exists, proceeding with login...');
            } else {
                throw registerError;
            }
        }

        // Step 2: Login
        console.log('\n2. Logging in as pramodhtest@gmail.com...');
        const loginResponse = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
            email: 'pramodhtest@gmail.com',
            password: 'pramodh123'
        });

        const token = loginResponse.data.token;
        console.log('✅ Login successful');

        // Step 3: Create DSAR request
        console.log('\n3. Creating DSAR request for access to personal data...');
        const dsarData = {
            type: 'data_access',
            description: 'I need access to all my personal data for account verification purposes. Please provide all information you have stored about me.'
        };

        const dsarResponse = await axios.post(`${BASE_URL}/api/v1/dsar/request`, dsarData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ DSAR request created successfully!');
        console.log('📋 Request ID:', dsarResponse.data.request.requestId);
        console.log('📧 Requester:', dsarResponse.data.request.requesterEmail);
        console.log('👤 Name:', dsarResponse.data.request.requesterName);
        console.log('📄 Type:', dsarResponse.data.request.requestType);
        console.log('📅 Submitted:', dsarResponse.data.request.submittedAt);

        console.log('\n🎉 Pramodh user and DSAR request created successfully!');
        console.log('✅ This request should now be visible in both:');
        console.log('   - Customer dashboard for pramodhtest@gmail.com');
        console.log('   - CSR dashboard for agent review');

    } catch (error) {
        console.error('❌ Error:', error.response ? error.response.data : error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
        }
    }
}

createPramodhUser();
