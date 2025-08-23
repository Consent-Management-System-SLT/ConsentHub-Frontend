const mongoose = require('mongoose');
require('dotenv').config();

// Use the same database connection as the backend
const connectDB = require('./config/database');

// Import models
const DSARRequest = require('./models/DSARRequest');
const User = require('./models/User');

async function createRealisticDSARRequests() {
  try {
    console.log('🚀 Creating realistic DSAR requests linked to actual users...');

    // Connect using the same configuration as the backend
    await connectDB();

    // Get actual users from the database
    const existingUsers = await User.find({}).select('_id email firstName lastName role').limit(10);
    console.log(`📊 Found ${existingUsers.length} existing users in database`);
    
    if (existingUsers.length > 0) {
      console.log('👥 Available users:');
      existingUsers.forEach(user => {
        console.log(`  - ${user.firstName} ${user.lastName} (${user.email}) [${user.role}]`);
      });
    }

    // Clear existing test DSAR requests (keep only real ones)
    const testRequests = await DSARRequest.find({ 
      $or: [
        { requesterEmail: /test\.backend@example\.com/ },
        { requesterId: /^external_/ }
      ]
    });
    
    if (testRequests.length > 0) {
      await DSARRequest.deleteMany({ 
        $or: [
          { requesterEmail: /test\.backend@example\.com/ },
          { requesterId: /^external_/ }
        ]
      });
      console.log(`🗑️ Cleaned up ${testRequests.length} test requests`);
    }

    // Create realistic DSAR requests for actual users or realistic customers
    const realisticRequests = [
      {
        requesterId: existingUsers.length > 0 ? existingUsers[0]._id.toString() : 'customer_001',
        requesterName: existingUsers.length > 0 ? `${existingUsers[0].firstName} ${existingUsers[0].lastName}` : 'John Silva',
        requesterEmail: existingUsers.length > 0 ? existingUsers[0].email : 'john.silva@gmail.com',
        requestType: 'data_access',
        subject: 'Request for My Personal Data - Mobile Service Account',
        description: 'I would like to access all personal data you have collected about me related to my mobile service account, including call records, billing information, location data, and any third-party data sharing records.',
        dataCategories: ['personal_data', 'contact_information', 'billing_information', 'usage_data', 'location_data'],
        status: 'pending',
        priority: 'medium',
        responseMethod: 'email',
        verificationMethod: 'email_verification',
        verificationStatus: 'pending',
        source: 'web_form',
        customerType: 'individual',
        applicableLaws: ['GDPR', 'PDPA_SL'],
        riskLevel: 'low',
        sensitiveData: false,
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        processingNotes: [
          {
            note: 'Request received via customer portal. Initial identity verification pending.',
            author: 'System Auto-Assignment',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          }
        ]
      },
      {
        requesterId: existingUsers.length > 1 ? existingUsers[1]._id.toString() : 'customer_002',
        requesterName: existingUsers.length > 1 ? `${existingUsers[1].firstName} ${existingUsers[1].lastName}` : 'Priya Perera',
        requesterEmail: existingUsers.length > 1 ? existingUsers[1].email : 'priya.perera@yahoo.com',
        requestType: 'data_rectification',
        subject: 'Incorrect Address Information in Account',
        description: 'My current address in your system is outdated. I have moved to a new location and need to update my registered address and emergency contact details.',
        dataCategories: ['contact_information', 'personal_data'],
        status: 'in_progress',
        priority: 'medium',
        responseMethod: 'email',
        verificationMethod: 'phone_verification',
        verificationStatus: 'verified',
        source: 'phone',
        customerType: 'individual',
        applicableLaws: ['GDPR', 'PDPA_SL'],
        riskLevel: 'low',
        sensitiveData: false,
        submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        processingNotes: [
          {
            note: 'Customer called to report address change. Phone verification completed successfully.',
            author: 'Niluka Fernando (CSR)',
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
          },
          {
            note: 'Address verification documents received. Processing address update across all systems.',
            author: 'Dilshan Jayawardena (Data Team)',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          }
        ],
        communications: [
          {
            type: 'phone',
            direction: 'inbound',
            content: 'Customer called to update address. Provided new address and proof of residence.',
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            author: 'Niluka Fernando (CSR)'
          }
        ]
      },
      {
        requesterId: existingUsers.length > 2 ? existingUsers[2]._id.toString() : 'customer_003',
        requesterName: existingUsers.length > 2 ? `${existingUsers[2].firstName} ${existingUsers[2].lastName}` : 'Rashid Ahmed',
        requesterEmail: existingUsers.length > 2 ? existingUsers[2].email : 'rashid.ahmed@hotmail.com',
        requestType: 'data_erasure',
        subject: 'Close Account and Delete Personal Data',
        description: 'I am terminating my mobile service and relocating overseas permanently. Please close my account and delete all personal data as I no longer require your services.',
        dataCategories: ['personal_data', 'contact_information', 'billing_information', 'usage_data', 'behavioral_data'],
        status: 'in_progress',
        priority: 'high',
        responseMethod: 'email',
        verificationMethod: 'identity_document',
        verificationStatus: 'verified',
        source: 'email',
        customerType: 'individual',
        applicableLaws: ['GDPR', 'PDPA_SL'],
        riskLevel: 'high',
        sensitiveData: true,
        submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        processingNotes: [
          {
            note: 'Account closure request received. Identity documents verified successfully.',
            author: 'Samantha Wickremesinghe (Senior CSR)',
            timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)
          },
          {
            note: 'Legal review required for data erasure due to regulatory retention requirements.',
            author: 'Legal Department',
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          },
          {
            note: 'Partial erasure approved. Some billing records must be retained for 7 years per Sri Lankan tax law.',
            author: 'Compliance Team',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          }
        ],
        communications: [
          {
            type: 'email',
            direction: 'outbound',
            content: 'Your data erasure request is being processed. Some records may need to be retained for legal compliance.',
            timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
            author: 'Data Protection Officer'
          }
        ]
      },
      {
        requesterId: 'customer_004',
        requesterName: 'Anushka Rajapaksha',
        requesterEmail: 'anushka.rajapaksha@slt.lk',
        requestType: 'data_portability',
        subject: 'Export Account Data for Business Migration',
        description: 'I am migrating my business to a new telecom provider and need to export all my account data, including call logs, billing history, and service usage patterns for the past 2 years.',
        dataCategories: ['personal_data', 'contact_information', 'billing_information', 'usage_data', 'behavioral_data'],
        status: 'completed',
        priority: 'medium',
        responseMethod: 'secure_download',
        verificationMethod: 'identity_document',
        verificationStatus: 'verified',
        source: 'web_form',
        customerType: 'business',
        applicableLaws: ['GDPR', 'PDPA_SL'],
        riskLevel: 'medium',
        sensitiveData: true,
        submittedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
        processingNotes: [
          {
            note: 'Business customer data export request. Identity verification completed.',
            author: 'Thilina Karunaratne (Business CSR)',
            timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
          },
          {
            note: 'Data compilation completed. Generated secure export package with 24 months of data.',
            author: 'Data Analytics Team',
            timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
          },
          {
            note: 'Secure download link sent to customer. Export completed successfully.',
            author: 'System',
            timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
          }
        ],
        responseData: {
          format: 'json',
          fileSize: 15728640, // 15MB
          recordCount: 8547,
          downloadUrl: 'https://secure.sltmobitel.lk/data-export/anushka-rajapaksha-export-2025.zip',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        },
        communications: [
          {
            type: 'email',
            direction: 'outbound',
            content: 'Your data export is ready for download. Please use the secure link provided.',
            timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
            author: 'System'
          }
        ]
      },
      {
        requesterId: 'customer_005',
        requesterName: 'Chaminda Wickramasinghe',
        requesterEmail: 'chaminda.w@gmail.com',
        requestType: 'object_processing',
        subject: 'Stop Marketing Communications',
        description: 'I no longer wish to receive any marketing communications including SMS, email campaigns, promotional offers, or telemarketing calls. Please remove me from all marketing lists.',
        dataCategories: ['contact_information', 'preferences', 'marketing_data'],
        status: 'completed',
        priority: 'low',
        responseMethod: 'email',
        verificationMethod: 'email_verification',
        verificationStatus: 'verified',
        source: 'web_form',
        customerType: 'individual',
        applicableLaws: ['GDPR', 'PDPA_SL'],
        riskLevel: 'low',
        sensitiveData: false,
        submittedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
        completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        processingNotes: [
          {
            note: 'Marketing opt-out request received. Email verification completed.',
            author: 'Marketing Team',
            timestamp: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000)
          },
          {
            note: 'Customer removed from all marketing databases and suppression list updated.',
            author: 'Database Administrator',
            timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
          }
        ],
        communications: [
          {
            type: 'email',
            direction: 'outbound',
            content: 'You have been successfully removed from all marketing communications. You will no longer receive promotional materials.',
            timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            author: 'Marketing Compliance Team'
          }
        ]
      },
      {
        requesterId: 'customer_006',
        requesterName: 'Nimesha Dissanayake',
        requesterEmail: 'nimesha.dissanayake@yahoo.com',
        requestType: 'restrict_processing',
        subject: 'Dispute Billing Data Accuracy',
        description: 'I dispute the accuracy of my billing records for the past 3 months. There are charges I do not recognize. Please restrict processing of my billing data until this is resolved.',
        dataCategories: ['billing_information', 'usage_data', 'personal_data'],
        status: 'pending',
        priority: 'high',
        responseMethod: 'email',
        verificationMethod: 'phone_verification',
        verificationStatus: 'pending',
        source: 'phone',
        customerType: 'individual',
        applicableLaws: ['GDPR', 'PDPA_SL'],
        riskLevel: 'high',
        sensitiveData: true,
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        processingNotes: [
          {
            note: 'URGENT: Customer disputes billing accuracy. Requires immediate investigation.',
            author: 'Customer Service Supervisor',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          },
          {
            note: 'Billing investigation team assigned. Processing restriction applied pending resolution.',
            author: 'Billing Department',
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
          }
        ],
        communications: [
          {
            type: 'phone',
            direction: 'inbound',
            content: 'Customer called about disputed charges. Requested processing restriction.',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            author: 'Customer Service Representative'
          }
        ]
      }
    ];

    // Create requests using the backend model
    let createdCount = 0;
    for (const requestData of realisticRequests) {
      try {
        const request = new DSARRequest(requestData);
        await request.save();
        console.log(`✅ Created DSAR request: ${request.requestId} - ${request.requesterName} (${request.requestType})`);
        createdCount++;
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⚠️ Skipped duplicate request for ${requestData.requesterName}`);
        } else {
          console.error(`❌ Error creating request for ${requestData.requesterName}:`, error.message);
        }
      }
    }

    console.log(`🎉 Successfully created ${createdCount} realistic DSAR requests!`);
    
    // Verify the requests
    const totalRequests = await DSARRequest.countDocuments();
    const statusCounts = await DSARRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    const typeCounts = await DSARRequest.aggregate([
      { $group: { _id: '$requestType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log(`\n📊 DSAR Database Summary:`);
    console.log(`Total DSAR requests: ${totalRequests}`);
    console.log(`\nStatus breakdown:`);
    statusCounts.forEach(status => {
      console.log(`  ${status._id}: ${status.count}`);
    });
    console.log(`\nRequest type breakdown:`);
    typeCounts.forEach(type => {
      console.log(`  ${type._id}: ${type.count}`);
    });

    // Show latest requests
    const latestRequests = await DSARRequest.find({})
      .sort({ createdAt: -1 })
      .limit(6)
      .select('requestId requesterName requestType status priority submittedAt');
    
    console.log('\n📋 Latest DSAR requests:');
    latestRequests.forEach(req => {
      const daysAgo = Math.floor((Date.now() - req.submittedAt.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`  ${req.requestId} - ${req.requesterName} | ${req.requestType} | ${req.status} (${req.priority}) | ${daysAgo} days ago`);
    });

  } catch (error) {
    console.error('❌ Error creating realistic DSAR requests:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📪 Database connection closed');
  }
}

createRealisticDSARRequests();
