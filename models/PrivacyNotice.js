const mongoose = require('mongoose');

const privacyNoticeSchema = new mongoose.Schema({
  noticeId: {
    type: String,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    enum: ['text/plain', 'text/html', 'text/markdown'],
    default: 'text/html'
  },
  version: {
    type: String,
    required: true,
    default: '1.0'
  },
  category: {
    type: String,
    enum: ['general', 'marketing', 'analytics', 'cookies', 'third-party', 'location', 'children', 'employment'],
    required: true,
    default: 'general'
  },
  purposes: [{
    type: String,
    required: true
  }],
  legalBasis: {
    type: String,
    enum: ['consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests'],
    required: true,
    default: 'consent'
  },
  dataCategories: [{
    type: String,
    enum: ['personal_data', 'sensitive_data', 'behavioral_data', 'location_data', 'communication_data', 'device_data', 'financial_data']
  }],
  recipients: [{
    name: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['internal', 'third_party', 'government', 'processor'],
      required: true
    },
    purpose: {
      type: String,
      required: true
    },
    country: String
  }],
  retentionPeriod: {
    duration: {
      type: String,
      required: true,
      default: '2 years'
    },
    criteria: String
  },
  rights: [{
    type: String,
    enum: ['access', 'rectification', 'erasure', 'portability', 'objection', 'restriction', 'withdraw_consent'],
    default: ['access', 'rectification', 'erasure']
  }],
  contactInfo: {
    dpo: {
      name: String,
      email: String,
      phone: String
    },
    organization: {
      name: {
        type: String,
        required: true,
        default: 'SLT Mobitel'
      },
      email: {
        type: String,
        required: true,
        default: 'privacy@sltmobitel.lk'
      },
      phone: String,
      address: String
    }
  },
  effectiveDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  expirationDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'archived'],
    default: 'draft',
    index: true
  },
  language: {
    type: String,
    enum: ['en', 'si', 'ta'],
    default: 'en'
  },
  applicableRegions: [{
    type: String,
    enum: ['sri_lanka', 'eu', 'us', 'global'],
    default: ['sri_lanka']
  }],
  lastReviewDate: {
    type: Date
  },
  nextReviewDate: {
    type: Date
  },
  acknowledgments: [{
    userId: {
      type: String,
      required: true
    },
    userEmail: String,
    acknowledgedAt: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String
  }],
  metadata: {
    tags: [String],
    author: String,
    approvedBy: String,
    approvalDate: Date,
    changeLog: [{
      version: String,
      changes: String,
      author: String,
      date: {
        type: Date,
        default: Date.now
      }
    }]
  }
}, {
  timestamps: true,
  collection: 'privacy_notices'
});

// Indexes for performance
privacyNoticeSchema.index({ status: 1, effectiveDate: -1 });
privacyNoticeSchema.index({ category: 1 });
privacyNoticeSchema.index({ version: 1, status: 1 });
privacyNoticeSchema.index({ 'metadata.tags': 1 });
privacyNoticeSchema.index({ language: 1 });

// Virtual for formatted content
privacyNoticeSchema.virtual('formattedContent').get(function() {
  if (this.contentType === 'text/html') {
    return this.content;
  } else if (this.contentType === 'text/markdown') {
    // In a real app, you'd use a markdown parser here
    return this.content.replace(/\n/g, '<br>');
  } else {
    return this.content.replace(/\n/g, '<br>');
  }
});

// Virtual field for backward compatibility
privacyNoticeSchema.virtual('id').get(function() {
  return this.noticeId;
});

// Ensure virtual fields are included when converting to JSON
privacyNoticeSchema.set('toJSON', { virtuals: true });
privacyNoticeSchema.set('toObject', { virtuals: true });

// Pre-save middleware to generate noticeId if not provided
privacyNoticeSchema.pre('save', function(next) {
  if (!this.noticeId) {
    const timestamp = Date.now();
    const categoryPrefix = this.category.toUpperCase().substring(0, 3);
    this.noticeId = `PN-${categoryPrefix}-${timestamp}`;
  }
  
  // Set next review date (1 year from effective date)
  if (!this.nextReviewDate && this.effectiveDate) {
    this.nextReviewDate = new Date(this.effectiveDate.getTime() + (365 * 24 * 60 * 60 * 1000));
  }
  
  next();
});

// Instance methods
privacyNoticeSchema.methods.acknowledge = function(userId, userEmail, metadata = {}) {
  this.acknowledgments.push({
    userId,
    userEmail,
    acknowledgedAt: new Date(),
    ipAddress: metadata.ipAddress,
    userAgent: metadata.userAgent
  });
  return this.save();
};

privacyNoticeSchema.methods.isAcknowledgedBy = function(userId) {
  return this.acknowledgments.some(ack => ack.userId === userId);
};

privacyNoticeSchema.methods.getAcknowledgmentCount = function() {
  return this.acknowledgments.length;
};

// Static methods
privacyNoticeSchema.statics.findActive = function() {
  return this.find({ status: 'active' }).sort({ effectiveDate: -1 });
};

privacyNoticeSchema.statics.findByCategory = function(category) {
  return this.find({ category, status: 'active' }).sort({ version: -1 });
};

const PrivacyNotice = mongoose.model('PrivacyNotice', privacyNoticeSchema);

module.exports = PrivacyNotice;
