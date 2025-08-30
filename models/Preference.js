const mongoose = require('mongoose');

// Preference Category Schema
const preferenceCategorySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'Settings'
  },
  enabled: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'preference_categories'
});

// Preference Item Schema
const preferenceItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  categoryId: {
    type: String,
    required: true,
    ref: 'PreferenceCategory'
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['boolean', 'string', 'number', 'array', 'object', 'enum'],
    required: true
  },
  required: {
    type: Boolean,
    default: false
  },
  defaultValue: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  options: [{
    type: String
  }],
  validation: {
    min: Number,
    max: Number,
    pattern: String,
    maxLength: Number,
    minLength: Number
  },
  enabled: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0
  },
  users: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'preference_items'
});

// User Preference Schema
const userPreferenceSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  partyId: {
    type: String,
    required: true,
    index: true
  },
  preferenceId: {
    type: String,
    required: true,
    ref: 'PreferenceItem'
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  source: {
    type: String,
    enum: ['user', 'admin', 'system', 'consent', 'bulk'],
    default: 'user'
  },
  expiresAt: {
    type: Date
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  collection: 'user_preferences'
});

// Preference Template Schema
const preferenceTemplateSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  categoryId: {
    type: String,
    required: true,
    ref: 'PreferenceCategory'
  },
  settings: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  applicableUserTypes: [{
    type: String,
    enum: ['customer', 'admin', 'csr', 'all']
  }],
  enabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'preference_templates'
});

// Preference Audit Schema
const preferenceAuditSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  partyId: {
    type: String,
    required: true
  },
  preferenceId: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: ['create', 'update', 'delete', 'bulk_update', 'template_apply'],
    required: true
  },
  oldValue: {
    type: mongoose.Schema.Types.Mixed
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed
  },
  source: {
    type: String,
    required: true
  },
  performedBy: {
    type: String,
    required: true
  },
  reason: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  collection: 'preference_audits'
});

// Indexes for performance
userPreferenceSchema.index({ partyId: 1, preferenceId: 1 }, { unique: true });
userPreferenceSchema.index({ userId: 1 });
userPreferenceSchema.index({ createdAt: 1 });
preferenceAuditSchema.index({ partyId: 1, createdAt: -1 });
preferenceAuditSchema.index({ performedBy: 1, createdAt: -1 });

// Create models
const PreferenceCategory = mongoose.model('PreferenceCategory', preferenceCategorySchema);
const PreferenceItem = mongoose.model('PreferenceItem', preferenceItemSchema);
const UserPreference = mongoose.model('UserPreference', userPreferenceSchema);
const PreferenceTemplate = mongoose.model('PreferenceTemplate', preferenceTemplateSchema);
const PreferenceAudit = mongoose.model('PreferenceAudit', preferenceAuditSchema);

module.exports = {
  PreferenceCategory,
  PreferenceItem,
  UserPreference,
  PreferenceTemplate,
  PreferenceAudit
};
