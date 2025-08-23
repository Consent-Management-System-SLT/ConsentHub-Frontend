// Quick test to see if our backend is working with DSAR endpoints
const BASE_URL = 'http://localhost:3001';

async function quickTest() {
  console.log('🚀 Testing DSAR Backend Integration\n');
  
  try {
    // Test 1: Check if backend is responsive
    console.log('1. Testing backend connectivity...');
    const healthCheck = await fetch(`${BASE_URL}/api/v1/dsar/requests`);
    console.log(`   Status: ${healthCheck.status}`);
    
    if (healthCheck.status === 401) {
      console.log('✅ Backend is responsive (requires authentication)');
      
      // Test 2: Try to get a token
      console.log('\n2. Testing authentication...');
      const loginResponse = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@sltmobitel.lk',
          password: 'admin123'
        })
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('✅ Authentication successful');
        
        // Test 3: Get DSAR requests with auth
        console.log('\n3. Testing DSAR requests with authentication...');
        const dsarResponse = await fetch(`${BASE_URL}/api/v1/dsar/requests`, {
          headers: {
            'Authorization': `Bearer ${loginData.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (dsarResponse.ok) {
          const dsarData = await dsarResponse.json();
          console.log('✅ DSAR requests loaded successfully');
          console.log(`   Found: ${dsarData.total || dsarData.requests?.length || 0} requests`);
          
          // Test 4: Export CSV
          console.log('\n4. Testing CSV export...');
          const exportResponse = await fetch(`${BASE_URL}/api/v1/dsar/export/csv`, {
            headers: {
              'Authorization': `Bearer ${loginData.token}`
            }
          });
          
          if (exportResponse.ok) {
            console.log('✅ CSV export working');
            const csvText = await exportResponse.text();
            console.log(`   CSV length: ${csvText.length} characters`);
          } else {
            console.log('❌ CSV export failed:', exportResponse.status);
          }
          
          // Test 5: Create a test request
          console.log('\n5. Testing create DSAR request...');
          const createResponse = await fetch(`${BASE_URL}/api/v1/dsar/requests`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${loginData.token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              requesterName: 'Test User Backend',
              requesterEmail: 'test.backend@example.com',
              requestType: 'data_access',
              subject: 'Backend Integration Test',
              description: 'Testing DSAR creation from backend integration test',
              dataCategories: ['personal_data'],
              priority: 'medium'
            })
          });
          
          if (createResponse.ok) {
            const createData = await createResponse.json();
            console.log('✅ DSAR request creation working');
            console.log(`   Created request ID: ${createData.request?.requestId}`);
          } else {
            console.log('❌ DSAR request creation failed:', createResponse.status);
            console.log(await createResponse.text());
          }
          
        } else {
          console.log('❌ DSAR requests failed:', dsarResponse.status);
        }
      } else {
        console.log('❌ Authentication failed:', loginResponse.status);
      }
    } else {
      console.log('❌ Backend not responsive or unexpected response');
    }
    
    console.log('\n🏁 Backend integration test complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

quickTest();
