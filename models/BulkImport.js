const mongoose = require('mongoose');

const bulkImportSchema = new mongoose.Schema({
  // Import identification
  importId: {
    type: String,
    required: true,
    unique: true,
    default: () => `IMP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  },
  
  // File information
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  
  // Import metadata
  importType: {
    type: String,
    required: true,
    enum: ['customers', 'consents', 'preferences', 'users', 'mixed'],
    default: 'mixed'
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  
  // Processing statistics
  recordsTotal: {
    type: Number,
    default: 0
  },
  recordsProcessed: {
    type: Number,
    default: 0
  },
  recordsSuccessful: {
    type: Number,
    default: 0
  },
  recordsSkipped: {
    type: Number,
    default: 0
  },
  recordsFailed: {
    type: Number,
    default: 0
  },
  
  // Error tracking
  errors: [{
    row: Number,
    field: String,
    value: String,
    message: String,
    severity: {
      type: String,
      enum: ['warning', 'error', 'critical'],
      default: 'error'
    }
  }],
  
  // Processing details
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  processingTime: {
    type: Number // in milliseconds
  },
  
  // User information
  uploadedBy: {
    userId: String,
    userName: String,
    userEmail: String,
    userRole: String
  },
  
  // File validation results
  validation: {
    hasHeaders: {
      type: Boolean,
      default: true
    },
    expectedColumns: [String],
    actualColumns: [String],
    missingColumns: [String],
    extraColumns: [String],
    encoding: String,
    delimiter: String
  },
  
  // Data mapping configuration
  columnMapping: {
    type: Map,
    of: String
  },
  
  // Import configuration
  options: {
    skipDuplicates: {
      type: Boolean,
      default: true
    },
    updateExisting: {
      type: Boolean,
      default: false
    },
    validateOnly: {
      type: Boolean,
      default: false
    },
    batchSize: {
      type: Number,
      default: 100
    }
  },
  
  // Results summary
  summary: {
    customersCreated: { type: Number, default: 0 },
    customersUpdated: { type: Number, default: 0 },
    consentsCreated: { type: Number, default: 0 },
    consentsUpdated: { type: Number, default: 0 },
    preferencesCreated: { type: Number, default: 0 },
    preferencesUpdated: { type: Number, default: 0 },
    usersCreated: { type: Number, default: 0 },
    usersUpdated: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Indexes for performance
bulkImportSchema.index({ importId: 1 });
bulkImportSchema.index({ status: 1 });
bulkImportSchema.index({ 'uploadedBy.userId': 1 });
bulkImportSchema.index({ createdAt: -1 });
bulkImportSchema.index({ importType: 1 });

// TTL index to automatically delete old imports after 90 days
bulkImportSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Virtual for progress percentage
bulkImportSchema.virtual('progressPercentage').get(function() {
  if (this.recordsTotal === 0) return 0;
  return Math.round((this.recordsProcessed / this.recordsTotal) * 100);
});

// Virtual for error count
bulkImportSchema.virtual('errorCount').get(function() {
  return this.errors ? this.errors.length : 0;
});

// Virtual for success rate
bulkImportSchema.virtual('successRate').get(function() {
  if (this.recordsProcessed === 0) return 0;
  return Math.round((this.recordsSuccessful / this.recordsProcessed) * 100);
});

// Method to add error
bulkImportSchema.methods.addError = function(row, field, value, message, severity = 'error') {
  this.errors.push({
    row,
    field,
    value: value ? value.toString().substring(0, 100) : '', // Limit value length
    message,
    severity
  });
  this.recordsFailed++;
};

// Method to update progress
bulkImportSchema.methods.updateProgress = function(processed, successful = 0, skipped = 0) {
  this.recordsProcessed = processed;
  this.recordsSuccessful += successful;
  this.recordsSkipped += skipped;
};

// Method to complete import
bulkImportSchema.methods.completeImport = function(status = 'completed') {
  this.status = status;
  this.completedAt = new Date();
  if (this.startedAt) {
    this.processingTime = this.completedAt - this.startedAt;
  }
};

// Static method to get import statistics
bulkImportSchema.statics.getImportStats = async function(userId = null, timeframe = 30) {
  const matchStage = {
    createdAt: { 
      $gte: new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000) 
    }
  };
  
  if (userId) {
    matchStage['uploadedBy.userId'] = userId;
  }

  return await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalImports: { $sum: 1 },
        completedImports: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        failedImports: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        totalRecordsProcessed: { $sum: '$recordsProcessed' },
        totalRecordsSuccessful: { $sum: '$recordsSuccessful' },
        totalErrors: { $sum: { $size: '$errors' } },
        avgProcessingTime: { $avg: '$processingTime' }
      }
    }
  ]);
};

module.exports = mongoose.model('BulkImport', bulkImportSchema);
