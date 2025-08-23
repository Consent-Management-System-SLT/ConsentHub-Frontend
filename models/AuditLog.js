const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  // Unique identifier
  auditId: {
    type: String,
    required: true,
    unique: true,
    default: () => `AUDIT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  },
  
  // User information
  userId: {
    type: String,
    required: true,
    index: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    required: true,
    enum: ['admin', 'csr', 'customer', 'system']
  },
  
  // Action details
  action: {
    type: String,
    required: true,
    enum: [
      // Consent management actions
      'consent_granted', 'consent_revoked', 'consent_updated', 'consent_viewed',
      // DSAR actions
      'dsar_request_created', 'dsar_request_updated', 'dsar_request_completed', 'dsar_request_viewed',
      // User management
      'user_login', 'user_logout', 'user_created', 'user_updated', 'user_deleted',
      // Privacy notices
      'privacy_notice_created', 'privacy_notice_updated', 'privacy_notice_published',
      // Data processing
      'data_exported', 'data_imported', 'data_deleted', 'data_accessed',
      // System actions
      'system_backup', 'system_restore', 'configuration_changed', 'security_event',
      // Audit and compliance
      'audit_report_generated', 'compliance_check_performed', 'data_breach_reported'
    ]
  },
  
  category: {
    type: String,
    required: true,
    enum: [
      'Consent Management', 'DSAR Processing', 'User Management', 
      'Privacy Notices', 'Data Processing', 'Security', 
      'System Administration', 'Compliance & Audit'
    ]
  },
  
  // Event details
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  // Target entity information
  entityType: {
    type: String,
    enum: ['user', 'consent', 'dsar_request', 'privacy_notice', 'preference', 'system']
  },
  entityId: {
    type: String
  },
  
  // Technical details
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String
  },
  sessionId: {
    type: String
  },
  
  // Compliance and risk
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  riskLevel: {
    type: String,
    enum: ['none', 'low', 'medium', 'high', 'critical'],
    default: 'none'
  },
  
  complianceRelevant: {
    type: Boolean,
    default: true
  },
  
  // Regulatory framework
  regulatoryFramework: [{
    type: String,
    enum: ['GDPR', 'PDPA_SL', 'CCPA', 'PIPEDA', 'DPA_UK']
  }],
  
  // Metadata and context
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Before and after state for updates
  previousState: {
    type: mongoose.Schema.Types.Mixed
  },
  newState: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Geographic and location data
  location: {
    country: String,
    region: String,
    city: String
  },
  
  // Processing outcome
  outcome: {
    type: String,
    enum: ['success', 'failure', 'partial', 'cancelled'],
    default: 'success'
  },
  
  errorMessage: {
    type: String
  }
}, {
  timestamps: true,
  collection: 'auditLogs'
});

// Indexes for performance and compliance
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ category: 1, createdAt: -1 });
auditLogSchema.index({ severity: 1, createdAt: -1 });
auditLogSchema.index({ ipAddress: 1, createdAt: -1 });
auditLogSchema.index({ 'regulatoryFramework': 1, createdAt: -1 });
auditLogSchema.index({ complianceRelevant: 1, createdAt: -1 });

// TTL index to automatically delete old logs after regulatory retention period (7 years)
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 220752000 }); // 7 years

// Virtual for age calculation
auditLogSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for regulatory compliance status
auditLogSchema.virtual('complianceStatus').get(function() {
  if (this.riskLevel === 'critical' || this.severity === 'critical') {
    return 'requires_immediate_attention';
  } else if (this.complianceRelevant) {
    return 'compliant';
  } else {
    return 'not_applicable';
  }
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
