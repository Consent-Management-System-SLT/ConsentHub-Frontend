// Test script to check backend connectivity
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const BACKEND_URL = process.env.VITE_API_URL || 'https://consenthub-backend.onrender.com';

console.log('Testing backend connectivity...');
console.log('Backend URL:', BACKEND_URL);

async function testEndpoints() {
  const endpoints = [
    '/health',
    '/api/health',
    '/api/v1/health',
    '/api/v1/auth/health',
    '/status'
  ];

  for (const endpoint of endpoints) {
    try {
      const url = `${BACKEND_URL}${endpoint}`;
      console.log(`\nTesting: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log(`✓ Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.text();
        console.log(`  Response: ${data}`);
      } else {
        console.log(`  Error: ${response.statusText}`);
      }
      
    } catch (error) {
      console.log(`✗ Error: ${error.message}`);
    }
  }
}

// Test authentication endpoint
async function testAuth() {
  try {
    const authUrl = `${BACKEND_URL}/api/v1/auth/login`;
    console.log(`\nTesting authentication: ${authUrl}`);
    
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test123'
      })
    });

    console.log(`Auth test - Status: ${response.status}`);
    const data = await response.text();
    console.log(`Auth test - Response: ${data}`);
    
  } catch (error) {
    console.log(`Auth test - Error: ${error.message}`);
  }
}

// Run tests
testEndpoints().then(() => {
  return testAuth();
}).then(() => {
  console.log('\nBackend connectivity test completed.');
}).catch((error) => {
  console.error('Test error:', error);
});
