// Script to add demo VAS services to the database
const mongoose = require('mongoose');
require('dotenv').config();

// VAS Service Schema (inline for this script)
const vasServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  provider: { type: String, required: true },
  price: { type: String, required: true },
  features: [String],
  benefits: [String],
  status: { type: String, enum: ['active', 'inactive', 'deprecated'], default: 'active' },
  popularity: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const VASService = mongoose.model('VASService', vasServiceSchema);

// Demo VAS services
const demoVASServices = [
  {
    name: "Premium Data Pack",
    description: "High-speed data with unlimited browsing",
    category: "Data",
    provider: "SLT-Mobitel",
    price: "Rs. 1,500/month",
    features: ["50GB High Speed Data", "Unlimited Social Media", "Free YouTube"],
    benefits: ["No throttling", "24/7 Support", "Rollover data"],
    popularity: 95,
    status: "active"
  },
  {
    name: "International Roaming",
    description: "Seamless connectivity while traveling abroad",
    category: "Roaming",
    provider: "SLT-Mobitel",
    price: "Rs. 500/day",
    features: ["Voice calls", "SMS", "Data access"],
    benefits: ["Global coverage", "Competitive rates", "Easy activation"],
    popularity: 78,
    status: "active"
  },
  {
    name: "Entertainment Plus",
    description: "Premium entertainment content and streaming services",
    category: "Entertainment",
    provider: "SLT-Mobitel",
    price: "Rs. 800/month",
    features: ["Netflix subscription", "Spotify Premium", "Local TV channels"],
    benefits: ["HD quality", "Offline downloads", "Multiple devices"],
    popularity: 87,
    status: "active"
  },
  {
    name: "Business Solutions",
    description: "Advanced features for business customers",
    category: "Business",
    provider: "SLT-Mobitel",
    price: "Rs. 2,000/month",
    features: ["Priority support", "Dedicated account manager", "Custom billing"],
    benefits: ["24/7 business support", "SLA guarantee", "Volume discounts"],
    popularity: 65,
    status: "active"
  },
  {
    name: "Security Shield",
    description: "Advanced security and privacy protection",
    category: "Security",
    provider: "SLT-Mobitel",
    price: "Rs. 300/month",
    features: ["VPN service", "Antivirus protection", "Secure browsing"],
    benefits: ["Military-grade encryption", "Ad blocking", "Malware protection"],
    popularity: 72,
    status: "active"
  },
  {
    name: "Family Plan",
    description: "Shared services for family members",
    category: "Family",
    provider: "SLT-Mobitel",
    price: "Rs. 3,500/month",
    features: ["Multiple lines", "Shared data pool", "Parental controls"],
    benefits: ["Cost savings", "Centralized billing", "Easy management"],
    popularity: 89,
    status: "active"
  },
  {
    name: "IoT Connectivity",
    description: "Internet of Things device connectivity",
    category: "IoT",
    provider: "SLT-Mobitel",
    price: "Rs. 100/device/month",
    features: ["Low power consumption", "Wide area coverage", "Device management"],
    benefits: ["Scalable solution", "Real-time monitoring", "API access"],
    popularity: 45,
    status: "active"
  }
];

async function addDemoVASServices() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/consentDB');
    console.log('Connected to MongoDB');

    // Check if services already exist
    const existingServices = await VASService.find();
    console.log(`Found ${existingServices.length} existing VAS services`);

    if (existingServices.length === 0) {
      // Add demo services
      await VASService.insertMany(demoVASServices);
      console.log(`✅ Added ${demoVASServices.length} demo VAS services`);
    } else {
      // Update existing services with demo data if needed
      for (const demoService of demoVASServices) {
        const existing = await VASService.findOne({ name: demoService.name });
        if (!existing) {
          await VASService.create(demoService);
          console.log(`✅ Added new VAS service: ${demoService.name}`);
        } else {
          console.log(`ℹ️ VAS service already exists: ${demoService.name}`);
        }
      }
    }

    // Display all services
    const allServices = await VASService.find().sort({ name: 1 });
    console.log('\n📋 All VAS Services:');
    allServices.forEach((service, index) => {
      console.log(`${index + 1}. ${service.name} - ${service.category} - ${service.price}`);
    });

    console.log('\n✅ VAS services initialization completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding demo VAS services:', error);
    process.exit(1);
  }
}

addDemoVASServices();
