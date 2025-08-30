const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/consenthub_dev')
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Import the backend model
const DSARRequest = require('./models/DSARRequest.js');

async function recreateRequestsUsingBackendModel() {
  try {
    console.log('🚀 Recreating DSAR requests using backend model...');

    // First, clear ALL existing DSAR requests to avoid conflicts
    await DSARRequest.deleteMany({});
    console.log('🗑️ Cleared all existing DSAR requests');

    // Also clear the raw collection to be sure
    try {
      await mongoose.connection.db.collection('dsarrequests').deleteMany({});
      console.log('🗑️ Cleared dsarrequests collection');
    } catch (e) {
      console.log('ℹ️ dsarrequests collection may not exist, continuing...');
    }

    const sampleRequests = [
      {
        requesterId: 'cust_001',
        requesterName: 'Sarah Johnson',
        requesterEmail: 'sarah.johnson@email.com',
        requestType: 'data_access',
        subject: 'Request for Personal Data Access',
        description: 'I would like to access all personal data you have collected about me, including my account information, transaction history, and any data shared with third parties.',
        dataCategories: ['personal_data', 'contact_information', 'billing_information', 'behavioral_data'],
        status: 'in_progress',
        priority: 'medium',
        responseMethod: 'email',
        verificationMethod: 'email_verification',
        verificationStatus: 'verified',
        source: 'web_form',
        customerType: 'individual',
        applicableLaws: ['GDPR', 'Sri_Lanka_DPA'],
        riskLevel: 'low',
        sensitiveData: false,
        submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        processingNotes: [
          {
            note: 'Initial review completed. Data compilation in progress.',
            author: 'John Doe (CSR)',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            visibility: 'internal'
          }
        ],
        tags: ['standard_request', 'verified']
      },
      {
        requesterId: 'cust_002',
        requesterName: 'Michael Chen',
        requesterEmail: 'michael.chen@company.com',
        requestType: 'data_erasure',
        subject: 'Right to be Forgotten - Account Deletion',
        description: 'I want to exercise my right to erasure under GDPR. Please delete all my personal data from your systems as I no longer wish to use your services.',
        dataCategories: ['personal_data', 'contact_information', 'behavioral_data', 'usage_data'],
        status: 'in_progress',
        priority: 'high',
        responseMethod: 'email',
        verificationMethod: 'two_factor_auth',
        verificationStatus: 'verified',
        source: 'email',
        customerType: 'individual',
        applicableLaws: ['GDPR'],
        riskLevel: 'medium',
        sensitiveData: false,
        submittedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
        processingNotes: [
          {
            note: 'Customer verified via 2FA. Legal review required for erasure request.',
            author: 'Emma Smith (CSR)',
            timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            visibility: 'internal'
          },
          {
            note: 'Legal clearance obtained. Proceeding with data deletion across systems.',
            author: 'David Wilson (Legal)',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            visibility: 'internal'
          }
        ],
        communications: [
          {
            type: 'email',
            direction: 'outbound',
            subject: 'Erasure Request - Verification Required',
            content: 'Thank you for your erasure request. Please complete 2FA verification to proceed.',
            timestamp: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
            author: 'System'
          }
        ],
        tags: ['erasure', 'verified', 'legal_review', 'high_priority']
      },
      {
        requesterId: 'cust_003',
        requesterName: 'Lisa Rodriguez',
        requesterEmail: 'lisa.rodriguez@email.com',
        requestType: 'data_rectification',
        subject: 'Incorrect Personal Information - Update Request',
        description: 'My address and phone number in your system are outdated. Please update them with the correct information provided.',
        dataCategories: ['contact_information', 'personal_data'],
        status: 'completed',
        priority: 'medium',
        responseMethod: 'email',
        verificationMethod: 'email_verification',
        verificationStatus: 'verified',
        source: 'web_form',
        customerType: 'individual',
        applicableLaws: ['GDPR', 'Sri_Lanka_DPA'],
        riskLevel: 'low',
        sensitiveData: false,
        submittedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        processingNotes: [
          {
            note: 'Address and phone number updated successfully in all systems.',
            author: 'Anna Taylor (CSR)',
            timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            visibility: 'internal'
          }
        ],
        responseData: {
          dataProvided: false,
          deliveryMethod: 'email_confirmation',
          deliveredAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
        },
        tags: ['rectification', 'completed', 'address_update']
      },
      {
        requesterId: 'cust_004',
        requesterName: 'Robert Brown',
        requesterEmail: 'robert.brown@email.com',
        requestType: 'data_portability',
        subject: 'Data Portability Request - Account Migration',
        description: 'I am switching to another service provider. Please provide all my data in a portable format (JSON or CSV) so I can transfer it to the new provider.',
        dataCategories: ['personal_data', 'contact_information', 'preferences', 'usage_data', 'behavioral_data'],
        status: 'completed',
        priority: 'medium',
        responseMethod: 'secure_portal',
        verificationMethod: 'document_verification',
        verificationStatus: 'verified',
        source: 'web_form',
        customerType: 'individual',
        applicableLaws: ['GDPR'],
        riskLevel: 'medium',
        sensitiveData: true,
        submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        completedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
        processingNotes: [
          {
            note: 'Document verification completed. Data export generated in JSON format.',
            author: 'Mark Davis (Senior CSR)',
            timestamp: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000),
            visibility: 'internal'
          }
        ],
        responseData: {
          dataProvided: true,
          dataFormat: 'json',
          responseSize: '5.2 MB',
          deliveryMethod: 'secure_portal_download',
          deliveredAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
        },
        tags: ['portability', 'completed', 'sensitive_data', 'verified']
      },
      {
        requesterId: 'cust_005',
        requesterName: 'Jennifer Wilson',
        requesterEmail: 'jennifer.wilson@email.com',
        requestType: 'restrict_processing',
        subject: 'Restrict Processing of Personal Data',
        description: 'I dispute the accuracy of some personal data you hold about me. Please restrict processing of my data while this is being verified and corrected.',
        dataCategories: ['personal_data', 'billing_information'],
        status: 'pending',
        priority: 'high',
        responseMethod: 'email',
        verificationMethod: 'phone_verification',
        verificationStatus: 'pending',
        source: 'phone',
        customerType: 'individual',
        applicableLaws: ['GDPR', 'Sri_Lanka_DPA'],
        riskLevel: 'high',
        sensitiveData: true,
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        processingNotes: [
          {
            note: 'Urgent request received via phone. Customer claims data inaccuracy affecting credit decisions.',
            author: 'Sarah Kim (Senior CSR)',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            visibility: 'internal'
          }
        ],
        tags: ['restriction', 'urgent', 'dispute', 'sensitive_data']
      },
      {
        requesterId: 'cust_006',
        requesterName: 'Ahmed Hassan',
        requesterEmail: 'ahmed.hassan@email.com',
        requestType: 'object_processing',
        subject: 'Object to Direct Marketing',
        description: 'I object to the processing of my personal data for direct marketing purposes. Please stop sending me marketing communications and remove me from marketing lists.',
        dataCategories: ['contact_information', 'preferences', 'behavioral_data'],
        status: 'completed',
        priority: 'low',
        responseMethod: 'email',
        verificationMethod: 'email_verification',
        verificationStatus: 'verified',
        source: 'web_form',
        customerType: 'individual',
        applicableLaws: ['GDPR', 'Sri_Lanka_DPA'],
        riskLevel: 'low',
        sensitiveData: false,
        submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        processingNotes: [
          {
            note: 'Marketing preferences updated. Customer removed from all marketing lists.',
            author: 'Tom Anderson (CSR)',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            visibility: 'internal'
          }
        ],
        responseData: {
          dataProvided: false,
          deliveryMethod: 'email_confirmation',
          deliveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        tags: ['objection', 'marketing', 'completed', 'unsubscribe']
      }
    ];

    // Create requests using the backend model
    for (const requestData of sampleRequests) {
      const request = new DSARRequest(requestData);
      await request.save();
      console.log(`✅ Created DSAR request: ${request.requestId} - ${request.requesterName}`);
    }

    console.log(`🎉 Successfully created ${sampleRequests.length} sample DSAR requests using backend model!`);
    
    // Verify the requests are visible to the backend
    const totalRequests = await DSARRequest.countDocuments();
    const statusCounts = await DSARRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log(`\n📊 Backend Model Summary:`);
    console.log(`Total DSAR requests: ${totalRequests}`);
    console.log(`Status breakdown:`);
    statusCounts.forEach(status => {
      console.log(`  ${status._id}: ${status.count}`);
    });

    // Test a sample query like the API does
    const sampleQuery = await DSARRequest.find({}).limit(3).select('requestId requesterName status');
    console.log('\n📋 Sample requests from backend model:');
    sampleQuery.forEach(req => {
      console.log(`  ${req.requestId} - ${req.requesterName} (${req.status})`);
    });

  } catch (error) {
    console.error('❌ Error recreating requests:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📪 Database connection closed');
  }
}

recreateRequestsUsingBackendModel();
