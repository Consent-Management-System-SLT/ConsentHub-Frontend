// API Test Script - Testing Multi-Service Architecture
import { multiServiceApiClient } from './src/services/multiServiceApiClient.js';

async function testApiConnectivity() {
  console.log('🔍 Testing ConsentHub Multi-Service API Connectivity...\n');

  // Test 1: Health check all services
  try {
    console.log('1️⃣ Checking health of all services...');
    const healthResults = await multiServiceApiClient.checkAllServicesHealth();
    console.log('Health Check Results:', JSON.stringify(healthResults, null, 2));
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }

  // Test 2: Test Consent API
  try {
    console.log('\n2️⃣ Testing Consent Service API...');
    const consentResult = await multiServiceApiClient.makeRequest('GET', '/api/v1/consent', undefined, 'admin', 'consent');
    console.log('✅ Consent API Response:', consentResult.error ? consentResult.message : 'Success');
  } catch (error) {
    console.error('❌ Consent API failed:', error.message);
  }

  // Test 3: Test Preference API
  try {
    console.log('\n3️⃣ Testing Preference Service API...');
    const preferenceResult = await multiServiceApiClient.makeRequest('GET', '/api/v1/preference', undefined, 'admin', 'preference');
    console.log('✅ Preference API Response:', preferenceResult.error ? preferenceResult.message : 'Success');
  } catch (error) {
    console.error('❌ Preference API failed:', error.message);
  }

  // Test 4: Test Party API
  try {
    console.log('\n4️⃣ Testing Party Service API...');
    const partyResult = await multiServiceApiClient.makeRequest('GET', '/api/v1/party', undefined, 'admin', 'party');
    console.log('✅ Party API Response:', partyResult.error ? partyResult.message : 'Success');
  } catch (error) {
    console.error('❌ Party API failed:', error.message);
  }

  // Test 5: Test DSAR API
  try {
    console.log('\n5️⃣ Testing DSAR Service API...');
    const dsarResult = await multiServiceApiClient.makeRequest('GET', '/api/v1/dsar', undefined, 'admin', 'dsar');
    console.log('✅ DSAR API Response:', dsarResult.error ? dsarResult.message : 'Success');
  } catch (error) {
    console.error('❌ DSAR API failed:', error.message);
  }
}

testApiConnectivity().then(() => {
  console.log('\n🎉 API connectivity test completed!');
}).catch((error) => {
  console.error('\n💥 Test script failed:', error);
});
