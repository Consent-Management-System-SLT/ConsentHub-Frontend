const axios = require('axios');

async function csrTool() {
  try {
    // Login as CSR
    const csrLogin = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'csr@sltmobitel.lk',
      password: 'csr123'
    });
    
    const csrToken = csrLogin.data.token;

    // Get all pending requests for customer@sltmobitel.lk
    const requestsResponse = await axios.get('http://localhost:3001/api/v1/dsar/requests', {
      headers: { Authorization: `Bearer ${csrToken}` }
    });
    
    const pendingRequests = requestsResponse.data.requests.filter(req => 
      req.requesterEmail === 'customer@sltmobitel.lk' && req.status === 'pending'
    );

    console.log('\n📋 CSR Quick Tool - Pending Requests:\n');
    
    if (pendingRequests.length === 0) {
      console.log('✅ No pending requests for customer@sltmobitel.lk');
      return;
    }

    pendingRequests.forEach((req, index) => {
      console.log(`${index + 1}. ${req.requestId}`);
      console.log(`   Status: ${req.status}`);
      console.log(`   Type: ${req.requestType}`);
      console.log(`   Date: ${req.submittedAt.split('T')[0]}`);
      console.log(`   Description: ${req.description.substring(0, 50)}...`);
      console.log('');
    });

    console.log('💡 To approve/reject/complete any request:');
    console.log('   1. Note the Request ID from above');
    console.log('   2. Run the appropriate command:');
    console.log('');
    console.log('   📝 To APPROVE request:');
    console.log('   node -e "const axios=require(\'axios\'); (async()=>{const login=await axios.post(\'http://localhost:3001/api/v1/auth/login\',{email:\'csr@sltmobitel.lk\',password:\'csr123\'}); await axios.put(\'http://localhost:3001/api/v1/dsar/requests/REQUEST_ID\',{status:\'in_progress\',processingNote:\'Approved by CSR\'},{headers:{Authorization:`Bearer ${login.data.token}`}}); console.log(\'✅ Approved!\');})()"');
    console.log('');
    console.log('   ❌ To REJECT request:');
    console.log('   node -e "const axios=require(\'axios\'); (async()=>{const login=await axios.post(\'http://localhost:3001/api/v1/auth/login\',{email:\'csr@sltmobitel.lk\',password:\'csr123\'}); await axios.put(\'http://localhost:3001/api/v1/dsar/requests/REQUEST_ID\',{status:\'rejected\',processingNote:\'Rejected by CSR - reason here\'},{headers:{Authorization:`Bearer ${login.data.token}`}}); console.log(\'❌ Rejected!\');})()"');
    console.log('');
    console.log('   ✅ To COMPLETE request:');
    console.log('   node -e "const axios=require(\'axios\'); (async()=>{const login=await axios.post(\'http://localhost:3001/api/v1/auth/login\',{email:\'csr@sltmobitel.lk\',password:\'csr123\'}); await axios.put(\'http://localhost:3001/api/v1/dsar/requests/REQUEST_ID\',{status:\'completed\',processingNote:\'Completed by CSR\'},{headers:{Authorization:`Bearer ${login.data.token}`}}); console.log(\'✅ Completed!\');})()"');
    console.log('');
    console.log('   ⚠️ Replace REQUEST_ID with the actual ID (like 68adb4e3467615e63ad15ba3)');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

csrTool();
