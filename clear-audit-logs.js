const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/consentDB';

async function clearAuditLogs() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Drop the audit logs collection entirely to clear any conflicting indexes
    try {
      await mongoose.connection.db.dropCollection('auditlogs');
      console.log('✅ Dropped auditlogs collection');
    } catch (error) {
      if (error.codeName === 'NamespaceNotFound') {
        console.log('ℹ️ auditlogs collection does not exist yet');
      } else {
        throw error;
      }
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

clearAuditLogs();
