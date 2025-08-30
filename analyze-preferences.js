const mongoose = require('mongoose');
require('dotenv').config();

async function analyzeUserPreferences() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        // Get sample records from user_preferences collection
        const userPrefs = await mongoose.connection.db.collection('user_preferences').find({}).limit(10).toArray();
        console.log(`📊 Total user_preferences: ${await mongoose.connection.db.collection('user_preferences').countDocuments()}`);
        
        console.log('\n📋 Sample user preferences:');
        userPrefs.forEach((pref, index) => {
            console.log(`\n${index + 1}. User: ${pref.userId || pref.customerId || 'Unknown'}`);
            console.log(`   Email: ${pref.email || 'N/A'}`);
            console.log(`   Created: ${pref.createdAt ? new Date(pref.createdAt).toLocaleDateString() : 'N/A'}`);
            console.log(`   Type: ${pref.preferenceType || pref.type || 'N/A'}`);
            console.log(`   Status: ${pref.isActive ? 'Active' : 'Inactive'}`);
        });
        
        // Check for duplicates by userId/email
        const pipeline = [
            {
                $group: {
                    _id: "$userId",
                    count: { $sum: 1 },
                    emails: { $addToSet: "$email" }
                }
            },
            {
                $match: { count: { $gt: 1 } }
            },
            {
                $sort: { count: -1 }
            }
        ];
        
        const duplicates = await mongoose.connection.db.collection('user_preferences').aggregate(pipeline).toArray();
        
        console.log(`\n🔍 Users with multiple preferences: ${duplicates.length}`);
        duplicates.slice(0, 5).forEach((dup, index) => {
            console.log(`   ${index + 1}. User ${dup._id}: ${dup.count} preferences, emails: ${dup.emails.join(', ')}`);
        });
        
        // Check date distribution
        const dateDistribution = await mongoose.connection.db.collection('user_preferences').aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
            { $limit: 10 }
        ]).toArray();
        
        console.log('\n📅 Recent creation dates:');
        dateDistribution.forEach((date, index) => {
            console.log(`   ${index + 1}. ${date._id.year}-${String(date._id.month).padStart(2, '0')}-${String(date._id.day).padStart(2, '0')}: ${date.count} preferences`);
        });
        
        await mongoose.disconnect();
        
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

analyzeUserPreferences();
