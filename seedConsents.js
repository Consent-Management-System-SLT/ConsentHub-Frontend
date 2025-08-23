const mongoose = require('mongoose');
const Consent = require('./models/Consent');
require('dotenv').config();

// MongoDB connection
const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb+srv://consentuser:12345@consentcluster.ylmrqgl.mongodb.net/consentDB?retryWrites=true&w=majority&appName=ConsentCluster';
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ MongoDB connected successfully');
        return true;
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        return false;
    }
};

// Sample consent data
const sampleConsents = [
    {
        id: "1",
        partyId: "1",
        customerId: "1",
        purpose: "marketing",
        status: "granted",
        channel: "email",
        geoLocation: "Colombo, Sri Lanka",
        privacyNoticeId: "PN-001",
        versionAccepted: "1.0",
        recordSource: "website",
        type: "marketing",
        consentType: "marketing",
        validFrom: new Date("2025-01-01"),
        grantedAt: new Date("2025-01-01"),
        timestampGranted: new Date("2025-01-01").toISOString()
    },
    {
        id: "2",
        partyId: "2", 
        customerId: "2",
        purpose: "analytics",
        status: "granted",
        channel: "sms",
        geoLocation: "Kandy, Sri Lanka",
        privacyNoticeId: "PN-002",
        versionAccepted: "1.0",
        recordSource: "mobile-app",
        type: "analytics",
        consentType: "analytics",
        validFrom: new Date("2025-02-01"),
        grantedAt: new Date("2025-02-01"),
        timestampGranted: new Date("2025-02-01").toISOString()
    },
    {
        id: "3",
        partyId: "3",
        customerId: "3", 
        purpose: "thirdPartySharing",
        status: "revoked",
        channel: "email",
        geoLocation: "Galle, Sri Lanka",
        privacyNoticeId: "PN-003",
        versionAccepted: "1.0",
        recordSource: "customer-service",
        type: "thirdPartySharing",
        consentType: "thirdPartySharing",
        validFrom: new Date("2025-01-15"),
        grantedAt: new Date("2025-01-15"),
        revokedAt: new Date("2025-03-15"),
        timestampGranted: new Date("2025-01-15").toISOString(),
        timestampRevoked: new Date("2025-03-15").toISOString()
    },
    {
        id: "4",
        partyId: "4",
        customerId: "4",
        purpose: "dataProcessing",
        status: "granted",
        channel: "all",
        geoLocation: "Negombo, Sri Lanka",
        privacyNoticeId: "PN-004", 
        versionAccepted: "1.1",
        recordSource: "admin-dashboard",
        type: "dataProcessing",
        consentType: "dataProcessing",
        validFrom: new Date("2025-03-01"),
        grantedAt: new Date("2025-03-01"),
        timestampGranted: new Date("2025-03-01").toISOString()
    },
    {
        id: "5",
        partyId: "5",
        customerId: "5",
        purpose: "personalization",
        status: "pending",
        channel: "push",
        geoLocation: "Jaffna, Sri Lanka",
        privacyNoticeId: "PN-005",
        versionAccepted: "1.0",
        recordSource: "website",
        type: "personalization", 
        consentType: "personalization",
        validFrom: new Date("2025-04-01")
    }
];

const seedConsents = async () => {
    try {
        // Connect to MongoDB
        const connected = await connectDB();
        if (!connected) {
            process.exit(1);
        }

        // Clear existing consents
        await Consent.deleteMany({});
        console.log('🧹 Cleared existing consents');

        // Insert sample consents
        const insertedConsents = await Consent.insertMany(sampleConsents);
        console.log(`✅ Inserted ${insertedConsents.length} sample consents`);

        // List all consents
        const allConsents = await Consent.find().sort({ createdAt: -1 });
        console.log('📋 Current consents in database:');
        allConsents.forEach(consent => {
            console.log(`   - ID: ${consent.id}, Party: ${consent.partyId}, Purpose: ${consent.purpose}, Status: ${consent.status}`);
        });

        console.log('🎉 Consent seeding completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding consents:', error);
        process.exit(1);
    }
};

// Run the seeding
seedConsents();
