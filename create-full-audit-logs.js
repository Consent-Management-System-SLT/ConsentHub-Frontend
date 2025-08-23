const mongoose = require('mongoose');
require('dotenv').config();

// Use the same schema as the simple version
const auditLogSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  userRole: { type: String, required: true, enum: ['admin', 'csr', 'customer', 'system'] },
  action: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  entityType: { type: String, required: true },
  entityId: { type: String, required: true },
  ipAddress: { type: String, required: true },
  userAgent: { type: String, required: true },
  sessionId: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
  riskLevel: { type: String, enum: ['none', 'low', 'medium', 'high', 'critical'], default: 'none' },
  complianceRelevant: { type: Boolean, default: false },
  regulatoryFramework: [{ type: String }],
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

auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7 * 365 * 24 * 60 * 60 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/consentDB';

async function createFullAuditLogs() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get actual users from the API
    const https = require('http');
    const users = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/v1/users',
        method: 'GET'
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            resolve(response.users || []);
          } catch (err) {
            reject(err);
          }
        });
      });
      req.on('error', reject);
      req.end();
    });
    
    console.log(`Found ${users.length} users to create audit logs for`);
    
    // Filter users with valid data
    const validUsers = users.filter(u => u.email && u.name);
    console.log(`Using ${validUsers.length} valid users with email and name`);
    
    // Clear existing
    await AuditLog.deleteMany({});
    console.log('Cleared existing audit logs');
    
    const ipAddresses = ['192.168.1.100', '192.168.1.105', '192.168.1.110', '10.0.0.50', '172.16.0.25'];
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'ConsentHub Mobile App v2.1.0',
      'ConsentHub System Automation'
    ];
    
    const actions = [
      { action: 'consent_granted', category: 'Consent Management', description: 'Marketing consent granted for SMS notifications', entityType: 'consent', severity: 'medium', complianceRelevant: true, regulatoryFramework: ['GDPR', 'PDPA_SL'] },
      { action: 'consent_revoked', category: 'Consent Management', description: 'Email marketing consent withdrawn by customer', entityType: 'consent', severity: 'medium', complianceRelevant: true, regulatoryFramework: ['GDPR', 'PDPA_SL'] },
      { action: 'dsar_request_created', category: 'DSAR Processing', description: 'New data subject access request submitted', entityType: 'dsar_request', severity: 'high', complianceRelevant: true, regulatoryFramework: ['GDPR', 'PDPA_SL'] },
      { action: 'user_login', category: 'User Management', description: 'Successful login to customer dashboard', entityType: 'user', severity: 'low', complianceRelevant: false, regulatoryFramework: [] },
      { action: 'data_exported', category: 'Data Processing', description: 'Customer data exported for compliance audit', entityType: 'user', severity: 'high', complianceRelevant: true, regulatoryFramework: ['GDPR', 'PDPA_SL'] },
      { action: 'privacy_notice_updated', category: 'Privacy Notices', description: 'Privacy policy updated to v3.2', entityType: 'privacy_notice', severity: 'high', complianceRelevant: true, regulatoryFramework: ['GDPR', 'PDPA_SL'] }
    ];
    
    const now = new Date();
    let totalCreated = 0;
    
    // Create 30 recent logs (last 7 days)
    for (let i = 0; i < 30; i++) {
      const randomUser = validUsers[Math.floor(Math.random() * validUsers.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      const dayOffset = Math.floor(Math.random() * 7);
      const hourOffset = Math.floor(Math.random() * 24);
      
      const logDate = new Date(now - (dayOffset * 24 * 60 * 60 * 1000) - (hourOffset * 60 * 60 * 1000));
      
      const auditLog = new AuditLog({
        userId: randomUser.id,
        userName: randomUser.name,
        userEmail: randomUser.email,
        userRole: randomUser.role,
        action: randomAction.action,
        category: randomAction.category,
        description: randomAction.description,
        entityType: randomAction.entityType,
        entityId: `${randomAction.entityType.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        ipAddress: ipAddresses[Math.floor(Math.random() * ipAddresses.length)],
        userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
        severity: randomAction.severity,
        riskLevel: 'none',
        complianceRelevant: randomAction.complianceRelevant,
        regulatoryFramework: randomAction.regulatoryFramework,
        location: {
          country: 'Sri Lanka',
          region: 'Western Province',
          city: 'Colombo'
        },
        outcome: Math.random() > 0.9 ? 'failure' : 'success',
        metadata: {
          platform: Math.random() > 0.5 ? 'web' : 'mobile',
          version: '2.1.0',
          feature: randomAction.category.toLowerCase().replace(' ', '_')
        },
        createdAt: logDate,
        updatedAt: logDate
      });
      
      await auditLog.save();
      totalCreated++;
      
      if (i % 5 === 0) {
        console.log(`Created ${i + 1} audit logs...`);
      }
    }
    
    console.log(`✅ Successfully created ${totalCreated} audit logs!`);
    
    // Show summary
    const severityCounts = await AuditLog.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);
    
    const categoryCounts = await AuditLog.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    console.log('\n=== AUDIT LOG SUMMARY ===');
    console.log('By Severity:', severityCounts);
    console.log('By Category:', categoryCounts);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createFullAuditLogs();
