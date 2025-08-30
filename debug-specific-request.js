const axios = require('axios');

async function debugSpecificRequest() {
  try {
    console.log('🔍 Debugging specific DSAR request update...\n');

    const requestId = '68ad74db41e5d35a36762d96';
    
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
      console.log('Available requests:');
      requestsResponse.data.requests.forEach(req => {
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

    // Try to update the request to in_progress
    console.log(`\n3️⃣ CSR approving request (pending → in_progress)...`);
    try {
      const approveResponse = await axios.put(
        `http://localhost:3001/api/v1/dsar/requests/${requestId}`,
        {
          status: 'in_progress',
          processingNote: 'Request approved by CSR - processing started'
        },
        {
          headers: { 
            Authorization: `Bearer ${csrToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Approve successful!');
      console.log(`   New status: ${approveResponse.data.request.status}`);

      // Wait 2 seconds, then complete
      console.log(`\n4️⃣ Waiting 2 seconds then completing...`);
      await new Promise(resolve => setTimeout(resolve, 2000));

      const completeResponse = await axios.put(
        `http://localhost:3001/api/v1/dsar/requests/${requestId}`,
        {
          status: 'completed',
          processingNote: 'Request completed by CSR'
        },
        {
          headers: { 
            Authorization: `Bearer ${csrToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Complete successful!');
      console.log(`   Final status: ${completeResponse.data.request.status}`);
      console.log(`   Completed at: ${completeResponse.data.request.completedAt}`);

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
      console.log('📱 Customer view:');
      console.log(`   Status: ${customerView.status}`);
      console.log(`   Completed: ${customerView.completedAt || 'Not set'}`);

      console.log('\n🎉 Status changes completed successfully!');
      console.log('📱 Now refresh your customer dashboard to see:');
      console.log('   1. Updated request status');
      console.log('   2. Notification bell with updates');

    } catch (updateError) {
      console.error('❌ Update failed:', updateError.response?.data || updateError.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugSpecificRequest();
