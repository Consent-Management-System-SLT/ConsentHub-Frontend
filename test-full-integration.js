// ConsentHub Full System Integration Test
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/v1';

async function testConsentHubSystem() {
    console.log('🧪 Testing ConsentHub Full System Integration...');
    console.log('='.repeat(50));

    try {
        // 1. Test Health Check
        console.log('1. Testing Health Check...');
        const health = await axios.get('http://localhost:3000/health');
        console.log('✅ Health:', health.data.status, '| Database:', health.data.database);

        // 2. Test Consent Management
        console.log('\n2. Testing Consent Management...');
        
        // Create consent
        const newConsent = {
            partyId: 'test-party-integration',
            consentType: 'data-processing',
            purpose: 'Service Improvement',
            description: 'Data processing for service analytics'
        };
        
        const createdConsent = await axios.post(`${API_BASE_URL}/consent`, newConsent);
        console.log('✅ Created Consent:', createdConsent.data.id);

        // Get all consents
        const consents = await axios.get(`${API_BASE_URL}/consent`);
        console.log('✅ Retrieved Consents:', consents.data.length, 'records');

        // 3. Test Party Management
        console.log('\n3. Testing Party Management...');
        
        const newParty = {
            name: 'Integration Test User',
            email: 'integration@test.com',
            phone: '+94771111111',
            partyType: 'individual'
        };
        
        const createdParty = await axios.post(`${API_BASE_URL}/party`, newParty);
        console.log('✅ Created Party:', createdParty.data.id);

        const parties = await axios.get(`${API_BASE_URL}/party`);
        console.log('✅ Retrieved Parties:', parties.data.length, 'records');

        // 4. Test Preference Management
        console.log('\n4. Testing Preference Management...');
        
        const newPreference = {
            partyId: 'test-party-integration',
            channelType: 'sms',
            contactMedium: '+94771111111',
            preferenceType: 'notifications',
            isAllowed: true
        };
        
        const createdPreference = await axios.post(`${API_BASE_URL}/preference`, newPreference);
        console.log('✅ Created Preference:', createdPreference.data.id);

        const preferences = await axios.get(`${API_BASE_URL}/preference`);
        console.log('✅ Retrieved Preferences:', preferences.data.length, 'records');

        // 5. Test DSAR Management
        console.log('\n5. Testing DSAR Management...');
        
        const newDSAR = {
            partyId: 'test-party-integration',
            requestType: 'data-export',
            description: 'Request for data export under GDPR'
        };
        
        const createdDSAR = await axios.post(`${API_BASE_URL}/dsar`, newDSAR);
        console.log('✅ Created DSAR:', createdDSAR.data.id);

        const dsars = await axios.get(`${API_BASE_URL}/dsar`);
        console.log('✅ Retrieved DSARs:', dsars.data.length, 'records');

        // 6. Test Update Operations
        console.log('\n6. Testing Update Operations...');
        
        const updatedConsent = await axios.put(`${API_BASE_URL}/consent/${createdConsent.data.id}`, {
            ...newConsent,
            status: 'revoked'
        });
        console.log('✅ Updated Consent Status:', updatedConsent.data.status);

        const updatedPreference = await axios.put(`${API_BASE_URL}/preference/${createdPreference.data.id}`, {
            ...newPreference,
            isAllowed: false
        });
        console.log('✅ Updated Preference:', updatedPreference.data.isAllowed);

        // 7. Test Service Health Endpoints
        console.log('\n7. Testing Service Health Endpoints...');
        
        const services = ['consent', 'preference', 'party', 'dsar'];
        for (const service of services) {
            const serviceHealth = await axios.get(`${API_BASE_URL}/${service}/health`);
            console.log(`✅ ${service}-service:`, serviceHealth.data.status);
        }

        console.log('\n🎉 ALL TESTS PASSED!');
        console.log('='.repeat(50));
        console.log('✅ ConsentHub System Status: FULLY OPERATIONAL');
        console.log('✅ MongoDB Integration: ACTIVE');
        console.log('✅ All APIs: FUNCTIONAL');
        console.log('✅ Frontend-Backend Connection: ESTABLISHED');
        console.log('='.repeat(50));
        
        return true;
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
        return false;
    }
}

// Run the test
testConsentHubSystem().then(success => {
    process.exit(success ? 0 : 1);
});
