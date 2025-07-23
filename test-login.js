// Quick test to verify backend login endpoint
const http = require('http');

const testLogin = (email, password) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ email, password });
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log(`\n=== Testing ${email} ===`);
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response: ${body}`);
        resolve({ status: res.statusCode, body: JSON.parse(body) });
      });
    });

    req.on('error', (e) => {
      console.error(`Error testing ${email}:`, e.message);
      reject(e);
    });

    req.write(data);
    req.end();
  });
};

// Test all three demo accounts
(async () => {
  try {
    console.log('🔍 Testing backend login endpoints...');
    
    await testLogin('customer@sltmobitel.lk', 'customer123');
    await testLogin('admin@sltmobitel.lk', 'admin123');
    await testLogin('csr@sltmobitel.lk', 'csr123');
    
    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
})();
