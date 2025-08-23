const https = require('http');

async function testDSARExportWithAuth() {
  console.log('Testing DSAR export endpoint with authentication...');
  
  // First, let's get an auth token by logging in
  const loginData = JSON.stringify({
    email: 'admin@sltmobitel.lk',
    password: 'admin123'
  });
  
  const loginOptions = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  const loginReq = https.request(loginOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        if (response.token) {
          console.log('Login successful, testing export...');
          testExport(response.token);
        } else {
          console.error('Login failed:', response);
        }
      } catch (e) {
        console.error('Login response parse error:', e.message);
        console.log('Raw response:', data);
      }
    });
  });

  loginReq.on('error', (e) => {
    console.error('Login request error:', e.message);
  });

  loginReq.write(loginData);
  loginReq.end();
}

function testExport(token) {
  const exportOptions = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/dsar/export/csv',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const exportReq = https.request(exportOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log(`Export response status: ${res.statusCode}`);
      console.log('Export response body:', data.substring(0, 500) + (data.length > 500 ? '...' : ''));
      if (res.statusCode === 200) {
        console.log('✅ CSV Export endpoint is working!');
      } else {
        console.log('❌ CSV Export failed');
      }
      process.exit(0);
    });
  });

  exportReq.on('error', (e) => {
    console.error('Export request error:', e.message);
    process.exit(1);
  });

  exportReq.end();
}

testDSARExportWithAuth();
