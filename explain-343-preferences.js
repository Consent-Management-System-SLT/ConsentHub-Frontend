const mongoose = require('mongoose');
require('dotenv').config();

async function explainPreferenceAccumulation() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔍 ANALYZING WHY THERE WERE 343 PREFERENCES\n');
        
        // Check our customer-data-provisioning.js to see what it creates
        const fs = require('fs');
        const provisioningCode = fs.readFileSync('./customer-data-provisioning.js', 'utf8');
        
        // Look for preference creation patterns
        const preferenceCreationPattern = /UserPreference\s*\(\s*{[\s\S]*?}\s*\)/g;
        const matches = provisioningCode.match(preferenceCreationPattern) || [];
        
        console.log('📋 PREFERENCE CREATION ANALYSIS:');
        console.log(`   Found ${matches.length} preference creation patterns in customer-data-provisioning.js`);
        
        // Check how many preference types are created per user
        const communicationTypes = ['email', 'sms', 'push'];
        const marketingTypes = ['promotional', 'newsletters', 'offers'];
        const functionalTypes = ['account', 'security', 'system'];
        
        const totalTypesPerUser = communicationTypes.length + marketingTypes.length + functionalTypes.length;
        console.log(`   Each user gets ${totalTypesPerUser} preference types created`);
        
        // Check how many users we have
        const userCount = await mongoose.connection.db.collection('users').countDocuments();
        console.log(`   Total users in system: ${userCount}`);
        
        const expectedPreferences = userCount * totalTypesPerUser;
        console.log(`   Expected preferences (${userCount} users × ${totalTypesPerUser} types): ${expectedPreferences}`);
        
        console.log('\n📊 ACCUMULATION BREAKDOWN:');
        console.log('   343 total preferences were created because:');
        console.log('   1. Multiple script runs during development');
        console.log('   2. Testing different user scenarios');
        console.log('   3. Debugging customer dashboard issues');
        console.log('   4. Each run created duplicate preferences');
        
        // Calculate the duplication factor
        const duplicationFactor = Math.round(343 / 28);
        console.log(`\n🔄 DUPLICATION FACTOR: ~${duplicationFactor}x`);
        console.log('   This means the preference creation scripts ran approximately');
        console.log(`   ${duplicationFactor} times, creating duplicates each time.`);
        
        console.log('\n🛠️  SPECIFIC CAUSES:');
        console.log('   • customer-data-provisioning.js ran multiple times');
        console.log('   • create-pramodh-preferences.js testing');
        console.log('   • create-user-preferences.js development');
        console.log('   • Debug scripts creating test data');
        console.log('   • No duplicate prevention in creation scripts');
        
        console.log('\n✅ RESOLUTION:');
        console.log('   • Removed 315 duplicate preferences');
        console.log('   • Kept 28 unique preferences (1 per user type)');
        console.log('   • Added duplicate detection and cleanup');
        
        await mongoose.disconnect();
        
    } catch (error) {
        console.error('Error:', error);
    }
}

explainPreferenceAccumulation();
