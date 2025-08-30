const axios = require('axios');

async function debugFrontendPreferencesIssue() {
  console.log('\n🔍 DEBUG: Frontend Preferences Loading Issue');
  console.log('='.repeat(80));
  
  try {
    // Step 1: Login
    const login = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'ojitharajapaksha@gmail.com',
      password: 'ABcd123#'
    });
    
    const token = login.data.token;
    console.log('✅ Login successful');
    
    // Step 2: Get the exact response the frontend receives
    console.log('\n📊 Getting preferences response...');
    const response = await axios.get('http://localhost:3001/api/v1/customer/preferences', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: { _t: Date.now() }
    });
    
    console.log('\n🔍 DETAILED RESPONSE ANALYSIS:');
    console.log('Response success:', response.data.success);
    console.log('Response has data:', !!response.data.data);
    
    if (response.data.data) {
      console.log('Data keys:', Object.keys(response.data.data));
      console.log('Communication array exists:', !!response.data.data.communication);
      console.log('Communication is array:', Array.isArray(response.data.data.communication));
      console.log('Communication length:', response.data.data.communication?.length || 0);
      
      if (response.data.data.communication && response.data.data.communication.length > 0) {
        const comm = response.data.data.communication[0];
        console.log('\n📋 COMMUNICATION PREFERENCES [0]:');
        console.log('- Has preferredChannels:', !!comm.preferredChannels);
        console.log('- Has topicSubscriptions:', !!comm.topicSubscriptions);
        console.log('- Has doNotDisturb:', !!comm.doNotDisturb);
        console.log('- Has timezone:', !!comm.timezone);
        console.log('- Has language:', !!comm.language);
        
        if (comm.preferredChannels) {
          console.log('\n🔗 Preferred Channels:');
          console.log('  - Email:', comm.preferredChannels.email);
          console.log('  - SMS:', comm.preferredChannels.sms);
          console.log('  - Push:', comm.preferredChannels.push);
        }
        
        if (comm.doNotDisturb) {
          console.log('\n🔕 Do Not Disturb:');
          console.log('  - Enabled:', comm.doNotDisturb.enabled);
          console.log('  - Start:', comm.doNotDisturb.start);
          console.log('  - End:', comm.doNotDisturb.end);
        }
        
        console.log('\n✅ FRONTEND SHOULD FIND COMMUNICATION PREFERENCES');
      } else {
        console.log('\n❌ NO COMMUNICATION PREFERENCES IN ARRAY');
      }
    } else {
      console.log('❌ NO DATA OBJECT IN RESPONSE');
    }
    
    // Step 3: Simulate the exact frontend condition
    console.log('\n🧪 SIMULATING FRONTEND LOGIC:');
    const communicationPrefs = response.data.data.communication && response.data.data.communication.length > 0 
      ? response.data.data.communication[0] 
      : null;
    
    console.log('Frontend condition result:', !!communicationPrefs);
    
    if (!communicationPrefs) {
      console.log('❌ FRONTEND LOGIC FAILING - communicationPrefs is null/undefined');
      console.log('Debug values:');
      console.log('  - response.data.data.communication:', response.data.data.communication);
      console.log('  - Array check:', Array.isArray(response.data.data.communication));
      console.log('  - Length:', response.data.data.communication?.length);
    } else {
      console.log('✅ Frontend logic should work correctly');
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugFrontendPreferencesIssue();
