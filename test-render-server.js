// Test the updated render server
const http = require('http');

const testRenderServerLogin = (email, password, port = 3000) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ email, password });
    
    const options = {
      hostname: 'localhost',
      port: port,
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
        console.log(`\n=== Testing Render Server: ${email} ===`);
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
    console.log('🔍 Testing updated render server login endpoints...');
    
    await testRenderServerLogin('customer@sltmobitel.lk', 'customer123');
    await testRenderServerLogin('admin@sltmobitel.lk', 'admin123');
    await testRenderServerLogin('csr@sltmobitel.lk', 'csr123');
    
    console.log('\n✅ All render server tests completed!');
  } catch (error) {
    console.error('❌ Render server test failed:', error.message);
  }
})();
