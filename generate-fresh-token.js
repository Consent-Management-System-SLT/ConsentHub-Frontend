// Create a fresh token
const payload = {
  id: 'admin-user-123',
  email: 'admin@sltmobitel.lk',
  role: 'admin',
  name: 'Admin User',
  phone: '+94712345678',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
};

const token = Buffer.from(JSON.stringify(payload)).toString('base64');
console.log('Fresh token:');
console.log(token);
