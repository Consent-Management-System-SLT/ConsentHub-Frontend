/**
 * Create Test Privacy Notices with Proper Schema
 * Creates privacy notices that work with the updated acknowledgment system
 */

const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = 'mongodb+srv://ojitharajapaksha2000:jcIUHLQpEodrOvJK@cluster0.x8kje.mongodb.net/consent-management?retryWrites=true&w=majority&appName=Cluster0';

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

const TEST_NOTICES = [
  {
    noticeId: 'privacy-policy-2025',
    title: 'Privacy Policy Update 2025',
    description: 'Updated privacy policy for enhanced data protection and user rights',
    content: `
      <div class="privacy-content">
        <h2>Privacy Policy Update</h2>
        <p>We have updated our privacy policy to provide enhanced data protection and clearer user rights.</p>
        
        <h3>What's New:</h3>
        <ul>
          <li>Enhanced encryption for all personal data</li>
          <li>Clearer consent processes for data collection</li>
          <li>Expanded user rights and control options</li>
          <li>Updated data retention policies</li>
          <li>Improved third-party data sharing transparency</li>
        </ul>
        
        <h3>Your Rights Include:</h3>
        <ul>
          <li>Right to access your personal data</li>
          <li>Right to correct or update information</li>
          <li>Right to delete your data (Right to be forgotten)</li>
          <li>Right to data portability</li>
          <li>Right to withdraw consent</li>
        </ul>
        
        <p>For questions about this privacy policy, contact our Data Protection Officer at privacy@company.com</p>
      </div>
    `,
    version: '3.0',
    category: 'privacy',
    status: 'active',
    language: 'en',
    effectiveDate: new Date('2025-01-01'),
    priority: 'high',
    acknowledgments: [],
    metadata: { 
      source: 'test-system',
      department: 'Legal',
      reviewedBy: 'Data Protection Officer'
    }
  },
  {
    noticeId: 'cookie-policy-2025',
    title: 'Cookie Usage Policy',
    description: 'Information about how we use cookies and tracking technologies',
    content: `
      <div class="cookie-content">
        <h2>Cookie Usage Policy</h2>
        <p>Our website uses cookies and similar tracking technologies to enhance your experience.</p>
        
        <h3>Types of Cookies We Use:</h3>
        <ul>
          <li><strong>Essential Cookies:</strong> Required for basic website functionality</li>
          <li><strong>Performance Cookies:</strong> Help us analyze website usage and improve performance</li>
          <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
          <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
        </ul>
        
        <h3>Managing Your Cookie Preferences:</h3>
        <p>You can control and manage cookies in several ways:</p>
        <ul>
          <li>Browser settings to block or delete cookies</li>
          <li>Our cookie preference center</li>
          <li>Third-party opt-out tools</li>
        </ul>
        
        <p>Please note that disabling essential cookies may affect website functionality.</p>
      </div>
    `,
    version: '2.1',
    category: 'cookies',
    status: 'active',
    language: 'en',
    effectiveDate: new Date('2025-02-01'),
    priority: 'medium',
    acknowledgments: [],
    metadata: { 
      source: 'test-system',
      department: 'Technology',
      reviewedBy: 'Web Development Team'
    }
  },
  {
    noticeId: 'marketing-communications-2025',
    title: 'Marketing Communications Consent',
    description: 'Consent for receiving promotional emails and marketing communications',
    content: `
      <div class="marketing-content">
        <h2>Marketing Communications</h2>
        <p>We would like your permission to send you marketing communications about our products and services.</p>
        
        <h3>What Communications Include:</h3>
        <ul>
          <li>Product updates and announcements</li>
          <li>Special offers and promotions</li>
          <li>Educational content and industry insights</li>
          <li>Event invitations and webinars</li>
          <li>Company news and updates</li>
        </ul>
        
        <h3>Communication Frequency:</h3>
        <p>We typically send marketing emails 2-3 times per month. You can:</p>
        <ul>
          <li>Adjust your communication preferences</li>
          <li>Choose specific types of content</li>
          <li>Unsubscribe at any time</li>
          <li>Update preferences in your account settings</li>
        </ul>
        
        <p><strong>Note:</strong> Declining marketing communications will not affect essential service communications or your account functionality.</p>
      </div>
    `,
    version: '1.8',
    category: 'marketing',
    status: 'active',
    language: 'en',
    effectiveDate: new Date('2025-01-15'),
    priority: 'low',
    acknowledgments: [],
    metadata: { 
      source: 'test-system',
      department: 'Marketing',
      reviewedBy: 'Marketing Director'
    }
  },
  {
    noticeId: 'terms-of-service-2025',
    title: 'Terms of Service Agreement',
    description: 'Updated terms and conditions for using our services',
    content: `
      <div class="terms-content">
        <h2>Terms of Service</h2>
        <p>These terms govern your use of our services and outline both your rights and responsibilities.</p>
        
        <h3>Service Usage:</h3>
        <ul>
          <li>You must provide accurate and current information</li>
          <li>Maintain the security of your account credentials</li>
          <li>Use services in compliance with applicable laws</li>
          <li>Respect intellectual property rights</li>
          <li>Not engage in prohibited activities</li>
        </ul>
        
        <h3>Our Commitments:</h3>
        <ul>
          <li>Provide reliable and secure services</li>
          <li>Protect your personal information</li>
          <li>Provide customer support</li>
          <li>Maintain service availability (with scheduled maintenance)</li>
        </ul>
        
        <h3>Updates and Changes:</h3>
        <p>We may update these terms from time to time. We will notify you of significant changes through your registered email or in-app notifications.</p>
        
        <p>For questions about these terms, contact our legal team at legal@company.com</p>
      </div>
    `,
    version: '5.0',
    category: 'terms',
    status: 'active',
    language: 'en',
    effectiveDate: new Date('2025-03-01'),
    priority: 'high',
    acknowledgments: [],
    metadata: { 
      source: 'test-system',
      department: 'Legal',
      reviewedBy: 'General Counsel'
    }
  }
];

async function createWorkingPrivacyNotices() {
  console.log('🧪 Creating Working Privacy Notices...');
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing test notices
    await PrivacyNotice.deleteMany({ 'metadata.source': 'test-system' });
    console.log('🧹 Cleared existing test notices');

    // Create new notices
    const created = [];
    for (const noticeData of TEST_NOTICES) {
      try {
        const notice = new PrivacyNotice(noticeData);
        await notice.save();
        created.push(notice);
        console.log(`✅ Created: ${notice.title}`);
      } catch (error) {
        console.error(`❌ Failed to create ${noticeData.title}:`, error.message);
      }
    }

    console.log(`\n📊 Summary: Created ${created.length}/${TEST_NOTICES.length} notices`);
    console.log('\n📋 Test Privacy Notices:');
    created.forEach((notice, i) => {
      console.log(`${i + 1}. ${notice.title}`);
      console.log(`   ID: ${notice.noticeId}`);
      console.log(`   Category: ${notice.category}`);
      console.log(`   Priority: ${notice.priority}`);
      console.log(`   Version: ${notice.version}`);
    });

    console.log('\n🎉 Privacy notices created successfully!');
    console.log('📱 Test the customer dashboard at http://localhost:5174');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

if (require.main === module) {
  createWorkingPrivacyNotices().catch(console.error);
}

module.exports = { createWorkingPrivacyNotices };
