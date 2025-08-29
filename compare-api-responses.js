const axios = require('axios');

async function compareBackendAndFrontendAPI() {
  console.log('\n🔍 COMPARE: Backend Response vs Frontend Service');
  console.log('='.repeat(80));
  
  try {
    // Step 1: Get auth token
    const loginResponse = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'ojitharajapaksha@gmail.com',
      password: 'ABcd123#'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Token obtained');
    
    // Step 2: Direct backend call (what backend actually returns)
    console.log('\n📡 DIRECT BACKEND RESPONSE:');
    const backendResponse = await axios.get('http://localhost:3001/api/v1/customer/preferences', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: { _t: Date.now() }
    });
    
    console.log('Backend response structure:');
    console.log('- Type:', typeof backendResponse.data);
    console.log('- Has success:', !!backendResponse.data.success);
    console.log('- Has data:', !!backendResponse.data.data);
    console.log('- Direct communication:', !!backendResponse.data.communication);
    
    if (backendResponse.data.data) {
      console.log('- data.communication exists:', !!backendResponse.data.data.communication);
    }
    
    // Step 3: Simulate frontend service transformation
    console.log('\n🎭 FRONTEND SERVICE TRANSFORMATION:');
    
    // This is what the preferenceService apiRequest function does:
    const frontendServiceResponse = {
      success: true,
      data: backendResponse.data  // This wraps the backend response
    };
    
    console.log('Frontend service response structure:');
    console.log('- Type:', typeof frontendServiceResponse.data);
    console.log('- Has success:', !!frontendServiceResponse.data.success);
    console.log('- Has data:', !!frontendServiceResponse.data.data);
    console.log('- Direct communication:', !!frontendServiceResponse.data.communication);
    
    // Step 4: Frontend component access pattern
    console.log('\n🎯 FRONTEND COMPONENT ACCESS:');
    
    // Pattern 1: response.data.communication (if backend returns communication directly)
    const pattern1 = frontendServiceResponse.data.communication;
    console.log('Pattern 1 (response.data.communication):', !!pattern1, Array.isArray(pattern1), pattern1?.length || 0);
    
    // Pattern 2: response.data.data.communication (if backend wraps in data)
    const pattern2 = frontendServiceResponse.data.data?.communication;
    console.log('Pattern 2 (response.data.data.communication):', !!pattern2, Array.isArray(pattern2), pattern2?.length || 0);
    
    // Determine which pattern works
    if (pattern1 && pattern1.length > 0) {
      console.log('✅ PATTERN 1 WORKS - use response.data.communication');
      const comm = pattern1[0];
      console.log('Sample values:');
      console.log('  - Email:', comm.preferredChannels?.email);
      console.log('  - SMS:', comm.preferredChannels?.sms);
      console.log('  - DND:', comm.doNotDisturb?.enabled);
    } else if (pattern2 && pattern2.length > 0) {
      console.log('✅ PATTERN 2 WORKS - use response.data.data.communication');
      const comm = pattern2[0];
      console.log('Sample values:');
      console.log('  - Email:', comm.preferredChannels?.email);
      console.log('  - SMS:', comm.preferredChannels?.sms);
      console.log('  - DND:', comm.doNotDisturb?.enabled);
    } else {
      console.log('❌ NEITHER PATTERN WORKS');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

compareBackendAndFrontendAPI();
