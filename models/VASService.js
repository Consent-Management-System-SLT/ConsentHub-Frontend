const mongoose = require('mongoose');

// VAS Service Schema - for managing Value Added Services that can be offered to customers
const vasServiceSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    required: true,
    enum: ['entertainment', 'security', 'healthcare', 'cloud', 'connectivity'],
    index: true
  },
  provider: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  price: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  priceNumeric: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'LKR',
    enum: ['LKR', 'USD', 'EUR']
  },
  features: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  benefits: [{
    type: String,
    trim: true,
    maxlength: 100
  }],
  popularity: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'deprecated'],
    default: 'active',
    index: true
  },
  totalSubscribers: {
    type: Number,
    default: 0,
    min: 0
  },
  monthlyRevenue: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Admin tracking
  createdBy: {
    userId: String,
    userEmail: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  updatedBy: {
    userId: String,
    userEmail: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  
  // Additional metadata
  tags: [String],
  targetAudience: String,
  minAge: Number,
  maxAge: Number,
  termsUrl: String,
  supportUrl: String,
  
  // Analytics
  analytics: {
    views: { type: Number, default: 0 },
    subscriptions: { type: Number, default: 0 },
    unsubscriptions: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    lastAnalyticsUpdate: Date
  }
}, {
  timestamps: true,
  collection: 'vas_services'
});

// Indexes for performance
vasServiceSchema.index({ name: 1 });
vasServiceSchema.index({ category: 1, status: 1 });
vasServiceSchema.index({ popularity: -1 });
vasServiceSchema.index({ createdAt: -1 });
vasServiceSchema.index({ updatedAt: -1 });

// Virtual for formatted price
vasServiceSchema.virtual('formattedPrice').get(function() {
  return `${this.currency} ${this.priceNumeric}/month`;
});

// Static method to get all active services
vasServiceSchema.statics.getActiveServices = async function() {
  try {
    return await this.find({ status: 'active' }).sort({ popularity: -1, createdAt: -1 });
  } catch (error) {
    console.error('Error fetching active VAS services:', error);
    throw error;
  }
};

// Static method to get services by category
vasServiceSchema.statics.getServicesByCategory = async function(category) {
  try {
    return await this.find({ 
      category: category, 
      status: 'active' 
    }).sort({ popularity: -1 });
  } catch (error) {
    console.error(`Error fetching VAS services for category ${category}:`, error);
    throw error;
  }
};

// Static method to search services
vasServiceSchema.statics.searchServices = async function(searchTerm, filters = {}) {
  try {
    const query = {};
    
    // Add search term
    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { provider: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } }
      ];
    }
    
    // Add filters
    if (filters.category) query.category = filters.category;
    if (filters.status) query.status = filters.status;
    if (filters.provider) query.provider = filters.provider;
    if (filters.minPrice) query.priceNumeric = { $gte: filters.minPrice };
    if (filters.maxPrice) {
      query.priceNumeric = query.priceNumeric || {};
      query.priceNumeric.$lte = filters.maxPrice;
    }
    
    return await this.find(query).sort({ popularity: -1, createdAt: -1 });
  } catch (error) {
    console.error('Error searching VAS services:', error);
    throw error;
  }
};

// Method to update subscriber count and revenue
vasServiceSchema.methods.updateMetrics = async function() {
  try {
    // This would be called when subscriptions change
    // For now, we'll implement basic metrics
    this.analytics.lastAnalyticsUpdate = new Date();
    return await this.save();
  } catch (error) {
    console.error('Error updating VAS service metrics:', error);
    throw error;
  }
};

// Pre-save middleware to extract numeric price
vasServiceSchema.pre('save', function(next) {
  if (this.isModified('price')) {
    // Extract numeric value from price string (e.g., "LKR 299/month" -> 299)
    const priceMatch = this.price.match(/(\d+(?:\.\d+)?)/);
    if (priceMatch) {
      this.priceNumeric = parseFloat(priceMatch[1]);
    }
  }
  
  // Update the updatedBy timestamp
  if (this.isModified() && !this.isNew) {
    this.updatedBy.timestamp = new Date();
  }
  
  next();
});

// Pre-remove middleware to handle cascading deletes
vasServiceSchema.pre('remove', async function(next) {
  try {
    // When a service is deleted, we should handle existing subscriptions
    // For now, we'll just log a warning
    console.warn(`VAS Service ${this.name} (${this.id}) is being deleted. Consider handling existing subscriptions.`);
    next();
  } catch (error) {
    next(error);
  }
});

const VASService = mongoose.model('VASService', vasServiceSchema);

module.exports = VASService;
