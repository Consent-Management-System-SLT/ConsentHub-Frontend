const axios = require('axios');

async function debugCSRDashboardIssue() {
  try {
    console.log('🔍 Debugging CSR Dashboard request handling...\n');

    const requestId = '68adb4e3467615e63ad15ba3';
    
    // Login as CSR
    const csrLogin = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'csr@sltmobitel.lk',
      password: 'csr123'
    });
    
    const csrToken = csrLogin.data.token;
    console.log('✅ CSR logged in successfully');

    // Get requests like the dashboard does
    console.log('\n📋 Getting requests as CSR dashboard would...');
    const requestsResponse = await axios.get('http://localhost:3001/api/v1/dsar/requests', {
      headers: { Authorization: `Bearer ${csrToken}` }
    });
    
    const targetRequest = requestsResponse.data.requests.find(req => req.id === requestId);
    
    if (!targetRequest) {
      console.log('❌ Request not found by .id, trying ._id...');
      const altRequest = requestsResponse.data.requests.find(req => req._id === requestId);
      if (altRequest) {
        console.log('✅ Found by ._id instead!');
        console.log(`   request._id: ${altRequest._id}`);
        console.log(`   request.id: ${altRequest.id}`);
      } else {
        console.log('❌ Request not found by either .id or ._id');
        return;
      }
    }

    console.log('\n🔍 Request object structure:');
    console.log(`   ._id: ${targetRequest._id || 'undefined'}`);
    console.log(`   .id: ${targetRequest.id || 'undefined'}`);
    console.log(`   .requestId: ${targetRequest.requestId}`);
    console.log(`   .status: ${targetRequest.status}`);

    // Test what the dashboard code would use
    const dashboardRequestId = targetRequest._id || targetRequest.id;
    console.log(`\n🎯 Dashboard would use ID: ${dashboardRequestId}`);

    // Test both possible endpoints
    console.log('\n🧪 Testing rejection with dashboard logic...');
    
    const reason = 'Test rejection from debug script';
    const processingNote = `Request rejected by CSR on ${new Date().toLocaleDateString()}. Reason: ${reason}`;
    
    try {
      const response = await axios.put(
        `http://localhost:3001/api/v1/dsar/requests/${dashboardRequestId}`,
        {
          status: 'rejected',
          processingNote: processingNote
        },
        {
          headers: { 
            Authorization: `Bearer ${csrToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Rejection successful with dashboard ID!');
      console.log(`   Response status: ${response.status}`);
      console.log(`   New status: ${response.data.request.status}`);

      // Verify the change
      const verifyResponse = await axios.get('http://localhost:3001/api/v1/dsar/requests', {
        headers: { Authorization: `Bearer ${csrToken}` }
      });
      
      const verifyRequest = verifyResponse.data.requests.find(req => 
        req.id === requestId || req._id === requestId
      );
      
      console.log('\n📊 Verification:');
      console.log(`   Status after update: ${verifyRequest.status}`);

      if (verifyRequest.status === 'rejected') {
        console.log('\n🎉 SUCCESS! The rejection worked correctly.');
        console.log('\n💡 Possible issues with CSR dashboard:');
        console.log('   1. JavaScript errors in browser console');
        console.log('   2. Form not submitting properly');
        console.log('   3. Page not refreshing after update');
        console.log('   4. Authentication token issues');
        console.log('\n🔧 Suggested fixes:');
        console.log('   1. Open browser console (F12) when using CSR dashboard');
        console.log('   2. Check for JavaScript errors during reject action');
        console.log('   3. Manually refresh CSR dashboard page after rejection');
        console.log('   4. Clear browser cache and cookies if needed');
      } else {
        console.log('\n❌ ISSUE: Status did not update properly');
      }

    } catch (error) {
      console.error('❌ Rejection failed with dashboard ID:');
      console.error('Error:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Main error:', error.response?.data || error.message);
  }
}

debugCSRDashboardIssue();
