// Enhanced debugging script to find where Ojitha's data is coming from
const fetch = require('node-fetch');

async function debugOjithaDataSource() {
  console.log('🔍 Debug: Finding Ojitha Rajapaksha Data Source');
  console.log('=' .repeat(60));

  try {
    // Test all possible endpoints for Ojitha data
    const endpoints = [
      'http://localhost:3001/api/v1/csr/consent',
      'http://localhost:3001/api/v1/consent', 
      'http://localhost:3001/api/csr/customers',
      'http://localhost:3001/api/v1/party',
      'http://localhost:3001/api/v1/parties'
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`\n📡 Testing: ${endpoint}`);
        const response = await fetch(endpoint);
        console.log(`   Status: ${response.status}`);
        
        if (response.status === 200) {
          const data = await response.json();
          
          // Search for Ojitha in various fields
          let ojithaFound = false;
          if (Array.isArray(data)) {
            const ojithaRecords = data.filter(item => 
              JSON.stringify(item).toLowerCase().includes('ojitha')
            );
            
            if (ojithaRecords.length > 0) {
              console.log(`   ✅ Found ${ojithaRecords.length} Ojitha records!`);
              ojithaRecords.forEach((record, index) => {
                console.log(`      Record ${index + 1}:`, {
                  id: record.id || record._id,
                  name: record.name || record.customerName,
                  email: record.email || record.customerEmail,
                  purpose: record.purpose,
                  status: record.status
                });
              });
              ojithaFound = true;
            }
          } else if (data && typeof data === 'object') {
            const dataStr = JSON.stringify(data).toLowerCase();
            if (dataStr.includes('ojitha')) {
              console.log(`   ✅ Found Ojitha in response object!`);
              console.log('   Data:', data);
              ojithaFound = true;
            }
          }
          
          if (!ojithaFound) {
            console.log(`   ❌ No Ojitha records found`);
            console.log(`   Total records: ${Array.isArray(data) ? data.length : 'Non-array response'}`);
          }
        } else {
          console.log(`   ❌ Request failed: ${response.status}`);
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }

    // Check if there might be a different API base URL being used
    console.log('\n🔍 Checking Alternative API Patterns...');
    
    // Check for customer-specific consent endpoints
    const customerIds = ['ojitha', 'ojitharajapaksha', '1', '2', '3'];
    
    for (const customerId of customerIds) {
      try {
        const endpoint = `http://localhost:3001/api/v1/customer/consents?customerId=${customerId}`;
        const response = await fetch(endpoint);
        if (response.status === 200) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            console.log(`   ✅ Found customer consents for ID "${customerId}": ${data.length} records`);
          }
        }
      } catch (error) {
        // Silent fail for this test
      }
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugOjithaDataSource();
