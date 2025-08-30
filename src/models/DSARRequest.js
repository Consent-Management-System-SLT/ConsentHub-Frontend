const mongoose = require('mongoose');

const dsarRequestSchema = new mongoose.Schema({
  // Request identification
  requestId: {
    type: String,
    required: true,
    unique: true,
    default: () => `DSAR-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  },
  
  // Requester information
  requesterId: {
    type: String,
    required: true
  },
  requesterName: {
    type: String,
    required: true
  },
  requesterEmail: {
    type: String,
    required: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  requesterPhone: {
    type: String
  },
  
  // Request details
  requestType: {
    type: String,
    required: true,
    enum: [
      'data_access',      // Article 15 - Right of access
      'data_rectification', // Article 16 - Right to rectification
      'data_erasure',     // Article 17 - Right to erasure (right to be forgotten)
      'data_portability', // Article 20 - Right to data portability
      'restrict_processing', // Article 18 - Right to restrict processing
      'object_processing', // Article 21 - Right to object
      'withdraw_consent',  // Article 7 - Right to withdraw consent
      'automated_decision' // Article 22 - Rights related to automated decision making
    ]
  },
  
  subject: {
    type: String,
    required: true,
    maxlength: 200
  },
  
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  
  // Specific data categories requested (for access/portability requests)
  dataCategories: [{
    type: String,
    enum: [
      'personal_data',
      'contact_information',
      'billing_information',
      'usage_data',
      'location_data',
      'communication_data',
      'device_data',
      'behavioral_data',
      'preferences',
      'marketing_data',
      'all_data'
    ]
  }],
  
  // Legal basis for processing (context)
  legalBasis: {
    type: String,
    enum: ['consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests']
  },
  
  // Request status and processing
  status: {
    type: String,
    required: true,
    enum: ['pending', 'in_progress', 'completed', 'rejected', 'cancelled'],
    default: 'pending'
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Processing timestamps
  submittedAt: {
    type: Date,
    default: Date.now
  },
  
  acknowledgedAt: {
    type: Date
  },
  
  completedAt: {
    type: Date
  },
  
  dueDate: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  },
  
  // Processing details
  assignedTo: {
    userId: String,
    name: String,
    email: String,
    assignedAt: Date
  },
  
  processingNotes: [{
    note: String,
    author: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Response details
  responseMethod: {
    type: String,
    enum: ['email', 'postal_mail', 'secure_download', 'api'],
    default: 'email'
  },
  
  responseData: {
    format: {
      type: String,
      enum: ['json', 'csv', 'pdf', 'xml'],
      default: 'json'
    },
    downloadUrl: String,
    expiresAt: Date,
    fileSize: Number,
    recordCount: Number
  },
  
  // Compliance and audit
  verificationMethod: {
    type: String,
    enum: ['email_verification', 'identity_document', 'phone_verification', 'in_person'],
    default: 'email_verification'
  },
  
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'failed'],
    default: 'pending'
  },
  
  verifiedAt: Date,
  verifiedBy: String,
  
  // Rejection details (if applicable)
  rejectionReason: {
    type: String,
    enum: [
      'invalid_identity',
      'no_data_found',
      'third_party_rights',
      'legal_privilege',
      'manifestly_unfounded',
      'excessive_request',
      'other'
    ]
  },
  
  rejectionDetails: String,
  
  // Communication log
  communications: [{
    type: {
      type: String,
      enum: ['email', 'phone', 'letter', 'system_notification']
    },
    direction: {
      type: String,
      enum: ['inbound', 'outbound']
    },
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    author: String
  }],
  
  // Metadata
  source: {
    type: String,
    enum: ['web_form', 'email', 'phone', 'letter', 'in_person', 'api'],
    default: 'web_form'
  },
  
  customerType: {
    type: String,
    enum: ['individual', 'business', 'employee', 'prospect'],
    default: 'individual'
  },
  
  jurisdiction: {
    type: String,
    default: 'Sri Lanka'
  },
  
  applicableLaws: [{
    type: String,
    enum: ['GDPR', 'CCPA', 'PDPA_SL', 'LGPD', 'PIPEDA']
  }],
  
  // Risk assessment
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  
  sensitiveData: {
    type: Boolean,
    default: false
  },
  
  // System fields
  createdBy: String,
  updatedBy: String,
  
  tags: [String],
  
  // External references
  relatedTickets: [String],
  relatedCases: [String]
}, {
  timestamps: true,
  collection: 'dsarRequests'
});

// Indexes for performance
dsarRequestSchema.index({ requestId: 1 });
dsarRequestSchema.index({ requesterEmail: 1 });
dsarRequestSchema.index({ status: 1 });
dsarRequestSchema.index({ requestType: 1 });
dsarRequestSchema.index({ submittedAt: -1 });
dsarRequestSchema.index({ dueDate: 1 });
dsarRequestSchema.index({ priority: 1 });

// Virtual for checking if request is overdue
dsarRequestSchema.virtual('isOverdue').get(function() {
  return this.status !== 'completed' && new Date() > this.dueDate;
});

// Virtual for days remaining
dsarRequestSchema.virtual('daysRemaining').get(function() {
  if (this.status === 'completed') return 0;
  const diffTime = this.dueDate - new Date();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for processing time
dsarRequestSchema.virtual('processingDays').get(function() {
  const endDate = this.completedAt || new Date();
  const diffTime = endDate - this.submittedAt;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for ID getter (for frontend compatibility)
dsarRequestSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialised
dsarRequestSchema.set('toJSON', {
  virtuals: true
});

// Pre-save middleware
dsarRequestSchema.pre('save', function(next) {
  if (this.isNew) {
    this.applicableLaws = ['PDPA_SL']; // Default for Sri Lanka
  }
  
  // Auto-acknowledge when status changes from pending
  if (this.isModified('status') && this.status === 'in_progress' && !this.acknowledgedAt) {
    this.acknowledgedAt = new Date();
  }
  
  // Set completed date when status becomes completed
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  next();
});

// Static methods
dsarRequestSchema.statics.getOverdueRequests = function() {
  return this.find({
    status: { $in: ['pending', 'in_progress'] },
    dueDate: { $lt: new Date() }
  });
};

dsarRequestSchema.statics.getRequestsByStatus = function(status) {
  return this.find({ status: status }).sort({ submittedAt: -1 });
};

dsarRequestSchema.statics.getRequestsByDateRange = function(startDate, endDate) {
  return this.find({
    submittedAt: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ submittedAt: -1 });
};

// Instance methods
dsarRequestSchema.methods.addProcessingNote = function(note, author) {
  this.processingNotes.push({
    note: note,
    author: author,
    timestamp: new Date()
  });
  return this.save();
};

dsarRequestSchema.methods.addCommunication = function(type, direction, content, author) {
  this.communications.push({
    type: type,
    direction: direction,
    content: content,
    author: author,
    timestamp: new Date()
  });
  return this.save();
};

module.exports = mongoose.model('DSARRequest', dsarRequestSchema);
