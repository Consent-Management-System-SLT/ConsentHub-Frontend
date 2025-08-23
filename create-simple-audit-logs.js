const mongoose = require('mongoose');
require('dotenv').config();

// Direct schema definition to avoid conflicts
const auditLogSchema = new mongoose.Schema({
  // User information
  userId: { type: String, required: true, index: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  userRole: { type: String, required: true, enum: ['admin', 'csr', 'customer', 'system'] },
  
  // Action details
  action: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  entityType: { type: String, required: true },
  entityId: { type: String, required: true },
  
  // Audit metadata
  ipAddress: { type: String, required: true },
  userAgent: { type: String, required: true },
  sessionId: { type: String, required: true },
  
  // Classification
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
  riskLevel: { type: String, enum: ['none', 'low', 'medium', 'high', 'critical'], default: 'none' },
  complianceRelevant: { type: Boolean, default: false },
  regulatoryFramework: [{ type: String }],
  
  // Context
  location: {
    country: String,
    region: String,
    city: String
  },
  outcome: { type: String, enum: ['success', 'failure', 'partial'], default: 'success' },
  metadata: {
    platform: String,
    version: String,
    feature: String
  }
}, {
  timestamps: true
});

// TTL index for automatic deletion after 7 years (GDPR requirement)
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7 * 365 * 24 * 60 * 60 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/consentDB';

async function createSimpleAuditLogs() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing
    await AuditLog.deleteMany({});
    console.log('Cleared existing audit logs');
    
    // Create just a few test records
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
        action: 'user_created',
        category: 'User Management',
        description: 'New user account created during registration',
        entityType: 'user',
        entityId: 'USER-TEST-002',
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0 Chrome Admin',
        sessionId: 'session_admin_002',
        severity: 'medium',
        riskLevel: 'none',
        complianceRelevant: true,
        regulatoryFramework: ['GDPR', 'PDPA_SL'],
        location: { country: 'Sri Lanka', region: 'Western Province', city: 'Colombo' },
        outcome: 'success',
        metadata: { platform: 'web', version: '2.1.0', feature: 'user_management' }
      }
    ];
    
    // Insert one at a time to isolate issues
    for (let i = 0; i < testLogs.length; i++) {
      const log = new AuditLog(testLogs[i]);
      await log.save();
      console.log(`✅ Created audit log ${i + 1}: ${log.action}`);
    }
    
    const count = await AuditLog.countDocuments();
    console.log(`\n✅ Successfully created ${count} audit logs!`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createSimpleAuditLogs();
