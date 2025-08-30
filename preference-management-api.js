const express = require('express');
const { PreferenceChannel, PreferenceTopic } = require('./preference-schemas');

// Create router instances
const channelRouter = express.Router();
const topicRouter = express.Router();
const customerConfigRouter = express.Router();

// Middleware for admin authentication (placeholder - integrate with your auth system)
const verifyAdminToken = (req, res, next) => {
    // In production, implement proper JWT token verification
    // For now, we'll skip authentication for development
    next();
};

// ================================
// COMMUNICATION CHANNELS ENDPOINTS  
// ================================

// GET /channels - Get all communication channels
channelRouter.get('/', verifyAdminToken, async (req, res) => {
  try {
    // Get from database or return defaults
    const channels = await PreferenceChannel.find({}) || getDefaultChannels();
    
    res.json({
      success: true,
      channels: channels,
      count: channels.length
    });
  } catch (error) {
    console.error('Error fetching preference channels:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch communication channels'
    });
  }
});

// POST /channels - Create new communication channel
channelRouter.post('/', verifyAdminToken, async (req, res) => {
  try {
    const { name, key, description, icon, enabled, isDefault } = req.body;
    
    // Validate required fields
    if (!name || !key) {
      return res.status(400).json({
        success: false,
        message: 'Channel name and key are required'
      });
    }
    
    // Check if key already exists
    const existingChannel = await PreferenceChannel.findOne({ key });
    if (existingChannel) {
      return res.status(400).json({
        success: false,
        message: 'Channel key already exists'
      });
    }
    
    const newChannel = new PreferenceChannel({
      name,
      key,
      description: description || '',
      icon: icon || 'MessageSquare',
      enabled: enabled !== undefined ? enabled : true,
      isDefault: isDefault || false,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.id
    });
    
    await newChannel.save();
    
    // Emit real-time update
    io.emit('preference-channel-added', {
      channel: newChannel,
      timestamp: new Date(),
      adminUser: req.user.email
    });
    
    res.status(201).json({
      success: true,
      channel: newChannel,
      message: 'Communication channel created successfully'
    });
  } catch (error) {
    console.error('Error creating preference channel:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create communication channel'
    });
  }
});

// DELETE /api/v1/admin/preference-channels/:id
app.delete('/api/v1/admin/preference-channels/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const channel = await PreferenceChannel.findByIdAndDelete(id);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Communication channel not found'
      });
    }
    
    // Emit real-time update
    io.emit('preference-channel-deleted', {
      channelId: id,
      channelName: channel.name,
      timestamp: new Date(),
      adminUser: req.user.email
    });
    
    res.json({
      success: true,
      message: 'Communication channel deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting preference channel:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete communication channel'
    });
  }
});

// PUT /api/v1/admin/preference-channels/:id
app.put('/api/v1/admin/preference-channels/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, enabled, isDefault } = req.body;
    
    const channel = await PreferenceChannel.findByIdAndUpdate(
      id,
      {
        name,
        description,
        icon,
        enabled,
        isDefault,
        updatedAt: new Date(),
        updatedBy: req.user.id
      },
      { new: true }
    );
    
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Communication channel not found'
      });
    }
    
    // Emit real-time update
    io.emit('preference-channel-updated', {
      channel: channel,
      timestamp: new Date(),
      adminUser: req.user.email
    });
    
    res.json({
      success: true,
      channel: channel,
      message: 'Communication channel updated successfully'
    });
  } catch (error) {
    console.error('Error updating preference channel:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update communication channel'
    });
  }
});

// GET /api/v1/admin/preference-topics
app.get('/api/v1/admin/preference-topics', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const topics = await PreferenceTopic.find({}) || getDefaultTopics();
    
    res.json({
      success: true,
      topics: topics,
      count: topics.length
    });
  } catch (error) {
    console.error('Error fetching preference topics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch topic subscriptions'
    });
  }
});

// POST /api/v1/admin/preference-topics
app.post('/api/v1/admin/preference-topics', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { name, key, description, category, enabled, isDefault, priority } = req.body;
    
    if (!name || !key) {
      return res.status(400).json({
        success: false,
        message: 'Topic name and key are required'
      });
    }
    
    const existingTopic = await PreferenceTopic.findOne({ key });
    if (existingTopic) {
      return res.status(400).json({
        success: false,
        message: 'Topic key already exists'
      });
    }
    
    const newTopic = new PreferenceTopic({
      name,
      key,
      description: description || '',
      category: category || 'marketing',
      enabled: enabled !== undefined ? enabled : true,
      isDefault: isDefault || false,
      priority: priority || 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.id
    });
    
    await newTopic.save();
    
    // Emit real-time update
    io.emit('preference-topic-added', {
      topic: newTopic,
      timestamp: new Date(),
      adminUser: req.user.email
    });
    
    res.status(201).json({
      success: true,
      topic: newTopic,
      message: 'Topic subscription created successfully'
    });
  } catch (error) {
    console.error('Error creating preference topic:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create topic subscription'
    });
  }
});

// DELETE /api/v1/admin/preference-topics/:id
app.delete('/api/v1/admin/preference-topics/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const topic = await PreferenceTopic.findByIdAndDelete(id);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic subscription not found'
      });
    }
    
    // Emit real-time update
    io.emit('preference-topic-deleted', {
      topicId: id,
      topicName: topic.name,
      timestamp: new Date(),
      adminUser: req.user.email
    });
    
    res.json({
      success: true,
      message: 'Topic subscription deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting preference topic:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete topic subscription'
    });
  }
});

// PUT /api/v1/admin/preference-topics/:id
app.put('/api/v1/admin/preference-topics/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, enabled, isDefault, priority } = req.body;
    
    const topic = await PreferenceTopic.findByIdAndUpdate(
      id,
      {
        name,
        description,
        category,
        enabled,
        isDefault,
        priority,
        updatedAt: new Date(),
        updatedBy: req.user.id
      },
      { new: true }
    );
    
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic subscription not found'
      });
    }
    
    // Emit real-time update
    io.emit('preference-topic-updated', {
      topic: topic,
      timestamp: new Date(),
      adminUser: req.user.email
    });
    
    res.json({
      success: true,
      topic: topic,
      message: 'Topic subscription updated successfully'
    });
  } catch (error) {
    console.error('Error updating preference topic:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update topic subscription'
    });
  }
});

// GET /api/v1/customer/preference-config
// This endpoint provides the current configuration to customer preference pages
app.get('/api/v1/customer/preference-config', authenticateToken, async (req, res) => {
  try {
    const [channels, topics] = await Promise.all([
      PreferenceChannel.find({ enabled: true }).sort({ name: 1 }),
      PreferenceTopic.find({ enabled: true }).sort({ category: 1, name: 1 })
    ]);
    
    res.json({
      success: true,
      config: {
        channels: channels || getDefaultChannels().filter(c => c.enabled),
        topics: topics || getDefaultTopics().filter(t => t.enabled),
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    console.error('Error fetching preference config:', error);
    res.json({
      success: true,
      config: {
        channels: getDefaultChannels().filter(c => c.enabled),
        topics: getDefaultTopics().filter(t => t.enabled),
        lastUpdated: new Date()
      }
    });
  }
});

// Helper functions for default data
function getDefaultChannels() {
  return [
    {
      id: '1',
      name: 'Email Notifications',
      key: 'email',
      description: 'Receive notifications via email',
      icon: 'Mail',
      enabled: true,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'SMS Notifications',
      key: 'sms',
      description: 'Receive notifications via SMS',
      icon: 'MessageSquare',
      enabled: true,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Push Notifications',
      key: 'push',
      description: 'Receive push notifications on your mobile device',
      icon: 'Bell',
      enabled: true,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '4',
      name: 'In-App Notifications',
      key: 'inapp',
      description: 'Receive notifications within the application',
      icon: 'Monitor',
      enabled: true,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}

function getDefaultTopics() {
  return [
    {
      id: '1',
      name: 'Special Offers & Promotions',
      key: 'promotions',
      description: 'Promotional offers and discounts',
      category: 'marketing',
      enabled: true,
      isDefault: false,
      priority: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Product Updates',
      key: 'product_updates',
      description: 'New features and service updates',
      category: 'product',
      enabled: true,
      isDefault: true,
      priority: 'high',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Service Alerts',
      key: 'service_alerts',
      description: 'Important service notifications and outages',
      category: 'service',
      enabled: true,
      isDefault: true,
      priority: 'high',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Billing & Payments',
      key: 'billing',
      description: 'Bill notifications and payment reminders',
      category: 'billing',
      enabled: true,
      isDefault: true,
      priority: 'high',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '5',
      name: 'Security Alerts',
      key: 'security',
      description: 'Account security and privacy updates',
      category: 'security',
      enabled: true,
      isDefault: true,
      priority: 'high',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '6',
      name: 'Newsletters',
      key: 'newsletters',
      description: 'Company news and industry insights',
      category: 'marketing',
      enabled: true,
      isDefault: false,
      priority: 'low',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}
