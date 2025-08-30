const mongoose = require('mongoose');
require('dotenv').config();
const AuditLog = require('./models/AuditLog');
const User = require('./models/User');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/consentDB';

async function createRealisticAuditLogs() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
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
    
    // Clear existing audit logs
    await AuditLog.deleteMany({});
    console.log('Cleared existing audit logs');
    
    const auditLogs = [];
    const ipAddresses = ['192.168.1.100', '192.168.1.105', '192.168.1.110', '10.0.0.50', '172.16.0.25'];
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'ConsentHub Mobile App v2.1.0',
      'ConsentHub System Automation'
    ];
    
    // Create varied audit logs for different time periods
    const now = new Date();
    
    // Recent logs (last 7 days)
    for (let i = 0; i < 25; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      
      // Debug - check if user has required fields
      if (!randomUser.email || !randomUser.name) {
        console.log(`Skipping user with missing data:`, randomUser);
        continue;
      }
      
      const dayOffset = Math.floor(Math.random() * 7);
      const hourOffset = Math.floor(Math.random() * 24);
      const minuteOffset = Math.floor(Math.random() * 60);
      
      const logDate = new Date(now - (dayOffset * 24 * 60 * 60 * 1000) - (hourOffset * 60 * 60 * 1000) - (minuteOffset * 60 * 1000));
      
      const actions = [
        // Consent management
        { action: 'consent_granted', category: 'Consent Management', description: 'Marketing consent granted for SMS notifications', entityType: 'consent', severity: 'medium', complianceRelevant: true, regulatoryFramework: ['GDPR', 'PDPA_SL'] },
        { action: 'consent_revoked', category: 'Consent Management', description: 'Email marketing consent withdrawn by customer', entityType: 'consent', severity: 'medium', complianceRelevant: true, regulatoryFramework: ['GDPR', 'PDPA_SL'] },
        { action: 'consent_updated', category: 'Consent Management', description: 'Preference settings updated - analytics tracking disabled', entityType: 'consent', severity: 'low', complianceRelevant: true, regulatoryFramework: ['GDPR'] },
        
        // DSAR processing
        { action: 'dsar_request_created', category: 'DSAR Processing', description: 'New data subject access request submitted', entityType: 'dsar_request', severity: 'high', complianceRelevant: true, regulatoryFramework: ['GDPR', 'PDPA_SL'] },
        { action: 'dsar_request_updated', category: 'DSAR Processing', description: 'DSAR request status updated to in_progress', entityType: 'dsar_request', severity: 'medium', complianceRelevant: true, regulatoryFramework: ['GDPR'] },
        { action: 'dsar_request_completed', category: 'DSAR Processing', description: 'Data portability request completed - files exported', entityType: 'dsar_request', severity: 'high', complianceRelevant: true, regulatoryFramework: ['GDPR', 'PDPA_SL'] },
        
        // User management
        { action: 'user_login', category: 'User Management', description: 'Successful login to admin dashboard', entityType: 'user', severity: 'low', complianceRelevant: false, regulatoryFramework: [] },
        { action: 'user_updated', category: 'User Management', description: 'User profile information updated', entityType: 'user', severity: 'medium', complianceRelevant: true, regulatoryFramework: ['GDPR'] },
        
        // Data processing
        { action: 'data_exported', category: 'Data Processing', description: 'Customer data exported for compliance audit', entityType: 'user', severity: 'high', complianceRelevant: true, regulatoryFramework: ['GDPR', 'PDPA_SL'] },
        { action: 'data_accessed', category: 'Data Processing', description: 'Personal data accessed for customer support', entityType: 'user', severity: 'medium', complianceRelevant: true, regulatoryFramework: ['GDPR'] },
        
        // Privacy notices
        { action: 'privacy_notice_updated', category: 'Privacy Notices', description: 'Privacy policy updated to v3.2 - new data categories added', entityType: 'privacy_notice', severity: 'high', complianceRelevant: true, regulatoryFramework: ['GDPR', 'PDPA_SL'] },
        
        // Security events
        { action: 'security_event', category: 'Security', description: 'Multiple failed login attempts detected', entityType: 'user', severity: 'high', complianceRelevant: true, regulatoryFramework: ['GDPR'], riskLevel: 'medium' }
      ];
      
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      
      auditLogs.push({
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
        severity: randomAction.severity,
        riskLevel: randomAction.riskLevel || 'none',
        complianceRelevant: randomAction.complianceRelevant,
        regulatoryFramework: randomAction.regulatoryFramework,
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
        location: {
          country: 'Sri Lanka',
          region: 'Western Province',
          city: 'Colombo'
        },
        outcome: Math.random() > 0.95 ? 'failure' : 'success',
        metadata: {
          platform: Math.random() > 0.5 ? 'web' : 'mobile',
          version: '2.1.0',
          feature: randomAction.category.toLowerCase().replace(' ', '_')
        },
        createdAt: logDate,
        updatedAt: logDate
      });
    }
    
    // Add some older logs (last 30 days)
    for (let i = 0; i < 15; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      
      // Debug - check if user has required fields
      if (!randomUser.email || !randomUser.name) {
        console.log(`Skipping user with missing data:`, randomUser);
        continue;
      }
      
      const dayOffset = 7 + Math.floor(Math.random() * 23); // 7-30 days ago
      const hourOffset = Math.floor(Math.random() * 24);
      
      const logDate = new Date(now - (dayOffset * 24 * 60 * 60 * 1000) - (hourOffset * 60 * 60 * 1000));
      
      const olderActions = [
        { action: 'user_created', category: 'User Management', description: 'New user account created during registration', entityType: 'user', severity: 'medium', complianceRelevant: true, regulatoryFramework: ['GDPR', 'PDPA_SL'] },
        { action: 'privacy_notice_published', category: 'Privacy Notices', description: 'Updated privacy policy published and notified to users', entityType: 'privacy_notice', severity: 'high', complianceRelevant: true, regulatoryFramework: ['GDPR', 'PDPA_SL'] },
        { action: 'audit_report_generated', category: 'Compliance & Audit', description: 'Monthly compliance audit report generated', entityType: 'system', severity: 'medium', complianceRelevant: true, regulatoryFramework: ['GDPR', 'PDPA_SL'] },
        { action: 'system_backup', category: 'System Administration', description: 'Automated system backup completed successfully', entityType: 'system', severity: 'low', complianceRelevant: false, regulatoryFramework: [] },
        { action: 'configuration_changed', category: 'System Administration', description: 'Data retention policy configuration updated', entityType: 'system', severity: 'high', complianceRelevant: true, regulatoryFramework: ['GDPR', 'PDPA_SL'] }
      ];
      
      const randomAction = olderActions[Math.floor(Math.random() * olderActions.length)];
      
      auditLogs.push({
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
        severity: randomAction.severity,
        riskLevel: randomAction.riskLevel || 'none',
        complianceRelevant: randomAction.complianceRelevant,
        regulatoryFramework: randomAction.regulatoryFramework,
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
        location: {
          country: 'Sri Lanka',
          region: 'Western Province',
          city: 'Colombo'
        },
        outcome: Math.random() > 0.9 ? 'failure' : 'success',
        metadata: {
          platform: Math.random() > 0.5 ? 'web' : 'mobile',
          version: '2.0.8',
          feature: randomAction.category.toLowerCase().replace(' ', '_')
        },
        createdAt: logDate,
        updatedAt: logDate
      });
    }
    
    // Insert all audit logs
    const insertedLogs = await AuditLog.insertMany(auditLogs);
    console.log(`Created ${insertedLogs.length} audit log entries`);
    
    // Show summary by category
    const categoryCounts = await AuditLog.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n=== AUDIT LOG SUMMARY BY CATEGORY ===');
    categoryCounts.forEach(cat => {
      console.log(`${cat._id}: ${cat.count}`);
    });
    
    // Show summary by severity
    const severityCounts = await AuditLog.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('\n=== AUDIT LOG SUMMARY BY SEVERITY ===');
    severityCounts.forEach(sev => {
      console.log(`${sev._id.toUpperCase()}: ${sev.count}`);
    });
    
    console.log('\n✅ Successfully created realistic audit logs with actual user data!');
    process.exit(0);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createRealisticAuditLogs();
