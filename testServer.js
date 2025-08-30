const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const MONGODB_URI = 'mongodb+srv://consentuser:12345@consentcluster.ylmrqgl.mongodb.net/consentDB?retryWrites=true&w=majority&appName=ConsentCluster';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Simple webhook schema without virtuals
const simpleWebhookSchema = new mongoose.Schema({
  name: String,
  url: String,
  isActive: Boolean,
  events: [String],
  totalTriggers: { type: Number, default: 0 }
}, { timestamps: true });

const SimpleWebhook = mongoose.model('SimpleWebhook', simpleWebhookSchema);

// Test endpoint
app.get('/test/webhooks', async (req, res) => {
  try {
    console.log('🔍 Testing simple webhook query...');
    
    // First try to find existing webhooks collection
    const webhooks = await mongoose.connection.db.collection('webhooks').find({}).toArray();
    console.log(`Found ${webhooks.length} webhooks in collection`);
    
    if (webhooks.length > 0) {
      console.log('Sample webhook:', JSON.stringify(webhooks[0], null, 2));
    }
    
    res.json({
      success: true,
      count: webhooks.length,
      data: webhooks.slice(0, 3) // Return first 3 for testing
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(3002, () => {
  console.log('🧪 Test server running on http://localhost:3002');
  console.log('📋 Test endpoint: GET /test/webhooks');
});
