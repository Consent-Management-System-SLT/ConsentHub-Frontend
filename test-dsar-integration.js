// Test DSAR MongoDB Integration
// This script tests the complete DSAR functionality with MongoDB

const BASE_URL = 'http://localhost:3001';

// Helper function to make authenticated requests
async function makeAuthRequest(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // Using a mock token - in production this would come from login
      'Authorization': 'Bearer mock-token-for-testing',
      ...options.headers
    }
  });
  
  return response;
}

// Test functions
async function testCreateDSARRequest() {
  console.log('\n🧪 Testing DSAR Request Creation...');
  
  try {
    const newRequest = {
      customerEmail: 'test.customer@example.com',
      customerName: 'Test Customer',
      customerPhone: '+94771234567',
      requestType: 'access',
      description: 'I would like to access all my personal data stored in your systems.',
      priority: 'medium'
    };

    const response = await makeAuthRequest('/api/v1/dsar/request', {
      method: 'POST',
      body: JSON.stringify(newRequest)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ DSAR Request created successfully:', data.request.requestId);
      return data.request._id;
    } else {
      const error = await response.text();
      console.log('❌ Failed to create DSAR request:', error);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

async function testGetDSARRequests() {
  console.log('\n🧪 Testing Get DSAR Requests...');
  
  try {
    const response = await makeAuthRequest('/api/v1/dsar/requests');
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Retrieved ${data.requests.length} DSAR requests`);
      
      // Display summary
      if (data.requests.length > 0) {
        console.log('\n📋 Request Summary:');
        data.requests.forEach(req => {
          console.log(`  - ${req.requestId}: ${req.requestType} (${req.status}) - ${req.customerEmail}`);
        });
      }
      
      return data.requests;
    } else {
      const error = await response.text();
      console.log('❌ Failed to get DSAR requests:', error);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

async function testExportDSARRequests() {
  console.log('\n🧪 Testing CSV Export...');
  
  try {
    const response = await makeAuthRequest('/api/v1/dsar/export/csv');
    
    if (response.ok) {
      const csvData = await response.text();
      console.log('✅ CSV Export successful');
      console.log('📄 Sample CSV data (first 200 chars):');
      console.log(csvData.substring(0, 200) + (csvData.length > 200 ? '...' : ''));
      return true;
    } else {
      const error = await response.text();
      console.log('❌ Failed to export CSV:', error);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

async function testDSARStats() {
  console.log('\n🧪 Testing DSAR Statistics...');
  
  try {
    const response = await makeAuthRequest('/api/v1/dsar/stats');
    
    if (response.ok) {
      const stats = await response.json();
      console.log('✅ Statistics retrieved successfully');
      console.log(`📊 Total: ${stats.total}, Pending: ${stats.pending}, Completed: ${stats.completed}, Overdue: ${stats.overdue}`);
      return stats;
    } else {
      const error = await response.text();
      console.log('❌ Failed to get statistics:', error);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

// Main test execution
async function runDSARTests() {
  console.log('🚀 Starting DSAR MongoDB Integration Tests...');
  console.log('🔗 Backend URL:', BASE_URL);
  
  // Test 1: Get existing requests
  const existingRequests = await testGetDSARRequests();
  
  // Test 2: Create new request
  const newRequestId = await testCreateDSARRequest();
  
  // Test 3: Get updated requests list
  if (newRequestId) {
    await testGetDSARRequests();
  }
  
  // Test 4: Export functionality
  await testExportDSARRequests();
  
  // Test 5: Statistics
  await testDSARStats();
  
  console.log('\n🎯 DSAR Tests completed!');
  console.log('\n💡 Next steps:');
  console.log('  1. Login to http://localhost:5174 with admin credentials');
  console.log('  2. Navigate to DSAR Management');
  console.log('  3. Test the UI functionality');
  console.log('  4. Try CSV export from the frontend');
}

// Run the tests
runDSARTests().catch(console.error);
