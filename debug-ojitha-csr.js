const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function debugOjithaCSR() {
  console.log('🔍 Debugging Ojitha preferences in CSR dashboard...\n');

  try {
    // 1. Login as CSR
    console.log('1. 🔐 Logging in as CSR...');
    const csrLogin = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
      email: 'csr@sltmobitel.lk',
      password: 'csr123'
    });

    const csrToken = csrLogin.data.token;
    console.log('✅ CSR logged in successfully\n');

    // 2. Search for Ojitha user
    console.log('2. 🔍 Searching for Ojitha user...');
    const searchResponse = await axios.get(`${BASE_URL}/api/v1/csr/customers?search=ojitharajapaksha@gmail.com`, {
      headers: { 'Authorization': `Bearer ${csrToken}` }
    });

    console.log('Search results:');
    if (searchResponse.data.customers && searchResponse.data.customers.length > 0) {
      const ojitha = searchResponse.data.customers[0];
      console.log(`✅ Found: ${ojitha.email} - ${ojitha.firstName} ${ojitha.lastName}`);
      console.log(`   Customer ID: ${ojitha.id}\n`);

      // 3. Get current preferences before any changes
      console.log('3. 📋 Getting current preferences...');
      const currentPrefs = await axios.get(`${BASE_URL}/api/v1/csr/customers/${ojitha.id}/preferences`, {
        headers: { 'Authorization': `Bearer ${csrToken}` }
      });

      console.log('Current preferences:');
      if (currentPrefs.data.preferences) {
        const pref = currentPrefs.data.preferences;
        console.log(`   Email: ${pref.preferredChannels?.email}`);
        console.log(`   SMS: ${pref.preferredChannels?.sms}`);
        console.log(`   Push: ${pref.preferredChannels?.push}`);
        console.log(`   Marketing: ${pref.topicSubscriptions?.marketing}`);
        console.log(`   Security: ${pref.topicSubscriptions?.security}`);
        console.log(`   Billing: ${pref.topicSubscriptions?.billing}`);
        console.log(`   Newsletter: ${pref.topicSubscriptions?.newsletter}`);
        console.log(`   DND enabled: ${pref.quietHours?.enabled}`);
        console.log(`   Last updated: ${pref.updatedAt || pref.lastUpdated}\n`);
      } else {
        console.log('   ❌ No preferences found - creating default ones...\n');
        
        // Create default preferences
        const createPrefs = await axios.put(`${BASE_URL}/api/v1/csr/customers/${ojitha.id}/preferences`, {
          preferences: {
            channels: {
              email: true,
              sms: false,
              push: true,
              phone: false
            },
            topics: {
              marketing: false,
              security: true,
              billing: true,
              newsletter: false
            },
            dndSettings: {
              enabled: true,
              start: "22:00",
              end: "08:00"
            },
            frequency: "immediate",
            timezone: "Asia/Colombo",
            language: "en"
          }
        }, {
          headers: { 'Authorization': `Bearer ${csrToken}` }
        });
        
        console.log('✅ Default preferences created');
        console.log('New preferences:', createPrefs.data);
      }

      // 4. Make a test update
      console.log('\n4. 🔄 Making test update to preferences...');
      const updateResponse = await axios.put(`${BASE_URL}/api/v1/csr/customers/${ojitha.id}/preferences`, {
        preferences: {
          channels: {
            email: false,
            sms: true,
            push: true,
            phone: true
          },
          topics: {
            marketing: true,
            security: true,
            billing: false,
            newsletter: true
          },
          dndSettings: {
            enabled: false,
            start: "23:00",
            end: "07:00"
          },
          frequency: "daily",
          timezone: "Asia/Colombo",
          language: "en"
        }
      }, {
        headers: { 'Authorization': `Bearer ${csrToken}` }
      });

      console.log('✅ Update completed');
      console.log('Update response:', updateResponse.data);

      // 5. Immediately check if the changes are saved
      console.log('\n5. 📋 Checking preferences immediately after update...');
      const afterUpdate = await axios.get(`${BASE_URL}/api/v1/csr/customers/${ojitha.id}/preferences`, {
        headers: { 'Authorization': `Bearer ${csrToken}` }
      });

      console.log('Preferences after update:');
      if (afterUpdate.data.preferences) {
        const pref = afterUpdate.data.preferences;
        console.log(`   Email: ${pref.preferredChannels?.email} (should be false)`);
        console.log(`   SMS: ${pref.preferredChannels?.sms} (should be true)`);
        console.log(`   Push: ${pref.preferredChannels?.push} (should be true)`);
        console.log(`   Phone: ${pref.preferredChannels?.phone} (should be true)`);
        console.log(`   Marketing: ${pref.topicSubscriptions?.marketing} (should be true)`);
        console.log(`   Security: ${pref.topicSubscriptions?.security} (should be true)`);
        console.log(`   Billing: ${pref.topicSubscriptions?.billing} (should be false)`);
        console.log(`   Newsletter: ${pref.topicSubscriptions?.newsletter} (should be true)`);
        console.log(`   DND enabled: ${pref.quietHours?.enabled} (should be false)`);
        console.log(`   Frequency: ${pref.frequency} (should be daily)`);
        console.log(`   Last updated: ${pref.updatedAt || pref.lastUpdated}\n`);
      }

      // 6. Test "refresh" by making another request with delay
      console.log('6. ⏳ Waiting 3 seconds and checking again (simulating refresh)...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      const afterRefresh = await axios.get(`${BASE_URL}/api/v1/csr/customers/${ojitha.id}/preferences`, {
        headers: { 'Authorization': `Bearer ${csrToken}` }
      });

      console.log('Preferences after "refresh":');
      if (afterRefresh.data.preferences) {
        const pref = afterRefresh.data.preferences;
        console.log(`   Email: ${pref.preferredChannels?.email}`);
        console.log(`   SMS: ${pref.preferredChannels?.sms}`);
        console.log(`   Push: ${pref.preferredChannels?.push}`);
        console.log(`   Phone: ${pref.preferredChannels?.phone}`);
        console.log(`   Marketing: ${pref.topicSubscriptions?.marketing}`);
        console.log(`   Security: ${pref.topicSubscriptions?.security}`);
        console.log(`   Billing: ${pref.topicSubscriptions?.billing}`);
        console.log(`   Newsletter: ${pref.topicSubscriptions?.newsletter}`);
        console.log(`   DND enabled: ${pref.quietHours?.enabled}`);
        console.log(`   Frequency: ${pref.frequency}`);
        console.log(`   Last updated: ${pref.updatedAt || pref.lastUpdated}`);

        // Check if changes persisted
        const changesLost = 
          pref.preferredChannels?.email !== false ||
          pref.preferredChannels?.sms !== true ||
          pref.topicSubscriptions?.marketing !== true ||
          pref.topicSubscriptions?.billing !== false;

        if (changesLost) {
          console.log('\n❌ PROBLEM CONFIRMED: Changes were lost after refresh!');
        } else {
          console.log('\n✅ Changes persisted correctly after refresh');
        }
      }

    } else {
      console.log('❌ User not found in search results');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugOjithaCSR();
