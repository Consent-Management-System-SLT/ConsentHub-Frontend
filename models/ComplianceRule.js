const mongoose = require('mongoose');

const ComplianceRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  ruleType: {
    type: String,
    required: true,
    enum: ['GDPR', 'CCPA', 'PIPEDA', 'Data_Retention', 'Consent_Management', 'Marketing', 'Cookie_Policy', 'Privacy_Notice']
  },
  category: {
    type: String,
    required: true,
    enum: ['consent', 'data_retention', 'privacy_rights', 'marketing', 'cookies', 'breach_notification', 'data_processing']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft', 'pending_review'],
    default: 'draft'
  },
  priority: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium'
  },
  conditions: [{
    field: String,
    operator: {
      type: String,
      enum: ['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'in', 'not_in']
    },
    value: mongoose.Schema.Types.Mixed
  }],
  actions: [{
    type: {
      type: String,
      enum: ['notify', 'expire_consent', 'delete_data', 'anonymize', 'block_processing', 'send_email', 'create_task']
    },
    parameters: mongoose.Schema.Types.Mixed,
    delay: {
      type: Number,
      default: 0 // in minutes
    }
  }],
  triggers: [{
    event: {
      type: String,
      enum: ['consent_granted', 'consent_withdrawn', 'data_created', 'user_inactive', 'scheduled', 'manual']
    },
    schedule: String // cron expression for scheduled triggers
  }],
  applicableRegions: [{
    type: String,
    enum: ['EU', 'US', 'CA', 'UK', 'AU', 'GLOBAL']
  }],
  dataTypes: [{
    type: String,
    enum: ['personal_data', 'sensitive_data', 'marketing_data', 'analytics_data', 'behavioral_data', 'financial_data']
  }],
  retentionPeriod: {
    value: Number,
    unit: {
      type: String,
      enum: ['days', 'months', 'years']
    }
  },
  compliance_requirements: {
    legal_basis: {
      type: String,
      enum: ['consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests']
    },
    data_subject_rights: [{
      type: String,
      enum: ['access', 'rectification', 'erasure', 'portability', 'restriction', 'objection']
    }],
    breach_notification_required: {
      type: Boolean,
      default: false
    },
    dpo_notification_required: {
      type: Boolean,
      default: false
    }
  },
  implementation: {
    auto_enforcement: {
      type: Boolean,
      default: false
    },
    manual_review_required: {
      type: Boolean,
      default: true
    },
    escalation_threshold: Number
  },
  metrics: {
    enforcement_count: {
      type: Number,
      default: 0
    },
    success_rate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    last_executed: Date,
    avg_execution_time: Number // in milliseconds
  },
  tags: [String],
  version: {
    type: String,
    default: '1.0'
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approval_date: Date,
  next_review_date: Date,
  audit_log: [{
    action: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    changes: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

// Indexes
ComplianceRuleSchema.index({ status: 1, ruleType: 1 });
ComplianceRuleSchema.index({ category: 1, priority: 1 });
ComplianceRuleSchema.index({ 'applicableRegions': 1 });
ComplianceRuleSchema.index({ created_by: 1 });
ComplianceRuleSchema.index({ next_review_date: 1 });

// Virtual for formatted retention period
ComplianceRuleSchema.virtual('formattedRetentionPeriod').get(function() {
  if (!this.retentionPeriod.value) return 'Not specified';
  return `${this.retentionPeriod.value} ${this.retentionPeriod.unit}`;
});

// Virtual for compliance score
ComplianceRuleSchema.virtual('complianceScore').get(function() {
  let score = 0;
  if (this.status === 'active') score += 30;
  if (this.implementation.auto_enforcement) score += 25;
  if (this.compliance_requirements.breach_notification_required) score += 20;
  if (this.metrics.success_rate > 80) score += 25;
  return Math.min(score, 100);
});

// Pre-save middleware
ComplianceRuleSchema.pre('save', function(next) {
  if (this.isModified() && this.status === 'active' && !this.approval_date) {
    this.status = 'pending_review';
  }
  
  // Set next review date based on priority
  if (!this.next_review_date) {
    const months = this.priority === 'critical' ? 3 : 
                  this.priority === 'high' ? 6 : 
                  this.priority === 'medium' ? 12 : 24;
    this.next_review_date = new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000);
  }
  
  next();
});

// Static methods
ComplianceRuleSchema.statics.getActiveRules = function(region = null) {
  const query = { status: 'active' };
  if (region) {
    query.applicableRegions = { $in: [region, 'GLOBAL'] };
  }
  return this.find(query).populate('created_by updated_by approved_by', 'name email');
};

ComplianceRuleSchema.statics.getRulesByCategory = function(category) {
  return this.find({ category, status: { $ne: 'inactive' } })
    .populate('created_by', 'name email')
    .sort({ priority: 1, createdAt: -1 });
};

ComplianceRuleSchema.statics.getOverdueReviews = function() {
  return this.find({ 
    next_review_date: { $lt: new Date() },
    status: { $in: ['active', 'pending_review'] }
  }).populate('created_by approved_by', 'name email');
};

// Instance methods
ComplianceRuleSchema.methods.execute = function(context = {}) {
  // Increment execution count
  this.metrics.enforcement_count += 1;
  this.metrics.last_executed = new Date();
  
  // Log execution
  this.audit_log.push({
    action: 'executed',
    timestamp: new Date(),
    changes: { context }
  });
  
  return this.save();
};

ComplianceRuleSchema.methods.updateSuccessRate = function(successful) {
  const currentRate = this.metrics.success_rate || 0;
  const executionCount = this.metrics.enforcement_count || 1;
  
  // Calculate new success rate using moving average
  this.metrics.success_rate = ((currentRate * (executionCount - 1)) + (successful ? 100 : 0)) / executionCount;
  
  return this.save();
};

const ComplianceRule = mongoose.model('ComplianceRule', ComplianceRuleSchema);

module.exports = ComplianceRule;
