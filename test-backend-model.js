const mongoose = require('mongoose');

// Connect to MongoDB using the same connection as the backend
mongoose.connect('mongodb://localhost:27017/consenthub_dev', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB consenthub_dev database');
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Import the exact same model as the backend
const DSARRequest = require('./models/DSARRequest.js');

async function testBackendModel() {
  try {
    console.log('🔍 Testing backend DSAR model...');
    
    // Count all documents using the backend model
    const count = await DSARRequest.countDocuments();
    console.log(`📊 Total DSAR requests via backend model: ${count}`);
    
    // Get all documents
    const requests = await DSARRequest.find().limit(10);
    console.log(`📋 Retrieved ${requests.length} requests:`);
    
    requests.forEach((request, index) => {
      console.log(`  ${index + 1}. ${request.requestId} - ${request.requesterName} (${request.status})`);
    });
    
    // Check different status counts
    const statusCounts = await DSARRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('\n📈 Status breakdown:');
    statusCounts.forEach(status => {
      console.log(`  ${status._id}: ${status.count}`);
    });
    
    // Test the same query as the API endpoint
    const page = 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    
    console.log('\n🔍 Testing API-style query...');
    const apiResults = await DSARRequest.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();
      
    console.log(`API query returned ${apiResults.length} results`);
    
    if (apiResults.length > 0) {
      console.log(`First result: ${apiResults[0].requestId} - ${apiResults[0].requesterName}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing backend model:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📪 Database connection closed');
  }
}

testBackendModel();
