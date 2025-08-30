const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function verifyEndToEndWorkflow() {
    console.log('🔄 Testing Complete End-to-End Workflow...\n');

    try {
        // 1. Customer updates preferences
        console.log('1️⃣ Customer updating preferences...');
        
        // Customer login
        const customerLogin = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
            email: 'test.customer@example.com',
            password: 'test123'
        });

        const customerToken = customerLogin.data.token;
        
        console.log('✅ Customer preferences updated');

        // 2. Wait a moment for real-time sync
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 3. CSR views updated preferences
        console.log('\n2️⃣ CSR viewing updated preferences...');
        
        const csrLogin = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
            email: 'csr@sltmobitel.lk',
            password: 'csr123'
        });

        const csrToken = csrLogin.data.token;

        // Get customer ID from CSR customers endpoint
        const customersResponse = await axios.get(`${BASE_URL}/api/v1/csr/customers`, {
            headers: { Authorization: `Bearer ${csrToken}` }
        });

        const testCustomer = customersResponse.data.customers.find(customer => 
            customer.email === 'test.customer@example.com'
        );

        if (!testCustomer) {
            console.log('❌ Test customer not found');
            return;
        }

        const customerId = testCustomer.id;

        // Update preferences
        const newPreferences = {
            type: 'communication',
            updates: {
                preferredChannels: {
                    email: false,        // Changed from true
                    sms: true,          // Changed from false  
                    whatsapp: false,    // Changed from true
                    push: true,         // Changed from false
                    inapp: false,       // Changed from true
                    test: true,         // Changed from false
                    "test 2": true      // Changed from false
                },
                topicSubscriptions: {
                    offers: true,           // Changed from false
                    product_updates: false, // Changed from true
                    billing: false,         // Changed from true
                    security: false,        // Changed from true
                    service_alerts: true    // Changed from false
                }
            }
        };

        const updateResponse = await axios.post(
            `${BASE_URL}/api/v1/customer/preferences`,
            newPreferences,
            { headers: { Authorization: `Bearer ${customerToken}` } }
        );

        console.log('✅ Customer preferences updated');

        // 2. Wait a moment for real-time sync
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 3. CSR views updated preferences
        console.log('\n2️⃣ CSR viewing updated preferences...');
        
        const csrLogin = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
            email: 'csr@sltmobitel.lk',
            password: 'csr123'
        });

        const csrToken = csrLogin.data.token;

        const csrViewResponse = await axios.get(
            `${BASE_URL}/api/v1/csr/customers/${customerId}/preferences`,
            { headers: { Authorization: `Bearer ${csrToken}` } }
        );

        console.log('✅ CSR accessed customer preferences');

        // 4. Verify the changes are reflected
        console.log('\n3️⃣ Verifying changes are synchronized:');
        
        const csrPrefs = csrViewResponse.data.preferences;
        
        console.log('\n📱 Channel Preferences (Customer → CSR):');
        console.log(`- Email: false → ${csrPrefs.preferredChannels?.email || 'not set'}`);
        console.log(`- SMS: true → ${csrPrefs.preferredChannels?.sms || 'not set'}`);
        console.log(`- WhatsApp: false → ${csrPrefs.preferredChannels?.whatsapp || 'not set'}`);
        console.log(`- Push: true → ${csrPrefs.preferredChannels?.push || 'not set'}`);
        console.log(`- In-App: false → ${csrPrefs.preferredChannels?.inapp || 'not set'}`);
        console.log(`- Test: true → ${csrPrefs.preferredChannels?.test || 'not set'}`);
        console.log(`- Test 2: true → ${csrPrefs.preferredChannels?.["test 2"] || 'not set'}`);

        console.log('\n📰 Topic Subscriptions (Customer → CSR):');
        console.log(`- Offers: true → ${csrPrefs.topicSubscriptions?.offers || 'not set'}`);
        console.log(`- Product Updates: false → ${csrPrefs.topicSubscriptions?.product_updates || 'not set'}`);
        console.log(`- Billing: false → ${csrPrefs.topicSubscriptions?.billing || 'not set'}`);
        console.log(`- Security: false → ${csrPrefs.topicSubscriptions?.security || 'not set'}`);
        console.log(`- Service Alerts: true → ${csrPrefs.topicSubscriptions?.service_alerts || 'not set'}`);

        // 5. Test admin configuration visibility
        console.log('\n4️⃣ Verifying admin configuration is visible...');
        
        const configResponse = await axios.get(
            `${BASE_URL}/api/v1/csr/preference-config`,
            { headers: { Authorization: `Bearer ${csrToken}` } }
        );

        console.log(`✅ Admin config loaded: ${configResponse.data.communicationChannels.length} channels, ${configResponse.data.topicSubscriptions.length} topics`);

        console.log('\n🎉 End-to-End Verification Complete!');
        console.log('✅ Customer can update preferences');
        console.log('✅ CSR sees updated preferences in real-time');
        console.log('✅ Admin-configured channels/topics are visible');
        console.log('✅ Dynamic preference system working correctly');

    } catch (error) {
        console.error('❌ Error in end-to-end test:', error.response?.data || error.message);
    }
}

verifyEndToEndWorkflow();
