// MongoDB schemas for preference management
// Add these to your comprehensive-backend.js or separate schema file

const mongoose = require('mongoose');

// Communication Channel Schema
const preferenceChannelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  key: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'MessageSquare'
  },
  enabled: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Topic Subscription Schema
const preferenceTopicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  key: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true,
    enum: ['marketing', 'product', 'service', 'billing', 'security', 'support'],
    default: 'marketing'
  },
  enabled: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better performance
preferenceChannelSchema.index({ key: 1 });
preferenceChannelSchema.index({ enabled: 1 });
preferenceChannelSchema.index({ createdAt: -1 });

preferenceTopicSchema.index({ key: 1 });
preferenceTopicSchema.index({ category: 1 });
preferenceTopicSchema.index({ enabled: 1 });
preferenceTopicSchema.index({ priority: 1 });
preferenceTopicSchema.index({ createdAt: -1 });

// Export models
const PreferenceChannel = mongoose.model('PreferenceChannel', preferenceChannelSchema);
const PreferenceTopic = mongoose.model('PreferenceTopic', preferenceTopicSchema);

module.exports = {
  PreferenceChannel,
  PreferenceTopic
};
