const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const { PreferenceCategory, PreferenceItem } = require('./models/Preference');

const MONGODB_URI = process.env.MONGODB_URI;

// Sample categories data
const sampleCategories = [
  {
    id: 'cat_communications',
    name: 'Communications',
    description: 'Manage how you want to receive communications from us',
    icon: 'Mail',
    priority: 100,
    enabled: true
  },
  {
    id: 'cat_privacy',
    name: 'Privacy & Data',
    description: 'Control how your personal data is used and shared',
    icon: 'Shield',
    priority: 90,
    enabled: true
  },
  {
    id: 'cat_security',
    name: 'Security',
    description: 'Configure security and authentication preferences',
    icon: 'Lock',
    priority: 80,
    enabled: true
  },
  {
    id: 'cat_personalization',
    name: 'Personalization',
    description: 'Customize your experience and content preferences',
    icon: 'Users',
    priority: 70,
    enabled: true
  },
  {
    id: 'cat_marketing',
    name: 'Marketing',
    description: 'Manage marketing communications and promotional offers',
    icon: 'Bell',
    priority: 60,
    enabled: true
  },
  {
    id: 'cat_analytics',
    name: 'Analytics',
    description: 'Control how your usage data is collected and analyzed',
    icon: 'Database',
    priority: 50,
    enabled: true
  }
];

// Sample preference items data
const samplePreferences = [
  // Communications preferences
  {
    id: 'pref_email_notifications',
    categoryId: 'cat_communications',
    name: 'Email Notifications',
    description: 'Receive important updates and notifications via email',
    type: 'boolean',
    required: true,
    defaultValue: true,
    priority: 100,
    enabled: true,
    users: 1247
  },
  {
    id: 'pref_sms_notifications',
    categoryId: 'cat_communications',
    name: 'SMS Notifications',
    description: 'Receive urgent notifications via SMS',
    type: 'boolean',
    required: false,
    defaultValue: false,
    priority: 90,
    enabled: true,
    users: 892
  },
  {
    id: 'pref_push_notifications',
    categoryId: 'cat_communications',
    name: 'Push Notifications',
    description: 'Receive push notifications on mobile devices',
    type: 'boolean',
    required: false,
    defaultValue: true,
    priority: 80,
    enabled: true,
    users: 2156
  },
  {
    id: 'pref_communication_frequency',
    categoryId: 'cat_communications',
    name: 'Communication Frequency',
    description: 'How often you want to receive communications',
    type: 'enum',
    required: false,
    defaultValue: 'weekly',
    options: ['immediate', 'daily', 'weekly', 'monthly'],
    priority: 70,
    enabled: true,
    users: 3421
  },

  // Privacy & Data preferences
  {
    id: 'pref_data_analytics',
    categoryId: 'cat_privacy',
    name: 'Data Analytics',
    description: 'Allow your data to be used for analytics and insights',
    type: 'boolean',
    required: false,
    defaultValue: false,
    priority: 100,
    enabled: true,
    users: 2156
  },
  {
    id: 'pref_third_party_sharing',
    categoryId: 'cat_privacy',
    name: 'Third-party Sharing',
    description: 'Share data with trusted third-party partners',
    type: 'boolean',
    required: false,
    defaultValue: false,
    priority: 90,
    enabled: false,
    users: 456
  },
  {
    id: 'pref_data_retention',
    categoryId: 'cat_privacy',
    name: 'Data Retention Period',
    description: 'How long to keep your personal data',
    type: 'enum',
    required: false,
    defaultValue: '2years',
    options: ['1year', '2years', '5years', 'indefinite'],
    priority: 80,
    enabled: true,
    users: 1823
  },
  {
    id: 'pref_location_tracking',
    categoryId: 'cat_privacy',
    name: 'Location Tracking',
    description: 'Allow location-based services and tracking',
    type: 'boolean',
    required: false,
    defaultValue: false,
    priority: 70,
    enabled: true,
    users: 987
  },

  // Security preferences
  {
    id: 'pref_two_factor_auth',
    categoryId: 'cat_security',
    name: 'Two-Factor Authentication',
    description: 'Enable two-factor authentication for enhanced security',
    type: 'boolean',
    required: false,
    defaultValue: false,
    priority: 100,
    enabled: true,
    users: 1834
  },
  {
    id: 'pref_session_timeout',
    categoryId: 'cat_security',
    name: 'Session Timeout',
    description: 'Automatically log out after inactivity',
    type: 'number',
    required: false,
    defaultValue: 30,
    validation: { min: 5, max: 120 },
    priority: 90,
    enabled: true,
    users: 2567
  },
  {
    id: 'pref_login_notifications',
    categoryId: 'cat_security',
    name: 'Login Notifications',
    description: 'Get notified of new login attempts',
    type: 'boolean',
    required: false,
    defaultValue: true,
    priority: 80,
    enabled: true,
    users: 3245
  },

  // Personalization preferences
  {
    id: 'pref_content_personalization',
    categoryId: 'cat_personalization',
    name: 'Content Personalization',
    description: 'Personalize content based on your preferences and behavior',
    type: 'boolean',
    required: false,
    defaultValue: true,
    priority: 100,
    enabled: true,
    users: 1923
  },
  {
    id: 'pref_language',
    categoryId: 'cat_personalization',
    name: 'Preferred Language',
    description: 'Your preferred language for the interface',
    type: 'enum',
    required: true,
    defaultValue: 'en',
    options: ['en', 'si', 'ta'],
    priority: 90,
    enabled: true,
    users: 4567
  },
  {
    id: 'pref_timezone',
    categoryId: 'cat_personalization',
    name: 'Time Zone',
    description: 'Your preferred time zone',
    type: 'enum',
    required: false,
    defaultValue: 'Asia/Colombo',
    options: ['Asia/Colombo', 'UTC', 'America/New_York', 'Europe/London'],
    priority: 80,
    enabled: true,
    users: 3456
  },
  {
    id: 'pref_theme',
    categoryId: 'cat_personalization',
    name: 'Theme Preference',
    description: 'Choose your preferred interface theme',
    type: 'enum',
    required: false,
    defaultValue: 'light',
    options: ['light', 'dark', 'auto'],
    priority: 70,
    enabled: true,
    users: 2789
  },

  // Marketing preferences
  {
    id: 'pref_promotional_emails',
    categoryId: 'cat_marketing',
    name: 'Promotional Emails',
    description: 'Receive promotional offers and deals via email',
    type: 'boolean',
    required: false,
    defaultValue: false,
    priority: 100,
    enabled: true,
    users: 1234
  },
  {
    id: 'pref_product_updates',
    categoryId: 'cat_marketing',
    name: 'Product Updates',
    description: 'Get notified about new features and product updates',
    type: 'boolean',
    required: false,
    defaultValue: true,
    priority: 90,
    enabled: true,
    users: 2876
  },
  {
    id: 'pref_survey_participation',
    categoryId: 'cat_marketing',
    name: 'Survey Participation',
    description: 'Participate in customer surveys and feedback',
    type: 'boolean',
    required: false,
    defaultValue: false,
    priority: 80,
    enabled: true,
    users: 987
  },

  // Analytics preferences
  {
    id: 'pref_usage_analytics',
    categoryId: 'cat_analytics',
    name: 'Usage Analytics',
    description: 'Allow collection of usage data for service improvement',
    type: 'boolean',
    required: false,
    defaultValue: true,
    priority: 100,
    enabled: true,
    users: 2345
  },
  {
    id: 'pref_performance_monitoring',
    categoryId: 'cat_analytics',
    name: 'Performance Monitoring',
    description: 'Monitor application performance and errors',
    type: 'boolean',
    required: false,
    defaultValue: true,
    priority: 90,
    enabled: true,
    users: 3567
  },
  {
    id: 'pref_crash_reporting',
    categoryId: 'cat_analytics',
    name: 'Crash Reporting',
    description: 'Send crash reports to help improve stability',
    type: 'boolean',
    required: false,
    defaultValue: true,
    priority: 80,
    enabled: true,
    users: 2890
  }
];

async function seedPreferences() {
  try {
    console.log('🌱 Starting preference seeding process...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing preferences and categories...');
    await PreferenceItem.deleteMany({});
    await PreferenceCategory.deleteMany({});

    // Seed categories
    console.log('📂 Seeding preference categories...');
    const createdCategories = [];
    for (const categoryData of sampleCategories) {
      const category = new PreferenceCategory({
        ...categoryData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await category.save();
      createdCategories.push(category);
      console.log(`   ✅ Created category: ${category.name}`);
    }

    // Seed preference items
    console.log('⚙️ Seeding preference items...');
    const createdPreferences = [];
    for (const prefData of samplePreferences) {
      const preference = new PreferenceItem({
        ...prefData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await preference.save();
      createdPreferences.push(preference);
      console.log(`   ✅ Created preference: ${preference.name}`);
    }

    console.log('\n🎉 Preference seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   📂 Categories created: ${createdCategories.length}`);
    console.log(`   ⚙️ Preferences created: ${createdPreferences.length}`);
    console.log(`   👥 Total simulated users: ${samplePreferences.reduce((sum, p) => sum + p.users, 0)}`);

    console.log('\n🚀 You can now test the preference management system in the admin dashboard!');
    
  } catch (error) {
    console.error('❌ Error seeding preferences:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the seeding function
if (require.main === module) {
  seedPreferences();
}

module.exports = { seedPreferences, sampleCategories, samplePreferences };
