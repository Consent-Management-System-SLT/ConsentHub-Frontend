const mongoose = require('mongoose');
require('dotenv').config();

// Use the same database connection as the backend
const connectDB = require('./config/database');

// Import the backend model
const DSARRequest = require('./models/DSARRequest');

async function createDSARRequestsOnBackendDB() {
  try {
    console.log('🚀 Creating DSAR requests on the same database as backend...');

    // Connect using the same configuration as the backend
    await connectDB();

    // Clear existing DSAR requests (optional - comment out if you want to keep existing ones)
    const existingCount = await DSARRequest.countDocuments();
    console.log(`Found ${existingCount} existing DSAR requests`);

    // Add our sample requests to the existing ones
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
        applicableLaws: ['GDPR', 'PDPA_SL'],
        riskLevel: 'low',
        sensitiveData: false,
        submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        processingNotes: [
          {
            note: 'Initial review completed. Data compilation in progress.',
            author: 'John Doe (CSR)',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          }
        ]
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
        verificationMethod: 'email_verification',
        verificationStatus: 'verified',
        source: 'email',
        customerType: 'individual',
        applicableLaws: ['GDPR'],
        riskLevel: 'medium',
        sensitiveData: false,
        submittedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
        processingNotes: [
          {
            note: 'Customer verified. Legal review required for erasure request.',
            author: 'Emma Smith (CSR)',
            timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
          }
        ],
        communications: [
          {
            type: 'email',
            direction: 'outbound',
            content: 'Thank you for your erasure request. We are processing your request.',
            timestamp: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
            author: 'System'
          }
        ]
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
        applicableLaws: ['GDPR', 'PDPA_SL'],
        riskLevel: 'low',
        sensitiveData: false,
        submittedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        processingNotes: [
          {
            note: 'Address and phone number updated successfully in all systems.',
            author: 'Anna Taylor (CSR)',
            timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
          }
        ],
        responseData: {
          format: 'json',
          fileSize: 1024,
          recordCount: 1
        }
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
        responseMethod: 'secure_download',
        verificationMethod: 'identity_document',
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
            timestamp: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000)
          }
        ],
        responseData: {
          format: 'json',
          fileSize: 5242880, // 5MB
          recordCount: 1847,
          downloadUrl: 'https://secure.example.com/downloads/data-export-cust004.zip',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        }
      }
    ];

    // Create requests using the backend model
    let createdCount = 0;
    for (const requestData of sampleRequests) {
      try {
        const request = new DSARRequest(requestData);
        await request.save();
        console.log(`✅ Created DSAR request: ${request.requestId} - ${request.requesterName}`);
        createdCount++;
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⚠️ Skipped duplicate request for ${requestData.requesterName}`);
        } else {
          console.error(`❌ Error creating request for ${requestData.requesterName}:`, error.message);
        }
      }
    }

    console.log(`🎉 Successfully created ${createdCount} new DSAR requests!`);
    
    // Verify the requests are visible to the backend
    const totalRequests = await DSARRequest.countDocuments();
    const statusCounts = await DSARRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log(`\n📊 Backend Database Summary:`);
    console.log(`Total DSAR requests: ${totalRequests}`);
    console.log(`Status breakdown:`);
    statusCounts.forEach(status => {
      console.log(`  ${status._id}: ${status.count}`);
    });

    // Test a sample query like the API does
    const sampleQuery = await DSARRequest.find({}).sort({ createdAt: -1 }).limit(5).select('requestId requesterName status priority');
    console.log('\n📋 Latest requests from backend database:');
    sampleQuery.forEach(req => {
      console.log(`  ${req.requestId} - ${req.requesterName} (${req.status}, ${req.priority})`);
    });

  } catch (error) {
    console.error('❌ Error creating requests:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📪 Database connection closed');
  }
}

createDSARRequestsOnBackendDB();
