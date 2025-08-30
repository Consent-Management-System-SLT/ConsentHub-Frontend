const mongoose = require('mongoose');
require('dotenv').config();
const DSARRequest = require('./models/DSARRequest');
const AuditLog = require('./models/AuditLog');

async function cleanDSARData() {
    // Use the same connection approach as the backend
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://consentuser:12345@consentcluster.ylmrqgl.mongodb.net/consentDB?retryWrites=true&w=majority&appName=ConsentCluster";
    
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('🧹 Starting DSAR data cleanup...');
        console.log('📦 Connected to MongoDB');
        
        // Get current DSAR count
        const currentCount = await DSARRequest.countDocuments();
        console.log(`📊 Current DSAR requests: ${currentCount}`);
        
        // Delete all existing DSAR requests
        const deleteResult = await DSARRequest.deleteMany({});
        console.log(`🗑️ Deleted ${deleteResult.deletedCount} DSAR requests`);
        
        // Reset any DSAR-related audit logs (optional)
        const auditDeleteResult = await AuditLog.deleteMany({
            action: { $in: ['DSAR_REQUEST_CREATED', 'DSAR_REQUEST_UPDATED', 'DSAR_REQUEST_APPROVED', 'DSAR_REQUEST_REJECTED', 'DSAR_REQUEST_COMPLETED'] }
        });
        console.log(`📝 Cleaned up ${auditDeleteResult.deletedCount} DSAR audit logs`);
        
        // Verify cleanup
        const finalCount = await DSARRequest.countDocuments();
        console.log(`✅ Final DSAR requests count: ${finalCount}`);
        
        console.log('\n🎯 DSAR System Reset Complete!');
        console.log('💡 Customers can now create fresh DSAR requests');
        console.log('📋 All historical DSAR data has been cleared');
        
    } catch (error) {
        console.error('❌ Error cleaning DSAR data:', error);
    } finally {
        await mongoose.connection.close();
    }
}

cleanDSARData();
