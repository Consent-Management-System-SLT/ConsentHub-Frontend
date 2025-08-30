/**
 * Direct Database Privacy Notice Creation
 * Creates privacy notices directly in MongoDB without API authentication
 */

// Import required modules
const mongoose = require('mongoose');

// Privacy Notice Schema (simplified version for direct creation)
const privacyNoticeSchema = new mongoose.Schema({
  noticeId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: String,
  content: { type: String, required: true },
  version: { type: String, default: '1.0' },
  category: { type: String, required: true },
  status: { type: String, enum: ['active', 'draft', 'archived'], default: 'active' },
  language: { type: String, default: 'en' },
  effectiveDate: { type: Date, default: Date.now },
  expirationDate: Date,
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  acknowledgments: [{
    customerId: String,
    customerEmail: String,
    acknowledged: { type: Boolean, default: false },
    acknowledgedAt: Date,
    decision: { type: String, enum: ['accept', 'decline'] },
    ipAddress: String,
    userAgent: String,
    metadata: mongoose.Schema.Types.Mixed
  }],
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

const PrivacyNotice = mongoose.model('PrivacyNotice', privacyNoticeSchema);

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://ojitharajapaksha2000:jcIUHLQpEodrOvJK@cluster0.x8kje.mongodb.net/consent-management?retryWrites=true&w=majority&appName=Cluster0';

const SAMPLE_NOTICES = [
  {
    noticeId: 'privacy-policy-2024',
    title: 'Privacy Policy Update',
    description: 'Updated privacy policy regarding data collection and usage',
    content: 'We have updated our privacy policy to provide more transparency about how we collect, use, and protect your personal data. Key changes include enhanced data encryption practices, clearer consent management processes, expanded user rights and control options, and updated third-party data sharing policies.',
    version: '2.1',
    category: 'privacy',
    status: 'active',
    language: 'en',
    effectiveDate: new Date('2024-01-15'),
    priority: 'high',
    metadata: { source: 'test', author: 'System' }
  },
  {
    noticeId: 'cookie-consent-2024',
    title: 'Cookie Consent Notice',
    description: 'Information about cookies and tracking technologies',
    content: 'Our website uses cookies and similar tracking technologies to enhance your browsing experience. We use essential cookies for functionality, analytics cookies to understand usage, and marketing cookies for advertisements.',
    version: '1.5',
    category: 'cookies',
    status: 'active',
    language: 'en',
    effectiveDate: new Date('2024-02-01'),
    priority: 'medium',
    metadata: { source: 'test', author: 'System' }
  },
  {
    noticeId: 'marketing-consent-2024',
    title: 'Marketing Communications',
    description: 'Consent for marketing emails and promotions',
    content: 'We would like your permission to send you marketing communications about our products, services, and special offers. You can unsubscribe at any time and this will not affect your account services.',
    version: '1.2',
    category: 'marketing',
    status: 'active',
    language: 'en',
    effectiveDate: new Date('2024-02-15'),
    priority: 'low',
    metadata: { source: 'test', author: 'System' }
  },
  {
    noticeId: 'terms-of-service-2024',
    title: 'Terms of Service Update',
    description: 'Updated terms and conditions for service usage',
    content: 'We have updated our Terms of Service to clarify user responsibilities and service provisions. Key updates include acceptable use policies, payment terms, security requirements, and dispute resolution procedures.',
    version: '4.1',
    category: 'terms',
    status: 'active',
    language: 'en',
    effectiveDate: new Date('2024-03-01'),
    priority: 'high',
    metadata: { source: 'test', author: 'System' }
  }
];

async function createPrivacyNoticesDirectly() {
  console.log('🚀 Creating Privacy Notices Directly in Database...');
  
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully');

    // Clear existing test notices to avoid duplicates
    console.log('🧹 Clearing existing test notices...');
    await PrivacyNotice.deleteMany({ 'metadata.source': 'test' });
    console.log('✅ Cleared existing test notices');

    // Create new notices
    console.log('📝 Creating new privacy notices...');
    const createdNotices = [];

    for (const noticeData of SAMPLE_NOTICES) {
      try {
        const notice = new PrivacyNotice(noticeData);
        await notice.save();
        createdNotices.push(notice);
        console.log(`✅ Created: ${notice.title} (${notice.noticeId})`);
      } catch (error) {
        console.error(`❌ Failed to create ${noticeData.title}:`, error.message);
      }
    }

    // Summary
    console.log('\n📊 Creation Summary:');
    console.log(`✅ Successfully created: ${createdNotices.length}/${SAMPLE_NOTICES.length} notices`);
    
    console.log('\n📋 Created Notices:');
    createdNotices.forEach((notice, index) => {
      console.log(`${index + 1}. ${notice.title}`);
      console.log(`   • ID: ${notice.noticeId}`);
      console.log(`   • Category: ${notice.category}`);
      console.log(`   • Priority: ${notice.priority}`);
      console.log(`   • Status: ${notice.status}`);
    });

    // Verify by querying
    console.log('\n🔍 Verifying created notices...');
    const allNotices = await PrivacyNotice.find({ 'metadata.source': 'test' }).sort({ createdAt: -1 });
    console.log(`✅ Found ${allNotices.length} test notices in database`);

    console.log('\n🎉 Privacy notices created successfully!');
    console.log('💡 You can now test the customer dashboard privacy notices page');
    console.log('🌐 Frontend URL: http://localhost:5174');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 11000) {
      console.error('📝 Duplicate key error - notices with these IDs already exist');
    }
  } finally {
    // Disconnect from MongoDB
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('📡 Disconnected from MongoDB');
    }
  }
}

// Run the script
if (require.main === module) {
  createPrivacyNoticesDirectly().catch(console.error);
}

module.exports = { createPrivacyNoticesDirectly, SAMPLE_NOTICES };
