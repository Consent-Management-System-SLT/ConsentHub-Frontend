// Frontend API Connection Test
// Open browser console to see results

console.log('🔧 Frontend API Connection Test');
console.log('================================');

async function testFrontendAPI() {
    const baseUrl = 'http://localhost:3001';
    
    console.log('Testing direct fetch calls to backend...');
    
    try {
        // Test 1: CSR Stats
        console.log('1. Testing CSR Stats...');
        const response1 = await fetch(`${baseUrl}/api/csr/stats`);
        const stats = await response1.json();
        console.log('   ✅ CSR Stats:', stats.totalCustomers, 'customers');
        
        // Test 2: Customer Data
        console.log('2. Testing Customer Data...');
        const response2 = await fetch(`${baseUrl}/api/v1/party`);
        const parties = await response2.json();
        console.log('   ✅ Customer Data:', parties.length, 'customers');
        
        // Test 3: Consent Data
        console.log('3. Testing Consent Data...');
        const response3 = await fetch(`${baseUrl}/api/v1/consent`);
        const consents = await response3.json();
        console.log('   ✅ Consent Data:', consents.length, 'consents');
        
        // Test 4: DSAR Data
        console.log('4. Testing DSAR Data...');
        const response4 = await fetch(`${baseUrl}/api/v1/dsar`);
        const dsars = await response4.json();
        console.log('   ✅ DSAR Data:', dsars.length, 'requests');
        
        console.log('\n🎉 All API endpoints are accessible from frontend!');
        return true;
        
    } catch (error) {
        console.error('❌ API Test Failed:', error);
        return false;
    }
}

// Run immediately when script loads
testFrontendAPI();

// Also expose as global function for manual testing
window.testAPI = testFrontendAPI;
