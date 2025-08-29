const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://consentuser:12345@consentcluster.ylmrqgl.mongodb.net/consentDB?retryWrites=true&w=majority&appName=ConsentCluster';

// User schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'csr', 'admin'], default: 'customer' },
  firstName: String,
  lastName: String,
  isActive: { type: Boolean, default: true }
});

const User = mongoose.model('User', UserSchema);

async function checkUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('📋 Checking all users in database:');
    const users = await User.find({}, 'email role firstName lastName isActive');
    
    console.log(`Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.role}) - ${user.firstName} ${user.lastName} - Active: ${user.isActive}`);
    });

    console.log('\n📋 Looking for Dinuka specifically:');
    const dinuka = await User.find({ 
      $or: [
        { email: /dinuka/i },
        { firstName: /dinuka/i },
        { lastName: /dinuka/i }
      ]
    });
    
    if (dinuka.length > 0) {
      console.log('Found Dinuka:');
      dinuka.forEach(user => {
        console.log(`   ${user.email} - ${user.firstName} ${user.lastName} (${user.role})`);
      });
    } else {
      console.log('❌ No Dinuka found');
    }

    console.log('\n📋 Looking for CSR users:');
    const csrUsers = await User.find({ role: 'csr' });
    if (csrUsers.length > 0) {
      console.log('Found CSR users:');
      csrUsers.forEach(user => {
        console.log(`   ${user.email} - ${user.firstName} ${user.lastName}`);
      });
    } else {
      console.log('❌ No CSR users found');
    }

    await mongoose.disconnect();
    console.log('\n✅ Database check completed');

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

checkUsers();
