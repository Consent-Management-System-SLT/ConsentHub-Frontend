const https = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/v1/dsar/requests',
  method: 'GET'
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('=== DSAR REQUESTS WITH REAL USERS ===');
      console.log(`Total requests: ${response.requests.length}`);
      console.log();
      response.requests.forEach((req, i) => {
        console.log(`${i+1}. ${req.requesterName} (${req.requesterEmail})`);
        console.log(`   Request: ${req.requestType.replace('_', ' ').toUpperCase()}`);
        console.log(`   Status: ${req.status.toUpperCase()}`);
        console.log(`   Subject: ${req.subject}`);
        console.log(`   Priority: ${req.priority.toUpperCase()}`);
        console.log();
      });
    } catch (e) {
      console.error('Error:', e.message);
      console.log('Raw response:', data);
    }
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
  process.exit(1);
});

req.end();
