// Quick test to check which backend is running
async function checkBackendVersion() {
  const url = 'https://consenthub-backend.onrender.com';
  
  try {
    console.log('🔍 Testing backend endpoints...\n');
    
    // Test health endpoint
    const health = await fetch(`${url}/health`);
    console.log(`Health endpoint: ${health.status} ${health.statusText}`);
    
    // Test which endpoints are available
    const testEndpoints = [
      '/api/v1/privacy-notices', // Should exist in comprehensive
      '/api/v1/admin/dashboard/overview', // Should exist in comprehensive  
      '/api/guardians', // Should exist in comprehensive
      '/api/v1/privacy-notice', // Exists in render-server (singular)
    ];
    
    for (const endpoint of testEndpoints) {
      try {
        const response = await fetch(`${url}${endpoint}`, {
          headers: { 'Authorization': 'Bearer test' }
        });
        console.log(`${endpoint}: ${response.status} ${response.statusText}`);
      } catch (error) {
        console.log(`${endpoint}: ERROR - ${error.message}`);
      }
    }
    
    // Test a specific endpoint that shows which backend
    try {
      const errorTest = await fetch(`${url}/api/v1/nonexistent`);
      const errorData = await errorTest.text();
      
      if (errorData.includes('availableEndpoints')) {
        const parsed = JSON.parse(errorData);
        console.log('\n📋 Available endpoints on deployed backend:');
        parsed.availableEndpoints.forEach(ep => console.log(`  - ${ep}`));
        
        if (parsed.availableEndpoints.includes('/api/v1/admin/dashboard/overview')) {
          console.log('\n✅ Running comprehensive-backend.js');
        } else {
          console.log('\n❌ Running render-server.js (needs update)');
        }
      }
    } catch (e) {
      console.log('\n❓ Could not determine backend version');
    }
    
  } catch (error) {
    console.error('❌ Backend test failed:', error.message);
  }
}

checkBackendVersion();
