const User = require('./models/User');

const seedGuardians = async () => {
  try {
    console.log('🚀 Starting guardian data seeding...');
    
    // Check if guardians already have proper name fields
    const guardians = await User.find({ role: 'guardian' });
    console.log(`📋 Found ${guardians.length} existing guardians`);
    
    let updatedCount = 0;
    
    for (const guardian of guardians) {
      let needsUpdate = false;
      const updates = {};
      
      // Add firstName and lastName if missing
      if (!guardian.firstName || !guardian.lastName) {
        // Extract names from email or use defaults
        const emailParts = guardian.email.split('@')[0].split('.');
        updates.firstName = guardian.firstName || emailParts[0] || 'Guardian';
        updates.lastName = guardian.lastName || emailParts[1] || 'User';
        needsUpdate = true;
      }
      
      // Ensure dependents have proper name structure
      if (guardian.dependents && guardian.dependents.length > 0) {
        const updatedDependents = guardian.dependents.map(dependent => {
          if (typeof dependent.name === 'string') {
            const nameParts = dependent.name.split(' ');
            return {
              ...dependent,
              firstName: nameParts[0] || dependent.name,
              lastName: nameParts[1] || '',
              name: dependent.name // Keep original name as well
            };
          }
          return dependent;
        });
        
        updates.dependents = updatedDependents;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await User.findByIdAndUpdate(guardian._id, updates, { new: true });
        console.log(`✅ Updated guardian: ${updates.firstName} ${updates.lastName} with name fields`);
        updatedCount++;
      }
    }
    
    console.log('🎯 Guardian data seeding completed successfully!');
    console.log(`📊 Guardian Summary:`);
    console.log(`   👨‍👩‍👧‍👦 Total Guardians: ${guardians.length}`);
    console.log(`   🔄 Updated: ${updatedCount}`);
    console.log(`   👶 Total Minors: ${guardians.reduce((total, g) => total + (g.dependents?.length || 0), 0)}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error seeding guardians:', error);
    return false;
  }
};

module.exports = { seedGuardians };