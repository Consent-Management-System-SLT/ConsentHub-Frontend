const mongoose = require('mongoose');

// VAS Subscription Schema - for customer Value Added Service subscriptions
const vasSubscriptionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  customerId: {
    type: String,
    required: true,
    index: true
  },
  customerEmail: {
    type: String,
    required: true,
    index: true
  },
  serviceId: {
    type: String,
    required: true,
    index: true
  },
  serviceName: {
    type: String,
    required: true
  },
  isSubscribed: {
    type: Boolean,
    required: true,
    default: false // All services start unsubscribed
  },
  
  // Subscription History
  subscriptionHistory: [{
    action: {
      type: String,
      enum: ['subscribe', 'unsubscribe'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    requestInfo: {
      ip: String,
      userAgent: String
    }
  }],

  // Billing Information
  billingInfo: {
    startDate: Date,
    nextBillingDate: Date,
    amount: String,
    currency: {
      type: String,
      default: 'LKR'
    }
  },

  // Metadata
  metadata: {
    source: {
      type: String,
      default: 'customer_dashboard'
    },
    notes: String
  }
}, {
  timestamps: true,
  collection: 'vas_subscriptions'
});

// Compound index for efficient queries
vasSubscriptionSchema.index({ customerId: 1, serviceId: 1 }, { unique: true });
vasSubscriptionSchema.index({ customerEmail: 1, serviceId: 1 });
vasSubscriptionSchema.index({ isSubscribed: 1 });

// Static Methods
vasSubscriptionSchema.statics.getCustomerSubscriptions = async function(customerId, customerEmail) {
  try {
    console.log(`🔍 VAS: Fetching subscriptions for customer ${customerId} (${customerEmail})`);
    
    // Use MongoDB aggregation to get only the most recent subscription for each service
    const uniqueSubscriptions = await this.aggregate([
      {
        $match: { 
          $or: [
            { customerId: customerId },
            { customerEmail: customerEmail }
          ]
        }
      },
      {
        $sort: { serviceId: 1, updatedAt: -1, createdAt: -1 }
      },
      {
        $group: {
          _id: "$serviceId",
          serviceId: { $first: "$serviceId" },
          isSubscribed: { $first: "$isSubscribed" },
          updatedAt: { $first: "$updatedAt" },
          createdAt: { $first: "$createdAt" }
        }
      },
      {
        $project: {
          _id: 0,
          serviceId: 1,
          isSubscribed: 1,
          updatedAt: 1,
          createdAt: 1
        }
      }
    ]);
    
    console.log(`🔍 VAS: Found ${uniqueSubscriptions.length} unique subscription records`);
    console.log('🔍 VAS: Latest subscriptions:', uniqueSubscriptions.map(s => ({ 
      serviceId: s.serviceId, 
      isSubscribed: s.isSubscribed,
      lastUpdated: s.updatedAt 
    })));
    
    return uniqueSubscriptions;
  } catch (error) {
    console.error('❌ VAS: Error fetching customer subscriptions:', error);
    return [];
  }
};

vasSubscriptionSchema.statics.updateSubscription = async function(customerId, customerEmail, serviceId, serviceName, action, requestInfo = {}) {
  try {
    console.log(`🔄 VAS: ${action.toUpperCase()} request for service ${serviceId}`);
    
    const isSubscribed = action === 'subscribe';
    
    // Find existing subscription or create new one
    let subscription = await this.findOne({ 
      customerId: customerId,
      serviceId: serviceId 
    });
    
    if (!subscription) {
      // Create new subscription record
      subscription = new this({
        customerId,
        customerEmail,
        serviceId,
        serviceName,
        isSubscribed,
        subscriptionHistory: [{
          action,
          timestamp: new Date(),
          requestInfo
        }]
      });
      
      console.log(`➕ VAS: Creating new subscription record for ${serviceId}`);
    } else {
      // Update existing subscription
      subscription.isSubscribed = isSubscribed;
      subscription.customerEmail = customerEmail; // Update email if changed
      subscription.serviceName = serviceName; // Update service name if changed
      
      // Add to history
      subscription.subscriptionHistory.push({
        action,
        timestamp: new Date(),
        requestInfo
      });
      
      console.log(`🔄 VAS: Updating existing subscription for ${serviceId}`);
    }
    
    // Update billing info for active subscriptions
    if (isSubscribed) {
      try {
        console.log(`💰 VAS: Getting price for service ${serviceId}...`);
        const servicePrice = await getServicePrice(serviceId);
        console.log(`💰 VAS: Price retrieved: ${servicePrice}`);
        
        subscription.billingInfo = {
          startDate: new Date(),
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          amount: servicePrice,
          currency: 'LKR'
        };
        console.log(`💰 VAS: Billing info updated for ${serviceId}`);
      } catch (priceError) {
        console.error(`❌ VAS: Error setting up billing for ${serviceId}:`, priceError);
        // Use default price if there's an error
        subscription.billingInfo = {
          startDate: new Date(),
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          amount: '500', // Default price
          currency: 'LKR'
        };
      }
    } else {
      subscription.billingInfo = {
        startDate: null,
        nextBillingDate: null,
        amount: null,
        currency: 'LKR'
      };
    }
    
    await subscription.save();
    
    console.log(`✅ VAS: Subscription ${action} successful for ${serviceId}`);
    console.log(`📊 VAS: New status: ${isSubscribed ? 'SUBSCRIBED' : 'UNSUBSCRIBED'}`);
    
    return subscription;
  } catch (error) {
    console.error(`❌ VAS: Error updating subscription for ${serviceId}:`, error);
    throw error;
  }
};

// Helper function to get service prices
async function getServicePrice(serviceId) {
  // Prices for predefined services (short IDs)
  const predefinedPrices = {
    'slt-filmhall': '299',
    'peo-tv': '1200', 
    'kaspersky-security': '450',
    'e-channelling-plus': '650',
    'slt-cloud-pro': '850',
    'slt-international-roaming': '950',
    'slt-wifi-plus': '750'
  };
  
  // Check if it's a predefined service
  if (predefinedPrices[serviceId]) {
    return predefinedPrices[serviceId];
  }
  
  // For admin-created services, fetch price from database
  try {
    const mongoose = require('mongoose');
    
    // Avoid circular dependency by accessing the model through mongoose.models
    let service = null;
    
    // Try to find by ObjectId first
    if (mongoose.Types.ObjectId.isValid(serviceId)) {
      service = await mongoose.models.VASService.findById(serviceId);
    }
    
    // If not found, try custom id field
    if (!service) {
      service = await mongoose.models.VASService.findOne({ id: serviceId });
    }
    
    if (service && service.price) {
      // Extract numeric value from price string (e.g., "LKR 500/month" -> "500")
      const priceMatch = service.price.match(/(\d+)/);
      const extractedPrice = priceMatch ? priceMatch[1] : '500';
      console.log(`💰 VAS: Found price for ${serviceId}: ${extractedPrice} (from: ${service.price})`);
      return extractedPrice;
    }
  } catch (error) {
    console.error(`❌ VAS: Error fetching price for service ${serviceId}:`, error.message);
  }
  
  // Fallback to default price
  console.log(`⚠️  VAS: Using default price for service ${serviceId}`);
  return '500'; // Default price for new services
}

// Instance Methods
vasSubscriptionSchema.methods.getSubscriptionStatus = function() {
  return {
    serviceId: this.serviceId,
    serviceName: this.serviceName,
    isSubscribed: this.isSubscribed,
    subscriptionDate: this.isSubscribed ? this.subscriptionHistory[this.subscriptionHistory.length - 1]?.timestamp : null,
    billingAmount: this.billingInfo?.amount,
    nextBilling: this.billingInfo?.nextBillingDate
  };
};

// Pre-save middleware
vasSubscriptionSchema.pre('save', function(next) {
  console.log(`💾 VAS: Saving subscription for ${this.serviceId} - Status: ${this.isSubscribed ? 'SUBSCRIBED' : 'UNSUBSCRIBED'}`);
  next();
});

// Post-save middleware
vasSubscriptionSchema.post('save', function(doc, next) {
  console.log(`✅ VAS: Subscription saved - ${doc.serviceId}: ${doc.isSubscribed ? 'SUBSCRIBED' : 'UNSUBSCRIBED'}`);
  next();
});

module.exports = mongoose.model('VASSubscription', vasSubscriptionSchema);
