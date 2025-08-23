const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/consentDB';

async function createMoreTestLogs() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Use same flexible schema as check script
    const AuditLog = mongoose.model('AuditLog', new mongoose.Schema({}, {strict: false}));
    
    // First clear and create fresh logs
    await AuditLog.deleteMany({});
    console.log('Cleared existing audit logs');
    
    // Sample users from the system
    const sampleUsers = [
      { id: '688d0351c3806e1b98fc7c73', name: 'CSR User', email: 'csr@sltmobitel.lk', role: 'csr' },
      { id: '688d0351c3806e1b98fc7c74', name: 'Admin User', email: 'admin@sltmobitel.lk', role: 'admin' },
      { id: '689d67d8b20471a810652abf', name: 'Omindu Premathilake', email: 'aaomindu@gmail.com', role: 'customer' },
      { id: '68a8640c3723313e0db3e5ee', name: 'jhon jhonnn', email: 'jhonjhonvvv@gmail.com', role: 'customer' },
      { id: '689d5fea9e2204feab3375c3', name: 'vvvjjjjj Abeysiri', email: 'ahha@gmail.com', role: 'customer' }
    ];
    
    const actions = [
      { action: 'consent_granted', category: 'Consent Management', description: 'Marketing consent granted for SMS notifications', severity: 'medium' },
      { action: 'consent_revoked', category: 'Consent Management', description: 'Email marketing consent withdrawn by customer', severity: 'medium' },
      { action: 'dsar_request_created', category: 'DSAR Processing', description: 'New data subject access request submitted', severity: 'high' },
      { action: 'dsar_request_completed', category: 'DSAR Processing', description: 'Data portability request completed - files exported', severity: 'high' },
      { action: 'user_login', category: 'User Management', description: 'Successful login to customer dashboard', severity: 'low' },
      { action: 'user_created', category: 'User Management', description: 'New user account created during registration', severity: 'medium' },
      { action: 'data_exported', category: 'Data Processing', description: 'Customer data exported for compliance audit', severity: 'high' },
      { action: 'data_accessed', category: 'Data Processing', description: 'Personal data accessed for customer support', severity: 'medium' },
      { action: 'privacy_notice_updated', category: 'Privacy Notices', description: 'Privacy policy updated to v3.2 - new data categories added', severity: 'high' },
      { action: 'system_backup', category: 'System Administration', description: 'Automated system backup completed successfully', severity: 'low' }
    ];
    
    const ipAddresses = ['192.168.1.100', '192.168.1.105', '192.168.1.110', '10.0.0.50', '172.16.0.25'];
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'ConsentHub Mobile App v2.1.0',
      'ConsentHub System Automation'
    ];
    
    const now = new Date();
    
    // Create 25 varied logs
    for (let i = 0; i < 25; i++) {
      const randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      const dayOffset = Math.floor(Math.random() * 14); // Last 2 weeks
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
        entityType: randomAction.action.includes('consent') ? 'consent' : 
                   randomAction.action.includes('dsar') ? 'dsar_request' :
                   randomAction.action.includes('user') ? 'user' : 
                   randomAction.action.includes('privacy') ? 'privacy_notice' : 'system',
        entityId: `${randomAction.category.toUpperCase().replace(' ', '_')}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        ipAddress: ipAddresses[Math.floor(Math.random() * ipAddresses.length)],
        userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
        severity: randomAction.severity,
        riskLevel: 'none',
        complianceRelevant: !randomAction.action.includes('system') && !randomAction.action.includes('login'),
        regulatoryFramework: randomAction.severity === 'high' ? ['GDPR', 'PDPA_SL'] : 
                           randomAction.severity === 'medium' ? ['GDPR'] : [],
        location: {
          country: 'Sri Lanka',
          region: 'Western Province',
          city: 'Colombo'
        },
        outcome: Math.random() > 0.1 ? 'success' : 'failure',
        metadata: {
          platform: Math.random() > 0.5 ? 'web' : 'mobile',
          version: '2.1.0',
          feature: randomAction.category.toLowerCase().replace(' ', '_')
        },
        createdAt: logDate,
        updatedAt: logDate
      });
      
      await auditLog.save();
      
      if ((i + 1) % 5 === 0) {
        console.log(`Created ${i + 1} audit logs...`);
      }
    }
    
    const totalCount = await AuditLog.countDocuments();
    console.log(`\n✅ Successfully created ${totalCount} comprehensive audit logs!`);
    
    // Show summary
    const categories = await AuditLog.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n📊 Audit logs by category:');
    categories.forEach(cat => console.log(`   ${cat._id}: ${cat.count}`));
    
    const severities = await AuditLog.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);
    
    console.log('\n🚨 Audit logs by severity:');
    severities.forEach(sev => console.log(`   ${sev._id}: ${sev.count}`));
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createMoreTestLogs();
