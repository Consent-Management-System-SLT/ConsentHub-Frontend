const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function debugCSRCustomerSync() {
  console.log('🔍 Debugging CSR → Customer sync issue...\n');

  try {
    // Login as customer
    const customerLogin = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
      email: 'dinuka@gmail.com',
      password: 'ABcd123#'
    });

    // Login as CSR
    const csrLogin = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
      email: 'csr@sltmobitel.lk',
      password: 'csr123'
    });

    const customerToken = customerLogin.data.token;
    const csrToken = csrLogin.data.token;
    const customerId = customerLogin.data.user.id;

    console.log('✅ Both logins successful');
    console.log(`   Customer ID: ${customerId}\n`);

    // Get initial customer preferences
    console.log('1. 📋 Initial customer preferences:');
    const initialCustomer = await axios.get(`${BASE_URL}/api/v1/customer/preferences`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });

    console.log('Raw customer response:');
    console.log(JSON.stringify(initialCustomer.data, null, 2));

    if (initialCustomer.data.data && initialCustomer.data.data.communication && initialCustomer.data.data.communication[0]) {
      const commPref = initialCustomer.data.data.communication[0];
      console.log('Customer sees:');
      console.log(`   Email: ${commPref.preferredChannels.email}`);
      console.log(`   SMS: ${commPref.preferredChannels.sms}`);
      console.log(`   Marketing: ${commPref.topicSubscriptions.marketing}`);
      console.log(`   Security: ${commPref.topicSubscriptions.security}\n`);
    } else {
      console.log('❌ No communication preferences found in expected format\n');
      return;
    }

    // CSR makes an update
    console.log('2. 🔄 CSR updating preferences...');
    const csrUpdate = await axios.put(`${BASE_URL}/api/v1/csr/customers/${customerId}/preferences`, {
      preferredChannels: {
        email: true,
        sms: false,
        push: true,
        phone: false
      },
      topicSubscriptions: {
        marketing: false,
        security: true,
        billing: false,
        newsletter: true
      },
      quietHours: {
        enabled: false,
        start: "22:00",
        end: "08:00"
      },
      frequency: "immediate",
      timezone: "Asia/Colombo",
      language: "en"
    }, {
      headers: { 'Authorization': `Bearer ${csrToken}` }
    });

    console.log(`✅ CSR update status: ${csrUpdate.status}`);
    if (csrUpdate.data) {
      console.log('CSR update response:', JSON.stringify(csrUpdate.data, null, 2));
    }

    // Wait a moment for the update
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check what customer sees after CSR update
    console.log('\n3. 📋 Customer preferences after CSR update:');
    const afterUpdate = await axios.get(`${BASE_URL}/api/v1/customer/preferences`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });

    console.log('Full response structure:');
    console.log(JSON.stringify(afterUpdate.data, null, 2));

    if (afterUpdate.data.data && afterUpdate.data.data.communication && afterUpdate.data.data.communication[0]) {
      const updatedCommPref = afterUpdate.data.data.communication[0];
      console.log('\nCustomer now sees:');
      console.log(`   Email: ${updatedCommPref.preferredChannels?.email}`);
      console.log(`   SMS: ${updatedCommPref.preferredChannels?.sms}`);
      console.log(`   Marketing: ${updatedCommPref.topicSubscriptions?.marketing}`);
      console.log(`   Security: ${updatedCommPref.topicSubscriptions?.security}`);
      console.log(`   Billing: ${updatedCommPref.topicSubscriptions?.billing}`);
      console.log(`   Newsletter: ${updatedCommPref.topicSubscriptions?.newsletter}`);
      console.log(`   DND enabled: ${updatedCommPref.doNotDisturb?.enabled || updatedCommPref.quietHours?.enabled}`);
    } else {
      console.log('❌ No communication preferences found in customer response');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugCSRCustomerSync();
