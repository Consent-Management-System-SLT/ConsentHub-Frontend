const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');
    
    // Try multiple connection options
    const connectionOptions = [
      process.env.MONGODB_URI,
      'mongodb+srv://consentuser:12345@consentcluster.ylmrqgl.mongodb.net/consentDB?retryWrites=true&w=majority&appName=ConsentCluster',
      'mongodb+srv://sltuser:Slt_DigitalPlatform2024@cluster0.ylmrqgl.mongodb.net/consentDB?retryWrites=true&w=majority',
      'mongodb://localhost:27017/consentDB'
    ].filter(Boolean);

    let conn = null;
    let lastError = null;

    for (const uri of connectionOptions) {
      try {
        console.log(`Trying connection with URI: ${uri.split('@')[0]}@***`);
        conn = await mongoose.connect(uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 5000,
          connectTimeoutMS: 5000,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database: ${conn.connection.name}`);
        break;
      } catch (error) {
        console.log(`❌ Failed with this URI: ${error.message}`);
        lastError = error;
        continue;
      }
    }

    if (!conn) {
      throw lastError || new Error('All connection attempts failed');
    }
    
    // Handle connection events
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
