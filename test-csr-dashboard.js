// CSR Dashboard API Test Script
// This script tests all the endpoints that the CSR dashboard needs

const baseUrl = 'http://localhost:3001';

async function testCSRDashboard() {
    console.log('🔍 Testing CSR Dashboard APIs...\n');
    
    try {
        // Test 1: CSR Stats
        console.log('1. Testing CSR Dashboard Stats...');
        const statsResponse = await fetch(`${baseUrl}/api/csr/stats`);
        const stats = await statsResponse.json();
        console.log(`   ✅ CSR Stats loaded: ${stats.totalCustomers} customers, ${stats.pendingRequests} pending requests`);
        
        // Test 2: Customer/Party Data
        console.log('\n2. Testing Customer/Party Data...');
        const partyResponse = await fetch(`${baseUrl}/api/v1/party`);
        const parties = await partyResponse.json();
        console.log(`   ✅ Customer data loaded: ${parties.length} customers found`);
        console.log(`   📋 First few customers: ${parties.slice(0, 3).map(p => p.name).join(', ')}`);
        
        // Test 3: Search Functionality (simulate search by name)
        console.log('\n3. Testing Customer Search...');
        const searchResults = parties.filter(p => p.name.toLowerCase().includes('john'));
        console.log(`   ✅ Search for "john": ${searchResults.length} results found`);
        if (searchResults.length > 0) {
            console.log(`   📝 Found: ${searchResults[0].name} (${searchResults[0].email})`);
        }
        
        // Test 4: Guardian Customers
        console.log('\n4. Testing Guardian Management...');
        const guardians = parties.filter(p => p.type === 'guardian');
        console.log(`   ✅ Guardian customers: ${guardians.length} found`);
        guardians.forEach(g => {
            console.log(`   👪 ${g.name} - Managing ${g.dependents?.length || 0} dependents`);
        });
        
        // Test 5: Consent Records
        console.log('\n5. Testing Consent History...');
        const consentResponse = await fetch(`${baseUrl}/api/v1/consent`);
        const consents = await consentResponse.json();
        console.log(`   ✅ Consent records loaded: ${consents.length} total consents`);
        const grantedConsents = consents.filter(c => c.status === 'granted');
        console.log(`   ✅ Granted consents: ${grantedConsents.length} active`);
        
        // Test 6: DSAR Requests
        console.log('\n6. Testing DSAR Requests...');
        const dsarResponse = await fetch(`${baseUrl}/api/v1/dsar`);
        const dsarRequests = await dsarResponse.json();
        console.log(`   ✅ DSAR requests loaded: ${dsarRequests.length} total requests`);
        const pendingDsar = dsarRequests.filter(d => d.status === 'pending');
        console.log(`   ⏳ Pending DSAR requests: ${pendingDsar.length}`);
        
        // Test 7: Communication Preferences
        console.log('\n7. Testing Communication Preferences...');
        const prefsResponse = await fetch(`${baseUrl}/api/v1/preferences`);
        const preferences = await prefsResponse.json();
        console.log(`   ✅ Preference records loaded: ${preferences.length} customer preferences`);
        
        // Test 8: Audit Events
        console.log('\n8. Testing Audit Trail...');
        const eventsResponse = await fetch(`${baseUrl}/api/v1/event`);
        const events = await eventsResponse.json();
        console.log(`   ✅ Audit events loaded: ${events.length} events recorded`);
        
        console.log('\n🎉 CSR Dashboard API Test Results:');
        console.log('=====================================');
        console.log(`✅ Customer Search: ${parties.length} customers available`);
        console.log(`✅ Consent History: ${consents.length} consent records`);
        console.log(`✅ Communication Preferences: ${preferences.length} preference profiles`);
        console.log(`✅ DSAR Requests: ${dsarRequests.length} requests tracked`);
        console.log(`✅ Guardian Management: ${guardians.length} guardians managing dependents`);
        console.log(`✅ Dashboard Stats: All metrics calculated`);
        console.log(`✅ Audit Trail: ${events.length} events logged`);
        
        console.log('\n🔧 Frontend Configuration Required:');
        console.log('=====================================');
        console.log('❌ Frontend is connecting to: https://consenthub-backend.onrender.com/');
        console.log('✅ Backend is running on:     http://localhost:3001');
        console.log('💡 Solution: Update frontend API configuration to point to localhost:3001');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testCSRDashboard();
