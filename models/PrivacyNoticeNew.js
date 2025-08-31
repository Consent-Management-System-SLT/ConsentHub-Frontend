const mongoose = require('mongoose');

// Privacy Notice Schema - matching existing database structure
const privacyNoticeSchema = new mongoose.Schema({
  noticeId: {
    type: String,
    unique: true,
    sparse: true
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
    type: mongoose.Schema.Types.Mixed, // Allow both string and nested object structure
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
    enum: ['general', 'marketing', 'analytics', 'cookies', 'cookie_policy', 'privacy_policy', 'third-party', 'location', 'children', 'employment', 'terms'],
    default: 'general'
  },
  purposes: [{
    type: String
  }],
  legalBasis: {
    type: String,
    enum: ['consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests'],
    default: 'consent'
  },
  dataCategories: [{
    type: String,
    enum: ['personal_data', 'sensitive_data', 'behavioral_data', 'location_data', 'communication_data', 'device_data', 'financial_data']
  }],
  recipients: [{
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['internal', 'third_party', 'government', 'processor'],
      default: 'internal'
    },
    purpose: String,
    country: String
  }],
  retentionPeriod: {
    duration: { type: String, default: '2 years' },
    criteria: String
  },
  rights: [{
    type: String,
    enum: ['access', 'rectification', 'erasure', 'portability', 'objection', 'restriction', 'withdraw_consent']
  }],
  contactInfo: {
    dpo: {
      name: String,
      email: String,
      phone: String
    },
    organization: {
      name: { type: String, default: 'SLT Mobitel' },
      email: { type: String, default: 'privacy@sltmobitel.lk' },
      phone: String,
      address: String
    }
  },
  effectiveDate: {
    type: Date,
    default: Date.now
  },
  expirationDate: Date,
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'archived'],
    default: 'draft'
  },
  language: {
    type: String,
    enum: ['en', 'si', 'ta'],
    default: 'en'
  },
  jurisdiction: {
    type: String,
    default: 'Sri Lanka'
  },
  applicableRegions: [{
    type: String,
    enum: ['sri_lanka', 'eu', 'us', 'global'],
    default: 'sri_lanka'
  }],
  applicableLaws: [String],
  lastReviewDate: Date,
  nextReviewDate: Date,
  acknowledgments: [{
    userId: { type: String, required: true },
    userEmail: String,
    acknowledgedAt: { type: Date, default: Date.now },
    decision: { 
      type: String, 
      enum: ['accept', 'decline'], 
      required: true 
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
      date: { type: Date, default: Date.now }
    }],
    archivedAt: Date,
    archivedBy: String
  },
  // Legacy fields for compatibility
  viewCount: { type: Number, default: 0 },
  consentCount: { type: Number, default: 0 },
  createdBy: String,
  changeLog: [mongoose.Schema.Types.Mixed],
  publishedChannels: [String],
  localizedVersions: [mongoose.Schema.Types.Mixed],
  legalReview: {
    required: { type: Boolean, default: false },
    completed: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Virtual field for 'id' to maintain API compatibility
privacyNoticeSchema.virtual('id').get(function() {
  return this.noticeId || this._id?.toString();
});

// Ensure virtuals are included in JSON output
privacyNoticeSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret.noticeId || ret._id?.toString();
    return ret;
  }
});

// Indexes for performance (these already exist, so they won't be recreated)
privacyNoticeSchema.index({ noticeId: 1 });
privacyNoticeSchema.index({ status: 1, effectiveDate: 1 });
privacyNoticeSchema.index({ version: 1, status: 1 });
privacyNoticeSchema.index({ language: 1 });
privacyNoticeSchema.index({ effectiveDate: -1 });
privacyNoticeSchema.index({ nextReviewDate: 1 });

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
