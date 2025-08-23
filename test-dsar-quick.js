// Quick DSAR Test
async function testDSAR() {
  try {
    // Login first
    const loginResponse = await fetch('http://localhost:3001/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@sltmobitel.lk',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful, token:', loginData.token.substring(0, 20) + '...');
    
    // Test DSAR requests endpoint
    const dsarResponse = await fetch('http://localhost:3001/api/v1/dsar/requests', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const dsarData = await dsarResponse.json();
    console.log('✅ DSAR Response Status:', dsarResponse.status);
    console.log('✅ DSAR Response Data:', dsarData);
    
    if (dsarData.requests && dsarData.requests.length > 0) {
      console.log('✅ Sample request fields:', Object.keys(dsarData.requests[0]));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDSAR();
