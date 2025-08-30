const axios = require('axios');

async function debugPreferenceSave() {
  try {
    console.log('🔍 Debugging preference save issue...\n');
    
    const baseURL = 'http://localhost:3001/api/v1';
    
    // Use existing customer credentials
    const loginData = {
      email: 'test.customer@example.com',
      password: 'TestPassword123!'
    };
    
    // Login to get auth token
    console.log('1️⃣ Logging in customer...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, loginData);
    const authToken = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Check what backend actually saves
    console.log('\n2️⃣ Saving preferences with detailed logging...');
    const newPreferences = {
      type: 'communication',
      updates: {
        preferredChannels: {
          email: true,
          sms: true,
          phone: false,
          push: true,
          whatsapp: false
        },
        topicSubscriptions: {
          offers: true,
          product_updates: false,
          billing: true,
          security: true,
          service_alerts: false
        },
        frequency: 'daily',
        timezone: 'UTC',
        language: 'en',
        quietHours: {
          enabled: true,
          start: '22:00',
          end: '08:00'
        }
      }
    };
    
    const saveResponse = await axios.post(`${baseURL}/customer/preferences`, newPreferences, {
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Save response:', saveResponse.data);
    
    // Wait a moment for database to update
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get preferences with detailed response
    console.log('\n3️⃣ Fetching saved preferences...');
    const getResponse = await axios.get(`${baseURL}/customer/preferences`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    console.log('Full GET response:', JSON.stringify(getResponse.data, null, 2));
    
    // Check if the problem is in the data structure
    const preferences = getResponse.data.data;
    if (preferences && preferences.length > 0) {
      console.log('\n✅ Found preferences:');
      preferences.forEach((pref, index) => {
        console.log(`Preference ${index + 1}:`, {
          type: pref.preferenceType,
          channels: pref.preferredChannels,
          topics: pref.topicSubscriptions,
          frequency: pref.frequency
        });
      });
    } else {
      console.log('\n❌ No preferences found in response');
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
  }
}

debugPreferenceSave();
