const mongoose = require('mongoose');

// Communication Preference Schema - for customer communication settings
const communicationPreferenceSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  partyId: {
    type: String,
    required: true,
    ref: 'Party'
  },
  preferredChannels: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      email: true,
      sms: false,
      phone: false,
      push: true,
      mail: false
    }
  },
  topicSubscriptions: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      marketing: false,
      promotions: false,
      serviceUpdates: true,
      billing: true,
      security: true,
      newsletter: false,
      surveys: false
    }
  },
  quietHours: {
    enabled: {
      type: Boolean,
      default: false
    },
    start: {
      type: String,
      default: '22:00'
    },
    end: {
      type: String,
      default: '08:00'
    }
  },
  frequency: {
    type: String,
    enum: ['immediate', 'hourly', 'daily', 'weekly', 'monthly', 'quarterly'],
    default: 'immediate'
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  language: {
    type: String,
    default: 'en'
  },
  blockedPeriods: [{
    start: Date,
    end: Date,
    reason: String
  }],
  customPreferences: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  updatedBy: {
    type: String,
    default: 'system'
  }
}, {
  timestamps: true,
  versionKey: false,
  collection: 'communication_preferences'
});

// Indexes for better performance
communicationPreferenceSchema.index({ partyId: 1 });
communicationPreferenceSchema.index({ 'topicSubscriptions.marketing': 1 });
communicationPreferenceSchema.index({ 'topicSubscriptions.promotions': 1 });
communicationPreferenceSchema.index({ frequency: 1 });
communicationPreferenceSchema.index({ updatedAt: -1 });

// Ensure virtual fields are serialized
communicationPreferenceSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('CommunicationPreference', communicationPreferenceSchema);
