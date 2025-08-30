const mongoose = require('mongoose');

// Webhook/Event Listener Schema
const WebhookSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    url: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^https?:\/\/.+/.test(v);
            },
            message: 'URL must be a valid HTTP/HTTPS URL'
        }
    },
    secret: {
        type: String,
        default: () => require('crypto').randomBytes(32).toString('hex')
    },
    events: [{
        type: String,
        required: true,
        enum: [
            'consent.granted',
            'consent.withdrawn', 
            'consent.updated',
            'dsar.created',
            'dsar.updated',
            'dsar.completed',
            'dsar.cancelled',
            'privacy.notice.created',
            'privacy.notice.updated',
            'privacy.notice.acknowledged',
            'user.created',
            'user.updated',
            'user.deleted',
            'preference.updated',
            'audit.log.created',
            'bulk.import.started',
            'bulk.import.completed',
            'bulk.import.failed'
        ]
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    retryAttempts: {
        type: Number,
        default: 3,
        min: 0,
        max: 10
    },
    timeout: {
        type: Number,
        default: 30000, // 30 seconds
        min: 1000,
        max: 120000
    },
    headers: {
        type: Map,
        of: String,
        default: new Map()
    },
    lastTriggered: {
        type: Date
    },
    totalTriggers: {
        type: Number,
        default: 0
    },
    successfulTriggers: {
        type: Number,
        default: 0
    },
    failedTriggers: {
        type: Number,
        default: 0
    },
    lastError: {
        message: String,
        timestamp: Date,
        statusCode: Number
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual fields
WebhookSchema.virtual('successRate').get(function() {
    if (this.totalTriggers === 0) return 0;
    return Math.round((this.successfulTriggers / this.totalTriggers) * 100);
});

WebhookSchema.virtual('status').get(function() {
    if (!this.isActive) return 'inactive';
    if (this.lastError && this.lastError.timestamp && Date.now() - this.lastError.timestamp.getTime() < 300000) { // 5 minutes
        return 'error';
    }
    return 'active';
});

// Instance methods
WebhookSchema.methods.recordSuccess = function() {
    this.lastTriggered = new Date();
    this.totalTriggers += 1;
    this.successfulTriggers += 1;
    this.lastError = undefined;
    return this.save();
};

WebhookSchema.methods.recordFailure = function(error, statusCode = null) {
    this.lastTriggered = new Date();
    this.totalTriggers += 1;
    this.failedTriggers += 1;
    this.lastError = {
        message: error.message || error,
        timestamp: new Date(),
        statusCode: statusCode
    };
    return this.save();
};

WebhookSchema.methods.testConnection = async function() {
    const axios = require('axios');
    try {
        const response = await axios.post(this.url, {
            event: 'webhook.test',
            timestamp: new Date().toISOString(),
            data: { test: true }
        }, {
            timeout: this.timeout,
            headers: {
                'Content-Type': 'application/json',
                'X-Webhook-Secret': this.secret,
                ...Object.fromEntries(this.headers)
            }
        });
        
        await this.recordSuccess();
        return { success: true, statusCode: response.status };
    } catch (error) {
        const statusCode = error.response?.status || null;
        await this.recordFailure(error, statusCode);
        return { 
            success: false, 
            error: error.message,
            statusCode: statusCode
        };
    }
};

// Static methods
WebhookSchema.statics.findByEvent = function(eventType) {
    return this.find({
        events: eventType,
        isActive: true
    });
};

WebhookSchema.statics.getStatistics = async function() {
    const total = await this.countDocuments();
    const active = await this.countDocuments({ isActive: true });
    const inactive = await this.countDocuments({ isActive: false });
    
    const aggregate = await this.aggregate([
        {
            $group: {
                _id: null,
                totalTriggers: { $sum: '$totalTriggers' },
                totalSuccess: { $sum: '$successfulTriggers' },
                totalFailures: { $sum: '$failedTriggers' }
            }
        }
    ]);
    
    const stats = aggregate[0] || { totalTriggers: 0, totalSuccess: 0, totalFailures: 0 };
    
    return {
        total,
        active,
        inactive,
        ...stats,
        successRate: stats.totalTriggers > 0 ? Math.round((stats.totalSuccess / stats.totalTriggers) * 100) : 0
    };
};

// Indexes
WebhookSchema.index({ isActive: 1 });
WebhookSchema.index({ events: 1 });
WebhookSchema.index({ createdBy: 1 });
WebhookSchema.index({ createdAt: -1 });

const Webhook = mongoose.model('Webhook', WebhookSchema);

// Event Log Schema for tracking webhook deliveries
const EventLogSchema = new mongoose.Schema({
    webhookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Webhook',
        required: true
    },
    eventType: {
        type: String,
        required: true
    },
    payload: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    deliveryStatus: {
        type: String,
        enum: ['pending', 'delivered', 'failed', 'retry'],
        default: 'pending'
    },
    responseCode: {
        type: Number
    },
    responseMessage: {
        type: String
    },
    attempts: {
        type: Number,
        default: 0
    },
    maxAttempts: {
        type: Number,
        default: 3
    },
    nextRetry: {
        type: Date
    },
    deliveredAt: {
        type: Date
    },
    error: {
        type: String
    }
}, {
    timestamps: true
});

// TTL index to automatically delete old event logs after 30 days
EventLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });
EventLogSchema.index({ webhookId: 1, createdAt: -1 });
EventLogSchema.index({ deliveryStatus: 1 });

const EventLog = mongoose.model('EventLog', EventLogSchema);

module.exports = { Webhook, EventLog };
