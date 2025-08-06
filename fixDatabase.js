const mongoose = require('mongoose');
require('dotenv').config();

const fixDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // List all indexes
    console.log('Current indexes:');
    const indexes = await collection.indexes();
    indexes.forEach(index => {
      console.log('Index:', index.name, 'Keys:', index.key);
    });

    // Drop the problematic id_1 index if it exists
    try {
      await collection.dropIndex('id_1');
      console.log('Dropped id_1 index successfully');
    } catch (error) {
      console.log('id_1 index not found or already dropped');
    }

    // Clear all existing users (since they might have old format)
    const deleteResult = await collection.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing user records`);

    // List indexes after cleanup
    console.log('\nIndexes after cleanup:');
    const finalIndexes = await collection.indexes();
    finalIndexes.forEach(index => {
      console.log('Index:', index.name, 'Keys:', index.key);
    });

    console.log('\nDatabase cleaned successfully!');

  } catch (error) {
    console.error('Database fix failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Connection closed');
  }
};

fixDatabase();
