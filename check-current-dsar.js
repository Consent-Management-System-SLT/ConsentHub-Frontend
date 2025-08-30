const mongoose = require('mongoose');

// DSAR Request Schema
const DSARRequestSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  requestType: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'completed', 'rejected'],
    default: 'pending' 
  },
  submittedAt: { type: Date, default: Date.now },
  completedAt: Date,
  requestDetails: {
    reason: String,
    specificData: String,
    contactMethod: String
  },
  responseFiles: [{
    filename: String,
    downloadUrl: String,
    expiryDate: Date
  }],
  processedBy: String,
  notes: String
});

const DSARRequest = mongoose.model('DSARRequest', DSARRequestSchema);

async function checkCurrentRequests() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    // Use the same connection string as the backend
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://ojitharaj:Ojitha%40123@cluster0.ylmrqgl.mongodb.net/consentDB?retryWrites=true&w=majority';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');
    
    const requests = await DSARRequest.find({}).sort({ submittedAt: -1 });
    
    console.log(`\n📋 Current DSAR Requests: ${requests.length}\n`);
    
    if (requests.length === 0) {
      console.log('   No DSAR requests found.');
    } else {
      requests.forEach((req, index) => {
        console.log(`${index + 1}. Request Details:`);
        console.log(`   ID: ${req._id}`);
        console.log(`   User: ${req.userId}`);
        console.log(`   Type: ${req.requestType}`);
        console.log(`   Status: ${req.status}`);
        console.log(`   Submitted: ${req.submittedAt?.toISOString()?.split('T')[0] || 'Unknown'}`);
        console.log(`   Processed By: ${req.processedBy || 'Not assigned'}`);
        console.log(`   Reason: ${req.requestDetails?.reason || 'No reason provided'}`);
        console.log('');
      });
    }
    
    // Check user data too
    const User = mongoose.model('User', new mongoose.Schema({
      email: String,
      firstName: String,
      role: String
    }));
    
    const users = await User.find({ role: 'customer' }).limit(5);
    console.log(`\n👥 Customer Users: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.firstName || 'Unknown'})`);
    });
    
    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkCurrentRequests();
