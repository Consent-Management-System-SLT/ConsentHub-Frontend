// Script to create realistic UserPreference records for real MongoDB users
const mongoose = require('mongoose');
require('dotenv').config();
const { PreferenceItem, UserPreference } = require('./models/Preference');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://admin:admin@cluster0.ylmrqgl.mongodb.net/consentDB?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
  seedUserPreferences();
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
});

async function seedUserPreferences() {
  try {
    console.log('🌱 Starting to seed user preferences with real data...');

    // Get all real users from MongoDB
    const users = await User.find({ status: 'active' }).limit(25);
    console.log(`Found ${users.length} real users`);

    // Get all preference items
    const preferenceItems = await PreferenceItem.find({ enabled: true });
    console.log(`Found ${preferenceItems.length} preference items`);

    if (users.length === 0) {
      console.log('❌ No users found in database. Please ensure there are users in the system first.');
      process.exit(1);
    }

    if (preferenceItems.length === 0) {
      console.log('❌ No preference items found in database.');
      process.exit(1);
    }

    // Clear existing UserPreference data
    await UserPreference.deleteMany({});
    console.log('🧹 Cleared existing user preferences');

    let totalPreferencesCreated = 0;

    // Create realistic preference patterns for each user
    for (const user of users) {
      console.log(`Creating preferences for user: ${user.firstName} ${user.lastName} (${user.email})`);
      
      // Each user will have preferences for about 60-80% of available preference items
      const userPreferenceCount = Math.floor(preferenceItems.length * (0.6 + Math.random() * 0.2));
      
      // Randomly select which preferences this user has set
      const shuffledPreferences = [...preferenceItems].sort(() => 0.5 - Math.random());
      const selectedPreferences = shuffledPreferences.slice(0, userPreferenceCount);
      
      for (const prefItem of selectedPreferences) {
        try {
          // Generate realistic preference values based on type
          let preferenceValue;
          
          switch (prefItem.type) {
            case 'boolean':
              // 70% chance of enabling useful preferences like email notifications
              // 30% chance for marketing preferences
              if (prefItem.categoryId === 'cat_communications' || prefItem.categoryId === 'cat_security') {
                preferenceValue = Math.random() > 0.3; // 70% enabled
              } else if (prefItem.categoryId === 'cat_marketing') {
                preferenceValue = Math.random() > 0.7; // 30% enabled
              } else {
                preferenceValue = Math.random() > 0.5; // 50% enabled
              }
              break;
              
            case 'enum':
              // Select random option from available options
              if (prefItem.options && prefItem.options.length > 0) {
                preferenceValue = prefItem.options[Math.floor(Math.random() * prefItem.options.length)];
              } else {
                preferenceValue = prefItem.defaultValue;
              }
              break;
              
            case 'number':
              // Generate realistic number within validation range
              if (prefItem.validation && prefItem.validation.min && prefItem.validation.max) {
                const min = prefItem.validation.min;
                const max = prefItem.validation.max;
                preferenceValue = Math.floor(Math.random() * (max - min + 1)) + min;
              } else {
                preferenceValue = prefItem.defaultValue || 1;
              }
              break;
              
            default:
              preferenceValue = prefItem.defaultValue;
          }

          // Create UserPreference record
          const userPref = new UserPreference({
            id: `user_pref_${user._id}_${prefItem.id}_${Date.now()}`,
            userId: user._id.toString(),
            partyId: user._id.toString(),
            preferenceId: prefItem.id,
            value: preferenceValue,
            source: 'user',
            metadata: {
              createdBy: 'seed_script',
              userEmail: user.email,
              userName: `${user.firstName} ${user.lastName}`
            }
          });

          await userPref.save();
          totalPreferencesCreated++;
          
        } catch (error) {
          console.error(`Error creating preference for user ${user.email} and item ${prefItem.id}:`, error.message);
        }
      }
    }

    console.log(`✅ Successfully created ${totalPreferencesCreated} user preference records`);
    console.log(`📊 Average preferences per user: ${Math.round(totalPreferencesCreated / users.length)}`);
    
    // Show summary
    const preferenceSummary = await Promise.all(
      preferenceItems.slice(0, 10).map(async (item) => {
        const totalUsers = await UserPreference.countDocuments({ preferenceId: item.id });
        const enabledUsers = await UserPreference.countDocuments({ 
          preferenceId: item.id, 
          value: true 
        });
        
        return {
          name: item.name,
          totalUsers,
          enabledUsers,
          enabledPercentage: totalUsers > 0 ? Math.round((enabledUsers / totalUsers) * 100) : 0
        };
      })
    );

    console.log('\n📈 Sample preference statistics:');
    preferenceSummary.forEach(stat => {
      console.log(`  ${stat.name}: ${stat.totalUsers} users (${stat.enabledUsers} enabled, ${stat.enabledPercentage}%)`);
    });

    console.log('\n🎉 User preference seeding completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding user preferences:', error);
    process.exit(1);
  }
}
