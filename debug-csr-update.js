const axios = require('axios');

async function debugCSRUpdate() {
  try {
    console.log('🔍 Debugging CSR DSAR update process...\n');

    // Login as CSR
    console.log('1️⃣ Logging in as CSR...');
    const csrLogin = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'csr@sltmobitel.lk',
      password: 'csr123'
    });
    
    const csrToken = csrLogin.data.token;
    console.log('✅ CSR logged in successfully');

    // Check the specific request
    const requestId = '68ad735e41e5d35a36762c61';
    console.log(`\n2️⃣ Checking request ${requestId}...`);
    
    const requestsResponse = await axios.get('http://localhost:3001/api/v1/dsar/requests', {
      headers: { Authorization: `Bearer ${csrToken}` }
    });
    
    const targetRequest = requestsResponse.data.requests.find(req => req.id === requestId);
    if (!targetRequest) {
      console.log('❌ Request not found');
      return;
    }

    console.log('📋 Current request details:');
    console.log(`   ID: ${targetRequest.id}`);
    console.log(`   Status: ${targetRequest.status}`);
    console.log(`   Type: ${targetRequest.requestType}`);
    console.log(`   Submitted: ${targetRequest.submittedAt}`);

    // Try to update the request
    console.log(`\n3️⃣ Attempting to update request to in_progress...`);
    try {
      const updateResponse = await axios.put(
        `http://localhost:3001/api/v1/dsar/requests/${requestId}`,
        {
          status: 'in_progress',
          processingNote: 'CSR approved - processing started'
        },
        {
          headers: { 
            Authorization: `Bearer ${csrToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Update successful!');
      console.log('Response:', updateResponse.data);

      // Verify the update
      console.log(`\n4️⃣ Verifying update...`);
      const verifyResponse = await axios.get('http://localhost:3001/api/v1/dsar/requests', {
        headers: { Authorization: `Bearer ${csrToken}` }
      });
      
      const updatedRequest = verifyResponse.data.requests.find(req => req.id === requestId);
      console.log('📋 Updated request details:');
      console.log(`   Status: ${updatedRequest.status}`);
      console.log(`   Updated: ${updatedRequest.updatedAt || 'Not set'}`);

      // Now try to complete it
      console.log(`\n5️⃣ Completing the request...`);
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

      console.log('✅ Completion successful!');
      console.log('Response:', completeResponse.data);

    } catch (updateError) {
      console.error('❌ Update failed:', updateError.response?.data || updateError.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugCSRUpdate();
