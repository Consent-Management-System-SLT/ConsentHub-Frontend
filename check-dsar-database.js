require('dotenv').config();
const mongoose = require('mongoose');

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://sltuser:Slt_DigitalPlatform2024@cluster0.ylmrqgl.mongodb.net/consentDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const DSARRequest = require('./models/DSARRequest');

async function checkDSARDatabase() {
    try {
        console.log('🔍 Checking DSAR requests in database...\n');
        
        // Get all DSAR requests
        const requests = await DSARRequest.find({}).lean();
        
        console.log(`📊 Total DSAR requests found: ${requests.length}\n`);
        
        if (requests.length === 0) {
            console.log('❌ No DSAR requests found in database');
            return;
        }
        
        // Check each request for missing fields
        requests.forEach((request, index) => {
            console.log(`\n--- Request #${index + 1} ---`);
            console.log(`ID: ${request._id}`);
            console.log(`RequestId: ${request.requestId || 'MISSING'}`);
            console.log(`RequesterName: ${request.requesterName || 'MISSING'}`);
            console.log(`RequesterEmail: ${request.requesterEmail || 'MISSING'}`);
            console.log(`RequestType: ${request.requestType || 'MISSING'}`);
            console.log(`Status: ${request.status || 'MISSING'}`);
            console.log(`Priority: ${request.priority || 'MISSING'}`);
            console.log(`Subject: ${request.subject || 'MISSING'}`);
            console.log(`Description: ${request.description || 'MISSING'}`);
            console.log(`SubmittedAt: ${request.submittedAt || 'MISSING'}`);
            console.log(`DueDate: ${request.dueDate || 'MISSING'}`);
            
            // Check for missing critical fields
            const missingFields = [];
            if (!request.status) missingFields.push('status');
            if (!request.priority) missingFields.push('priority');
            if (!request.requestType) missingFields.push('requestType');
            if (!request.dueDate) missingFields.push('dueDate');
            if (!request.requestId) missingFields.push('requestId');
            
            if (missingFields.length > 0) {
                console.log(`⚠️  Missing fields: ${missingFields.join(', ')}`);
            } else {
                console.log('✅ All required fields present');
            }
        });
        
        // Statistics
        console.log('\n📈 Statistics:');
        const byStatus = requests.reduce((acc, req) => {
            const status = req.status || 'undefined';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});
        
        const byRequestType = requests.reduce((acc, req) => {
            const type = req.requestType || 'undefined';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});
        
        const byPriority = requests.reduce((acc, req) => {
            const priority = req.priority || 'undefined';
            acc[priority] = (acc[priority] || 0) + 1;
            return acc;
        }, {});
        
        console.log('By Status:', byStatus);
        console.log('By Request Type:', byRequestType);
        console.log('By Priority:', byPriority);
        
    } catch (error) {
        console.error('❌ Error checking DSAR database:', error);
    } finally {
        mongoose.connection.close();
        console.log('\n🔚 Database connection closed');
    }
}

checkDSARDatabase();
