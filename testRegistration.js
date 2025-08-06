const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const testRegistration = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Test creating a new user
    const testUser = new User({
      email: 'newuser@test.com',
      password: 'Test123!@#',
      firstName: 'New',
      lastName: 'User',
      phone: '+94771234567',
      company: 'SLT-Mobitel',
      department: 'IT',
      jobTitle: 'Developer',
      role: 'customer',
      status: 'active',
      emailVerified: false,
      isActive: true,
      acceptTerms: true,
      acceptPrivacy: true,
      language: 'en',
      lastLoginAt: new Date()
    });

    const savedUser = await testUser.save();
    console.log('User created successfully:', savedUser._id);
    console.log('User data:', {
      id: savedUser._id,
      email: savedUser.email,
      name: savedUser.name,
      role: savedUser.role
    });

    // Test retrieving the user
    const foundUser = await User.findById(savedUser._id);
    console.log('User found by ID:', foundUser ? 'Yes' : 'No');

    // Clean up - delete the test user
    await User.findByIdAndDelete(savedUser._id);
    console.log('Test user deleted');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Connection closed');
  }
};

testRegistration();
