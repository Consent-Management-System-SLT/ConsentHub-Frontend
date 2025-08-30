const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/consenthub_dev')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Get direct access to the collection
    const collection = mongoose.connection.db.collection('dsarrequests');
    
    // Get a sample document
    const sample = await collection.findOne({});
    console.log('🔍 Sample document from dsarrequests collection:');
    console.log(JSON.stringify(sample, null, 2));
    
    await mongoose.connection.close();
    console.log('\n📪 Database connection closed');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
