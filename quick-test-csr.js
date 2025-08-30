const axios = require('axios');

async function quickTestCSRFix() {
    console.log('🔧 Quick CSR Fix Test...\n');

    try {
        // Login as CSR
        const csrLogin = await axios.post('http://localhost:3001/api/v1/auth/login', {
            email: 'csr@sltmobitel.lk',
            password: 'csr123'
        });
        console.log('✅ CSR logged in');

        // Get test customer
        const customersResponse = await axios.get('http://localhost:3001/api/v1/csr/customers', {
            headers: { Authorization: `Bearer ${csrLogin.data.token}` }
        });

        const customer = customersResponse.data.customers[0]; // Use first customer
        console.log('✅ Using customer:', customer.email);

        // Test the EXACT update that was failing - only email=true, everything else=false
        const testPreferences = {
            preferredChannels: {
                email: true,           // ONLY this should be true
                sms: false,           
                whatsapp: false,      
                push: false,          // This should stay FALSE  
                inapp: false,         
                test: false,          
                "test 2": false       
            },
            topicSubscriptions: {
                offers: false,
                product_updates: true,
                billing: true,
                security: true,
                service_alerts: false
            }
        };

        console.log('\n🔄 Updating preferences (email=true, push=false)...');
        
        const updateResponse = await axios.put(
            `http://localhost:3001/api/v1/csr/customers/${customer.id}/preferences`, 
            { preferences: testPreferences },
            { headers: { Authorization: `Bearer ${csrLogin.data.token}` } }
        );

        console.log('\n📋 Backend response preferredChannels:');
        console.log('- Email:', updateResponse.data.preferences.preferredChannels.email);
        console.log('- Push:', updateResponse.data.preferences.preferredChannels.push, '← Should be FALSE');
        console.log('- WhatsApp:', updateResponse.data.preferences.preferredChannels.whatsapp);
        console.log('- In-App:', updateResponse.data.preferences.preferredChannels.inapp);

        // Verify the fix
        if (updateResponse.data.preferences.preferredChannels.push === false) {
            console.log('\n🎉 SUCCESS: Push is correctly FALSE!');
            console.log('✅ CSR preference save issue FIXED!');
        } else {
            console.log('\n❌ STILL BROKEN: Push is', updateResponse.data.preferences.preferredChannels.push);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data?.message || error.message);
    }
}

quickTestCSRFix();
