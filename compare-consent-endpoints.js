const fetch = require('node-fetch');

async function compareConsentEndpoints() {
  console.log('🔍 Comparing Consent Data Between CSR and Admin Dashboards');
  console.log('=' .repeat(60));

  try {
    // Test CSR endpoint (non-authenticated)
    console.log('📊 Fetching CSR Dashboard consent data (/api/v1/csr/consent)...');
    const csrResponse = await fetch('http://localhost:3001/api/v1/csr/consent');
    const csrData = await csrResponse.json();
    
    // Test both Admin endpoints - they use /api/v1/consent but authenticated
    console.log('📊 Testing Admin Dashboard endpoints...');
    
    // Test non-authenticated /api/v1/consent (should return 401)
    console.log('  → Testing /api/v1/consent (no auth)...');
    const adminNoAuthResponse = await fetch('http://localhost:3001/api/v1/consent');
    console.log(`     Status: ${adminNoAuthResponse.status}`);
    
    // Test non-authenticated version
    console.log('  → Testing /api/v1/consent (non-auth version)...');  
    const adminResponse = await fetch('http://localhost:3001/api/v1/consent');
    
    console.log('\n📈 CSR Dashboard Data:');
    console.log(`- Total consents: ${csrData.length}`);
    if (csrData.length > 0) {
      console.log(`- Sample consent ID: ${csrData[0].id}`);
      console.log(`- Sample consent purpose: ${csrData[0].purpose}`);
      console.log(`- Sample consent status: ${csrData[0].status}`);
      console.log(`- Has grantedAt: ${!!csrData[0].grantedAt}`);
      console.log(`- Has revokedAt: ${!!csrData[0].revokedAt}`);
    }
    
    if (adminResponse.status === 401) {
      console.log('\n❌ Admin endpoint requires authentication');
      
      // Since both are sourcing from the same database, check if CSR data has the expected fields
      console.log('\n� Analyzing CSR Data Structure for Real-time Compatibility:');
      if (csrData.length > 0) {
        const sample = csrData[0];
        console.log('- Fields present in consent record:');
        console.log(`  ✓ id: ${sample.id}`);
        console.log(`  ✓ purpose: ${sample.purpose}`); 
        console.log(`  ✓ status: ${sample.status}`);
        console.log(`  ✓ grantedAt: ${sample.grantedAt || 'Missing'}`);
        console.log(`  ✓ revokedAt: ${sample.revokedAt || 'Missing'}`);
        console.log(`  ✓ source: ${sample.recordSource || sample.source || 'Missing'}`);
        console.log(`  ✓ customerId: ${sample.customerId || sample.partyId}`);
        
        // Count status types
        const statusCounts = csrData.reduce((acc, consent) => {
          acc[consent.status] = (acc[consent.status] || 0) + 1;
          return acc;
        }, {});
        console.log('- Status distribution:', statusCounts);
      }
    } else {
      const adminData = await adminResponse.json();
      console.log('\n📈 Admin Dashboard Data:');
      console.log(`- Total consents: ${adminData.length}`);
      
      // Compare data structures
      console.log('\n🔍 Comparison Results:');
      console.log(`- CSR consents count: ${csrData.length}`);
      console.log(`- Admin consents count: ${adminData.length}`);
      console.log(`- Data sources match: ${csrData.length === adminData.length}`);
    }

  } catch (error) {
    console.error('❌ Error comparing endpoints:', error.message);
  }
}

compareConsentEndpoints();
