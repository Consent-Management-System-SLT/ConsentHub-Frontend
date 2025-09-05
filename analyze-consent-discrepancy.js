const fetch = require('node-fetch');

async function analyzeConsentDataDiscrepancy() {
  console.log('🔍 Analyzing Consent Data Discrepancy - CSR vs Admin Dashboard');
  console.log('=' .repeat(70));

  try {
    // Fetch CSR data
    console.log('📊 Fetching CSR Dashboard data...');
    const csrResponse = await fetch('http://localhost:3001/api/v1/csr/consent');
    const csrData = await csrResponse.json();

    // Find Ojitha's records in CSR data
    const ojithaCSR = csrData.filter(consent => 
      consent.customerEmail?.toLowerCase().includes('ojitharajapaksha') ||
      consent.email?.toLowerCase().includes('ojitharajapaksha') ||
      consent.customerName?.toLowerCase().includes('ojitha')
    );

    console.log('\n📊 CSR Dashboard - Ojitha Records:');
    console.log(`Found ${ojithaCSR.length} records for Ojitha`);
    
    ojithaCSR.forEach((consent, index) => {
      console.log(`\n--- CSR Record ${index + 1} ---`);
      console.log(`ID: ${consent.id}`);
      console.log(`Customer: ${consent.customerName || consent.name}`);
      console.log(`Email: ${consent.customerEmail || consent.email}`);
      console.log(`Purpose: ${consent.purpose}`);
      console.log(`Status: ${consent.status}`);
      console.log(`Granted At: ${consent.grantedAt}`);
      console.log(`Revoked At: ${consent.revokedAt || 'N/A'}`);
      console.log(`Source: ${consent.source || consent.recordSource || 'N/A'}`);
      console.log(`Updated: ${consent.updatedAt}`);
    });

    // Since admin uses the same endpoint but with different transformations,
    // let's check the raw data structure
    console.log('\n📊 Raw Data Analysis for Transformations:');
    
    if (ojithaCSR.length > 0) {
      const sample = ojithaCSR[0];
      console.log('Sample raw consent object keys:', Object.keys(sample));
      console.log('Sample consent full object:', JSON.stringify(sample, null, 2));
    }

    // Check if there are different customers with similar names
    const allCustomers = csrData.reduce((customers, consent) => {
      const customerKey = consent.customerEmail || consent.email || consent.customerId;
      const customerName = consent.customerName || consent.name || 'Unknown';
      
      if (customerKey && !customers[customerKey]) {
        customers[customerKey] = {
          name: customerName,
          email: customerKey,
          consents: []
        };
      }
      
      if (customerKey) {
        customers[customerKey].consents.push({
          id: consent.id,
          purpose: consent.purpose,
          status: consent.status,
          grantedAt: consent.grantedAt,
          source: consent.source
        });
      }
      
      return customers;
    }, {});

    console.log('\n📊 All Customer Summary:');
    Object.entries(allCustomers).forEach(([email, customer]) => {
      if (email.toLowerCase().includes('ojitha') || customer.name.toLowerCase().includes('ojitha')) {
        console.log(`\n👤 Customer: ${customer.name}`);
        console.log(`   Email: ${email}`);
        console.log(`   Total Consents: ${customer.consents.length}`);
        
        // Group by status
        const statusCounts = customer.consents.reduce((counts, consent) => {
          counts[consent.status] = (counts[consent.status] || 0) + 1;
          return counts;
        }, {});
        console.log(`   Status Distribution:`, statusCounts);
      }
    });

    // Look for data transformation patterns
    console.log('\n🔍 Purpose Mapping Analysis:');
    const purposeCounts = csrData.reduce((counts, consent) => {
      counts[consent.purpose] = (counts[consent.purpose] || 0) + 1;
      return counts;
    }, {});
    
    console.log('Purpose values in raw data:', Object.keys(purposeCounts));
    
    // Check status distribution
    console.log('\n🔍 Status Distribution Analysis:');
    const statusCounts = csrData.reduce((counts, consent) => {
      counts[consent.status] = (counts[consent.status] || 0) + 1;
      return counts;
    }, {});
    
    console.log('Status distribution:', statusCounts);

  } catch (error) {
    console.error('❌ Error analyzing data:', error.message);
  }
}

analyzeConsentDataDiscrepancy();
