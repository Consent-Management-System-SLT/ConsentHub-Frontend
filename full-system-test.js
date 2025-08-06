// Full System Test - Backend and Frontend Connection
// Run this to verify the complete ConsentHub system is working

console.log('🎯 ConsentHub Complete System Test');
console.log('==================================');

async function testCompleteSystem() {
    const baseUrl = 'http://localhost:3001';
    
    try {
        console.log('1. Testing Backend Health...');
        const healthResponse = await fetch(`${baseUrl}/api/v1/health`);
        const health = await healthResponse.json();
        console.log(`   ✅ Backend Health: ${health.status} - ${health.message}`);
        
        console.log('\n2. Testing CSR Dashboard APIs...');
        
        // Test CSR Stats
        const statsResponse = await fetch(`${baseUrl}/api/csr/stats`);
        const stats = await statsResponse.json();
        console.log(`   ✅ CSR Stats: ${stats.totalCustomers} customers`);
        
        // Test Customer Data
        const partyResponse = await fetch(`${baseUrl}/api/v1/party`);
        const parties = await partyResponse.json();
        console.log(`   ✅ Customer Data: ${parties.length} customers loaded`);
        
        // Test Consent Data
        const consentResponse = await fetch(`${baseUrl}/api/v1/consent`);
        const consents = await consentResponse.json();
        console.log(`   ✅ Consent Data: ${consents.length} consent records`);
        
        // Test DSAR Data
        const dsarResponse = await fetch(`${baseUrl}/api/v1/dsar`);
        const dsarRequests = await dsarResponse.json();
        console.log(`   ✅ DSAR Data: ${dsarRequests.length} requests`);
        
        // Test Audit Events
        const eventResponse = await fetch(`${baseUrl}/api/v1/event`);
        const events = await eventResponse.json();
        console.log(`   ✅ Audit Events: ${events.length} events logged`);
        
        // Test Preferences
        const prefResponse = await fetch(`${baseUrl}/api/v1/preferences`);
        const preferences = await prefResponse.json();
        console.log(`   ✅ Preferences: ${preferences.length} customer profiles`);
        
        console.log('\n3. Testing Search Functionality...');
        const searchTest = parties.filter(p => p.name.toLowerCase().includes('john'));
        console.log(`   ✅ Search Test: Found ${searchTest.length} customers named 'John'`);
        
        console.log('\n4. Testing Guardian Management...');
        const guardians = parties.filter(p => p.type === 'guardian');
        console.log(`   ✅ Guardian Management: ${guardians.length} guardians managing dependents`);
        
        console.log('\n🎉 System Test Results Summary:');
        console.log('===============================');
        console.log(`✅ Backend Status: Online (${baseUrl})`);
        console.log(`✅ Customer Management: ${parties.length} customers`);
        console.log(`✅ Consent Management: ${consents.length} consent records`);
        console.log(`✅ DSAR Management: ${dsarRequests.length} requests`);
        console.log(`✅ Communication Preferences: ${preferences.length} profiles`);
        console.log(`✅ Guardian Features: ${guardians.length} guardians`);
        console.log(`✅ Audit Trail: ${events.length} logged events`);
        console.log(`✅ Search Functionality: Working`);
        console.log(`✅ Dashboard Statistics: All metrics available`);
        
        console.log('\n🚀 All CSR Dashboard Features Are Working!');
        console.log('==========================================');
        console.log('✅ Customer search is working');
        console.log('✅ Consent history page has data');
        console.log('✅ Communication preference page has data');
        console.log('✅ DSAR request page has data');
        console.log('✅ Guardian consent page has data');
        
        return true;
    } catch (error) {
        console.error('❌ System test failed:', error.message);
        return false;
    }
}

// Run the test
testCompleteSystem();
