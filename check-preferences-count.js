const mongoose = require('mongoose');
require('dotenv').config();

const UserPreference = require('./models/User');

async function checkPreferencesCount() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        // Check UserPreference collection
        const userPrefs = await mongoose.connection.db.collection('userpreferences').find({}).toArray();
        console.log(`📊 UserPreferences collection count: ${userPrefs.length}`);
        
        // Check if there are any other preference-related collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        const preferenceCollections = collections.filter(c => 
            c.name.toLowerCase().includes('preference') || 
            c.name.toLowerCase().includes('pref')
        );
        
        console.log('\n📋 Preference-related collections:');
        for (const collection of preferenceCollections) {
            const count = await mongoose.connection.db.collection(collection.name).countDocuments();
            console.log(`   ${collection.name}: ${count} documents`);
        }
        
        // Check Users collection for any preference data
        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        console.log(`\n👥 Users collection count: ${users.length}`);
        
        // Check if users have embedded preferences
        const usersWithPreferences = users.filter(user => user.preferences && user.preferences.length > 0);
        console.log(`   Users with embedded preferences: ${usersWithPreferences.length}`);
        
        if (usersWithPreferences.length > 0) {
            const totalEmbeddedPrefs = usersWithPreferences.reduce((sum, user) => sum + (user.preferences ? user.preferences.length : 0), 0);
            console.log(`   Total embedded preferences: ${totalEmbeddedPrefs}`);
        }
        
        await mongoose.disconnect();
        
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkPreferencesCount();
