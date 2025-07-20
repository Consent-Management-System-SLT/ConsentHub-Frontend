// Direct MongoDB test with UserProfile model
const mongoose = require('mongoose');
const UserProfile = require('./backend/backend/auth-service/models/UserProfile');

async function testUserProfileOperations() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/consenhub', {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
    console.log('✅ Connected to MongoDB');

    // Test 1: Try to find existing users
    console.log('\n1. Checking for existing users...');
    const existingUsers = await UserProfile.find().limit(5);
    console.log(`Found ${existingUsers.length} existing users`);

    // Test 2: Create a test user
    console.log('\n2. Creating test user...');
    const testUser = new UserProfile({
      firebaseUid: 'test-user-' + Date.now(),
      email: 'test@example.com',
      emailVerified: false,
      displayName: 'Test User',
      status: 'active',
      role: 'customer',
      _devPassword: 'hashedpassword'
    });

    const savedUser = await testUser.save();
    console.log('✅ User created:', savedUser.email);

    // Test 3: Find the user we just created
    console.log('\n3. Finding user by email...');
    const foundUser = await UserProfile.findOne({ email: 'test@example.com' });
    console.log('✅ User found:', foundUser ? foundUser.email : 'Not found');

    // Clean up
    if (foundUser) {
      await UserProfile.deleteOne({ _id: foundUser._id });
      console.log('✅ Test user cleaned up');
    }

    await mongoose.disconnect();
    console.log('✅ Test completed successfully');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  }
}

testUserProfileOperations();
