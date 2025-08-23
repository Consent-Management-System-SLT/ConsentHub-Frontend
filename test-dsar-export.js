const https = require('http');

async function testDSARExport() {
  // First, let's test the endpoint without auth to see what happens
  console.log('Testing DSAR export endpoint...');
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/dsar/export/csv',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log(`Response status: ${res.statusCode}`);
      console.log(`Response headers:`, res.headers);
      console.log('Response body:', data);
      process.exit(0);
    });
  });

  req.on('error', (e) => {
    console.error('Error:', e.message);
    process.exit(1);
  });

  req.end();
}

testDSARExport();
