const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/consenthub_dev')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📚 Available Collections:');
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });
    
    // Check DSAR-related collections
    console.log('\n🔍 Checking DSAR collections:');
    
    // Try different possible collection names
    const possibleNames = ['dsarrequests', 'DSARRequests', 'dsar_requests', 'requests'];
    
    for (const name of possibleNames) {
      try {
        const count = await mongoose.connection.db.collection(name).countDocuments();
        if (count > 0) {
          console.log(`  ✅ ${name}: ${count} documents`);
          
          // Show sample document
          const sample = await mongoose.connection.db.collection(name).findOne({});
          console.log(`    Sample fields: ${Object.keys(sample).join(', ')}`);
        }
      } catch (e) {
        // Collection doesn't exist, ignore
      }
    }
    
    await mongoose.connection.close();
    console.log('\n📪 Database connection closed');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
