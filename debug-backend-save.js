const axios = require('axios');

async function debugBackendSave() {
  try {
    console.log('🔍 Debugging what backend receives...\n');
    
    const baseURL = 'http://localhost:3001/api/v1';
    
    // Login
    const loginData = {
      email: 'test.customer@example.com',
      password: 'TestPassword123!'
    };
    
    const loginResponse = await axios.post(`${baseURL}/auth/login`, loginData);
    const authToken = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Create the exact data structure that frontend sends
    const saveData = {
      type: 'communication',
      updates: {
        preferredChannels: {
          whatsapp: true,
          email: true,
          sms: false,
          push: false,
          inapp: true,
          test: false,
          'test 2': false
        },
        topicSubscriptions: {
          offers: false,
          product_updates: true,
          billing: true,
          security: true,
          service_alerts: false
        },
        frequency: 'daily',
        timezone: 'Asia/Colombo',
        language: 'en',
        quietHours: {
          enabled: true,
          start: '22:00',
          end: '08:00'
        }
      }
    };
    
    console.log('\n📤 Sending to backend:');
    console.log('Structure:', JSON.stringify(saveData, null, 2));
    
    const saveResponse = await axios.post(`${baseURL}/customer/preferences`, saveData, {
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n✅ Backend response:', saveResponse.data);
    
    // Check what was actually saved
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const getResponse = await axios.get(`${baseURL}/customer/preferences`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const savedData = getResponse.data.data;
    const commPrefs = savedData.communication && savedData.communication[0];
    
    console.log('\n📥 What was actually saved:');
    console.log('Channels:', JSON.stringify(commPrefs?.preferredChannels, null, 2));
    console.log('Topics:', JSON.stringify(commPrefs?.topicSubscriptions, null, 2));
    
    // Compare what we sent vs what was saved
    console.log('\n🔍 Comparison:');
    console.log('Sent channels:', JSON.stringify(saveData.updates.preferredChannels));
    console.log('Saved channels:', JSON.stringify(commPrefs?.preferredChannels));
    console.log('Channels match:', JSON.stringify(saveData.updates.preferredChannels) === JSON.stringify(commPrefs?.preferredChannels) ? '✅' : '❌');
    
    console.log('Sent topics:', JSON.stringify(saveData.updates.topicSubscriptions));
    console.log('Saved topics:', JSON.stringify(commPrefs?.topicSubscriptions));
    console.log('Topics match:', JSON.stringify(saveData.updates.topicSubscriptions) === JSON.stringify(commPrefs?.topicSubscriptions) ? '✅' : '❌');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
  }
}

debugBackendSave();
