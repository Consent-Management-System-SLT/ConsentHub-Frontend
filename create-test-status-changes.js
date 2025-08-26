const axios = require('axios');

async function createMultipleStatusChanges() {
  try {
    console.log('🔄 Creating multiple DSAR status changes for testing...\n');

    // Login as CSR
    const csrLogin = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'csr@sltmobitel.lk',
      password: 'csr123'
    });
    
    const csrToken = csrLogin.data.token;
    console.log('✅ CSR logged in successfully');

    // Get current requests
    const requestsResponse = await axios.get('http://localhost:3001/api/v1/dsar/requests', {
      headers: { Authorization: `Bearer ${csrToken}` }
    });
    
    const customerRequests = requestsResponse.data.requests.filter(req => 
      req.requesterEmail === 'customer@sltmobitel.lk'
    );

    console.log(`\n📋 Found ${customerRequests.length} requests for customer@sltmobitel.lk`);

    // Find a pending request to complete
    const pendingRequest = customerRequests.find(req => req.status === 'pending');
    if (pendingRequest) {
      console.log(`\n1️⃣ Completing request: ${pendingRequest.requestId}`);
      await axios.put(
        `http://localhost:3001/api/v1/dsar/requests/${pendingRequest.id}`,
        {
          status: 'completed',
          processingNote: 'Request completed successfully by CSR team'
        },
        {
          headers: { Authorization: `Bearer ${csrToken}` }
        }
      );
      console.log('✅ Request marked as completed');
    }

    // Find another pending request to reject
    const anotherPendingRequest = customerRequests.find(req => 
      req.status === 'pending' && req.id !== pendingRequest?.id
    );
    if (anotherPendingRequest) {
      console.log(`\n2️⃣ Rejecting request: ${anotherPendingRequest.requestId}`);
      await axios.put(
        `http://localhost:3001/api/v1/dsar/requests/${anotherPendingRequest.id}`,
        {
          status: 'rejected',
          processingNote: 'Request rejected - insufficient documentation provided'
        },
        {
          headers: { Authorization: `Bearer ${csrToken}` }
        }
      );
      console.log('✅ Request marked as rejected');
    }

    console.log('\n🎉 Multiple status changes created!');
    console.log('\n📱 Now test the notifications:');
    console.log('   1. Go to http://localhost:5174/');
    console.log('   2. Login as: customer@sltmobitel.lk / customer123');
    console.log('   3. Go to DSAR Requests page');
    console.log('   4. Watch for notifications as the page auto-refreshes!');
    console.log('   5. You should see notifications for:');
    console.log('      - Request approved (in_progress)');
    console.log('      - Request completed');
    console.log('      - Request rejected');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

createMultipleStatusChanges();
