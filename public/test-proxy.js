// Test the proxy configuration
fetch('/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'customer@sltmobitel.lk',
    password: 'customer123'
  })
})
.then(response => {
  console.log('✅ Proxy test - Status:', response.status);
  console.log('✅ Proxy test - URL:', response.url);
  return response.json();
})
.then(data => {
  console.log('✅ Proxy test - Response:', data);
})
.catch(error => {
  console.error('❌ Proxy test - Error:', error);
});

// Also test the API endpoint
fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@sltmobitel.lk',
    password: 'admin123'
  })
})
.then(response => {
  console.log('✅ API test - Status:', response.status);
  console.log('✅ API test - URL:', response.url);
  return response.json();
})
.then(data => {
  console.log('✅ API test - Response:', data);
})
.catch(error => {
  console.error('❌ API test - Error:', error);
});
