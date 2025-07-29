const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@sltmobitel.lk' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create default users
    const defaultUsers = [
      {
        email: 'admin@sltmobitel.lk',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        phone: '+94771234567',
        company: 'SLT-Mobitel',
        department: 'IT Administration',
        jobTitle: 'System Administrator',
        role: 'admin',
        status: 'active',
        emailVerified: true,
        isActive: true,
        acceptTerms: true,
        acceptPrivacy: true,
        language: 'en',
        lastLoginAt: new Date()
      },
      {
        email: 'csr@sltmobitel.lk',
        password: 'csr123',
        firstName: 'CSR',
        lastName: 'Representative',
        phone: '+94771234568',
        company: 'SLT-Mobitel',
        department: 'Customer Service',
        jobTitle: 'Customer Service Representative',
        role: 'csr',
        status: 'active',
        emailVerified: true,
        isActive: true,
        acceptTerms: true,
        acceptPrivacy: true,
        language: 'en',
        lastLoginAt: new Date()
      },
      {
        email: 'customer@sltmobitel.lk',
        password: 'customer123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+94771234569',
        company: 'SLT-Mobitel',
        department: 'Sales',
        jobTitle: 'Sales Manager',
        role: 'customer',
        status: 'active',
        emailVerified: true,
        isActive: true,
        acceptTerms: true,
        acceptPrivacy: true,
        language: 'en',
        lastLoginAt: new Date(),
        address: '123 Main St, Colombo 03'
      }
    ];

    for (const userData of defaultUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`Created ${userData.role} user: ${userData.email}`);
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

const runSeed = async () => {
  await connectDB();
  await seedUsers();
};

// Run the seed function
runSeed();
