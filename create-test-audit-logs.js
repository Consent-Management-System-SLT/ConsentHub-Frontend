const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/consentDB';

// Define schema inline to avoid conflicts
const auditLogSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  userEmail: String,
  userRole: String,
  action: String,
  category: String,
  description: String,
  entityType: String,
  entityId: String,
  ipAddress: String,
  userAgent: String,
  sessionId: String,
  severity: String,
  riskLevel: String,
  complianceRelevant: Boolean,
  regulatoryFramework: [String],
  location: {
    country: String,
    region: String,
    city: String
  },
  outcome: String,
  metadata: {
    platform: String,
    version: String,
    feature: String
  }
}, {
  timestamps: true
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

async function createTestAuditLogs() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing
    await AuditLog.deleteMany({});
    console.log('Cleared existing audit logs');
    
    // Test logs with actual CSR and Admin user IDs
    const testLogs = [
      {
        userId: '688d0351c3806e1b98fc7c73',
        userName: 'CSR User',
        userEmail: 'csr@sltmobitel.lk',
        userRole: 'csr',
        action: 'consent_granted',
        category: 'Consent Management',
        description: 'Marketing consent granted for SMS notifications',
        entityType: 'consent',
        entityId: 'CONSENT-TEST-001',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 Chrome Test',
        sessionId: 'session_test_001',
        severity: 'medium',
        riskLevel: 'none',
        complianceRelevant: true,
        regulatoryFramework: ['GDPR', 'PDPA_SL'],
        location: { country: 'Sri Lanka', region: 'Western Province', city: 'Colombo' },
        outcome: 'success',
        metadata: { platform: 'web', version: '2.1.0', feature: 'consent_management' }
      },
      {
        userId: '688d0351c3806e1b98fc7c74',
        userName: 'Admin User',
        userEmail: 'admin@sltmobitel.lk',
        userRole: 'admin',
        action: 'dsar_request_created',
        category: 'DSAR Processing',
        description: 'New data subject access request submitted',
        entityType: 'dsar_request',
        entityId: 'DSAR-TEST-002',
        ipAddress: '192.168.1.105',
        userAgent: 'ConsentHub Admin Panel',
        sessionId: 'session_admin_002',
        severity: 'high',
        riskLevel: 'low',
        complianceRelevant: true,
        regulatoryFramework: ['GDPR', 'PDPA_SL'],
        location: { country: 'Sri Lanka', region: 'Western Province', city: 'Colombo' },
        outcome: 'success',
        metadata: { platform: 'web', version: '2.1.0', feature: 'dsar_processing' }
      },
      {
        userId: '689d67d8b20471a810652abf',
        userName: 'Omindu Premathilake',
        userEmail: 'aaomindu@gmail.com',
        userRole: 'customer',
        action: 'user_login',
        category: 'User Management',
        description: 'Successful login to customer dashboard',
        entityType: 'user',
        entityId: 'USER-TEST-003',
        ipAddress: '10.0.0.50',
        userAgent: 'ConsentHub Mobile App v2.1.0',
        sessionId: 'session_customer_003',
        severity: 'low',
        riskLevel: 'none',
        complianceRelevant: false,
        regulatoryFramework: [],
        location: { country: 'Sri Lanka', region: 'Western Province', city: 'Colombo' },
        outcome: 'success',
        metadata: { platform: 'mobile', version: '2.1.0', feature: 'user_management' }
      },
      {
        userId: '688d0351c3806e1b98fc7c73',
        userName: 'CSR User',
        userEmail: 'csr@sltmobitel.lk',
        userRole: 'csr',
        action: 'data_exported',
        category: 'Data Processing',
        description: 'Customer data exported for compliance audit',
        entityType: 'user',
        entityId: 'EXPORT-TEST-004',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 Chrome CSV Export',
        sessionId: 'session_export_004',
        severity: 'high',
        riskLevel: 'medium',
        complianceRelevant: true,
        regulatoryFramework: ['GDPR', 'PDPA_SL'],
        location: { country: 'Sri Lanka', region: 'Western Province', city: 'Colombo' },
        outcome: 'success',
        metadata: { platform: 'web', version: '2.1.0', feature: 'data_processing' }
      },
      {
        userId: '688d0351c3806e1b98fc7c74',
        userName: 'Admin User',
        userEmail: 'admin@sltmobitel.lk',
        userRole: 'admin',
        action: 'privacy_notice_updated',
        category: 'Privacy Notices',
        description: 'Privacy policy updated to v3.2 - new data categories added',
        entityType: 'privacy_notice',
        entityId: 'PRIVACY-TEST-005',
        ipAddress: '192.168.1.105',
        userAgent: 'ConsentHub Admin Panel',
        sessionId: 'session_privacy_005',
        severity: 'high',
        riskLevel: 'low',
        complianceRelevant: true,
        regulatoryFramework: ['GDPR', 'PDPA_SL'],
        location: { country: 'Sri Lanka', region: 'Western Province', city: 'Colombo' },
        outcome: 'success',
        metadata: { platform: 'web', version: '2.1.0', feature: 'privacy_notices' }
      },
      {
        userId: 'system',
        userName: 'System Automation',
        userEmail: 'system@sltmobitel.lk',
        userRole: 'system',
        action: 'system_backup',
        category: 'System Administration',
        description: 'Automated system backup completed successfully',
        entityType: 'system',
        entityId: 'BACKUP-TEST-006',
        ipAddress: '127.0.0.1',
        userAgent: 'ConsentHub System Automation',
        sessionId: 'session_system_006',
        severity: 'low',
        riskLevel: 'none',
        complianceRelevant: false,
        regulatoryFramework: [],
        location: { country: 'Sri Lanka', region: 'Western Province', city: 'Colombo' },
        outcome: 'success',
        metadata: { platform: 'system', version: '2.1.0', feature: 'system_administration' }
      }
    ];
    
    // Create with some time variations
    const now = new Date();
    for (let i = 0; i < testLogs.length; i++) {
      const logData = testLogs[i];
      const dayOffset = Math.floor(Math.random() * 7);
      const hourOffset = Math.floor(Math.random() * 24);
      const logDate = new Date(now - (dayOffset * 24 * 60 * 60 * 1000) - (hourOffset * 60 * 60 * 1000));
      
      logData.createdAt = logDate;
      logData.updatedAt = logDate;
      
      const auditLog = new AuditLog(logData);
      await auditLog.save();
      console.log(`✅ Created: ${logData.action} by ${logData.userName}`);
    }
    
    const totalCount = await AuditLog.countDocuments();
    console.log(`\n✅ Successfully created ${totalCount} audit logs for testing!`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestAuditLogs();
