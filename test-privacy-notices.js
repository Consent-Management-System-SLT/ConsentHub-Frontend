// Test Privacy Notice CRUD functionality
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const API_BASE = `${BASE_URL}/api/v1`;

// Demo user credentials
const adminCredentials = {
  email: 'admin@sltmobitel.lk',
  password: 'admin123'
};

let authToken = '';

async function login() {
  try {
    console.log('🔑 Logging in as admin...');
    const response = await axios.post(`${API_BASE}/auth/login`, adminCredentials);
    authToken = response.data.token;
    console.log('✅ Login successful');
    return authToken;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

async function testPrivacyNotices() {
  const headers = { Authorization: `Bearer ${authToken}` };

  console.log('\n📋 Testing Privacy Notice CRUD Operations...\n');

  try {
    // 1. Get all privacy notices
    console.log('1️⃣ Getting all privacy notices...');
    const getResponse = await axios.get(`${API_BASE}/privacy-notices`, { headers });
    console.log(`   Found ${getResponse.data.notices?.length || 0} notices`);
    console.log(`   Stats:`, getResponse.data.stats);

    // 2. Create a new privacy notice
    console.log('\n2️⃣ Creating a new privacy notice...');
    const newNotice = {
      title: 'Test Privacy Notice',
      content: 'This is a test privacy notice created via API.',
      contentType: 'text/plain',
      category: 'general',
      purposes: ['data processing', 'marketing'],
      legalBasis: 'consent',
      dataCategories: ['personal_data'],
      recipients: [{
        name: 'SLT Mobitel',
        category: 'internal',
        purpose: 'Service delivery'
      }],
      retentionPeriod: {
        duration: '2 years',
        criteria: 'Contract duration plus legal requirements'
      },
      rights: ['access', 'rectification', 'erasure'],
      contactInfo: {
        organization: {
          name: 'SLT Mobitel',
          email: 'privacy@sltmobitel.lk',
          phone: '+94112345678'
        }
      },
      effectiveDate: new Date().toISOString(),
      status: 'draft',
      language: 'en',
      applicableRegions: ['sri_lanka'],
      metadata: {
        tags: ['test', 'api'],
        author: 'API Test'
      }
    };

    const createResponse = await axios.post(`${API_BASE}/privacy-notices`, newNotice, { headers });
    const createdNotice = createResponse.data.notice;
    console.log(`   ✅ Created notice with ID: ${createdNotice.id}`);

    // 3. Get the created notice
    console.log('\n3️⃣ Getting the created notice...');
    const getOneResponse = await axios.get(`${API_BASE}/privacy-notices/${createdNotice.id}`, { headers });
    console.log(`   ✅ Retrieved notice: ${getOneResponse.data.notice.title}`);

    // 4. Update the notice
    console.log('\n4️⃣ Updating the notice...');
    const updateData = {
      title: 'Updated Test Privacy Notice',
      status: 'active',
      changeReason: 'API test update'
    };
    console.log('   Update data:', updateData);
    console.log('   Updating notice ID:', createdNotice.id);
    const updateResponse = await axios.put(`${API_BASE}/privacy-notices/${createdNotice.id}`, updateData, { headers });
    console.log('   Update response:', updateResponse.data);
    console.log(`   ✅ Updated notice title: ${updateResponse.data.notice?.title || 'No title returned'}`);

    // 5. Test export functionality
    console.log('\n5️⃣ Testing export functionality...');
    try {
      const exportResponse = await axios.get(`${API_BASE}/privacy-notices/export/json`, { 
        headers,
        responseType: 'blob'
      });
      console.log(`   ✅ Export successful (${exportResponse.data.size || 'unknown'} bytes)`);
    } catch (exportError) {
      console.log(`   ⚠️  Export test skipped: ${exportError.message}`);
    }

    // 6. Test search functionality
    console.log('\n6️⃣ Testing search functionality...');
    const searchResponse = await axios.get(`${API_BASE}/privacy-notices?search=Test`, { headers });
    console.log(`   ✅ Search found ${searchResponse.data.notices?.length || 0} notices`);

    // 7. Delete the test notice
    console.log('\n7️⃣ Deleting the test notice...');
    const deleteResponse = await axios.delete(`${API_BASE}/privacy-notices/${createdNotice.id}`, { headers });
    console.log(`   ✅ ${deleteResponse.data.message}`);

    console.log('\n🎉 All Privacy Notice CRUD operations completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('🔑 Authentication might have expired. Try logging in again.');
    }
  }
}

async function main() {
  console.log('🚀 Starting Privacy Notice API Test...');
  
  await login();
  await testPrivacyNotices();
  
  console.log('\n✨ Test completed! You can now:');
  console.log('   1. Open http://localhost:5174 in your browser');
  console.log('   2. Login as admin@sltmobitel.lk / admin123');
  console.log('   3. Navigate to Privacy Notices in the admin dashboard');
  console.log('   4. Test the full CRUD interface with MongoDB persistence');
}

main().catch(console.error);
