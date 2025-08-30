const mongoose = require('mongoose');
const axios = require('axios');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://consentuser:12345@consentcluster.ylmrqgl.mongodb.net/consentDB?retryWrites=true&w=majority&appName=ConsentCluster';

const BASE_URL = 'http://localhost:3001';

// User schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'csr', 'admin'], default: 'customer' },
  firstName: String,
  lastName: String,
  isActive: { type: Boolean, default: true }
});

const CommunicationPreferenceSchema = new mongoose.Schema({
  partyId: { type: String, required: true },
  preferredChannels: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: false },
    phone: { type: Boolean, default: false }
  },
  topicSubscriptions: {
    marketing: { type: Boolean, default: false },
    security: { type: Boolean, default: true },
    billing: { type: Boolean, default: true },
    newsletter: { type: Boolean, default: false }
  },
  quietHours: {
    enabled: { type: Boolean, default: false },
    start: { type: String, default: '22:00' },
    end: { type: String, default: '08:00' }
  },
  frequency: { type: String, default: 'immediate' },
  timezone: { type: String, default: 'UTC' },
  language: { type: String, default: 'en' }
}, {
  timestamps: true
});

async function checkOjithaPreferences() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const User = mongoose.model('User', UserSchema);
    const CommunicationPreference = mongoose.model('CommunicationPreference', CommunicationPreferenceSchema);

    // 1. Find Ojitha user
    console.log('1. 🔍 Looking for Ojitha user...');
    const ojithaUsers = await User.find({ 
      email: { $regex: /ojitharajapaksha/i }
    });
    
    if (ojithaUsers.length === 0) {
      console.log('❌ No user found with email containing "ojitharajapaksha"');
      
      // Check for similar emails
      const similarUsers = await User.find({ 
        email: { $regex: /ojitha/i }
      });
      console.log(`Found ${similarUsers.length} users with "ojitha" in email:`);
      similarUsers.forEach(user => {
        console.log(`   ${user.email} - ${user.firstName} ${user.lastName} (ID: ${user._id})`);
      });
      
      await mongoose.disconnect();
      return;
    }

    const ojithaUser = ojithaUsers[0];
    console.log(`✅ Found user: ${ojithaUser.email}`);
    console.log(`   Name: ${ojithaUser.firstName} ${ojithaUser.lastName}`);
    console.log(`   ID: ${ojithaUser._id}`);
    console.log(`   Role: ${ojithaUser.role}\n`);

    // 2. Check communication preferences
    console.log('2. 📋 Checking communication preferences...');
    const commPrefs = await CommunicationPreference.find({ 
      partyId: ojithaUser._id.toString() 
    }).sort({ updatedAt: -1 });

    if (commPrefs.length === 0) {
      console.log('❌ No communication preferences found for this user');
    } else {
      console.log(`✅ Found ${commPrefs.length} communication preference(s):`);
      commPrefs.forEach((pref, index) => {
        console.log(`\n   Preference ${index + 1}:`);
        console.log(`   ID: ${pref._id}`);
        console.log(`   Email: ${pref.preferredChannels?.email}`);
        console.log(`   SMS: ${pref.preferredChannels?.sms}`);
        console.log(`   Push: ${pref.preferredChannels?.push}`);
        console.log(`   Phone: ${pref.preferredChannels?.phone}`);
        console.log(`   Marketing: ${pref.topicSubscriptions?.marketing}`);
        console.log(`   Security: ${pref.topicSubscriptions?.security}`);
        console.log(`   Billing: ${pref.topicSubscriptions?.billing}`);
        console.log(`   Newsletter: ${pref.topicSubscriptions?.newsletter}`);
        console.log(`   DND enabled: ${pref.quietHours?.enabled}`);
        console.log(`   Last updated: ${pref.updatedAt}`);
        console.log(`   Created: ${pref.createdAt}`);
      });
    }

    // 3. Test CSR API to see what it returns
    console.log('\n3. 🔄 Testing CSR API...');
    try {
      // Login as CSR
      const csrLogin = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
        email: 'csr@sltmobitel.lk',
        password: 'csr123'
      });

      const csrToken = csrLogin.data.token;
      console.log('✅ CSR logged in successfully');

      // Get CSR view of Ojitha's preferences
      const csrView = await axios.get(`${BASE_URL}/api/v1/csr/customers/${ojithaUser._id}/preferences`, {
        headers: { 'Authorization': `Bearer ${csrToken}` }
      });

      console.log('\n📊 CSR API Response:');
      console.log(JSON.stringify(csrView.data, null, 2));

    } catch (apiError) {
      console.log('❌ CSR API Error:', apiError.response?.data || apiError.message);
    }

    await mongoose.disconnect();
    console.log('\n✅ Database check completed');

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

checkOjithaPreferences();
