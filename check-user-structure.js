const https = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/v1/users',
  method: 'GET'
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const response = JSON.parse(data);
    console.log('First 3 users with all fields:');
    response.users.slice(0,3).forEach((user, i) => {
      console.log(`\nUser ${i+1}:`);
      Object.keys(user).forEach(key => {
        console.log(`  ${key}: ${user[key]}`);
      });
    });
    
    // Check key users
    const keyUsers = ['admin@sltmobitel.lk', 'csr@sltmobitel.lk', 'customer@sltmobitel.lk'];
    console.log('\n=== KEY SYSTEM USERS ===');
    keyUsers.forEach(email => {
      const user = response.users.find(u => u.email === email);
      if (user) {
        console.log(`${user.name} (${user.email}) - Role: ${user.role}`);
      }
    });
    
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
  process.exit(1);
});

req.end();
