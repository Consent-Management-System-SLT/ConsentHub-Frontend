// Simple MongoDB connection test
const mongoose = require('mongoose');

async function testMongoConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    
    await mongoose.connect('mongodb://localhost:27017/consenhub', {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ Connected to MongoDB successfully!');
    
    // Test basic operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📊 Available collections:', collections.map(c => c.name));
    
    // Test UserProfile model
    const UserProfile = mongoose.model('UserProfile', new mongoose.Schema({
      email: String,
      firebaseUid: String
    }));
    
    const testUser = await UserProfile.findOne().limit(1);
    console.log('👤 Sample user data:', testUser);
    
    await mongoose.disconnect();
    console.log('✅ Connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  }
}

testMongoConnection();
