// Test script to verify customer dashboard integration
const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3010'; // API Gateway
const AUTH_SERVICE_URL = 'http://localhost:3008'; // Simple Auth Service
const CUSTOMER_SERVICE_URL = 'http://localhost:3011'; // Customer Service

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'testpassword123',
  name: 'Test User',
  phone: '+1234567890'
};

async function testIntegration() {
  console.log('🚀 Testing Customer Dashboard Integration...\n');

  try {
    // Test 1: Service Health Checks
    console.log('1. Testing Service Health Checks...');
    
    const services = [
      { name: 'API Gateway', url: `${BASE_URL}/health` },
      { name: 'Auth Service', url: `${AUTH_SERVICE_URL}/api/v1/auth/health` },
      { name: 'Customer Service', url: `${CUSTOMER_SERVICE_URL}/health` }
    ];

    for (const service of services) {
      try {
        const response = await axios.get(service.url, { timeout: 5000 });
        console.log(`✅ ${service.name}: ${response.status === 200 ? 'OK' : 'ERROR'}`);
      } catch (error) {
        console.log(`❌ ${service.name}: Not responding - ${error.message}`);
      }
    }

    // Test 2: User Registration
    console.log('\n2. Testing User Registration...');
    try {
      const registerResponse = await axios.post(`${AUTH_SERVICE_URL}/api/v1/auth/auth/register`, testUser);
      console.log('✅ User registration successful');
      console.log(`User ID: ${registerResponse.data.user?.id || 'N/A'}`);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('⚠️  User already exists - continuing with login test');
      } else {
        console.log(`❌ Registration failed: ${error.response?.data?.message || error.message}`);
      }
    }

    // Test 3: User Login
    console.log('\n3. Testing User Login...');
    try {
      const loginResponse = await axios.post(`${AUTH_SERVICE_URL}/api/v1/auth/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });
      
      const token = loginResponse.data.token;
      console.log('✅ User login successful');
      console.log(`Token: ${token ? 'Generated' : 'Missing'}`);

      if (token) {
        // Test 4: Dashboard Data Retrieval
        console.log('\n4. Testing Dashboard Data Retrieval...');
        
        try {
          const dashboardResponse = await axios.get(`${CUSTOMER_SERVICE_URL}/api/v1/customer/dashboard/overview`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log('✅ Dashboard data retrieved successfully');
          console.log(`Dashboard stats: ${JSON.stringify(dashboardResponse.data, null, 2)}`);
        } catch (error) {
          console.log(`❌ Dashboard retrieval failed: ${error.response?.data?.message || error.message}`);
        }

        // Test 5: Profile Data Retrieval
        console.log('\n5. Testing Profile Data Retrieval...');
        
        try {
          const profileResponse = await axios.get(`${CUSTOMER_SERVICE_URL}/api/v1/customer/dashboard/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log('✅ Profile data retrieved successfully');
          console.log(`Profile: ${JSON.stringify(profileResponse.data, null, 2)}`);
        } catch (error) {
          console.log(`❌ Profile retrieval failed: ${error.response?.data?.message || error.message}`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Login failed: ${error.response?.data?.message || error.message}`);
    }

    console.log('\n🏁 Integration test complete!');

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run the tests
testIntegration().catch(console.error);
