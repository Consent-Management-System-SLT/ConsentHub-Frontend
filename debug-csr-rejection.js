const axios = require('axios');

async function debugCSRRejection() {
  try {
    console.log('🔍 Debugging CSR rejection process...\n');

    const requestId = '68adb4e3467615e63ad15ba3';
    
    // Login as CSR
    console.log('1️⃣ Logging in as CSR...');
    const csrLogin = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'csr@sltmobitel.lk',
      password: 'csr123'
    });
    
    const csrToken = csrLogin.data.token;
    console.log('✅ CSR logged in successfully');

    // Check the specific request
    console.log(`\n2️⃣ Checking request ${requestId}...`);
    
    const requestsResponse = await axios.get('http://localhost:3001/api/v1/dsar/requests', {
      headers: { Authorization: `Bearer ${csrToken}` }
    });
    
    const targetRequest = requestsResponse.data.requests.find(req => req.id === requestId);
    if (!targetRequest) {
      console.log('❌ Request not found');
      console.log('\n📋 Available requests:');
      requestsResponse.data.requests
        .filter(req => req.requesterEmail === 'customer@sltmobitel.lk')
        .slice(0, 5)
        .forEach(req => {
          console.log(`   ${req.id} - ${req.requestId} - ${req.status}`);
        });
      return;
    }

    console.log('📋 Current request details:');
    console.log(`   ID: ${targetRequest.id}`);
    console.log(`   Request ID: ${targetRequest.requestId}`);
    console.log(`   Status: ${targetRequest.status}`);
    console.log(`   Type: ${targetRequest.requestType}`);
    console.log(`   Customer: ${targetRequest.requesterEmail}`);
    console.log(`   Submitted: ${targetRequest.submittedAt}`);

    // Try to reject the request
    console.log(`\n3️⃣ CSR rejecting the request...`);
    try {
      const rejectResponse = await axios.put(
        `http://localhost:3001/api/v1/dsar/requests/${requestId}`,
        {
          status: 'rejected',
          processingNote: 'Request rejected - test from debug script',
          reason: 'Testing rejection process'
        },
        {
          headers: { 
            Authorization: `Bearer ${csrToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Rejection request sent successfully!');
      console.log('Response status:', rejectResponse.status);
      console.log('Response data:');
      console.log('   Success:', rejectResponse.data.success);
      console.log('   Message:', rejectResponse.data.message);
      console.log('   New Status:', rejectResponse.data.request?.status);

      // Verify the update from CSR perspective
      console.log(`\n4️⃣ Verifying from CSR perspective...`);
      const csrVerifyResponse = await axios.get('http://localhost:3001/api/v1/dsar/requests', {
        headers: { Authorization: `Bearer ${csrToken}` }
      });
      
      const csrView = csrVerifyResponse.data.requests.find(req => req.id === requestId);
      console.log('🔍 CSR view after update:');
      console.log(`   Status: ${csrView.status}`);
      console.log(`   Updated: ${csrView.updatedAt || 'Not set'}`);

      // Verify from customer perspective
      console.log(`\n5️⃣ Verifying from customer perspective...`);
      const customerLogin = await axios.post('http://localhost:3001/api/v1/auth/login', {
        email: 'customer@sltmobitel.lk',
        password: 'customer123'
      });

      const customerToken = customerLogin.data.token;
      const customerRequests = await axios.get('http://localhost:3001/api/v1/dsar/requests', {
        headers: { Authorization: `Bearer ${customerToken}` }
      });

      const customerView = customerRequests.data.requests.find(req => req.id === requestId);
      console.log('👤 Customer view after update:');
      console.log(`   Status: ${customerView.status}`);
      console.log(`   Reason: ${customerView.reason || 'Not set'}`);

      if (customerView.status === 'rejected') {
        console.log('\n🎉 SUCCESS! Rejection worked correctly!');
      } else {
        console.log('\n❌ PROBLEM! Customer still sees status as:', customerView.status);
      }

    } catch (updateError) {
      console.error('❌ Rejection failed:');
      console.error('Status:', updateError.response?.status);
      console.error('Error:', updateError.response?.data);
      
      // Check if it's an endpoint issue
      if (updateError.response?.status === 404) {
        console.log('\n🔍 Testing alternative endpoints...');
        
        // Try without /requests in path
        try {
          const altResponse = await axios.put(
            `http://localhost:3001/api/v1/dsar/${requestId}`,
            {
              status: 'rejected',
              processingNote: 'Request rejected - alternative endpoint test'
            },
            {
              headers: { 
                Authorization: `Bearer ${csrToken}`,
                'Content-Type': 'application/json'
              }
            }
          );
          console.log('✅ Alternative endpoint worked!');
        } catch (altError) {
          console.error('❌ Alternative endpoint also failed:', altError.response?.data);
        }
      }
    }

  } catch (error) {
    console.error('❌ Main error:', error.response?.data || error.message);
  }
}

debugCSRRejection();
