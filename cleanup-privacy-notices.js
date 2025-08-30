const mongoose = require('mongoose');
const PrivacyNotice = require('./models/PrivacyNoticeNew');

const MONGODB_URI = 'mongodb+srv://consentuser:12345@cluster0.ylmrqgl.mongodb.net/consentDB?retryWrites=true&w=majority';

// Define 5 essential privacy notices
const essentialNotices = [
    {
        noticeId: 'privacy_policy_2025',
        title: 'SLT Mobitel Privacy Policy',
        description: 'Our comprehensive privacy policy explaining how we collect, use, and protect your personal data.',
        content: `# SLT Mobitel Privacy Policy

## 1. Information We Collect
We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us.

## 2. How We Use Your Information  
We use the information we collect to provide, maintain, and improve our services.

## 3. Information Sharing
We do not sell, trade, or otherwise transfer your personal information to third parties without your consent.

## 4. Data Security
We implement appropriate security measures to protect your personal information.

## 5. Your Rights
You have the right to access, update, or delete your personal information.

## 6. Contact Us
If you have any questions about this Privacy Policy, please contact us.`,
        version: '3.2',
        category: 'general',
        priority: 'required',
        status: 'active',
        language: 'en',
        effectiveDate: new Date('2024-01-01'),
        expirationDate: null,
        metadata: {
            tags: ['privacy', 'policy', 'required'],
            author: 'Legal Team',
            approvedBy: 'Chief Legal Officer',
            approvalDate: new Date('2023-12-15')
        }
    },
    {
        noticeId: 'terms_of_service_2024',
        title: 'Terms of Service',
        description: 'Terms and conditions for using SLT Mobitel services.',
        content: `# Terms of Service

## 1. Acceptance of Terms
By using our services, you agree to these terms.

## 2. Service Description
SLT Mobitel provides telecommunications and digital services.

## 3. User Responsibilities
Users must comply with applicable laws and regulations.

## 4. Service Availability
We strive to maintain service availability but cannot guarantee 100% uptime.

## 5. Limitation of Liability
Our liability is limited as set forth in these terms.

## 6. Termination
Either party may terminate service with appropriate notice.`,
        version: '4.0',
        category: 'general',
        priority: 'required',
        status: 'active',
        language: 'en',
        effectiveDate: new Date('2024-03-15'),
        expirationDate: null,
        metadata: {
            tags: ['terms', 'service', 'legal'],
            author: 'Legal Team',
            approvedBy: 'Chief Legal Officer',
            approvalDate: new Date('2024-03-01')
        }
    },
    {
        noticeId: 'marketing_communications_2024',
        title: 'Marketing Communications Policy',
        description: 'How we communicate with you about our products and services.',
        content: `# Marketing Communications Policy

## 1. Communication Types
We may send you promotional emails, SMS messages, and other communications.

## 2. Opt-out Options
You can opt out of marketing communications at any time.

## 3. Frequency
We respect your preferences and won't overwhelm you with messages.

## 4. Personalization
We may personalize communications based on your interests and usage.

## 5. Contact Preferences
You can update your communication preferences in your account settings.`,
        version: '1.5',
        category: 'marketing',
        priority: 'optional',
        status: 'active',
        language: 'en',
        effectiveDate: new Date('2024-05-01'),
        expirationDate: null,
        metadata: {
            tags: ['marketing', 'communications', 'optional'],
            author: 'Marketing Team',
            approvedBy: 'Marketing Director',
            approvalDate: new Date('2024-04-15')
        }
    },
    {
        noticeId: 'cookie_policy_2024',
        title: 'Cookie Usage Policy',
        description: 'Information about how we use cookies on our websites and applications.',
        content: `# Cookie Usage Policy

## 1. What Are Cookies
Cookies are small files stored on your device when you visit our website.

## 2. Types of Cookies We Use
- Essential cookies for website functionality
- Analytics cookies to understand usage
- Marketing cookies for personalized ads

## 3. Cookie Management
You can manage cookie preferences through your browser settings.

## 4. Third-Party Cookies
Some cookies may be set by third-party services we use.

## 5. Updates to This Policy
We may update this cookie policy from time to time.`,
        version: '2.1',
        category: 'cookies',
        priority: 'optional',
        status: 'active',
        language: 'en',
        effectiveDate: new Date('2024-06-01'),
        expirationDate: null,
        metadata: {
            tags: ['cookies', 'website', 'tracking'],
            author: 'Technical Team',
            approvedBy: 'CTO',
            approvalDate: new Date('2024-05-15')
        }
    },
    {
        noticeId: 'data_processing_2024',
        title: 'Data Processing Notice',
        description: 'Details about how we process your personal data under GDPR and local regulations.',
        content: `# Data Processing Notice

## 1. Legal Basis for Processing
We process your data based on legitimate interests, consent, or contractual necessity.

## 2. Data Categories
We process various categories of personal data including contact information and usage data.

## 3. Processing Purposes
Data is processed for service provision, customer support, and legal compliance.

## 4. Data Retention
We retain data only as long as necessary for the stated purposes.

## 5. Your Rights Under GDPR
You have rights to access, rectify, erase, and port your personal data.

## 6. International Transfers
Data may be transferred outside Sri Lanka with appropriate safeguards.`,
        version: '1.0',
        category: 'general',
        priority: 'required',
        status: 'active',
        language: 'en',
        effectiveDate: new Date('2024-06-01'),
        expirationDate: null,
        metadata: {
            tags: ['gdpr', 'data-processing', 'rights'],
            author: 'Data Protection Officer',
            approvedBy: 'Chief Legal Officer',
            approvalDate: new Date('2024-05-20')
        }
    }
];

async function cleanupPrivacyNotices() {
    try {
        // Connect to MongoDB
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get current notice count
        const currentCount = await PrivacyNotice.countDocuments();
        console.log(`📊 Current privacy notices: ${currentCount}`);

        // Delete all existing privacy notices
        console.log('🗑️ Removing all existing privacy notices...');
        const deleteResult = await PrivacyNotice.deleteMany({});
        console.log(`✅ Deleted ${deleteResult.deletedCount} privacy notices`);

        // Insert the 5 essential notices
        console.log('➕ Creating 5 essential privacy notices...');
        const insertResult = await PrivacyNotice.insertMany(essentialNotices);
        console.log(`✅ Created ${insertResult.length} privacy notices`);

        // Display the created notices
        console.log('\n📋 Created Privacy Notices:');
        insertResult.forEach((notice, index) => {
            console.log(`   ${index + 1}. ${notice.title} (${notice.noticeId})`);
            console.log(`      - Version: ${notice.version}`);
            console.log(`      - Category: ${notice.category}`);
            console.log(`      - Priority: ${notice.priority}`);
            console.log(`      - MongoDB ID: ${notice._id}`);
            console.log('');
        });

        console.log('🎉 Privacy notices cleanup completed successfully!');
        console.log('📝 Summary:');
        console.log(`   - Total notices: 5`);
        console.log(`   - Required notices: 3`);
        console.log(`   - Optional notices: 2`);
        console.log(`   - All notices are active and ready for acknowledgment`);

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔐 Database connection closed');
    }
}

// Run the cleanup
cleanupPrivacyNotices();
