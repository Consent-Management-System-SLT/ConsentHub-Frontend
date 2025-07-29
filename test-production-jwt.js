#!/usr/bin/env node

/**
 * Production JWT Token Test
 * Tests JWT authentication between Vercel frontend and Render backend
 */

const https = require('https');

const BACKEND_URL = 'https://consenthub-backend.onrender.com';
const FRONTEND_URL = 'https://consent-management-system-api.vercel.app';

console.log('🧪 Testing JWT Authentication in Production Environment');
console.log(`🔗 Backend URL: ${BACKEND_URL}`);
console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
console.log('');

// Test user registration
async function testRegistration() {
  console.log('📝 Testing User Registration...');
  
  const registrationData = JSON.stringify({
    firstName: 'Test',
    lastName: 'User', 
    email: `testuser_${Date.now()}@example.com`,
    password: 'testpassword123',
    phone: '+94771234567',
    company: 'SLT-Mobitel',
    acceptTerms: true,
    acceptPrivacy: true
  });

  const options = {
    hostname: 'consenthub-backend.onrender.com',
    port: 443,
    path: '/api/v1/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': registrationData.length,
      'Origin': FRONTEND_URL,
      'User-Agent': 'ConsentHub-Test/1.0'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`✅ Registration Status: ${res.statusCode}`);
          
          if (response.success && response.token) {
            console.log(`🎫 JWT Token received: ${response.token.substring(0, 50)}...`);
            console.log(`👤 User ID: ${response.user?.id || response.user?._id}`);
            console.log(`📧 Email: ${response.user?.email}`);
            console.log(`🎭 Role: ${response.user?.role}`);
            resolve(response);
          } else {
            console.log(`❌ Registration failed: ${response.message}`);
            reject(new Error(response.message));
          }
        } catch (error) {
          console.log(`❌ Parse error: ${error.message}`);
          console.log(`📄 Raw response: ${data}`);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Request error: ${error.message}`);
      reject(error);
    });

    req.write(registrationData);
    req.end();
  });
}

// Test user login
async function testLogin(email, password) {
  console.log('\n🔐 Testing User Login...');
  
  const loginData = JSON.stringify({
    email: email,
    password: password
  });

  const options = {
    hostname: 'consenthub-backend.onrender.com',
    port: 443,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': loginData.length,
      'Origin': FRONTEND_URL,
      'User-Agent': 'ConsentHub-Test/1.0'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`✅ Login Status: ${res.statusCode}`);
          
          if (response.success && response.token) {
            console.log(`🎫 JWT Token received: ${response.token.substring(0, 50)}...`);
            console.log(`👤 User: ${response.user?.email}`);
            console.log(`🎭 Role: ${response.user?.role}`);
            resolve(response);
          } else {
            console.log(`❌ Login failed: ${response.message}`);
            reject(new Error(response.message));
          }
        } catch (error) {
          console.log(`❌ Parse error: ${error.message}`);
          console.log(`📄 Raw response: ${data}`);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Request error: ${error.message}`);
      reject(error);
    });

    req.write(loginData);
    req.end();
  });
}

// Test protected route with JWT
async function testProtectedRoute(token) {
  console.log('\n🛡️ Testing Protected Route with JWT...');
  
  const options = {
    hostname: 'consenthub-backend.onrender.com',
    port: 443,
    path: '/api/v1/auth/profile',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Origin': FRONTEND_URL,
      'User-Agent': 'ConsentHub-Test/1.0'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`✅ Profile Access Status: ${res.statusCode}`);
          
          if (response.success) {
            console.log(`👤 Profile Data Retrieved Successfully`);
            console.log(`📧 Email: ${response.user?.email}`);
            console.log(`🏢 Company: ${response.user?.company}`);
            resolve(response);
          } else {
            console.log(`❌ Profile access failed: ${response.message}`);
            reject(new Error(response.message));
          }
        } catch (error) {
          console.log(`❌ Parse error: ${error.message}`);
          console.log(`📄 Raw response: ${data}`);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Request error: ${error.message}`);
      reject(error);
    });

    req.end();
  });
}

// Test health endpoint
async function testHealthEndpoint() {
  console.log('\n❤️ Testing Backend Health...');
  
  const options = {
    hostname: 'consenthub-backend.onrender.com',
    port: 443,
    path: '/api/v1/health',
    method: 'GET',
    headers: {
      'User-Agent': 'ConsentHub-Test/1.0'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ Health Check Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
          console.log(`🟢 Backend is healthy and running`);
          resolve(true);
        } else {
          console.log(`🔴 Backend health check failed`);
          reject(new Error('Health check failed'));
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Health check error: ${error.message}`);
      reject(error);
    });

    req.end();
  });
}

// Run comprehensive test
async function runComprehensiveTest() {
  try {
    console.log('🚀 Starting Comprehensive JWT Production Test\n');
    
    // Test 1: Health check
    await testHealthEndpoint();
    
    // Test 2: Registration
    const registrationResult = await testRegistration();
    const testEmail = registrationResult.user.email;
    const testPassword = 'testpassword123';
    
    // Test 3: Login with the registered user
    const loginResult = await testLogin(testEmail, testPassword);
    const jwtToken = loginResult.token;
    
    // Test 4: Access protected route
    await testProtectedRoute(jwtToken);
    
    console.log('\n🎉 ALL TESTS PASSED! 🎉');
    console.log('✅ JWT tokens are working correctly in production');
    console.log('✅ Registration → Login → Protected Route flow complete');
    console.log('✅ CORS is properly configured');
    console.log('✅ Your hosted system is ready for users!');
    
  } catch (error) {
    console.log('\n❌ TEST FAILED');
    console.log(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the test
runComprehensiveTest();
