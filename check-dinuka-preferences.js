const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://consentuser:12345@consentcluster.ylmrqgl.mongodb.net/consentDB?retryWrites=true&w=majority&appName=ConsentCluster';

// Define schemas to check different collections
const CommunicationPreferenceSchema = new mongoose.Schema({}, { strict: false });
const UserPreferenceSchema = new mongoose.Schema({}, { strict: false });
const PreferenceSchema = new mongoose.Schema({}, { strict: false });

const CommunicationPreference = mongoose.model('CommunicationPreference', CommunicationPreferenceSchema);
const UserPreference = mongoose.model('UserPreference', UserPreferenceSchema);
const Preference = mongoose.model('Preference', PreferenceSchema);

async function checkDinukaPreferences() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const dinukaId = '68ab214db812768956391dc4';
    console.log(`🔍 Checking preferences for Dinuka (ID: ${dinukaId})\n`);

    console.log('1. 📋 CommunicationPreferences collection:');
    const commPrefs = await CommunicationPreference.find({ 
      $or: [
        { partyId: dinukaId },
        { userId: dinukaId },
        { customerId: dinukaId },
        { _id: mongoose.Types.ObjectId.isValid(dinukaId) ? dinukaId : null }
      ]
    });
    
    if (commPrefs.length > 0) {
      console.log(`   Found ${commPrefs.length} communication preferences:`);
      commPrefs.forEach((pref, index) => {
        console.log(`   ${index + 1}. ID: ${pref._id}`);
        console.log(`      partyId: ${pref.partyId}`);
        console.log(`      topicSubscriptions:`, pref.topicSubscriptions);
        console.log(`      preferredChannels:`, pref.preferredChannels);
      });
    } else {
      console.log('   ❌ No communication preferences found');
    }

    console.log('\n2. 📋 UserPreferences collection:');
    const userPrefs = await UserPreference.find({ 
      $or: [
        { partyId: dinukaId },
        { userId: dinukaId },
        { customerId: dinukaId }
      ]
    });
    
    if (userPrefs.length > 0) {
      console.log(`   Found ${userPrefs.length} user preferences:`);
      userPrefs.forEach((pref, index) => {
        console.log(`   ${index + 1}. ID: ${pref._id} - Type: ${pref.preferenceType}`);
      });
    } else {
      console.log('   ❌ No user preferences found');
    }

    console.log('\n3. 📋 Preferences collection:');
    const prefs = await Preference.find({ 
      $or: [
        { partyId: dinukaId },
        { userId: dinukaId },
        { customerId: dinukaId }
      ]
    });
    
    if (prefs.length > 0) {
      console.log(`   Found ${prefs.length} general preferences:`);
      prefs.forEach((pref, index) => {
        console.log(`   ${index + 1}. ID: ${pref._id} - Type: ${pref.preferenceType}`);
      });
    } else {
      console.log('   ❌ No general preferences found');
    }

    console.log('\n4. 📋 Creating default preferences for Dinuka...');
    
    // Create communication preferences
    const defaultCommPref = new CommunicationPreference({
      partyId: dinukaId,
      preferenceType: 'communication',
      category: 'communication',
      preferredChannels: {
        email: true,
        sms: true,
        push: true,
        phone: false
      },
      topicSubscriptions: {
        marketing: true,
        security: true,
        billing: true,
        newsletter: false
      },
      doNotDisturb: {
        enabled: true,
        start: "22:00",
        end: "08:00"
      },
      frequency: "immediate",
      timezone: "Asia/Colombo",
      language: "en",
      lastUpdated: new Date()
    });

    await defaultCommPref.save();
    console.log(`✅ Created communication preference with ID: ${defaultCommPref._id}`);

    await mongoose.disconnect();
    console.log('\n✅ Database check and setup completed');

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

checkDinukaPreferences();
