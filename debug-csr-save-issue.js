const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testCSRPreferenceSave() {
    console.log('🔍 Testing CSR Preference Save Issue...\n');

    try {
        // 1. Login as CSR
        console.log('1️⃣ CSR Login...');
        const csrLogin = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
            email: 'csr@sltmobitel.lk',
            password: 'csr123'
        });
        const csrToken = csrLogin.data.token;
        console.log('✅ CSR logged in');

        // 2. Get customer list
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
        console.log('✅ Found test customer:', customerId);

        // 3. Get current preferences
        console.log('\n2️⃣ Getting current preferences...');
        const currentPrefsResponse = await axios.get(`${BASE_URL}/api/v1/csr/customers/${customerId}/preferences`, {
            headers: { Authorization: `Bearer ${csrToken}` }
        });

        console.log('Current preferences:');
        console.log(JSON.stringify(currentPrefsResponse.data.preferences, null, 2));

        // 4. Update preferences (turn OFF everything except email)
        console.log('\n3️⃣ CSR updating preferences (only email ON)...');
        const newPreferences = {
            preferredChannels: {
                email: true,           // ONLY email should be ON
                sms: false,           
                whatsapp: false,      
                push: false,          // This should be OFF
                inapp: false,         
                test: false,          
                "test 2": false       
            },
            topicSubscriptions: {
                offers: false,
                product_updates: true,  // Keep some topics for testing
                billing: true,
                security: true,
                service_alerts: false
            },
            doNotDisturb: {
                enabled: false,
                start: '22:00',
                end: '08:00'
            },
            frequency: 'immediate',
            timezone: 'Asia/Colombo',
            language: 'en'
        };

        console.log('Sending update with preferences:');
        console.log(JSON.stringify(newPreferences, null, 2));

        const updateResponse = await axios.put(`${BASE_URL}/api/v1/csr/customers/${customerId}/preferences`, {
            preferences: newPreferences
        }, {
            headers: { Authorization: `Bearer ${csrToken}` }
        });

        console.log('✅ CSR update response:', updateResponse.data);

        // 5. Wait a moment then check what was actually saved
        console.log('\n4️⃣ Checking what was actually saved...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        const verifyResponse = await axios.get(`${BASE_URL}/api/v1/csr/customers/${customerId}/preferences`, {
            headers: { Authorization: `Bearer ${csrToken}` }
        });

        const savedPrefs = verifyResponse.data.preferences;
        console.log('\nSaved preferences:');
        console.log(JSON.stringify(savedPrefs, null, 2));

        // 6. Check specific channels
        console.log('\n5️⃣ Channel verification:');
        console.log(`- Email: Expected TRUE → Actual ${savedPrefs.preferredChannels?.email}`);
        console.log(`- SMS: Expected FALSE → Actual ${savedPrefs.preferredChannels?.sms}`);  
        console.log(`- WhatsApp: Expected FALSE → Actual ${savedPrefs.preferredChannels?.whatsapp}`);
        console.log(`- Push: Expected FALSE → Actual ${savedPrefs.preferredChannels?.push}`);
        console.log(`- In-App: Expected FALSE → Actual ${savedPrefs.preferredChannels?.inapp}`);
        console.log(`- Test: Expected FALSE → Actual ${savedPrefs.preferredChannels?.test}`);
        console.log(`- Test 2: Expected FALSE → Actual ${savedPrefs.preferredChannels?.["test 2"]}`);

        // 7. Check if push is incorrectly turned on
        if (savedPrefs.preferredChannels?.push === true) {
            console.log('\n🚨 ISSUE FOUND: Push notifications is ON but should be OFF!');
            
            // Let's see if there are any default values being applied
            console.log('\n🔍 Investigating backend response...');
            
            // Check if there's a default preference config affecting this
            const configResponse = await axios.get(`${BASE_URL}/api/v1/csr/preference-config`, {
                headers: { Authorization: `Bearer ${csrToken}` }
            });
            
            console.log('Admin preference config:');
            console.log(JSON.stringify(configResponse.data, null, 2));
            
        } else {
            console.log('\n✅ Preferences saved correctly');
        }

    } catch (error) {
        console.error('❌ Error in CSR preference test:', error.response?.data || error.message);
        if (error.response?.data) {
            console.log('Error details:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testCSRPreferenceSave();
