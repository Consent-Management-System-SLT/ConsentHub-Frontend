const mongoose = require('mongoose');
require('dotenv').config();

async function cleanupTestPreferences() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        // Check current counts
        const totalBefore = await mongoose.connection.db.collection('user_preferences').countDocuments();
        console.log(`📊 Current user_preferences count: ${totalBefore}`);
        
        // Find legitimate users (those in the users collection)
        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        const legitimateUserIds = users.map(user => user._id.toString());
        console.log(`👥 Legitimate users: ${legitimateUserIds.length}`);
        
        // Find preferences for legitimate users only
        const legitPrefs = await mongoose.connection.db.collection('user_preferences').find({
            userId: { $in: legitimateUserIds }
        }).toArray();
        console.log(`✅ Preferences for legitimate users: ${legitPrefs.length}`);
        
        // Find orphaned preferences (users that don't exist in users collection)
        const orphanedPrefs = await mongoose.connection.db.collection('user_preferences').find({
            userId: { $nin: legitimateUserIds }
        }).toArray();
        console.log(`🗑️  Orphaned preferences to clean: ${orphanedPrefs.length}`);
        
        if (orphanedPrefs.length > 0) {
            console.log('\n🧹 Cleaning up orphaned preferences...');
            const deleteResult = await mongoose.connection.db.collection('user_preferences').deleteMany({
                userId: { $nin: legitimateUserIds }
            });
            console.log(`✅ Deleted ${deleteResult.deletedCount} orphaned preferences`);
        }
        
        // Check for duplicates among remaining preferences
        const pipeline = [
            {
                $match: { userId: { $in: legitimateUserIds } }
            },
            {
                $group: {
                    _id: {
                        userId: "$userId",
                        preferenceType: "$preferenceType",
                        channel: "$channel"
                    },
                    count: { $sum: 1 },
                    ids: { $push: "$_id" }
                }
            },
            {
                $match: { count: { $gt: 1 } }
            }
        ];
        
        const duplicates = await mongoose.connection.db.collection('user_preferences').aggregate(pipeline).toArray();
        console.log(`🔍 Duplicate preference groups: ${duplicates.length}`);
        
        // Remove duplicates, keeping only the most recent one
        for (const duplicate of duplicates) {
            const idsToDelete = duplicate.ids.slice(0, -1); // Keep the last one, delete others
            if (idsToDelete.length > 0) {
                await mongoose.connection.db.collection('user_preferences').deleteMany({
                    _id: { $in: idsToDelete }
                });
                console.log(`   Removed ${idsToDelete.length} duplicates for user ${duplicate._id.userId}`);
            }
        }
        
        const totalAfter = await mongoose.connection.db.collection('user_preferences').countDocuments();
        console.log(`\n📊 Final user_preferences count: ${totalAfter}`);
        console.log(`🎯 Cleaned up ${totalBefore - totalAfter} excess preference records`);
        
        // Show remaining preferences by user
        const remainingByUser = await mongoose.connection.db.collection('user_preferences').aggregate([
            {
                $group: {
                    _id: "$userId",
                    count: { $sum: 1 },
                    active: { $sum: { $cond: ["$isActive", 1, 0] } }
                }
            },
            { $sort: { count: -1 } }
        ]).toArray();
        
        console.log('\n👥 Remaining preferences by user:');
        remainingByUser.forEach((user, index) => {
            console.log(`   ${index + 1}. User ${user._id}: ${user.count} total (${user.active} active)`);
        });
        
        await mongoose.disconnect();
        console.log('\n✅ Cleanup completed successfully!');
        
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

cleanupTestPreferences();
