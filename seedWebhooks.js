const mongoose = require('mongoose');
const { Webhook } = require('./models/Webhook');
const User = require('./models/User');

// MongoDB connection (using the same as the backend based on seedConsents.js)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://consentuser:12345@consentcluster.ylmrqgl.mongodb.net/consentDB?retryWrites=true&w=majority&appName=ConsentCluster';

const sampleWebhooks = [
  {
    name: 'Marketing Consent Webhook',
    url: 'https://api.marketing.company.com/webhooks/consent',
    description: 'Receives notifications when users grant or withdraw marketing consent',
    method: 'POST',
    events: ['consent.granted', 'consent.withdrawn', 'consent.updated'],
    isActive: true,
    retryAttempts: 3,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer marketing-api-key-12345',
      'X-Source': 'ConsentHub'
    },
    authentication: {
      type: 'bearer',
      token: 'marketing-api-key-12345'
    },
    // Simulate some delivery history
    totalTriggers: 145,
    successfulTriggers: 142,
    failedTriggers: 3,
    successRate: 97.9,
    lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    name: 'DSAR Processing Webhook',
    url: 'https://compliance.company.com/api/webhooks/dsar',
    description: 'Handles Data Subject Access Request notifications',
    method: 'POST',
    events: ['dsar.created', 'dsar.completed', 'dsar.updated', 'dsar.cancelled'],
    isActive: true,
    retryAttempts: 5,
    timeout: 45000,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'compliance-key-67890',
      'X-Webhook-Source': 'ConsentHub-DSAR'
    },
    authentication: {
      type: 'api_key',
      apiKey: 'compliance-key-67890'
    },
    totalTriggers: 23,
    successfulTriggers: 22,
    failedTriggers: 1,
    successRate: 95.7,
    lastTriggered: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    lastError: {
      message: 'Connection timeout',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      statusCode: 408
    }
  },
  {
    name: 'Analytics Event Tracker',
    url: 'https://analytics.company.com/webhooks/privacy-events',
    description: 'Tracks privacy-related events for analytics and reporting',
    method: 'POST',
    events: ['consent.granted', 'consent.withdrawn', 'preference.updated', 'privacy.notice.updated'],
    isActive: true,
    retryAttempts: 2,
    timeout: 20000,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer analytics-token-abcdef',
      'X-Analytics-Source': 'ConsentHub'
    },
    authentication: {
      type: 'bearer',
      token: 'analytics-token-abcdef'
    },
    totalTriggers: 312,
    successfulTriggers: 309,
    failedTriggers: 3,
    successRate: 99.0,
    lastTriggered: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
  },
  {
    name: 'Customer Service Integration',
    url: 'https://support.company.com/api/privacy-notifications',
    description: 'Notifies customer service team of privacy-related requests',
    method: 'POST',
    events: ['dsar.created', 'user.created', 'privacy.notice.created'],
    isActive: true,
    retryAttempts: 3,
    timeout: 25000,
    headers: {
      'Content-Type': 'application/json',
      'X-Service-Key': 'support-webhook-key-xyz789',
      'X-Priority': 'high'
    },
    authentication: {
      type: 'api_key',
      apiKey: 'support-webhook-key-xyz789'
    },
    totalTriggers: 67,
    successfulTriggers: 65,
    failedTriggers: 2,
    successRate: 97.0,
    lastTriggered: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
  },
  {
    name: 'Email Marketing Platform',
    url: 'https://email.platform.com/webhooks/consent-updates',
    description: 'Syncs consent preferences with email marketing platform',
    method: 'POST',
    events: ['consent.granted', 'consent.withdrawn', 'preference.updated'],
    isActive: true,
    retryAttempts: 4,
    timeout: 35000,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer email-platform-token-123',
      'X-Webhook-Version': '2.0'
    },
    authentication: {
      type: 'bearer',
      token: 'email-platform-token-123'
    },
    totalTriggers: 89,
    successfulTriggers: 87,
    failedTriggers: 2,
    successRate: 97.8,
    lastTriggered: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
  },
  {
    name: 'CRM System Sync',
    url: 'https://crm.company.com/api/webhooks/customer-consent',
    description: 'Synchronizes customer consent data with CRM system',
    method: 'POST',
    events: ['consent.granted', 'consent.withdrawn', 'user.created', 'user.updated'],
    isActive: false,
    retryAttempts: 3,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'X-CRM-API-Key': 'crm-api-key-disabled-456',
      'X-Integration': 'ConsentHub-CRM'
    },
    authentication: {
      type: 'api_key',
      apiKey: 'crm-api-key-disabled-456'
    },
    totalTriggers: 0,
    successfulTriggers: 0,
    failedTriggers: 0,
    successRate: 0,
    lastError: {
      message: 'Webhook disabled by admin',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      statusCode: 200
    }
  },
  {
    name: 'Data Warehouse ETL',
    url: 'https://warehouse.company.com/etl/privacy-events',
    description: 'Feeds privacy events into data warehouse for compliance reporting',
    method: 'POST',
    events: ['consent.granted', 'consent.withdrawn', 'dsar.created', 'dsar.completed', 'preference.updated'],
    isActive: true,
    retryAttempts: 5,
    timeout: 60000,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer warehouse-etl-token-789',
      'X-ETL-Source': 'ConsentHub',
      'X-Data-Classification': 'PII'
    },
    authentication: {
      type: 'bearer',
      token: 'warehouse-etl-token-789'
    },
    totalTriggers: 456,
    successfulTriggers: 448,
    failedTriggers: 8,
    successRate: 98.2,
    lastTriggered: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
  },
  {
    name: 'Mobile App Notifications',
    url: 'https://mobile-api.company.com/webhooks/privacy-updates',
    description: 'Sends push notifications to mobile app about privacy updates',
    method: 'POST',
    events: ['privacy.notice.updated', 'user.created', 'preference.updated'],
    isActive: true,
    retryAttempts: 2,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      'X-Mobile-API-Key': 'mobile-notifications-key-abc',
      'X-Platform': 'iOS-Android'
    },
    authentication: {
      type: 'api_key',
      apiKey: 'mobile-notifications-key-abc'
    },
    totalTriggers: 178,
    successfulTriggers: 176,
    failedTriggers: 2,
    successRate: 98.9,
    lastTriggered: new Date(Date.now() - 45 * 60 * 1000) // 45 minutes ago
  }
];

async function seedWebhooks() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Find an admin user to assign as creator (or create a system user)
    let adminUser = await User.findOne({ role: 'admin' }).limit(1);
    
    if (!adminUser) {
      console.log('ℹ️  No admin user found, creating system user...');
      adminUser = new User({
        firstName: 'System',
        lastName: 'Administrator',
        email: 'system@consenthub.com',
        phone: '+94712345678',
        role: 'admin',
        password: 'system-generated-password',
        company: 'SLT-Mobitel',
        department: 'IT',
        jobTitle: 'System Administrator',
        isActive: true,
        isVerified: true
      });
      await adminUser.save();
      console.log('✅ System admin user created');
    }

    console.log('🗑️  Cleaning up existing sample webhooks...');
    // Remove existing sample webhooks (optional - comment out if you want to keep existing ones)
    await Webhook.deleteMany({
      name: { 
        $in: sampleWebhooks.map(w => w.name) 
      }
    });

    console.log('📝 Creating sample webhooks...');
    const webhooksWithCreator = sampleWebhooks.map(webhook => ({
      ...webhook,
      createdBy: adminUser._id,
      updatedBy: adminUser._id
    }));

    const createdWebhooks = await Webhook.insertMany(webhooksWithCreator);
    
    console.log(`✅ Successfully created ${createdWebhooks.length} sample webhooks:`);
    createdWebhooks.forEach((webhook, index) => {
      console.log(`   ${index + 1}. ${webhook.name} (${webhook.isActive ? 'Active' : 'Inactive'})`);
    });

    // Also create some sample delivery logs for realistic data
    console.log('📊 Adding sample delivery logs...');
    
    const now = new Date();
    const sampleLogs = [];
    
    for (const webhook of createdWebhooks) {
      if (webhook.totalTriggers > 0) {
        // Create some recent delivery logs
        const logCount = Math.min(webhook.totalTriggers, 10);
        for (let i = 0; i < logCount; i++) {
          const hoursAgo = Math.floor(Math.random() * 48); // Random time in last 48 hours
          const isSuccess = Math.random() < (webhook.successRate / 100);
          
          const log = {
            webhookId: webhook._id,
            eventType: webhook.events[Math.floor(Math.random() * webhook.events.length)],
            eventData: {
              userId: new mongoose.Types.ObjectId(),
              timestamp: new Date(now - hoursAgo * 60 * 60 * 1000),
              action: 'sample_event'
            },
            deliveryStatus: isSuccess ? 'delivered' : 'failed',
            responseCode: isSuccess ? 200 : (Math.random() > 0.5 ? 404 : 500),
            responseMessage: isSuccess ? 'OK' : 'Internal Server Error',
            attempts: isSuccess ? 1 : Math.ceil(Math.random() * webhook.retryAttempts),
            maxAttempts: webhook.retryAttempts,
            deliveredAt: isSuccess ? new Date(now - hoursAgo * 60 * 60 * 1000) : null,
            error: !isSuccess ? 'Connection timeout or server error' : null,
            createdAt: new Date(now - hoursAgo * 60 * 60 * 1000),
            updatedAt: new Date(now - hoursAgo * 60 * 60 * 1000)
          };
          
          sampleLogs.push(log);
        }
      }
    }

    // Insert delivery logs directly into the deliveryLogs collection
    if (sampleLogs.length > 0) {
      const db = mongoose.connection.db;
      await db.collection('deliverylogs').insertMany(sampleLogs);
      console.log(`✅ Added ${sampleLogs.length} sample delivery logs`);
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('📱 You can now view these webhooks in the Event Listeners page');
    console.log('🌐 Frontend URL: http://localhost:5174');
    
  } catch (error) {
    console.error('❌ Error seeding webhooks:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seeding function
if (require.main === module) {
  seedWebhooks();
}

module.exports = { seedWebhooks, sampleWebhooks };
