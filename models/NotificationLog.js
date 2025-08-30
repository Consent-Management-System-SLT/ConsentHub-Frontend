const mongoose = require('mongoose');

const NotificationLogSchema = new mongoose.Schema({
  // Customer Information
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: false
  },
  customerPhone: {
    type: String,
    required: false
  },

  // Notification Content
  subject: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 5000
  },
  messageType: {
    type: String,
    required: true,
    enum: ['informational', 'promotional', 'alert', 'survey'],
    default: 'informational'
  },

  // Channel Information
  channel: {
    type: String,
    required: true,
    enum: ['email', 'sms', 'push', 'inapp'],
    index: true
  },
  
  // Delivery Information
  status: {
    type: String,
    required: true,
    enum: ['pending', 'sent', 'delivered', 'failed', 'bounced'],
    default: 'pending',
    index: true
  },
  messageId: {
    type: String,
    required: false,
    unique: true,
    sparse: true
  },
  
  // Timestamps
  sentAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  deliveredAt: {
    type: Date,
    required: false
  },
  openedAt: {
    type: Date,
    required: false
  },
  clickedAt: {
    type: Date,
    required: false
  },

  // Delivery Details
  deliveryDetails: {
    to: String,
    messageId: String,
    response: mongoose.Schema.Types.Mixed,
    error: String,
    retryCount: {
      type: Number,
      default: 0
    },
    lastRetryAt: Date
  },

  // CSR Information
  csrId: {
    type: String,
    required: true,
    index: true
  },
  csrName: {
    type: String,
    required: true
  },

  // Campaign Information (optional)
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: false,
    index: true
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NotificationTemplate',
    required: false
  },

  // Analytics
  analytics: {
    opened: {
      type: Boolean,
      default: false
    },
    clicked: {
      type: Boolean,
      default: false
    },
    bounced: {
      type: Boolean,
      default: false
    },
    unsubscribed: {
      type: Boolean,
      default: false
    }
  },

  // Metadata
  metadata: {
    userAgent: String,
    ipAddress: String,
    deviceInfo: String,
    location: String,
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    }
  }
}, {
  timestamps: true,
  collection: 'notification_logs'
});

// Indexes for performance
NotificationLogSchema.index({ customerId: 1, sentAt: -1 });
NotificationLogSchema.index({ channel: 1, status: 1 });
NotificationLogSchema.index({ csrId: 1, sentAt: -1 });
NotificationLogSchema.index({ campaignId: 1, sentAt: -1 });
NotificationLogSchema.index({ messageType: 1, sentAt: -1 });
NotificationLogSchema.index({ 'analytics.opened': 1, sentAt: -1 });

// Virtual for delivery rate calculation
NotificationLogSchema.virtual('deliveryDuration').get(function() {
  if (this.deliveredAt && this.sentAt) {
    return this.deliveredAt - this.sentAt;
  }
  return null;
});

// Static method to get analytics
NotificationLogSchema.statics.getAnalytics = async function(filters = {}) {
  try {
    const pipeline = [];
    
    // Match stage
    if (Object.keys(filters).length > 0) {
      pipeline.push({ $match: filters });
    }

    // Overall stats
    const overallStats = await this.aggregate([
      ...pipeline,
      {
        $group: {
          _id: null,
          totalSent: { $sum: 1 },
          totalDelivered: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          totalOpened: {
            $sum: { $cond: ['$analytics.opened', 1, 0] }
          },
          totalClicked: {
            $sum: { $cond: ['$analytics.clicked', 1, 0] }
          },
          totalFailed: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          }
        }
      }
    ]);

    // Channel performance
    const channelStats = await this.aggregate([
      ...pipeline,
      {
        $group: {
          _id: '$channel',
          sent: { $sum: 1 },
          delivered: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          opened: {
            $sum: { $cond: ['$analytics.opened', 1, 0] }
          },
          clicked: {
            $sum: { $cond: ['$analytics.clicked', 1, 0] }
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          }
        }
      }
    ]);

    // Daily trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const trends = await this.aggregate([
      ...pipeline,
      { $match: { sentAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$sentAt' }
          },
          sent: { $sum: 1 },
          delivered: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          opened: {
            $sum: { $cond: ['$analytics.opened', 1, 0] }
          },
          clicked: {
            $sum: { $cond: ['$analytics.clicked', 1, 0] }
          }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Process results
    const overall = overallStats[0] || {
      totalSent: 0,
      totalDelivered: 0,
      totalOpened: 0,
      totalClicked: 0,
      totalFailed: 0
    };

    const channels = {};
    channelStats.forEach(stat => {
      channels[stat._id] = {
        sent: stat.sent,
        delivered: stat.delivered,
        deliveryRate: stat.sent > 0 ? ((stat.delivered / stat.sent) * 100).toFixed(1) : 0,
        opened: stat.opened,
        openRate: stat.delivered > 0 ? ((stat.opened / stat.delivered) * 100).toFixed(1) : 0,
        clicked: stat.clicked,
        clickRate: stat.opened > 0 ? ((stat.clicked / stat.opened) * 100).toFixed(1) : 0,
        failed: stat.failed
      };
    });

    return {
      overview: {
        ...overall,
        deliveryRate: overall.totalSent > 0 ? 
          ((overall.totalDelivered / overall.totalSent) * 100).toFixed(1) : 0,
        openRate: overall.totalDelivered > 0 ? 
          ((overall.totalOpened / overall.totalDelivered) * 100).toFixed(1) : 0,
        clickRate: overall.totalOpened > 0 ? 
          ((overall.totalClicked / overall.totalOpened) * 100).toFixed(1) : 0
      },
      channels,
      trends: trends.map(trend => ({
        date: trend._id,
        sent: trend.sent,
        delivered: trend.delivered,
        opened: trend.opened,
        clicked: trend.clicked
      })),
      topPerformers: {
        templates: [],
        campaigns: []
      }
    };
  } catch (error) {
    console.error('Error calculating analytics:', error);
    throw error;
  }
};

// Instance method to mark as opened
NotificationLogSchema.methods.markAsOpened = function() {
  this.analytics.opened = true;
  this.openedAt = new Date();
  return this.save();
};

// Instance method to mark as clicked
NotificationLogSchema.methods.markAsClicked = function() {
  this.analytics.clicked = true;
  this.clickedAt = new Date();
  return this.save();
};

// Pre-save middleware
NotificationLogSchema.pre('save', function(next) {
  if (this.isNew) {
    // Auto-generate messageId if not provided
    if (!this.messageId) {
      this.messageId = `${this.channel}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }
  next();
});

// Post-save middleware for logging
NotificationLogSchema.post('save', function(doc, next) {
  console.log(`📝 NotificationLog saved: ${doc.channel} to ${doc.customerName} (${doc.status})`);
  next();
});

module.exports = mongoose.model('NotificationLog', NotificationLogSchema);
