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

// Define the DSAR Request schema
const dsarRequestSchema = new mongoose.Schema({
  // Core identification
  requestId: { type: String, required: true, unique: true },
  requesterId: { type: String, required: true },
  requesterName: { type: String, required: true },
  requesterEmail: { type: String, required: true },
  
  // Request details
  requestType: {
    type: String,
    enum: ['data_access', 'data_rectification', 'data_erasure', 'data_portability', 'restrict_processing', 'object_processing', 'automated_decision_making'],
    required: true
  },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  
  // Processing information
  status: {
    type: String,
    enum: ['pending', 'under_review', 'in_progress', 'completed', 'rejected', 'withdrawn', 'on_hold'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Data categories requested
  dataCategories: [{
    type: String,
    enum: [
      'personal_identifiers', 'contact_information', 'demographic_data',
      'financial_data', 'employment_data', 'education_data', 'health_data',
      'location_data', 'behavioral_data', 'communication_data', 'device_data',
      'usage_data', 'preference_data', 'consent_data', 'complaint_data'
    ]
  }],
  
  // Response and verification
  responseMethod: {
    type: String,
    enum: ['email', 'postal_mail', 'secure_portal', 'phone', 'in_person'],
    default: 'email'
  },
  verificationMethod: {
    type: String,
    enum: ['email_verification', 'phone_verification', 'document_verification', 'in_person_verification', 'two_factor_auth'],
    default: 'email_verification'
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'failed', 'not_required'],
    default: 'pending'
  },
  
  // Metadata
  source: {
    type: String,
    enum: ['web_form', 'email', 'phone', 'postal_mail', 'in_person', 'api'],
    default: 'web_form'
  },
  customerType: {
    type: String,
    enum: ['individual', 'minor', 'legal_guardian', 'authorized_representative', 'employee', 'business_contact'],
    default: 'individual'
  },
  
  // Legal and compliance
  jurisdiction: {
    type: String,
    default: 'Sri Lanka'
  },
  applicableLaws: [{
    type: String,
    enum: ['GDPR', 'CCPA', 'LGPD', 'PIPEDA', 'Sri_Lanka_DPA', 'Other']
  }],
  
  // Risk assessment
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  sensitiveData: {
    type: Boolean,
    default: false
  },
  
  // Timing
  submittedAt: { type: Date, default: Date.now },
  dueDate: { type: Date },
  completedAt: { type: Date },
  
  // Communications and notes
  processingNotes: [{
    note: String,
    author: String,
    timestamp: { type: Date, default: Date.now },
    visibility: { type: String, enum: ['internal', 'customer'], default: 'internal' }
  }],
  
  communications: [{
    type: { type: String, enum: ['email', 'phone', 'letter', 'meeting', 'system'] },
    direction: { type: String, enum: ['inbound', 'outbound'] },
    subject: String,
    content: String,
    timestamp: { type: Date, default: Date.now },
    author: String
  }],
  
  // Response data (for completed requests)
  responseData: {
    dataProvided: { type: Boolean, default: false },
    dataFormat: { type: String, enum: ['json', 'csv', 'pdf', 'xml', 'other'] },
    responseSize: String, // e.g., "2.5 MB"
    deliveryMethod: String,
    deliveredAt: Date
  },
  
  // Related records
  tags: [String],
  relatedTickets: [String],
  relatedCases: [String]
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Virtual fields
dsarRequestSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.status === 'completed') return false;
  return new Date() > this.dueDate;
});

dsarRequestSchema.virtual('daysRemaining').get(function() {
  if (!this.dueDate || this.status === 'completed') return null;
  const diffTime = this.dueDate - new Date();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

dsarRequestSchema.virtual('processingDays').get(function() {
  const startDate = this.submittedAt;
  const endDate = this.completedAt || new Date();
  const diffTime = endDate - startDate;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
dsarRequestSchema.pre('save', function(next) {
  // Generate unique request ID if not provided
  if (!this.requestId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    this.requestId = `DSAR-${timestamp}-${random}`;
  }
  
  // Set due date if not provided (30 days from submission)
  if (!this.dueDate) {
    this.dueDate = new Date(this.submittedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
  }
  
  next();
});

// Ensure virtuals are included in JSON output
dsarRequestSchema.set('toJSON', { virtuals: true });
dsarRequestSchema.set('toObject', { virtuals: true });

const DSARRequest = mongoose.model('DSARRequest', dsarRequestSchema);

async function createSampleDSARRequests() {
  try {
    console.log('🚀 Creating sample DSAR requests...');

    const sampleRequests = [
      {
        requestId: 'DSAR-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        requesterId: 'cust_001',
        requesterName: 'Sarah Johnson',
        requesterEmail: 'sarah.johnson@email.com',
        requestType: 'data_access',
        subject: 'Request for Personal Data Access',
        description: 'I would like to access all personal data you have collected about me, including my account information, transaction history, and any data shared with third parties.',
        dataCategories: ['personal_identifiers', 'contact_information', 'financial_data', 'behavioral_data'],
        status: 'under_review',
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
        requestId: 'DSAR-' + (Date.now() + 1) + '-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        requesterId: 'cust_002',
        requesterName: 'Michael Chen',
        requesterEmail: 'michael.chen@company.com',
        requestType: 'data_erasure',
        subject: 'Right to be Forgotten - Account Deletion',
        description: 'I want to exercise my right to erasure under GDPR. Please delete all my personal data from your systems as I no longer wish to use your services.',
        dataCategories: ['personal_identifiers', 'contact_information', 'behavioral_data', 'usage_data'],
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
        requestId: 'DSAR-' + (Date.now() + 2) + '-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        requesterId: 'cust_003',
        requesterName: 'Lisa Rodriguez',
        requesterEmail: 'lisa.rodriguez@email.com',
        requestType: 'data_rectification',
        subject: 'Incorrect Personal Information - Update Request',
        description: 'My address and phone number in your system are outdated. Please update them with the correct information provided.',
        dataCategories: ['contact_information', 'demographic_data'],
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
        requestId: 'DSAR-' + (Date.now() + 3) + '-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        requesterId: 'cust_004',
        requesterName: 'Robert Brown',
        requesterEmail: 'robert.brown@email.com',
        requestType: 'data_portability',
        subject: 'Data Portability Request - Account Migration',
        description: 'I am switching to another service provider. Please provide all my data in a portable format (JSON or CSV) so I can transfer it to the new provider.',
        dataCategories: ['personal_identifiers', 'contact_information', 'preference_data', 'usage_data', 'behavioral_data'],
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
        requestId: 'DSAR-' + (Date.now() + 4) + '-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        requesterId: 'cust_005',
        requesterName: 'Jennifer Wilson',
        requesterEmail: 'jennifer.wilson@email.com',
        requestType: 'restrict_processing',
        subject: 'Restrict Processing of Personal Data',
        description: 'I dispute the accuracy of some personal data you hold about me. Please restrict processing of my data while this is being verified and corrected.',
        dataCategories: ['personal_identifiers', 'demographic_data', 'financial_data'],
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
        requestId: 'DSAR-' + (Date.now() + 5) + '-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        requesterId: 'cust_006',
        requesterName: 'Ahmed Hassan',
        requesterEmail: 'ahmed.hassan@email.com',
        requestType: 'object_processing',
        subject: 'Object to Direct Marketing',
        description: 'I object to the processing of my personal data for direct marketing purposes. Please stop sending me marketing communications and remove me from marketing lists.',
        dataCategories: ['contact_information', 'preference_data', 'behavioral_data'],
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

    // Clear existing requests first (optional - remove if you want to keep existing ones)
    // await DSARRequest.deleteMany({});

    // Insert new requests
    for (const requestData of sampleRequests) {
      const request = new DSARRequest(requestData);
      await request.save();
      console.log(`✅ Created DSAR request: ${request.requestId} - ${request.requesterName}`);
    }

    console.log(`🎉 Successfully created ${sampleRequests.length} sample DSAR requests!`);
    
    // Display summary
    const totalRequests = await DSARRequest.countDocuments();
    const statusCounts = await DSARRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log(`\n📊 Database Summary:`);
    console.log(`Total DSAR requests: ${totalRequests}`);
    console.log(`Status breakdown:`);
    statusCounts.forEach(status => {
      console.log(`  ${status._id}: ${status.count}`);
    });

  } catch (error) {
    console.error('❌ Error creating sample requests:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📪 Database connection closed');
  }
}

// Run the script
createSampleDSARRequests();
