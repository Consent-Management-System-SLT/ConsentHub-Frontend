const axios = require('axios');

async function quickCSRAction() {
  try {
    console.log('🚀 Quick CSR Action Test\n');

    // Login as CSR
    const csrLogin = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'csr@sltmobitel.lk',
      password: 'csr123'
    });
    
    const csrToken = csrLogin.data.token;
    
    // Get pending requests
    const requestsResponse = await axios.get('http://localhost:3001/api/v1/dsar/requests', {
      headers: { Authorization: `Bearer ${csrToken}` }
    });
    
    const pendingRequest = requestsResponse.data.requests.find(req => 
      req.requesterEmail === 'customer@sltmobitel.lk' && req.status === 'pending'
    );

    if (!pendingRequest) {
      console.log('❌ No pending requests found for customer@sltmobitel.lk');
      return;
    }

    console.log(`📋 Found request: ${pendingRequest.requestId} (${pendingRequest.status})`);
    console.log('🔄 Approving request...');
    
    // Approve the request
    await axios.put(
      `http://localhost:3001/api/v1/dsar/requests/${pendingRequest.id}`,
      {
        status: 'in_progress',
        processingNote: 'Approved for real-time testing'
      },
      {
        headers: { 
          Authorization: `Bearer ${csrToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Request approved! Customer should see instant update.');
    console.log('📱 Check customer dashboard for real-time notification!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

quickCSRAction();
