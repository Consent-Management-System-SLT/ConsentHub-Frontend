const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/consentDB';

async function checkAuditLogs() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Use a flexible schema to check existing data
    const AuditLog = mongoose.model('AuditLog', new mongoose.Schema({}, {strict: false}));
    
    const count = await AuditLog.countDocuments();
    console.log(`\n📊 Total audit logs in database: ${count}`);
    
    if (count > 0) {
      const logs = await AuditLog.find({}).limit(10).sort({createdAt: -1});
      console.log('\n📋 Recent audit logs:');
      logs.forEach((log, index) => {
        console.log(`${index + 1}. ${log.action || 'unknown'} by ${log.userName || 'unknown'} (${log.category || 'unknown'})`);
      });
    } else {
      console.log('\n⚠️  No audit logs found in database');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAuditLogs();
