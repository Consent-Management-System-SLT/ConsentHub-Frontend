const express = require('express');
const { PreferenceChannel, PreferenceTopic } = require('./preference-schemas');

// Import the CommunicationPreference model for customer updates
let CommunicationPreference;
try {
    CommunicationPreference = require('./models/CommunicationPreference');
} catch (err) {
    console.log('CommunicationPreference model not found, will operate without customer sync');
}

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

// Function to update customer preferences when admin configuration changes
const updateCustomerPreferences = async (type, item) => {
    if (!CommunicationPreference) return;
    
    try {
        if (type === 'channel_added') {
            // Add new channel to all existing customer preferences
            const updateObject = {};
            updateObject[`preferredChannels.${item.key}`] = item.isDefault;
            
            await CommunicationPreference.updateMany(
                {},
                { $set: updateObject }
            );
            
            console.log(`✅ Updated all customer preferences with new channel: ${item.name}`);
        } else if (type === 'topic_added') {
            // Add new topic to all existing customer preferences
            const updateObject = {};
            updateObject[`topicSubscriptions.${item.key}`] = item.isDefault;
            
            await CommunicationPreference.updateMany(
                {},
                { $set: updateObject }
            );
            
            console.log(`✅ Updated all customer preferences with new topic: ${item.name}`);
        }
    } catch (error) {
        console.error('❌ Failed to update customer preferences:', error);
    }
};

// Standard communication channels that match customer dashboard
const getStandardChannels = () => [
    {
        name: 'Email Notifications',
        key: 'email',
        description: 'Receive notifications via email',
        icon: 'Mail',
        enabled: true,
        isDefault: true
    },
    {
        name: 'SMS Notifications',
        key: 'sms',
        description: 'Receive notifications via SMS',
        icon: 'MessageSquare',
        enabled: true,
        isDefault: false
    },
    {
        name: 'Push Notifications',
        key: 'push',
        description: 'Receive push notifications on your mobile device',
        icon: 'Bell',
        enabled: true,
        isDefault: false
    },
    {
        name: 'In-App Notifications',
        key: 'inapp',
        description: 'Receive notifications within the application',
        icon: 'Bell',
        enabled: true,
        isDefault: false
    }
];

// Standard topic subscriptions that match customer dashboard
const getStandardTopics = () => [
    {
        name: 'Special Offers & Promotions',
        key: 'offers',
        description: 'Promotional offers and discounts',
        category: 'marketing',
        enabled: true,
        isDefault: false,
        priority: 'medium'
    },
    {
        name: 'Product Updates',
        key: 'product_updates',
        description: 'New features and service updates',
        category: 'product',
        enabled: true,
        isDefault: true,
        priority: 'medium'
    },
    {
        name: 'Service Alerts',
        key: 'service_alerts',
        description: 'Important service notifications and outages',
        category: 'service',
        enabled: true,
        isDefault: true,
        priority: 'high'
    },
    {
        name: 'Billing & Payments',
        key: 'billing',
        description: 'Bill notifications and payment reminders',
        category: 'billing',
        enabled: true,
        isDefault: true,
        priority: 'high'
    },
    {
        name: 'Security Alerts',
        key: 'security',
        description: 'Account security and privacy updates',
        category: 'security',
        enabled: true,
        isDefault: true,
        priority: 'high'
    },
    {
        name: 'Newsletters',
        key: 'newsletters',
        description: 'Company news and industry insights',
        category: 'newsletter',
        enabled: true,
        isDefault: false,
        priority: 'low'
    }
];

// ================================
// COMMUNICATION CHANNELS ENDPOINTS  
// ================================

// GET /channels - Get all communication channels
channelRouter.get('/', verifyAdminToken, async (req, res) => {
    try {
        let channels;
        try {
            channels = await PreferenceChannel.find({}).sort({ createdAt: -1 });
            if (!channels || channels.length === 0) {
                channels = getStandardChannels();
            }
        } catch (dbError) {
            console.log('Database not available, using defaults');
            channels = getStandardChannels();
        }
        
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
                message: 'Name and key are required'
            });
        }

        try {
            // Check if channel with this key already exists
            const existingChannel = await PreferenceChannel.findOne({ key });
            if (existingChannel) {
                return res.status(400).json({
                    success: false,
                    message: 'Channel with this key already exists'
                });
            }

            // Create new channel
            const newChannel = new PreferenceChannel({
                name,
                key,
                description: description || '',
                icon: icon || 'Bell',
                enabled: enabled !== false,
                isDefault: isDefault === true
            });

            const savedChannel = await newChannel.save();

            // Update customer preferences with new channel
            await updateCustomerPreferences('channel_added', savedChannel);

            // Emit real-time update via WebSocket
            if (global.io) {
                global.io.emit('preferenceConfigUpdated', {
                    type: 'channel_added',
                    channel: savedChannel
                });
            }

            res.status(201).json({
                success: true,
                message: 'Communication channel created successfully',
                channel: savedChannel
            });
        } catch (dbError) {
            console.error('Database error:', dbError);
            res.status(500).json({
                success: false,
                message: 'Database error occurred'
            });
        }
    } catch (error) {
        console.error('Error creating preference channel:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create communication channel'
        });
    }
});

// PUT /channels/:id - Update communication channel
channelRouter.put('/:id', verifyAdminToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, key, description, icon, enabled, isDefault } = req.body;
        
        try {
            // Check if another channel has the same key (excluding current)
            if (key) {
                const existingChannel = await PreferenceChannel.findOne({ 
                    key, 
                    _id: { $ne: id } 
                });
                if (existingChannel) {
                    return res.status(400).json({
                        success: false,
                        message: 'Another channel with this key already exists'
                    });
                }
            }

            const updatedChannel = await PreferenceChannel.findByIdAndUpdate(
                id,
                {
                    ...(name && { name }),
                    ...(key && { key }),
                    ...(description !== undefined && { description }),
                    ...(icon && { icon }),
                    ...(enabled !== undefined && { enabled }),
                    ...(isDefault !== undefined && { isDefault }),
                    updatedAt: new Date()
                },
                { new: true, runValidators: true }
            );

            if (!updatedChannel) {
                return res.status(404).json({
                    success: false,
                    message: 'Communication channel not found'
                });
            }

            // Emit real-time update via WebSocket
            if (global.io) {
                global.io.emit('preference-config-updated', {
                    type: 'channel',
                    action: enabled === false ? 'disabled' : 'enabled',
                    channel: updatedChannel.name,
                    data: updatedChannel
                });
                console.log('📡 WebSocket notification sent for channel config update');
            }

            // If channel was disabled, optionally update customer preferences
            if (enabled === false && CommunicationPreference) {
                try {
                    console.log(`🔄 Channel "${updatedChannel.name}" disabled - this will be hidden from customer dashboards`);
                    // Note: We don't need to update existing customer preferences since the customer
                    // dashboard will automatically filter out disabled channels from the UI
                } catch (customerUpdateError) {
                    console.error('Error updating customer preferences:', customerUpdateError);
                }
            }

            res.json({
                success: true,
                message: 'Communication channel updated successfully',
                channel: updatedChannel
            });
        } catch (dbError) {
            console.error('Database error:', dbError);
            res.status(500).json({
                success: false,
                message: 'Database error occurred'
            });
        }
    } catch (error) {
        console.error('Error updating preference channel:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update communication channel'
        });
    }
});

// DELETE /channels/:id - Delete communication channel
channelRouter.delete('/:id', verifyAdminToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        try {
            const deletedChannel = await PreferenceChannel.findByIdAndDelete(id);
            
            if (!deletedChannel) {
                return res.status(404).json({
                    success: false,
                    message: 'Communication channel not found'
                });
            }

            // Emit real-time update via WebSocket
            if (global.io) {
                global.io.emit('preferenceConfigUpdated', {
                    type: 'channel_deleted',
                    channelId: id
                });
            }

            res.json({
                success: true,
                message: 'Communication channel deleted successfully',
                deletedChannel
            });
        } catch (dbError) {
            console.error('Database error:', dbError);
            res.status(500).json({
                success: false,
                message: 'Database error occurred'
            });
        }
    } catch (error) {
        console.error('Error deleting preference channel:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete communication channel'
        });
    }
});

// ================================
// TOPIC SUBSCRIPTIONS ENDPOINTS
// ================================

// GET /topics - Get all topic subscriptions
topicRouter.get('/', verifyAdminToken, async (req, res) => {
    try {
        let topics;
        try {
            topics = await PreferenceTopic.find({}).sort({ priority: -1, createdAt: -1 });
            if (!topics || topics.length === 0) {
                topics = getStandardTopics();
            }
        } catch (dbError) {
            console.log('Database not available, using defaults');
            topics = getStandardTopics();
        }
        
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

// POST /topics - Create new topic subscription
topicRouter.post('/', verifyAdminToken, async (req, res) => {
    try {
        const { name, key, description, category, enabled, isDefault, priority } = req.body;
        
        // Validate required fields
        if (!name || !key) {
            return res.status(400).json({
                success: false,
                message: 'Name and key are required'
            });
        }

        try {
            // Check if topic with this key already exists
            const existingTopic = await PreferenceTopic.findOne({ key });
            if (existingTopic) {
                return res.status(400).json({
                    success: false,
                    message: 'Topic with this key already exists'
                });
            }

            // Create new topic
            const newTopic = new PreferenceTopic({
                name,
                key,
                description: description || '',
                category: category || 'general',
                enabled: enabled !== false,
                isDefault: isDefault === true,
                priority: priority || 'medium'
            });

            const savedTopic = await newTopic.save();

            // Update customer preferences with new topic
            await updateCustomerPreferences('topic_added', savedTopic);

            // Emit real-time update via WebSocket
            if (global.io) {
                global.io.emit('preferenceConfigUpdated', {
                    type: 'topic_added',
                    topic: savedTopic
                });
            }

            res.status(201).json({
                success: true,
                message: 'Topic subscription created successfully',
                topic: savedTopic
            });
        } catch (dbError) {
            console.error('Database error:', dbError);
            res.status(500).json({
                success: false,
                message: 'Database error occurred'
            });
        }
    } catch (error) {
        console.error('Error creating preference topic:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create topic subscription'
        });
    }
});

// PUT /topics/:id - Update topic subscription
topicRouter.put('/:id', verifyAdminToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, key, description, category, enabled, isDefault, priority } = req.body;
        
        try {
            // Check if another topic has the same key (excluding current)
            if (key) {
                const existingTopic = await PreferenceTopic.findOne({ 
                    key, 
                    _id: { $ne: id } 
                });
                if (existingTopic) {
                    return res.status(400).json({
                        success: false,
                        message: 'Another topic with this key already exists'
                    });
                }
            }

            const updatedTopic = await PreferenceTopic.findByIdAndUpdate(
                id,
                {
                    ...(name && { name }),
                    ...(key && { key }),
                    ...(description !== undefined && { description }),
                    ...(category && { category }),
                    ...(enabled !== undefined && { enabled }),
                    ...(isDefault !== undefined && { isDefault }),
                    ...(priority && { priority }),
                    updatedAt: new Date()
                },
                { new: true, runValidators: true }
            );

            if (!updatedTopic) {
                return res.status(404).json({
                    success: false,
                    message: 'Topic subscription not found'
                });
            }

            // Emit real-time update via WebSocket
            if (global.io) {
                global.io.emit('preference-config-updated', {
                    type: 'topic',
                    action: enabled === false ? 'disabled' : 'enabled',
                    topic: updatedTopic.name,
                    data: updatedTopic
                });
                console.log('📡 WebSocket notification sent for topic config update');
            }

            // If topic was disabled, log for transparency
            if (enabled === false) {
                console.log(`🔄 Topic "${updatedTopic.name}" disabled - this will be hidden from customer dashboards`);
                // Note: Customer dashboard automatically filters out disabled topics from the UI
            }

            res.json({
                success: true,
                message: 'Topic subscription updated successfully',
                topic: updatedTopic
            });
        } catch (dbError) {
            console.error('Database error:', dbError);
            res.status(500).json({
                success: false,
                message: 'Database error occurred'
            });
        }
    } catch (error) {
        console.error('Error updating preference topic:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update topic subscription'
        });
    }
});

// DELETE /topics/:id - Delete topic subscription
topicRouter.delete('/:id', verifyAdminToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        try {
            const deletedTopic = await PreferenceTopic.findByIdAndDelete(id);
            
            if (!deletedTopic) {
                return res.status(404).json({
                    success: false,
                    message: 'Topic subscription not found'
                });
            }

            // Emit real-time update via WebSocket
            if (global.io) {
                global.io.emit('preferenceConfigUpdated', {
                    type: 'topic_deleted',
                    topicId: id
                });
            }

            res.json({
                success: true,
                message: 'Topic subscription deleted successfully',
                deletedTopic
            });
        } catch (dbError) {
            console.error('Database error:', dbError);
            res.status(500).json({
                success: false,
                message: 'Database error occurred'
            });
        }
    } catch (error) {
        console.error('Error deleting preference topic:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete topic subscription'
        });
    }
});

// ================================
// CUSTOMER CONFIGURATION ENDPOINT
// ================================

// GET /config - Get current preference configuration for customer UI
customerConfigRouter.get('/', async (req, res) => {
    try {
        let channels, topics;
        
        try {
            // Get enabled channels and topics from database
            channels = await PreferenceChannel.find({ enabled: true }).sort({ createdAt: 1 });
            topics = await PreferenceTopic.find({ enabled: true }).sort({ priority: -1, category: 1 });
            
            // Fallback to defaults if database is empty
            if (!channels || channels.length === 0) {
                channels = getDefaultChannels().filter(c => c.enabled);
            }
            if (!topics || topics.length === 0) {
                topics = getStandardTopics().filter(t => t.enabled);
            }
        } catch (dbError) {
            console.log('Database not available, using defaults');
            channels = getStandardChannels().filter(c => c.enabled);
            topics = getStandardTopics().filter(t => t.enabled);
        }
        
        res.json({
            success: true,
            config: {
                communicationChannels: channels,
                topicSubscriptions: topics,
                lastUpdated: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error fetching customer preference config:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch preference configuration',
            config: {
                communicationChannels: getStandardChannels().filter(c => c.enabled),
                topicSubscriptions: getStandardTopics().filter(t => t.enabled),
                lastUpdated: new Date().toISOString()
            }
        });
    }
});

// POST /admin/initialize-standard-preferences - Initialize system with standard channels and topics
channelRouter.post('/initialize-standard', verifyAdminToken, async (req, res) => {
    try {
        let addedChannels = [];
        let addedTopics = [];
        let skippedChannels = [];
        let skippedTopics = [];

        // Add standard channels
        for (const channelData of getStandardChannels()) {
            try {
                // Check if channel already exists
                const existingChannel = await PreferenceChannel.findOne({ key: channelData.key });
                if (existingChannel) {
                    skippedChannels.push(channelData.name);
                    continue;
                }

                const newChannel = new PreferenceChannel(channelData);
                const savedChannel = await newChannel.save();
                addedChannels.push(savedChannel.name);

                // Update customer preferences
                await updateCustomerPreferences('channel_added', savedChannel);
            } catch (dbError) {
                console.error(`Error adding channel ${channelData.name}:`, dbError);
            }
        }

        // Add standard topics
        for (const topicData of getStandardTopics()) {
            try {
                // Check if topic already exists
                const existingTopic = await PreferenceTopic.findOne({ key: topicData.key });
                if (existingTopic) {
                    skippedTopics.push(topicData.name);
                    continue;
                }

                const newTopic = new PreferenceTopic(topicData);
                const savedTopic = await newTopic.save();
                addedTopics.push(savedTopic.name);

                // Update customer preferences
                await updateCustomerPreferences('topic_added', savedTopic);
            } catch (dbError) {
                console.error(`Error adding topic ${topicData.name}:`, dbError);
            }
        }

        res.json({
            success: true,
            message: 'Standard preferences initialization completed',
            results: {
                channelsAdded: addedChannels,
                topicsAdded: addedTopics,
                channelsSkipped: skippedChannels,
                topicsSkipped: skippedTopics,
                totalAdded: addedChannels.length + addedTopics.length,
                totalSkipped: skippedChannels.length + skippedTopics.length
            }
        });

        // Emit real-time update
        if (global.io) {
            global.io.emit('preferenceConfigUpdated', {
                type: 'bulk_initialization',
                channelsAdded: addedChannels.length,
                topicsAdded: addedTopics.length
            });
        }
    } catch (error) {
        console.error('Error initializing standard preferences:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to initialize standard preferences'
        });
    }
});

// Export the routers
module.exports = {
    channelRouter,
    topicRouter,
    customerConfigRouter
};
