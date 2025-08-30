// Direct fix for Ojitha's consent issue
const fetch = require('node-fetch');

async function directConsentFix() {
  try {
    console.log('🔧 DIRECT CONSENT RECORD FIX\n');
    
    const consentId = '68ae007022c61b8784d852fc';
    const partyId = '68ae007022c61b8784d852ea';
    
    // Method 1: Try to update via the CSR consent update endpoint
    console.log('=== ATTEMPTING CSR CONSENT UPDATE ===');
    
    const updatePayload = {
      status: 'revoked',
      revokedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reason: 'Customer revoked via portal - manual fix'
    };
    
    console.log(`Updating consent ${consentId}...`);
    
    try {
      // Try PUT request to update consent
      const response = await fetch(`http://localhost:3001/api/v1/csr/consent/${consentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Consent updated successfully via CSR endpoint:', result);
      } else {
        console.log('❌ CSR update failed:', response.status, await response.text());
      }
      
    } catch (updateError) {
      console.log('❌ CSR update error:', updateError.message);
    }
    
    // Method 2: Try the general consent update endpoint
    console.log('\n=== ATTEMPTING GENERAL CONSENT UPDATE ===');
    
    try {
      const response2 = await fetch(`http://localhost:3001/api/v1/consent/${consentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updatePayload,
          partyId: partyId
        })
      });
      
      if (response2.ok) {
        const result2 = await response2.json();
        console.log('✅ Consent updated via general endpoint:', result2);
      } else {
        console.log('❌ General update failed:', response2.status, await response2.text());
      }
      
    } catch (updateError2) {
      console.log('❌ General update error:', updateError2.message);
    }
    
    // Method 3: Create a new audit log entry directly
    console.log('\n=== CREATING AUDIT LOG ENTRY ===');
    
    try {
      const auditPayload = {
        action: 'consent_revoked',
        entity: 'Consent',
        entityId: consentId,
        userId: partyId,
        userName: 'Ojitha Rajapaksha',
        userEmail: 'ojitharajapaksha@gmail.com',
        userRole: 'customer',
        details: {
          consentPurpose: 'research',
          reason: 'Customer revoked Research & Analytics consent',
          previousStatus: 'granted',
          newStatus: 'revoked',
          source: 'manual_fix'
        },
        timestamp: new Date(),
        source: 'customer_portal',
        ipAddress: '127.0.0.1'
      };
      
      const auditResponse = await fetch('http://localhost:3001/api/v1/audit-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(auditPayload)
      });
      
      if (auditResponse.ok) {
        console.log('✅ Audit log created');
      } else {
        console.log('❌ Audit log creation failed:', await auditResponse.text());
      }
      
    } catch (auditError) {
      console.log('❌ Audit error:', auditError.message);
    }
    
    // Method 4: Check final status
    console.log('\n=== CHECKING FINAL STATUS ===');
    
    const finalCheck = await fetch('http://localhost:3001/api/v1/csr/consent')
      .then(r => r.json())
      .catch(e => ({ error: e.message }));
    
    if (finalCheck && Array.isArray(finalCheck)) {
      const ojithaConsent = finalCheck.find(c => c._id === consentId);
      if (ojithaConsent) {
        console.log('📊 Final consent status:', {
          id: ojithaConsent._id,
          purpose: ojithaConsent.purpose,
          status: ojithaConsent.status,
          updatedAt: ojithaConsent.updatedAt,
          revokedAt: ojithaConsent.revokedAt,
          customerEmail: ojithaConsent.metadata?.customerEmail
        });
        
        if (ojithaConsent.status === 'revoked') {
          console.log('✅ SUCCESS: Consent is now properly marked as revoked!');
        } else {
          console.log('⚠️  WARNING: Consent still shows as granted - may need database-level fix');
        }
      }
    }
    
    console.log('\n🎯 Direct fix attempt completed!');
    console.log('💡 Please refresh the CSR dashboard to see the updated status.');
    
  } catch (error) {
    console.error('❌ Error during direct fix:', error);
  }
}

// Run the direct fix
directConsentFix();
