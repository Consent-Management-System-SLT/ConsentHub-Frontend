const express = require("express");
const cors = require("cors");
const multer = require("multer");
const csvParser = require("csv-parser");
const fs = require("fs-extra");
const path = require("path");
require('dotenv').config();
const connectDB = require('./config/database');
const User = require('./models/User');
const Consent = require('./models/Consent');
const PrivacyNotice = require('./models/PrivacyNoticeNew');
const DSARRequest = require('./models/DSARRequest');
const AuditLog = require('./models/AuditLog');
const BulkImport = require('./models/BulkImport');
const ComplianceRule = require('./models/ComplianceRule');
const { Webhook, EventLog } = require('./models/Webhook');
const { 
  PreferenceCategory, 
  PreferenceItem, 
  UserPreference, 
  PreferenceTemplate, 
  PreferenceAudit 
} = require('./models/Preference');
const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Production CORS configuration
const corsOptions = {
  origin: [
    'https://consent-management-system-api.vercel.app',
    'https://consenthub-backend.onrender.com',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:4173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'x-requested-with',
    'x-correlation-id',
    'X-Correlation-Id',
    'Access-Control-Allow-Origin'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// In-memory database for demo (in production, use MongoDB)
let users = [
    { 
        id: "1", 
        email: "admin@sltmobitel.lk", 
        password: "admin123", 
        role: "admin", 
        name: "Admin User",
        phone: "+94771234567",
        organization: "SLT-Mobitel",
        createdAt: new Date().toISOString()
    },
    { 
        id: "2", 
        email: "csr@sltmobitel.lk", 
        password: "csr123", 
        role: "csr", 
        name: "CSR User",
        phone: "+94771234568",
        organization: "SLT-Mobitel",
        createdAt: new Date().toISOString()
    },
    { 
        id: "3", 
        email: "customer@sltmobitel.lk", 
        password: "customer123", 
        role: "customer", 
        name: "John Doe",
        phone: "+94771234569",
        organization: "SLT-Mobitel",
        address: "123 Main St, Colombo 03",
        createdAt: new Date().toISOString()
    },
    { 
        id: "4", 
        email: "customer@example.com", 
        password: "customer123", 
        role: "customer", 
        name: "Jane Smith",
        phone: "+94771234570",
        organization: "SLT-Mobitel",
        address: "456 Oak Ave, Kandy",
        createdAt: new Date().toISOString()
    }
];

// Demo data storage
let consents = [
    {
        id: "1",
        userId: "3",
        type: "marketing",
        purpose: "Email marketing communications",
        status: "granted",
        grantedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        expiresAt: new Date(Date.now() + 31536000000).toISOString() // 1 year from now
    },
    {
        id: "2", 
        userId: "3",
        type: "analytics",
        purpose: "Website analytics and performance tracking",
        status: "granted",
        grantedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        expiresAt: new Date(Date.now() + 31536000000).toISOString()
    },
    {
        id: "3",
        userId: "3", 
        type: "personalization",
        purpose: "Personalized content and recommendations",
        status: "denied",
        deniedAt: new Date().toISOString()
    }
];

let preferences = [
    {
        id: "1",
        userId: "3",
        category: "communication",
        type: "email",
        enabled: true,
        frequency: "weekly"
    },
    {
        id: "2",
        userId: "3", 
        category: "communication",
        type: "sms",
        enabled: false,
        frequency: "never"
    },
    {
        id: "3",
        userId: "3",
        category: "privacy",
        type: "data_sharing",
        enabled: false
    }
];

let privacyNotices = [
    {
        id: "1",
        title: "Privacy Policy Update",
        content: "We have updated our privacy policy to comply with new regulations.",
        version: "2.1",
        effectiveDate: new Date().toISOString(),
        acknowledged: false
    },
    {
        id: "2", 
        title: "Cookie Policy",
        content: "Information about how we use cookies on our website.",
        version: "1.3", 
        effectiveDate: new Date(Date.now() - 86400000).toISOString(),
        acknowledged: true
    }
];

// Utility functions
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-2023';

function generateToken(user) {
    const payload = { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        name: user.name,
        phone: user.phone,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };
    return Buffer.from(JSON.stringify(payload)).toString("base64");
}

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: true,
            message: 'No valid token provided'
        });
    }
    
    try {
        const token = authHeader.substring(7);
        const payload = JSON.parse(Buffer.from(token, 'base64').toString());
        
        // Check token expiration
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
            return res.status(401).json({
                error: true,
                message: 'Token has expired'
            });
        }
        
        req.user = payload;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({
            error: true,
            message: 'Invalid token format'
        });
    }
}

// Health check
app.get("/api/v1/health", (req, res) => {
    res.json({ 
        status: "ok", 
        message: "ConsentHub Backend Running",
        timestamp: new Date().toISOString()
    });
});

// ===== CSR DASHBOARD API ENDPOINTS (No Auth Required) =====
// These endpoints are placed before authenticated endpoints to handle CSR requests

// Comprehensive Dummy Data for CSR Dashboard - Extensive Dataset
let parties = [
    {
        id: "1",
        name: "John Doe", 
        email: "john.doe@email.com",
        phone: "+94771234567",
        mobile: "+94771234567",
        status: "active",
        type: "individual",
        partyType: "individual",
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        address: "123 Main St, Colombo 03",
        dateOfBirth: "1985-06-15",
        customerSince: "2023-01-15",
        riskLevel: "low",
        totalConsents: 8,
        activeConsents: 6
    },
    {
        id: "2", 
        name: "Jane Smith",
        email: "jane.smith@email.com",
        phone: "+94771234568",
        mobile: "+94771234568", 
        status: "active",
        type: "individual",
        partyType: "individual",
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        address: "456 Oak Ave, Kandy",
        dateOfBirth: "1992-03-22",
        customerSince: "2023-03-10",
        riskLevel: "medium",
        totalConsents: 12,
        activeConsents: 10
    },
    {
        id: "3",
        name: "Robert Johnson",
        email: "robert.j@email.com", 
        phone: "+94771234569",
        mobile: "+94771234569",
        status: "active",
        type: "guardian",
        partyType: "guardian",
        createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        address: "789 Pine Rd, Galle",
        dateOfBirth: "1978-11-08",
        customerSince: "2022-12-05",
        riskLevel: "low",
        totalConsents: 15,
        activeConsents: 12,
        dependents: ["minor_001", "minor_002"]
    },
    {
        id: "4",
        name: "Emily Davis",
        email: "emily.davis@email.com",
        phone: "+94771234570", 
        mobile: "+94771234570",
        status: "inactive",
        type: "individual",
        partyType: "individual", 
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        address: "321 Elm St, Matara",
        dateOfBirth: "1995-09-12",
        customerSince: "2024-01-20",
        riskLevel: "high",
        totalConsents: 5,
        activeConsents: 2
    },
    {
        id: "5",
        name: "Michael Chen",
        email: "michael.chen@email.com",
        phone: "+94771234571",
        mobile: "+94771234571",
        status: "active",
        type: "individual",
        partyType: "individual",
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        address: "555 Tech Park, Colombo 07",
        dateOfBirth: "1990-05-18",
        customerSince: "2024-07-20",
        riskLevel: "low",
        totalConsents: 6,
        activeConsents: 6
    },
    {
        id: "6",
        name: "Sarah Williams",
        email: "sarah.w@email.com",
        phone: "+94771234572",
        mobile: "+94771234572",
        status: "active",
        type: "guardian",
        partyType: "guardian",
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        address: "888 Garden Lane, Negombo",
        dateOfBirth: "1985-12-03",
        customerSince: "2023-05-12",
        riskLevel: "medium",
        totalConsents: 20,
        activeConsents: 18,
        dependents: ["minor_003"]
    },
    {
        id: "7",
        name: "David Brown",
        email: "david.brown@email.com",
        phone: "+94771234573",
        mobile: "+94771234573",
        status: "pending",
        type: "individual",
        partyType: "individual",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        address: "999 Business District, Colombo 01",
        dateOfBirth: "1988-07-25",
        customerSince: "2024-07-19",
        riskLevel: "medium",
        totalConsents: 3,
        activeConsents: 1
    },
    {
        id: "8",
        name: "Lisa Anderson",
        email: "lisa.anderson@email.com",
        phone: "+94771234574",
        mobile: "+94771234574",
        status: "active",
        type: "individual",
        partyType: "individual",
        createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
        address: "111 Coastal Road, Bentota",
        dateOfBirth: "1993-02-14",
        customerSince: "2023-02-01",
        riskLevel: "low",
        totalConsents: 14,
        activeConsents: 11
    },
    {
        id: "9",
        name: "Alex Thompson",
        email: "alex.thompson@email.com",
        phone: "+94771234575",
        mobile: "+94771234575",
        status: "active",
        type: "individual",
        partyType: "individual",
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        address: "222 Hill View, Nuwara Eliya",
        dateOfBirth: "1987-09-30",
        customerSince: "2022-10-15",
        riskLevel: "low",
        totalConsents: 18,
        activeConsents: 16
    },
    {
        id: "10",
        name: "Maria Rodriguez",
        email: "maria.rodriguez@email.com",
        phone: "+94771234576",
        mobile: "+94771234576",
        status: "suspended",
        type: "individual",
        partyType: "individual",
        createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
        address: "333 Central Plaza, Anuradhapura",
        dateOfBirth: "1991-04-07",
        customerSince: "2022-08-20",
        riskLevel: "high",
        totalConsents: 9,
        activeConsents: 3
    },
    {
        id: "5",
        name: "Michael Wilson", 
        email: "m.wilson@email.com",
        phone: "+94771234571",
        mobile: "+94771234571",
        status: "active",
        type: "individual", 
        partyType: "individual",
        createdAt: new Date().toISOString(),
        address: "654 Maple Dr, Negombo",
        dateOfBirth: "1988-12-03"
    }
];

// Comprehensive CSR Consent Data - Extensive Dataset
let csrConsents = [
    // Customer 1 - John Doe (8 consents)
    {
        id: "1",
        partyId: "1",
        customerId: "1",
        type: "marketing",
        purpose: "Email marketing communications",
        status: "granted", 
        grantedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 365).toISOString(),
        source: "website",
        lawfulBasis: "consent",
        category: "Marketing",
        description: "Receive promotional emails and special offers"
    },
    {
        id: "2",
        partyId: "1", 
        customerId: "1",
        type: "analytics",
        purpose: "Website analytics and performance tracking", 
        status: "granted",
        grantedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 365).toISOString(),
        source: "mobile_app",
        lawfulBasis: "consent",
        category: "Analytics",
        description: "Allow usage tracking for service improvement"
    },
    {
        id: "3",
        partyId: "1",
        customerId: "1",
        type: "service",
        purpose: "Service communications and updates",
        status: "granted",
        grantedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 365).toISOString(),
        source: "registration",
        lawfulBasis: "contract",
        category: "Service",
        description: "Essential service notifications and updates"
    },
    {
        id: "4",
        partyId: "1",
        customerId: "1",
        type: "personalization",
        purpose: "Personalized content recommendations",
        status: "granted",
        grantedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 365).toISOString(),
        source: "website",
        lawfulBasis: "consent",
        category: "Personalization",
        description: "Customize content based on preferences"
    },
    {
        id: "5",
        partyId: "1",
        customerId: "1",
        type: "sms_marketing",
        purpose: "SMS promotional messages",
        status: "denied",
        deniedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        source: "customer_service",
        lawfulBasis: "consent",
        category: "Marketing",
        description: "Receive promotional SMS messages"
    },
    {
        id: "6",
        partyId: "1",
        customerId: "1",
        type: "third_party_sharing",
        purpose: "Share data with marketing partners",
        status: "denied",
        deniedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
        source: "website",
        lawfulBasis: "consent",
        category: "Third Party",
        description: "Allow sharing with trusted marketing partners"
    },
    {
        id: "7",
        partyId: "1",
        customerId: "1",
        type: "location_tracking",
        purpose: "Location-based services",
        status: "granted",
        grantedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 365).toISOString(),
        source: "mobile_app",
        lawfulBasis: "consent",
        category: "Location",
        description: "Use location for nearby offers and services"
    },
    {
        id: "8",
        partyId: "1",
        customerId: "1",
        type: "cookies",
        purpose: "Essential and functional cookies",
        status: "granted",
        grantedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 365).toISOString(),
        source: "website",
        lawfulBasis: "consent",
        category: "Cookies",
        description: "Store cookies for better user experience"
    },

    // Customer 2 - Jane Smith (12 consents)
    {
        id: "9",
        partyId: "2",
        customerId: "2",
        type: "marketing",
        purpose: "Email marketing communications",
        status: "granted",
        grantedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 365).toISOString(),
        source: "website",
        lawfulBasis: "consent",
        category: "Marketing",
        description: "Receive promotional emails and special offers"
    },
    {
        id: "10",
        partyId: "2",
        customerId: "2", 
        type: "personalization",
        purpose: "Personalized content and recommendations",
        status: "granted",
        grantedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 365).toISOString(),
        source: "website",
        lawfulBasis: "consent",
        category: "Personalization",
        description: "Customize content based on preferences"
    },
    {
        id: "11",
        partyId: "2",
        customerId: "2",
        type: "sms_marketing",
        purpose: "SMS promotional messages",
        status: "granted",
        grantedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 365).toISOString(),
        source: "customer_service",
        lawfulBasis: "consent",
        category: "Marketing",
        description: "Receive promotional SMS messages"
    },
    {
        id: "12",
        partyId: "2",
        customerId: "2",
        type: "analytics",
        purpose: "Website and app analytics",
        status: "granted",
        grantedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 365).toISOString(),
        source: "mobile_app",
        lawfulBasis: "consent",
        category: "Analytics",
        description: "Track usage for service improvement"
    },
    {
        id: "13",
        partyId: "2",
        customerId: "2",
        type: "service",
        purpose: "Service communications",
        status: "granted",
        grantedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 365).toISOString(),
        source: "registration",
        lawfulBasis: "contract",
        category: "Service",
        description: "Essential service notifications"
    },
    {
        id: "14",
        partyId: "2",
        customerId: "2",
        type: "location_tracking",
        purpose: "Location-based services",
        status: "granted",
        grantedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 365).toISOString(),
        source: "mobile_app",
        lawfulBasis: "consent",
        category: "Location",
        description: "Location-based offers and services"
    },
    {
        id: "15",
        partyId: "2",
        customerId: "2",
        type: "cookies",
        purpose: "Functional cookies",
        status: "granted",
        grantedAt: new Date(Date.now() - 86400000 * 18).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 365).toISOString(),
        source: "website",
        lawfulBasis: "consent",
        category: "Cookies",
        description: "Essential website functionality"
    },
    {
        id: "16",
        partyId: "2",
        customerId: "2",
        type: "third_party_sharing",
        purpose: "Share with analytics partners",
        status: "granted",
        grantedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 365).toISOString(),
        source: "website",
        lawfulBasis: "consent",
        category: "Third Party",
        description: "Share anonymized data with analytics partners"
    },
    {
        id: "17",
        partyId: "2",
        customerId: "2",
        type: "push_notifications",
        purpose: "Mobile push notifications",
        status: "granted",
        grantedAt: new Date(Date.now() - 86400000 * 25).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 365).toISOString(),
        source: "mobile_app",
        lawfulBasis: "consent",
        category: "Notifications",
        description: "Receive mobile push notifications"
    },
    {
        id: "18",
        partyId: "2",
        customerId: "2",
        type: "research",
        purpose: "Market research participation",
        status: "denied",
        deniedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        source: "email",
        lawfulBasis: "consent",
        category: "Research",
        description: "Participate in market research surveys"
    },
    {
        id: "19",
        partyId: "2",
        customerId: "2",
        type: "social_media",
        purpose: "Social media integration",
        status: "granted",
        grantedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 365).toISOString(),
        source: "website",
        lawfulBasis: "consent",
        category: "Social Media",
        description: "Connect with social media accounts"
    },
    {
        id: "20",
        partyId: "2",
        customerId: "2",
        type: "newsletter",
        purpose: "Monthly newsletter subscription",
        status: "granted",
        grantedAt: new Date(Date.now() - 86400000 * 35).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 365).toISOString(),
        source: "website",
        lawfulBasis: "consent",
        category: "Newsletter",
        description: "Receive monthly newsletter updates"
    },

    // Additional consents for other customers (15 consents for Robert Johnson)
    {
        id: "21",
        partyId: "3",
        customerId: "3",
        type: "marketing", 
        purpose: "SMS marketing communications",
        status: "granted",
        grantedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 365).toISOString(),
        source: "customer_service",
        lawfulBasis: "consent",
        category: "Marketing",
        description: "Guardian consent for marketing communications"
    },
    {
        id: "22",
        partyId: "3",
        customerId: "3",
        type: "guardian_consent",
        purpose: "Consent on behalf of minor child",
        status: "granted",
        grantedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 365).toISOString(),
        source: "in_person",
        lawfulBasis: "consent",
        category: "Guardian",
        description: "Legal guardian consent for minor's data processing"
    },

    // Quick additional consents for remaining customers
    {
        id: "23",
        partyId: "4",
        customerId: "4",
        type: "data_processing",
        purpose: "Account management and billing",
        status: "granted",
        grantedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 730).toISOString(),
        source: "registration", 
        lawfulBasis: "contract",
        category: "Service",
        description: "Essential account and billing data processing"
    },
    {
        id: "24",
        partyId: "5",
        customerId: "5",
        type: "marketing",
        purpose: "Email marketing",
        status: "granted",
        grantedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 365).toISOString(),
        source: "website",
        lawfulBasis: "consent",
        category: "Marketing",
        description: "New customer marketing consent"
    },
    {
        id: "25",
        partyId: "6",
        customerId: "6",
        type: "guardian_consent",
        purpose: "Guardian data processing",
        status: "granted",
        grantedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 365).toISOString(),
        source: "in_person",
        lawfulBasis: "consent",
        category: "Guardian",
        description: "Guardian consent for dependent management"
    }
];

// Comprehensive DSAR Requests - Extensive Dataset
let dsarRequests = [
    {
        id: "1",
        partyId: "1",
        customerId: "1", 
        requestType: "data_access",
        status: "pending",
        submittedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        description: "Request to access all personal data collected and processed",
        requestorName: "John Doe",
        requestorEmail: "john.doe@email.com",
        priority: "medium",
        estimatedCompletionDate: new Date(Date.now() + 86400000 * 27).toISOString(),
        assignedTo: "CSR Team A",
        category: "Subject Access Request",
        legalBasis: "GDPR Article 15"
    },
    {
        id: "2", 
        partyId: "2",
        customerId: "2",
        requestType: "data_deletion",
        status: "completed", 
        submittedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        description: "Request to delete marketing profile data and analytics cookies",
        requestorName: "Jane Smith",
        requestorEmail: "jane.smith@email.com",
        priority: "high",
        assignedTo: "Sarah Wilson",
        category: "Right to Erasure",
        legalBasis: "GDPR Article 17",
        completionNotes: "All marketing data successfully deleted. Customer notified."
    },
    {
        id: "3",
        partyId: "3", 
        customerId: "3",
        requestType: "data_portability",
        status: "pending",
        submittedAt: new Date(Date.now() - 86400000 * 28).toISOString(),
        description: "Request to export complete account data for transfer to another service",
        requestorName: "Robert Johnson", 
        requestorEmail: "robert.j@email.com",
        priority: "high", // Over 25 days old - risk alert!
        estimatedCompletionDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        assignedTo: "Michael Chen",
        category: "Data Portability",
        legalBasis: "GDPR Article 20",
        notes: "URGENT: Request approaching 30-day deadline"
    },
    {
        id: "4",
        partyId: "4",
        customerId: "4", 
        requestType: "data_rectification",
        status: "in_progress",
        submittedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        description: "Request to update incorrect address and phone number information",
        requestorName: "Emily Davis",
        requestorEmail: "emily.davis@email.com", 
        priority: "medium",
        estimatedCompletionDate: new Date(Date.now() + 86400000 * 23).toISOString(),
        assignedTo: "Lisa Anderson",
        category: "Right to Rectification",
        legalBasis: "GDPR Article 16",
        notes: "Verification documents received, processing updates"
    },
    {
        id: "5",
        partyId: "5",
        customerId: "5",
        requestType: "data_access",
        status: "pending",
        submittedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        description: "New customer requesting copy of all data collected during registration",
        requestorName: "Michael Chen",
        requestorEmail: "michael.chen@email.com",
        priority: "low",
        estimatedCompletionDate: new Date(Date.now() + 86400000 * 29).toISOString(),
        assignedTo: "David Brown",
        category: "Subject Access Request",
        legalBasis: "GDPR Article 15"
    },
    {
        id: "6",
        partyId: "6",
        customerId: "6",
        requestType: "data_restriction",
        status: "completed",
        submittedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
        completedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        description: "Guardian requesting restriction of minor's data processing for marketing",
        requestorName: "Sarah Williams",
        requestorEmail: "sarah.w@email.com",
        priority: "high",
        assignedTo: "Alex Thompson",
        category: "Right to Restriction",
        legalBasis: "GDPR Article 18",
        completionNotes: "Marketing data processing restricted for dependent minor_003"
    },
    {
        id: "7",
        partyId: "7",
        customerId: "7",
        requestType: "consent_withdrawal",
        status: "completed",
        submittedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        completedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        description: "Withdrawal of consent for all non-essential data processing",
        requestorName: "David Brown",
        requestorEmail: "david.brown@email.com",
        priority: "medium",
        assignedTo: "Maria Rodriguez",
        category: "Consent Withdrawal",
        legalBasis: "GDPR Article 7(3)",
        completionNotes: "All non-essential consents revoked, account status updated"
    },
    {
        id: "8",
        partyId: "8",
        customerId: "8",
        requestType: "data_deletion",
        status: "pending",
        submittedAt: new Date(Date.now() - 86400000 * 9).toISOString(),
        description: "Request to delete inactive account and all associated data",
        requestorName: "Lisa Anderson",
        requestorEmail: "lisa.anderson@email.com",
        priority: "medium",
        estimatedCompletionDate: new Date(Date.now() + 86400000 * 21).toISOString(),
        assignedTo: "Emily Davis",
        category: "Right to Erasure",
        legalBasis: "GDPR Article 17"
    },
    {
        id: "9",
        partyId: "9",
        customerId: "9",
        requestType: "data_portability",
        status: "in_progress",
        submittedAt: new Date(Date.now() - 86400000 * 18).toISOString(),
        description: "Long-term customer requesting full data export for backup purposes",
        requestorName: "Alex Thompson",
        requestorEmail: "alex.thompson@email.com",
        priority: "low",
        estimatedCompletionDate: new Date(Date.now() + 86400000 * 12).toISOString(),
        assignedTo: "Robert Johnson",
        category: "Data Portability",
        legalBasis: "GDPR Article 20",
        notes: "Large dataset - processing in phases"
    },
    {
        id: "10",
        partyId: "10",
        customerId: "10",
        requestType: "account_investigation",
        status: "pending",
        submittedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        description: "Investigation of suspected unauthorized data processing activities",
        requestorName: "Maria Rodriguez",
        requestorEmail: "maria.rodriguez@email.com",
        priority: "high", // 30 days old - CRITICAL risk alert!
        estimatedCompletionDate: new Date(Date.now()).toISOString(), // OVERDUE
        assignedTo: "Compliance Team",
        category: "Investigation",
        legalBasis: "Data Protection Investigation",
        notes: "CRITICAL: 30-day deadline exceeded - immediate attention required"
    },
    {
        id: "11",
        partyId: "2",
        customerId: "2",
        requestType: "data_access",
        status: "completed",
        submittedAt: new Date(Date.now() - 86400000 * 45).toISOString(),
        completedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
        description: "Previous access request for billing data verification",
        requestorName: "Jane Smith",
        requestorEmail: "jane.smith@email.com",
        priority: "medium",
        assignedTo: "John Doe",
        category: "Subject Access Request",
        legalBasis: "GDPR Article 15",
        completionNotes: "Billing data provided, customer satisfied with response"
    },
    {
        id: "12",
        partyId: "1",
        customerId: "1",
        requestType: "consent_update",
        status: "completed",
        submittedAt: new Date(Date.now() - 86400000 * 60).toISOString(),
        completedAt: new Date(Date.now() - 86400000 * 58).toISOString(),
        description: "Update marketing consent preferences following service upgrade",
        requestorName: "John Doe",
        requestorEmail: "john.doe@email.com",
        priority: "low",
        assignedTo: "Sarah Williams",
        category: "Consent Management",
        legalBasis: "GDPR Article 7",
        completionNotes: "Consent preferences updated successfully"
    }
];

// Comprehensive Audit Events - Extensive Activity Log
let auditEvents = [
    // Today's events (5 events for today's actions stat)
    {
        id: "1",
        partyId: "1",
        eventType: "consent_granted",
        description: "Marketing consent granted via website - SMS notifications enabled",
        createdAt: new Date().toISOString(),
        userId: "csr_001",
        userName: "Sarah Wilson",
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        metadata: { consentId: "1", channel: "website", consentType: "marketing" },
        category: "Consent Management",
        severity: "info"
    },
    {
        id: "2", 
        partyId: "5",
        eventType: "customer_registration",
        description: "New customer account created - Michael Chen",
        createdAt: new Date().toISOString(),
        userId: "system",
        userName: "System Automated",
        ipAddress: "192.168.1.105", 
        userAgent: "ConsentHub Registration System",
        metadata: { customerId: "5", registrationSource: "website" },
        category: "Account Management",
        severity: "info"
    },
    {
        id: "3",
        partyId: "3",
        eventType: "dsar_request_updated",
        description: "DSAR request status updated to in_progress - Data portability request",
        createdAt: new Date().toISOString(),
        userId: "csr_003",
        userName: "Michael Chen",
        ipAddress: "192.168.1.110",
        userAgent: "ConsentHub CSR Dashboard",
        metadata: { dsarId: "3", oldStatus: "pending", newStatus: "in_progress" },
        category: "DSAR Management",
        severity: "medium"
    },
    {
        id: "4", 
        partyId: "10",
        eventType: "risk_alert_generated",
        description: "CRITICAL: DSAR request deadline exceeded - Investigation required",
        createdAt: new Date().toISOString(),
        userId: "system",
        userName: "Compliance Monitor",
        ipAddress: "internal",
        userAgent: "ConsentHub Compliance Engine",
        metadata: { dsarId: "10", daysOverdue: 1, alertLevel: "critical" },
        category: "Compliance Alert",
        severity: "critical"
    },
    {
        id: "5",
        partyId: "2",
        eventType: "preference_updated",
        description: "Communication preferences updated - Email frequency changed to weekly",
        createdAt: new Date().toISOString(),
        userId: "csr_002",
        userName: "Lisa Anderson",
        ipAddress: "192.168.1.107",
        userAgent: "ConsentHub CSR Dashboard",
        metadata: { preferenceType: "email_frequency", oldValue: "daily", newValue: "weekly" },
        category: "Preference Management", 
        severity: "info"
    },

    // Recent events (last few days)
    {
        id: "6",
        partyId: "2",
        eventType: "consent_denied",
        description: "Research participation consent denied - Customer declined survey invitations",
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        userId: "customer",
        userName: "Jane Smith",
        ipAddress: "192.168.1.101",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)",
        metadata: { consentId: "18", channel: "mobile_app", consentType: "research" },
        category: "Consent Management",
        severity: "info"
    },
    {
        id: "7",
        partyId: "1",
        eventType: "dsar_request_submitted",
        description: "Data access request submitted - Full profile data requested",
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        userId: "customer", 
        userName: "John Doe",
        ipAddress: "192.168.1.102",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        metadata: { dsarId: "1", requestType: "data_access" },
        category: "DSAR Management",
        severity: "medium"
    },
    {
        id: "8",
        partyId: "2",
        eventType: "dsar_request_completed", 
        description: "Data deletion request completed successfully - Marketing data removed",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        userId: "csr_001",
        userName: "Sarah Wilson",
        ipAddress: "192.168.1.103",
        userAgent: "ConsentHub CSR Dashboard",
        metadata: { dsarId: "2", requestType: "data_deletion", dataRemoved: "marketing_profile" },
        category: "DSAR Management",
        severity: "info"
    },
    {
        id: "9",
        partyId: "3",
        eventType: "profile_updated",
        description: "Customer profile information updated - Address changed",
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        userId: "customer",
        userName: "Robert Johnson",
        ipAddress: "192.168.1.108",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        metadata: { profileField: "address", oldValue: "789 Pine Rd", newValue: "789 Pine Road, Updated" },
        category: "Profile Management",
        severity: "info"
    },
    {
        id: "10",
        partyId: "6",
        eventType: "guardian_consent_granted",
        description: "Guardian consent granted for minor dependent - Sarah Williams acting as guardian",
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        userId: "csr_004",
        userName: "Alex Thompson",
        ipAddress: "192.168.1.112",
        userAgent: "ConsentHub CSR Dashboard",
        metadata: { guardianId: "6", minorId: "minor_003", consentType: "data_processing" },
        category: "Guardian Management",
        severity: "info"
    }
];

let customerPreferences = [
    {
        id: "1",
        partyId: "1",
        preferredChannels: {
            email: true,
            sms: false, 
            phone: true,
            push: true
        },
        topicSubscriptions: {
            marketing: true,
            promotions: false,
            serviceUpdates: true,
            billing: true,
            security: true
        },
        frequency: "weekly",
        language: "en",
        timezone: "Asia/Colombo",
        updatedAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
        id: "2", 
        partyId: "2",
        preferredChannels: {
            email: false,
            sms: true,
            phone: false,
            push: false
        },
        topicSubscriptions: {
            marketing: false,
            promotions: false, 
            serviceUpdates: true,
            billing: true,
            security: true
        },
        frequency: "immediate",
        language: "en",
        timezone: "Asia/Colombo",
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
    }
];

// CSR Dashboard API Routes (No authentication required)

// GET /api/csr/stats - Get CSR Dashboard Statistics
app.get("/api/csr/stats", (req, res) => {
    console.log('📊 CSR Dashboard: Fetching dashboard statistics');
    
    // Calculate dynamic stats
    const totalCustomers = parties.length;
    const pendingRequests = dsarRequests.filter(r => r.status === 'pending').length;
    const consentUpdates = csrConsents.filter(c => {
        const grantedDate = new Date(c.grantedAt || c.createdAt);
        const daysSince = (Date.now() - grantedDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 7; // Consents updated in last 7 days
    }).length;
    const guardiansManaged = parties.filter(p => p.type === 'guardian').length;
    const todayActions = auditEvents.filter(e => {
        const eventDate = new Date(e.createdAt);
        const today = new Date();
        return eventDate.toDateString() === today.toDateString();
    }).length;
    
    // Risk alerts: DSAR requests over 25 days old
    const riskAlerts = dsarRequests.filter(r => {
        const submitted = new Date(r.submittedAt);
        const daysSince = (Date.now() - submitted.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince > 25 && r.status !== 'completed';
    }).length;
    
    const stats = {
        totalCustomers,
        pendingRequests,
        consentUpdates,
        guardiansManaged,
        todayActions,
        riskAlerts,
        // Additional insights
        consentRate: Math.round((csrConsents.filter(c => c.status === 'granted').length / csrConsents.length) * 100),
        resolvedRequests: dsarRequests.filter(r => r.status === 'completed').length,
        newCustomers: parties.filter(p => {
            const created = new Date(p.createdAt);
            const daysSince = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
            return daysSince <= 1;
        }).length
    };
    
    res.json(stats);
});

// GET /api/v1/party - Get all customers/parties for CSR
app.get("/api/v1/party", async (req, res) => {
    try {
        console.log('🔍 CSR Dashboard: Fetching party/customer data from MongoDB');
        
        // Fetch users from MongoDB (customers only for consent management)
        const mongoUsers = await User.find({ 
            role: 'customer', 
            status: 'active',
            isActive: true 
        }).select('_id firstName lastName email phone company department jobTitle status emailVerified createdAt updatedAt').sort({ createdAt: -1 }).lean();
        
        console.log(`Found ${mongoUsers.length} active customers in MongoDB`);
        
        // Transform MongoDB users to match the party interface expected by frontend
        const transformedUsers = mongoUsers.map(user => ({
            id: user._id.toString(), // Convert ObjectId to string
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            phone: user.phone || '',
            mobile: user.phone || '',
            company: user.company || '',
            department: user.department || '',
            jobTitle: user.jobTitle || '',
            status: user.status || 'active',
            type: 'individual',
            partyType: 'individual',
            createdAt: user.createdAt,
            lastUpdated: user.updatedAt,
            userDetails: {
                status: user.status,
                emailVerified: user.emailVerified || false,
                createdAt: user.createdAt
            }
        }));
        
        // For debugging, let's log some info
        if (mongoUsers.length > 0) {
            console.log('Sample MongoDB user:', JSON.stringify(mongoUsers[0], null, 2));
            console.log('Sample transformed user:', JSON.stringify(transformedUsers[0], null, 2));
        }
        
        // Return MongoDB users primarily, with static data as fallback for specific IDs
        const finalResult = transformedUsers.length > 0 ? transformedUsers : parties;
        
        console.log(`Returning ${finalResult.length} total parties`);
        res.json(finalResult);
        
    } catch (error) {
        console.error('❌ Error fetching parties from MongoDB:', error);
        // Fallback to static data if MongoDB fails
        console.log('Falling back to static party data');
        res.json(parties);
    }
});

// GET /api/v1/consent - Get all consents for CSR  
app.get("/api/v1/consent", async (req, res) => {
    try {
        console.log('✅ CSR Dashboard: Fetching consent data');
        
        // Fetch from MongoDB
        const mongoConsents = await Consent.find().sort({ createdAt: -1 }).lean();
        console.log(`Found ${mongoConsents.length} consents in MongoDB`);
        
        // Combine MongoDB data with in-memory data and remove duplicates
        const allConsents = [...mongoConsents, ...csrConsents];
        const uniqueConsents = allConsents.reduce((unique, consent) => {
            if (!unique.find(c => c.id === consent.id)) {
                unique.push(consent);
            }
            return unique;
        }, []);
        
        console.log(`Returning ${uniqueConsents.length} total consents`);
        res.json(uniqueConsents);
        
    } catch (error) {
        console.error('❌ Error fetching consents:', error);
        // Fallback to in-memory data
        console.log('Falling back to in-memory consent data');
        res.json(csrConsents);
    }
});

// GET /api/v1/dsar - Get all DSAR requests for CSR with MongoDB integration
app.get("/api/v1/dsar", verifyToken, async (req, res) => {
    try {
        console.log('📋 CSR Dashboard: Fetching DSAR data from MongoDB');
        const { status, requestType, priority, page = 1, limit = 50 } = req.query;
        
        // Build query
        const query = {};
        if (status) query.status = status;
        if (requestType) query.requestType = requestType;
        if (priority) query.priority = priority;
        
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { submittedAt: -1 },
            populate: []
        };
        
        const dsarRequests = await DSARRequest.find(query)
            .sort({ submittedAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));
            
        const total = await DSARRequest.countDocuments(query);
        
        // Add risk indicators
        const requestsWithRisk = dsarRequests.map(request => ({
            ...request.toObject(),
            isOverdue: request.isOverdue,
            daysRemaining: request.daysRemaining,
            processingDays: request.processingDays
        }));
        
        res.json({
            requests: requestsWithRisk,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit))
        });
        
    } catch (error) {
        console.error('❌ Error fetching DSAR requests:', error);
        // Fallback to in-memory data
        console.log('Falling back to in-memory DSAR data');
        res.json(dsarRequests);
    }
});

// GET /api/v1/event - Get all audit events for CSR
app.get("/api/v1/event", (req, res) => {
    console.log('📝 CSR Dashboard: Fetching event/audit data');
    res.json(auditEvents);
});

// Test endpoint without authentication
app.get("/api/v1/test-audit", async (req, res) => {
    try {
        console.log('🔍 Testing audit logs endpoint');
        
        const count = await AuditLog.countDocuments();
        const logs = await AuditLog.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        res.json({
            success: true,
            message: 'Test endpoint working',
            totalLogs: count,
            sampleLogs: logs.map(log => ({
                action: log.action,
                userName: log.userName,
                category: log.category,
                createdAt: log.createdAt
            }))
        });
        
    } catch (error) {
        console.error('❌ Error in test endpoint:', error);
        res.status(500).json({
            success: false,
            message: 'Test endpoint failed',
            error: error.message
        });
    }
});

// GET /api/v1/audit-logs - Get paginated audit logs with search and filtering
app.get("/api/v1/audit-logs", verifyToken, async (req, res) => {
    try {
        console.log('🔍 Admin: Fetching audit logs with filters:', req.query);
        
        const {
            page = 1,
            limit = 10,
            search = '',
            severity = '',
            category = '',
            outcome = '',
            startDate = '',
            endDate = ''
        } = req.query;

        // Build the filter query
        const filter = {};
        
        if (search) {
            filter.$or = [
                { userName: { $regex: search, $options: 'i' } },
                { userEmail: { $regex: search, $options: 'i' } },
                { action: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { entityType: { $regex: search, $options: 'i' } },
                { entityId: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (severity) filter.severity = severity;
        if (category) filter.category = category;
        if (outcome) filter.outcome = outcome;
        
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Get total count for pagination
        const total = await AuditLog.countDocuments(filter);
        
        // Get audit logs with pagination and sorting
        const logs = await AuditLog.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        console.log(`✅ Found ${logs.length} audit logs out of ${total} total`);
        
        res.json({
            success: true,
            logs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            },
            total
        });
        
    } catch (error) {
        console.error('❌ Error fetching audit logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch audit logs',
            error: error.message
        });
    }
});

// GET /api/v1/audit-logs/export/csv - Export filtered audit logs as CSV
app.get("/api/v1/audit-logs/export/csv", verifyToken, async (req, res) => {
    try {
        console.log('📊 Admin: Exporting audit logs to CSV with filters:', req.query);
        
        const {
            search = '',
            severity = '',
            category = '',
            outcome = '',
            startDate = '',
            endDate = ''
        } = req.query;

        // Build the same filter query as the main endpoint
        const filter = {};
        
        if (search) {
            filter.$or = [
                { userName: { $regex: search, $options: 'i' } },
                { userEmail: { $regex: search, $options: 'i' } },
                { action: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { entityType: { $regex: search, $options: 'i' } },
                { entityId: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (severity) filter.severity = severity;
        if (category) filter.category = category;
        if (outcome) filter.outcome = outcome;
        
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        // Get all matching logs without pagination for export
        const logs = await AuditLog.find(filter)
            .sort({ createdAt: -1 })
            .lean();

        // Create CSV content
        const csvHeaders = [
            'Timestamp',
            'User Name',
            'User Email',
            'User Role',
            'Action',
            'Category',
            'Description',
            'Entity Type',
            'Entity ID',
            'Severity',
            'Risk Level',
            'Outcome',
            'IP Address',
            'Session ID',
            'Compliance Relevant',
            'Regulatory Frameworks',
            'Location',
            'Platform',
            'User Agent'
        ];

        const csvRows = [
            csvHeaders.join(',')
        ];

        logs.forEach(log => {
            const row = [
                `"${new Date(log.createdAt).toLocaleString()}"`,
                `"${log.userName || ''}"`,
                `"${log.userEmail || ''}"`,
                `"${log.userRole || ''}"`,
                `"${log.action || ''}"`,
                `"${log.category || ''}"`,
                `"${(log.description || '').replace(/"/g, '""')}"`,
                `"${log.entityType || ''}"`,
                `"${log.entityId || ''}"`,
                `"${log.severity || ''}"`,
                `"${log.riskLevel || ''}"`,
                `"${log.outcome || ''}"`,
                `"${log.ipAddress || ''}"`,
                `"${log.sessionId || ''}"`,
                `"${log.complianceRelevant ? 'Yes' : 'No'}"`,
                `"${(log.regulatoryFramework || []).join('; ')}"`,
                `"${log.location ? `${log.location.city}, ${log.location.region}, ${log.location.country}` : ''}"`,
                `"${log.metadata ? log.metadata.platform : ''}"`,
                `"${(log.userAgent || '').replace(/"/g, '""')}"`
            ];
            csvRows.push(row.join(','));
        });

        const csvContent = csvRows.join('\n');
        const filename = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;

        console.log(`✅ Exporting ${logs.length} audit logs to CSV: ${filename}`);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(csvContent);
        
    } catch (error) {
        console.error('❌ Error exporting audit logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export audit logs',
            error: error.message
        });
    }
});

// GET /api/v1/audit-logs/stats - Get audit log statistics
app.get("/api/v1/audit-logs/stats", verifyToken, async (req, res) => {
    try {
        console.log('📊 Admin: Fetching audit log statistics');
        
        const totalLogs = await AuditLog.countDocuments();
        const recentLogs = await AuditLog.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });
        
        // Count by severity
        const severityStats = await AuditLog.aggregate([
            { $group: { _id: '$severity', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        
        // Count by category
        const categoryStats = await AuditLog.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        // Count by outcome
        const outcomeStats = await AuditLog.aggregate([
            { $group: { _id: '$outcome', count: { $sum: 1 } } }
        ]);
        
        // Compliance relevant logs
        const complianceLogs = await AuditLog.countDocuments({ complianceRelevant: true });
        
        res.json({
            success: true,
            stats: {
                total: totalLogs,
                last24Hours: recentLogs,
                complianceRelevant: complianceLogs,
                bySeverity: severityStats,
                byCategory: categoryStats,
                byOutcome: outcomeStats
            }
        });
        
    } catch (error) {
        console.error('❌ Error fetching audit log statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch audit log statistics',
            error: error.message
        });
    }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadsDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.csv');
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed'));
        }
    }
});

// ============================================================================
// BULK IMPORT ENDPOINTS
// ============================================================================

// POST /api/v1/bulk-import/upload - Upload and process CSV file
app.post("/api/v1/bulk-import/upload", verifyToken, upload.single('file'), async (req, res) => {
    try {
        console.log('📤 Admin: Bulk import file upload initiated');
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const { importType, columnMapping } = req.body;
        let parsedColumnMapping = {};
        
        try {
            parsedColumnMapping = JSON.parse(columnMapping || '{}');
        } catch (err) {
            console.warn('⚠️ Invalid column mapping, using default');
        }

        // Create bulk import record
        const bulkImport = new BulkImport({
            fileName: req.file.originalname,
            filePath: req.file.path,
            fileSize: req.file.size,
            importType: importType || 'customers',
            columnMapping: parsedColumnMapping,
            uploadedBy: req.userId,
            status: 'pending'
        });

        await bulkImport.save();

        // Start processing the file asynchronously
        processCSVFile(bulkImport._id, req.file.path, importType || 'customers', parsedColumnMapping, req.userId);

        res.json({
            success: true,
            message: 'File uploaded successfully and processing started',
            importId: bulkImport._id
        });

    } catch (error) {
        console.error('❌ Error uploading bulk import file:', error);
        
        // Clean up uploaded file if error occurred
        if (req.file && req.file.path) {
            fs.unlink(req.file.path).catch(err => console.error('Error deleting file:', err));
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to upload file',
            error: error.message
        });
    }
});

// GET /api/v1/bulk-import/history - Get import history with pagination
app.get("/api/v1/bulk-import/history", verifyToken, async (req, res) => {
    try {
        console.log('📋 Admin: Fetching bulk import history');
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Build filter
        const filter = {};
        if (req.query.status) {
            filter.status = req.query.status;
        }
        if (req.query.importType) {
            filter.importType = req.query.importType;
        }
        if (req.query.search) {
            filter.$or = [
                { fileName: { $regex: req.query.search, $options: 'i' } },
                { importType: { $regex: req.query.search, $options: 'i' } }
            ];
        }
        
        // Date range filter
        if (req.query.startDate || req.query.endDate) {
            filter.createdAt = {};
            if (req.query.startDate) {
                filter.createdAt.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                filter.createdAt.$lte = new Date(req.query.endDate);
            }
        }

        const total = await BulkImport.countDocuments(filter);
        const imports = await BulkImport.find(filter)
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            success: true,
            data: imports,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                hasNext: skip + limit < total,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('❌ Error fetching bulk import history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch import history',
            error: error.message
        });
    }
});

// GET /api/v1/bulk-import/status/:id - Get import status
app.get("/api/v1/bulk-import/status/:id", verifyToken, async (req, res) => {
    try {
        const bulkImport = await BulkImport.findById(req.params.id)
            .populate('uploadedBy', 'name email');
        
        if (!bulkImport) {
            return res.status(404).json({
                success: false,
                message: 'Import not found'
            });
        }

        res.json({
            success: true,
            data: bulkImport
        });

    } catch (error) {
        console.error('❌ Error fetching import status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch import status',
            error: error.message
        });
    }
});

// DELETE /api/v1/bulk-import/:id - Delete import record
app.delete("/api/v1/bulk-import/:id", verifyToken, async (req, res) => {
    try {
        const bulkImport = await BulkImport.findById(req.params.id);
        
        if (!bulkImport) {
            return res.status(404).json({
                success: false,
                message: 'Import not found'
            });
        }

        // Delete the file if it exists
        if (bulkImport.filePath && fs.existsSync(bulkImport.filePath)) {
            await fs.unlink(bulkImport.filePath);
        }

        await BulkImport.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Import deleted successfully'
        });

    } catch (error) {
        console.error('❌ Error deleting import:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete import',
            error: error.message
        });
    }
});

// Async function to process CSV file
async function processCSVFile(importId, filePath, importType, columnMapping, userId) {
    try {
        console.log(`📊 Starting CSV processing for import ${importId}`);
        
        const bulkImport = await BulkImport.findById(importId);
        if (!bulkImport) {
            console.error('❌ Import record not found');
            return;
        }

        // Update status to processing
        bulkImport.status = 'processing';
        bulkImport.startTime = new Date();
        await bulkImport.save();

        const results = [];
        const errors = [];
        let totalRows = 0;
        let processedRows = 0;

        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csvParser())
                .on('data', async (row) => {
                    totalRows++;
                    
                    try {
                        // Process row based on import type
                        await processRow(row, importType, columnMapping, bulkImport, totalRows);
                        processedRows++;
                        
                        // Update progress every 10 rows
                        if (totalRows % 10 === 0) {
                            bulkImport.processedCount = processedRows;
                            bulkImport.totalCount = totalRows;
                            bulkImport.progressPercentage = Math.round((processedRows / totalRows) * 100);
                            await bulkImport.save();
                        }
                        
                    } catch (error) {
                        console.error(`❌ Error processing row ${totalRows}:`, error);
                        bulkImport.addError(totalRows, 'general', error.message);
                        errors.push({
                            row: totalRows,
                            field: 'general',
                            message: error.message,
                            data: row
                        });
                    }
                })
                .on('end', async () => {
                    try {
                        // Final update
                        bulkImport.status = errors.length === totalRows ? 'failed' : 'completed';
                        bulkImport.endTime = new Date();
                        bulkImport.totalCount = totalRows;
                        bulkImport.processedCount = processedRows;
                        bulkImport.successfulCount = processedRows;
                        bulkImport.failedCount = errors.length;
                        bulkImport.progressPercentage = 100;
                        
                        // Save summary
                        bulkImport.summary = {
                            totalRows,
                            processedRows,
                            successfulRows: processedRows,
                            failedRows: errors.length,
                            processingTime: bulkImport.endTime - bulkImport.startTime
                        };
                        
                        await bulkImport.save();
                        
                        console.log(`✅ CSV processing completed for import ${importId}: ${processedRows}/${totalRows} rows processed`);
                        resolve();
                        
                    } catch (error) {
                        console.error(`❌ Error finalizing import ${importId}:`, error);
                        bulkImport.status = 'failed';
                        await bulkImport.save();
                        reject(error);
                    }
                })
                .on('error', async (error) => {
                    console.error(`❌ CSV parsing error for import ${importId}:`, error);
                    bulkImport.status = 'failed';
                    bulkImport.endTime = new Date();
                    await bulkImport.save();
                    reject(error);
                });
        });

    } catch (error) {
        console.error(`❌ Error processing CSV file for import ${importId}:`, error);
        
        try {
            const bulkImport = await BulkImport.findById(importId);
            if (bulkImport) {
                bulkImport.status = 'failed';
                bulkImport.endTime = new Date();
                await bulkImport.save();
            }
        } catch (updateError) {
            console.error('❌ Error updating failed import status:', updateError);
        }
    }
}

// Process individual row based on import type
async function processRow(row, importType, columnMapping, bulkImport, rowNumber) {
    switch (importType) {
        case 'customers':
            await processCustomerRow(row, columnMapping, bulkImport, rowNumber);
            break;
        case 'consents':
            await processConsentRow(row, columnMapping, bulkImport, rowNumber);
            break;
        case 'preferences':
            await processPreferenceRow(row, columnMapping, bulkImport, rowNumber);
            break;
        case 'users':
            await processUserRow(row, columnMapping, bulkImport, rowNumber);
            break;
        default:
            throw new Error(`Unsupported import type: ${importType}`);
    }
}

// Process customer data row
async function processCustomerRow(row, columnMapping, bulkImport, rowNumber) {
    try {
        // Map CSV columns to user fields
        const userData = {
            name: row[columnMapping.name || 'name'] || row.name,
            email: row[columnMapping.email || 'email'] || row.email,
            phone: row[columnMapping.phone || 'phone'] || row.phone,
            role: 'customer',
            isActive: true
        };

        // Validate required fields
        if (!userData.email) {
            throw new Error('Email is required');
        }
        if (!userData.name) {
            throw new Error('Name is required');
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Create new user
        const user = new User(userData);
        await user.save();
        
        // Update statistics
        bulkImport.statistics.customers = (bulkImport.statistics.customers || 0) + 1;
        
        console.log(`✅ Created customer: ${userData.email}`);

    } catch (error) {
        bulkImport.addError(rowNumber, 'customer', error.message);
        throw error;
    }
}

// Process consent data row
async function processConsentRow(row, columnMapping, bulkImport, rowNumber) {
    try {
        // Map CSV columns to consent fields
        const consentData = {
            userId: row[columnMapping.userId || 'userId'] || row.userId,
            purpose: row[columnMapping.purpose || 'purpose'] || row.purpose,
            status: row[columnMapping.status || 'status'] || row.status || 'granted',
            source: 'bulk_import',
            metadata: {
                importId: bulkImport._id,
                rowNumber: rowNumber
            }
        };

        // Validate required fields
        if (!consentData.userId) {
            throw new Error('User ID is required');
        }
        if (!consentData.purpose) {
            throw new Error('Purpose is required');
        }

        // Verify user exists
        const user = await User.findById(consentData.userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Create consent record
        const consent = new Consent(consentData);
        await consent.save();
        
        // Update statistics
        bulkImport.statistics.consents = (bulkImport.statistics.consents || 0) + 1;
        
        console.log(`✅ Created consent for user: ${consentData.userId}`);

    } catch (error) {
        bulkImport.addError(rowNumber, 'consent', error.message);
        throw error;
    }
}

// Process preference data row
async function processPreferenceRow(row, columnMapping, bulkImport, rowNumber) {
    try {
        // Map CSV columns to preference fields
        const preferenceData = {
            userId: row[columnMapping.userId || 'userId'] || row.userId,
            categoryId: row[columnMapping.categoryId || 'categoryId'] || row.categoryId,
            itemId: row[columnMapping.itemId || 'itemId'] || row.itemId,
            value: row[columnMapping.value || 'value'] || row.value || true
        };

        // Validate required fields
        if (!preferenceData.userId) {
            throw new Error('User ID is required');
        }
        if (!preferenceData.categoryId) {
            throw new Error('Category ID is required');
        }
        if (!preferenceData.itemId) {
            throw new Error('Item ID is required');
        }

        // Verify user exists
        const user = await User.findById(preferenceData.userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Create or update preference
        await UserPreference.findOneAndUpdate(
            { userId: preferenceData.userId, itemId: preferenceData.itemId },
            { 
                ...preferenceData,
                updatedAt: new Date()
            },
            { upsert: true }
        );
        
        // Update statistics
        bulkImport.statistics.preferences = (bulkImport.statistics.preferences || 0) + 1;
        
        console.log(`✅ Updated preference for user: ${preferenceData.userId}`);

    } catch (error) {
        bulkImport.addError(rowNumber, 'preference', error.message);
        throw error;
    }
}

// Process user data row (for admin user creation)
async function processUserRow(row, columnMapping, bulkImport, rowNumber) {
    try {
        // Map CSV columns to user fields
        const userData = {
            name: row[columnMapping.name || 'name'] || row.name,
            email: row[columnMapping.email || 'email'] || row.email,
            phone: row[columnMapping.phone || 'phone'] || row.phone,
            role: row[columnMapping.role || 'role'] || row.role || 'customer',
            isActive: row[columnMapping.isActive || 'isActive'] !== 'false'
        };

        // Validate required fields
        if (!userData.email) {
            throw new Error('Email is required');
        }
        if (!userData.name) {
            throw new Error('Name is required');
        }

        // Validate role
        const validRoles = ['admin', 'csr', 'customer'];
        if (!validRoles.includes(userData.role)) {
            throw new Error(`Invalid role: ${userData.role}. Must be one of: ${validRoles.join(', ')}`);
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Create new user
        const user = new User(userData);
        await user.save();
        
        // Update statistics
        bulkImport.statistics.users = (bulkImport.statistics.users || 0) + 1;
        
        console.log(`✅ Created user: ${userData.email} with role: ${userData.role}`);

    } catch (error) {
        bulkImport.addError(rowNumber, 'user', error.message);
        throw error;
    }
}

// ============================================================================
// WEBHOOK/EVENT LISTENER ENDPOINTS
// ============================================================================

// GET /api/v1/webhooks - Get all webhooks with pagination and filtering
app.get("/api/v1/webhooks", verifyToken, async (req, res) => {
    try {
        console.log('📡 Admin: Fetching webhooks');
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Build filter
        const filter = {};
        if (req.query.status) {
            if (req.query.status === 'active') {
                filter.isActive = true;
            } else if (req.query.status === 'inactive') {
                filter.isActive = false;
            }
        }
        if (req.query.search) {
            filter.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { url: { $regex: req.query.search, $options: 'i' } }
            ];
        }
        if (req.query.event) {
            filter.events = req.query.event;
        }

        const total = await Webhook.countDocuments(filter);
        const webhooks = await Webhook.find(filter)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            success: true,
            data: webhooks,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                hasNext: skip + limit < total,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('❌ Error fetching webhooks:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch webhooks',
            error: error.message
        });
    }
});

// POST /api/v1/webhooks - Create new webhook
app.post("/api/v1/webhooks", verifyToken, async (req, res) => {
    try {
        console.log('📡 Admin: Creating new webhook');
        
        const { name, url, events, isActive, retryAttempts, timeout, headers } = req.body;
        
        // Validate required fields
        if (!name || !url || !events || !Array.isArray(events) || events.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Name, URL, and at least one event are required'
            });
        }

        const webhook = new Webhook({
            name,
            url,
            events,
            isActive: isActive !== false, // Default to true
            retryAttempts: retryAttempts || 3,
            timeout: timeout || 30000,
            headers: headers ? new Map(Object.entries(headers)) : new Map(),
            createdBy: req.userId
        });

        await webhook.save();

        // Populate the created webhook
        const populatedWebhook = await Webhook.findById(webhook._id)
            .populate('createdBy', 'name email');

        res.status(201).json({
            success: true,
            message: 'Webhook created successfully',
            data: populatedWebhook
        });

    } catch (error) {
        console.error('❌ Error creating webhook:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: errors
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to create webhook',
            error: error.message
        });
    }
});

// PUT /api/v1/webhooks/:id - Update webhook
app.put("/api/v1/webhooks/:id", verifyToken, async (req, res) => {
    try {
        console.log(`📡 Admin: Updating webhook ${req.params.id}`);
        
        const { name, url, events, isActive, retryAttempts, timeout, headers } = req.body;
        
        const webhook = await Webhook.findById(req.params.id);
        if (!webhook) {
            return res.status(404).json({
                success: false,
                message: 'Webhook not found'
            });
        }

        // Update fields
        if (name !== undefined) webhook.name = name;
        if (url !== undefined) webhook.url = url;
        if (events !== undefined) webhook.events = events;
        if (isActive !== undefined) webhook.isActive = isActive;
        if (retryAttempts !== undefined) webhook.retryAttempts = retryAttempts;
        if (timeout !== undefined) webhook.timeout = timeout;
        if (headers !== undefined) webhook.headers = new Map(Object.entries(headers));
        webhook.updatedBy = req.userId;

        await webhook.save();

        // Populate the updated webhook
        const populatedWebhook = await Webhook.findById(webhook._id)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');

        res.json({
            success: true,
            message: 'Webhook updated successfully',
            data: populatedWebhook
        });

    } catch (error) {
        console.error('❌ Error updating webhook:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: errors
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to update webhook',
            error: error.message
        });
    }
});

// DELETE /api/v1/webhooks/:id - Delete webhook
app.delete("/api/v1/webhooks/:id", verifyToken, async (req, res) => {
    try {
        console.log(`📡 Admin: Deleting webhook ${req.params.id}`);
        
        const webhook = await Webhook.findById(req.params.id);
        if (!webhook) {
            return res.status(404).json({
                success: false,
                message: 'Webhook not found'
            });
        }

        await Webhook.findByIdAndDelete(req.params.id);
        
        // Also delete related event logs
        await EventLog.deleteMany({ webhookId: req.params.id });

        res.json({
            success: true,
            message: 'Webhook deleted successfully'
        });

    } catch (error) {
        console.error('❌ Error deleting webhook:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete webhook',
            error: error.message
        });
    }
});

// POST /api/v1/webhooks/:id/test - Test webhook connection
app.post("/api/v1/webhooks/:id/test", verifyToken, async (req, res) => {
    try {
        console.log(`📡 Admin: Testing webhook ${req.params.id}`);
        
        const webhook = await Webhook.findById(req.params.id);
        if (!webhook) {
            return res.status(404).json({
                success: false,
                message: 'Webhook not found'
            });
        }

        const result = await webhook.testConnection();
        
        res.json({
            success: result.success,
            message: result.success ? 'Webhook test successful' : 'Webhook test failed',
            data: result
        });

    } catch (error) {
        console.error('❌ Error testing webhook:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to test webhook',
            error: error.message
        });
    }
});

// GET /api/v1/webhooks/events - Get available events
app.get("/api/v1/webhooks/events", verifyToken, async (req, res) => {
    try {
        const events = [
            { value: 'consent.granted', label: 'Consent Granted', description: 'Triggered when a user grants consent' },
            { value: 'consent.withdrawn', label: 'Consent Withdrawn', description: 'Triggered when a user withdraws consent' },
            { value: 'consent.updated', label: 'Consent Updated', description: 'Triggered when consent is updated' },
            { value: 'dsar.created', label: 'DSAR Request Created', description: 'Triggered when a new DSAR request is created' },
            { value: 'dsar.updated', label: 'DSAR Request Updated', description: 'Triggered when a DSAR request is updated' },
            { value: 'dsar.completed', label: 'DSAR Request Completed', description: 'Triggered when a DSAR request is completed' },
            { value: 'dsar.cancelled', label: 'DSAR Request Cancelled', description: 'Triggered when a DSAR request is cancelled' },
            { value: 'privacy.notice.created', label: 'Privacy Notice Created', description: 'Triggered when a new privacy notice is created' },
            { value: 'privacy.notice.updated', label: 'Privacy Notice Updated', description: 'Triggered when a privacy notice is updated' },
            { value: 'privacy.notice.acknowledged', label: 'Privacy Notice Acknowledged', description: 'Triggered when a privacy notice is acknowledged' },
            { value: 'user.created', label: 'User Created', description: 'Triggered when a new user is created' },
            { value: 'user.updated', label: 'User Updated', description: 'Triggered when a user is updated' },
            { value: 'user.deleted', label: 'User Deleted', description: 'Triggered when a user is deleted' },
            { value: 'preference.updated', label: 'Preference Updated', description: 'Triggered when user preferences are updated' },
            { value: 'audit.log.created', label: 'Audit Log Created', description: 'Triggered when a new audit log entry is created' },
            { value: 'bulk.import.started', label: 'Bulk Import Started', description: 'Triggered when a bulk import is started' },
            { value: 'bulk.import.completed', label: 'Bulk Import Completed', description: 'Triggered when a bulk import is completed' },
            { value: 'bulk.import.failed', label: 'Bulk Import Failed', description: 'Triggered when a bulk import fails' }
        ];

        res.json({
            success: true,
            data: events
        });

    } catch (error) {
        console.error('❌ Error fetching webhook events:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch webhook events',
            error: error.message
        });
    }
});

// GET /api/v1/webhooks/:id/logs - Get webhook delivery logs
app.get("/api/v1/webhooks/:id/logs", verifyToken, async (req, res) => {
    try {
        console.log(`📡 Admin: Fetching logs for webhook ${req.params.id}`);
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        const filter = { webhookId: req.params.id };
        if (req.query.status) {
            filter.deliveryStatus = req.query.status;
        }
        if (req.query.eventType) {
            filter.eventType = req.query.eventType;
        }

        const total = await EventLog.countDocuments(filter);
        const logs = await EventLog.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            success: true,
            data: logs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                hasNext: skip + limit < total,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('❌ Error fetching webhook logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch webhook logs',
            error: error.message
        });
    }
});

// GET /api/v1/webhooks/stats - Get webhook statistics
app.get("/api/v1/webhooks/stats", verifyToken, async (req, res) => {
    try {
        console.log('📡 Admin: Fetching webhook statistics');
        
        const stats = await Webhook.getStatistics();
        
        // Get recent activity (last 24 hours)
        const recentLogs = await EventLog.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });
        
        // Get most active webhooks
        const topWebhooks = await Webhook.find({ isActive: true })
            .sort({ totalTriggers: -1 })
            .limit(5)
            .populate('createdBy', 'name');

        res.json({
            success: true,
            stats: {
                ...stats,
                recentActivity: recentLogs,
                topWebhooks: topWebhooks
            }
        });

    } catch (error) {
        console.error('❌ Error fetching webhook statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch webhook statistics',
            error: error.message
        });
    }
});

// Webhook trigger function (used internally)
async function triggerWebhooks(eventType, data) {
    try {
        const webhooks = await Webhook.findByEvent(eventType);
        
        if (webhooks.length === 0) {
            console.log(`📡 No webhooks found for event: ${eventType}`);
            return;
        }
        
        console.log(`📡 Triggering ${webhooks.length} webhooks for event: ${eventType}`);
        
        const promises = webhooks.map(webhook => triggerSingleWebhook(webhook, eventType, data));
        await Promise.allSettled(promises);
        
    } catch (error) {
        console.error(`❌ Error triggering webhooks for ${eventType}:`, error);
    }
}

// Helper function to trigger a single webhook
async function triggerSingleWebhook(webhook, eventType, data) {
    const axios = require('axios');
    
    // Create event log entry
    const eventLog = new EventLog({
        webhookId: webhook._id,
        eventType: eventType,
        payload: data,
        maxAttempts: webhook.retryAttempts
    });
    
    await eventLog.save();
    
    try {
        const payload = {
            event: eventType,
            timestamp: new Date().toISOString(),
            data: data,
            webhook: {
                id: webhook._id,
                name: webhook.name
            }
        };
        
        const headers = {
            'Content-Type': 'application/json',
            'X-Webhook-Secret': webhook.secret,
            'User-Agent': 'ConsentHub/1.0',
            ...Object.fromEntries(webhook.headers)
        };
        
        const response = await axios.post(webhook.url, payload, {
            timeout: webhook.timeout,
            headers: headers
        });
        
        // Record success
        await webhook.recordSuccess();
        eventLog.deliveryStatus = 'delivered';
        eventLog.responseCode = response.status;
        eventLog.responseMessage = response.statusText;
        eventLog.deliveredAt = new Date();
        await eventLog.save();
        
        console.log(`✅ Webhook delivered successfully: ${webhook.name} (${response.status})`);
        
    } catch (error) {
        const statusCode = error.response?.status;
        const errorMessage = error.message;
        
        // Record failure
        await webhook.recordFailure(error, statusCode);
        eventLog.deliveryStatus = 'failed';
        eventLog.responseCode = statusCode;
        eventLog.error = errorMessage;
        eventLog.attempts += 1;
        
        // Schedule retry if attempts remaining
        if (eventLog.attempts < eventLog.maxAttempts) {
            eventLog.deliveryStatus = 'retry';
            eventLog.nextRetry = new Date(Date.now() + (eventLog.attempts * 60000)); // Exponential backoff
        }
        
        await eventLog.save();
        
        console.error(`❌ Webhook delivery failed: ${webhook.name} - ${errorMessage}`);
    }
}

// Export the trigger function for use in other parts of the application
global.triggerWebhooks = triggerWebhooks;

// ================================
// COMPLIANCE RULES API ENDPOINTS
// ================================

// GET /api/v1/compliance-rules - Get all compliance rules with pagination and filtering
app.get("/api/v1/compliance-rules", verifyToken, async (req, res) => {
    try {
        console.log('📋 Admin: Fetching compliance rules');
        
        const { 
            page = 1, 
            limit = 20, 
            status, 
            ruleType, 
            category, 
            priority,
            region,
            search 
        } = req.query;

        // Build filter object
        const filter = {};
        
        if (status) filter.status = status;
        if (ruleType) filter.ruleType = ruleType;
        if (category) filter.category = category;
        if (priority) filter.priority = priority;
        if (region) filter.applicableRegions = { $in: [region] };
        
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const skip = (page - 1) * limit;
        const totalRules = await ComplianceRule.countDocuments(filter);
        
        const rules = await ComplianceRule.find(filter)
            .populate('created_by updated_by approved_by', 'name email role')
            .sort({ priority: 1, createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        // Add virtual fields
        const rulesWithVirtuals = rules.map(rule => ({
            ...rule.toObject(),
            formattedRetentionPeriod: rule.formattedRetentionPeriod,
            complianceScore: rule.complianceScore
        }));

        res.json({
            success: true,
            data: {
                rules: rulesWithVirtuals,
                totalRules,
                totalPages: Math.ceil(totalRules / limit),
                currentPage: parseInt(page),
                hasMore: skip + rules.length < totalRules
            }
        });

    } catch (error) {
        console.error('❌ Error fetching compliance rules:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch compliance rules',
            error: error.message
        });
    }
});

// POST /api/v1/compliance-rules - Create new compliance rule
app.post("/api/v1/compliance-rules", verifyToken, async (req, res) => {
    try {
        console.log('📋 Admin: Creating new compliance rule');
        
        const ruleData = {
            ...req.body,
            created_by: req.user.id,
            audit_log: [{
                action: 'created',
                user: req.user.id,
                timestamp: new Date(),
                changes: req.body
            }]
        };

        const rule = new ComplianceRule(ruleData);
        await rule.save();
        
        await rule.populate('created_by', 'name email role');

        // Log audit event
        await AuditLog.create({
            userId: req.user.id,
            action: 'CREATE_COMPLIANCE_RULE',
            resource: 'compliance_rule',
            resourceId: rule._id,
            details: { 
                name: rule.name,
                ruleType: rule.ruleType,
                category: rule.category,
                status: rule.status
            },
            ipAddress: req.ip
        });

        res.status(201).json({
            success: true,
            message: 'Compliance rule created successfully',
            data: {
                ...rule.toObject(),
                formattedRetentionPeriod: rule.formattedRetentionPeriod,
                complianceScore: rule.complianceScore
            }
        });

    } catch (error) {
        console.error('❌ Error creating compliance rule:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(e => e.message)
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create compliance rule',
            error: error.message
        });
    }
});

// PUT /api/v1/compliance-rules/:id - Update compliance rule
app.put("/api/v1/compliance-rules/:id", verifyToken, async (req, res) => {
    try {
        console.log(`📋 Admin: Updating compliance rule ${req.params.id}`);
        
        const rule = await ComplianceRule.findById(req.params.id);
        if (!rule) {
            return res.status(404).json({
                success: false,
                message: 'Compliance rule not found'
            });
        }

        // Store old values for audit
        const oldValues = rule.toObject();
        
        // Update fields
        Object.assign(rule, req.body);
        rule.updated_by = req.user.id;
        
        // Add audit log entry
        rule.audit_log.push({
            action: 'updated',
            user: req.user.id,
            timestamp: new Date(),
            changes: req.body
        });

        await rule.save();
        await rule.populate('created_by updated_by approved_by', 'name email role');

        // Log audit event
        await AuditLog.create({
            userId: req.user.id,
            action: 'UPDATE_COMPLIANCE_RULE',
            resource: 'compliance_rule',
            resourceId: rule._id,
            details: { 
                name: rule.name,
                changes: Object.keys(req.body),
                oldStatus: oldValues.status,
                newStatus: rule.status
            },
            ipAddress: req.ip
        });

        res.json({
            success: true,
            message: 'Compliance rule updated successfully',
            data: {
                ...rule.toObject(),
                formattedRetentionPeriod: rule.formattedRetentionPeriod,
                complianceScore: rule.complianceScore
            }
        });

    } catch (error) {
        console.error('❌ Error updating compliance rule:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update compliance rule',
            error: error.message
        });
    }
});

// DELETE /api/v1/compliance-rules/:id - Delete compliance rule
app.delete("/api/v1/compliance-rules/:id", verifyToken, async (req, res) => {
    try {
        console.log(`📋 Admin: Deleting compliance rule ${req.params.id}`);
        
        const rule = await ComplianceRule.findById(req.params.id);
        if (!rule) {
            return res.status(404).json({
                success: false,
                message: 'Compliance rule not found'
            });
        }

        // Check if rule is active and has critical priority
        if (rule.status === 'active' && rule.priority === 'critical') {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete active critical compliance rules. Deactivate first.'
            });
        }

        // Store rule data for audit before deletion
        const ruleData = rule.toObject();

        await ComplianceRule.findByIdAndDelete(req.params.id);

        // Log audit event
        await AuditLog.create({
            userId: req.user.id,
            action: 'DELETE_COMPLIANCE_RULE',
            resource: 'compliance_rule',
            resourceId: req.params.id,
            details: { 
                name: ruleData.name,
                ruleType: ruleData.ruleType,
                category: ruleData.category,
                deletedStatus: ruleData.status
            },
            ipAddress: req.ip
        });

        res.json({
            success: true,
            message: 'Compliance rule deleted successfully'
        });

    } catch (error) {
        console.error('❌ Error deleting compliance rule:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete compliance rule',
            error: error.message
        });
    }
});

// POST /api/v1/compliance-rules/:id/execute - Execute compliance rule
app.post("/api/v1/compliance-rules/:id/execute", verifyToken, async (req, res) => {
    try {
        console.log(`📋 Admin: Executing compliance rule ${req.params.id}`);
        
        const rule = await ComplianceRule.findById(req.params.id);
        if (!rule) {
            return res.status(404).json({
                success: false,
                message: 'Compliance rule not found'
            });
        }

        if (rule.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'Only active rules can be executed'
            });
        }

        // Execute the rule (this would contain actual compliance logic)
        const context = req.body || {};
        await rule.execute(context);

        // Log audit event
        await AuditLog.create({
            userId: req.user.id,
            action: 'EXECUTE_COMPLIANCE_RULE',
            resource: 'compliance_rule',
            resourceId: rule._id,
            details: { 
                name: rule.name,
                executionContext: context,
                executionCount: rule.metrics.enforcement_count
            },
            ipAddress: req.ip
        });

        res.json({
            success: true,
            message: 'Compliance rule executed successfully',
            data: {
                executionCount: rule.metrics.enforcement_count,
                lastExecuted: rule.metrics.last_executed
            }
        });

    } catch (error) {
        console.error('❌ Error executing compliance rule:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to execute compliance rule',
            error: error.message
        });
    }
});

// GET /api/v1/compliance-rules/stats - Get compliance statistics
app.get("/api/v1/compliance-rules/stats", verifyToken, async (req, res) => {
    try {
        console.log('📊 Admin: Fetching compliance rule statistics');
        
        const totalRules = await ComplianceRule.countDocuments();
        const activeRules = await ComplianceRule.countDocuments({ status: 'active' });
        const inactiveRules = await ComplianceRule.countDocuments({ status: 'inactive' });
        const draftRules = await ComplianceRule.countDocuments({ status: 'draft' });
        const pendingReview = await ComplianceRule.countDocuments({ status: 'pending_review' });
        
        // Priority breakdown
        const criticalRules = await ComplianceRule.countDocuments({ priority: 'critical' });
        const highPriorityRules = await ComplianceRule.countDocuments({ priority: 'high' });
        const mediumPriorityRules = await ComplianceRule.countDocuments({ priority: 'medium' });
        const lowPriorityRules = await ComplianceRule.countDocuments({ priority: 'low' });
        
        // Rule type breakdown
        const gdprRules = await ComplianceRule.countDocuments({ ruleType: 'GDPR' });
        const ccpaRules = await ComplianceRule.countDocuments({ ruleType: 'CCPA' });
        const pipedaRules = await ComplianceRule.countDocuments({ ruleType: 'PIPEDA' });
        
        // Category breakdown
        const categoryStats = await ComplianceRule.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);
        
        // Overdue reviews
        const overdueReviews = await ComplianceRule.getOverdueReviews();
        
        // Execution stats
        const executionStats = await ComplianceRule.aggregate([
            { $group: { 
                _id: null, 
                totalExecutions: { $sum: '$metrics.enforcement_count' },
                avgSuccessRate: { $avg: '$metrics.success_rate' }
            }}
        ]);

        res.json({
            success: true,
            data: {
                overview: {
                    totalRules,
                    activeRules,
                    inactiveRules,
                    draftRules,
                    pendingReview
                },
                priority: {
                    critical: criticalRules,
                    high: highPriorityRules,
                    medium: mediumPriorityRules,
                    low: lowPriorityRules
                },
                ruleTypes: {
                    GDPR: gdprRules,
                    CCPA: ccpaRules,
                    PIPEDA: pipedaRules
                },
                categories: categoryStats.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                compliance: {
                    overdueReviews: overdueReviews.length,
                    totalExecutions: executionStats[0]?.totalExecutions || 0,
                    avgSuccessRate: Math.round(executionStats[0]?.avgSuccessRate || 0)
                }
            }
        });

    } catch (error) {
        console.error('❌ Error fetching compliance statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch compliance statistics',
            error: error.message
        });
    }
});

// GET /api/v1/compliance-rules/overdue-reviews - Get rules that need review
app.get("/api/v1/compliance-rules/overdue-reviews", verifyToken, async (req, res) => {
    try {
        console.log('📋 Admin: Fetching overdue compliance reviews');
        
        const overdueRules = await ComplianceRule.getOverdueReviews();
        
        res.json({
            success: true,
            data: {
                rules: overdueRules,
                totalOverdue: overdueRules.length
            }
        });

    } catch (error) {
        console.error('❌ Error fetching overdue reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch overdue reviews',
            error: error.message
        });
    }
});

// GET /api/v1/compliance-rules/categories - Get available categories and rule types
app.get("/api/v1/compliance-rules/categories", verifyToken, async (req, res) => {
    try {
        console.log('📋 Admin: Fetching compliance categories and types');
        
        res.json({
            success: true,
            data: {
                ruleTypes: ['GDPR', 'CCPA', 'PIPEDA', 'Data_Retention', 'Consent_Management', 'Marketing', 'Cookie_Policy', 'Privacy_Notice'],
                categories: ['consent', 'data_retention', 'privacy_rights', 'marketing', 'cookies', 'breach_notification', 'data_processing'],
                priorities: ['critical', 'high', 'medium', 'low'],
                statuses: ['active', 'inactive', 'draft', 'pending_review'],
                regions: ['EU', 'US', 'CA', 'UK', 'AU', 'GLOBAL'],
                dataTypes: ['personal_data', 'sensitive_data', 'marketing_data', 'analytics_data', 'behavioral_data', 'financial_data'],
                legalBasis: ['consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests'],
                dataSubjectRights: ['access', 'rectification', 'erasure', 'portability', 'restriction', 'objection']
            }
        });

    } catch (error) {
        console.error('❌ Error fetching compliance categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch compliance categories',
            error: error.message
        });
    }
});

// GET /api/v1/preferences/stats - Get preference statistics (MUST come before generic /preferences route)
app.get("/api/v1/preferences/stats", async (req, res) => {
    try {
        console.log('� STATS ROUTE HIT: /api/v1/preferences/stats - This should be the stats route!');
        console.log('�📊 Admin: Fetching preference statistics');
        
        const totalPreferences = await PreferenceItem.countDocuments();
        const activePreferences = await PreferenceItem.countDocuments({ enabled: true });
        const totalUsers = await User.countDocuments();
        const categoriesCount = await PreferenceCategory.countDocuments();
        
        // Category stats
        const categories = await PreferenceCategory.find({});
        const categoryStats = {};
        
        for (const category of categories) {
            const count = await PreferenceItem.countDocuments({ categoryId: category.id });
            const enabled = await PreferenceItem.countDocuments({ categoryId: category.id, enabled: true });
            const users = await UserPreference.countDocuments({
                preferenceId: { $in: await PreferenceItem.find({ categoryId: category.id }).distinct('id') }
            });
            
            categoryStats[category.name] = {
                count,
                enabled,
                users: users || 0
            };
        }
        
        const customizedUserIds = await UserPreference.distinct('partyId');
        const customizedUsers = customizedUserIds.length;
        const engagementRate = totalUsers > 0 ? Math.round((customizedUsers / totalUsers) * 100) : 0;
        
        res.json({
            totalPreferences,
            activePreferences,
            totalUsers,
            categoriesCount,
            lastUpdated: new Date().toISOString(),
            categoryStats,
            userEngagement: {
                customizedUsers,
                defaultUsers: totalUsers - customizedUsers,
                engagementRate
            }
        });
    } catch (error) {
        console.error('❌ Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics', details: error.message });
    }
});

// GET /api/v1/preferences - Get customer preferences for CSR
app.get("/api/v1/preferences", (req, res) => {
    console.log('⚙️ CSR Dashboard: Fetching preferences data');
    const partyId = req.query.partyId;
    if (partyId) {
        const prefs = customerPreferences.filter(p => p.partyId === partyId);
        res.json(prefs);
    } else {
        res.json(customerPreferences);
    }
});

// POST /api/v1/dsar - Create new DSAR request
app.post("/api/v1/dsar", (req, res) => {
    console.log('📋 CSR Dashboard: Creating new DSAR request');
    const newRequest = {
        id: String(dsarRequests.length + 1),
        ...req.body,
        submittedAt: new Date().toISOString(),
        status: req.body.status || 'pending'
    };
    dsarRequests.push(newRequest);
    res.json(newRequest);
});

// PUT /api/v1/dsar/:id - Update DSAR request status
app.put("/api/v1/dsar/:id", (req, res) => {
    console.log('📋 CSR Dashboard: Updating DSAR request:', req.params.id);
    const requestId = req.params.id;
    const requestIndex = dsarRequests.findIndex(r => r.id === requestId);
    
    if (requestIndex >= 0) {
        dsarRequests[requestIndex] = {
            ...dsarRequests[requestIndex],
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        
        if (req.body.status === 'completed') {
            dsarRequests[requestIndex].completedAt = new Date().toISOString();
        }
        
        res.json(dsarRequests[requestIndex]);
    } else {
        res.status(404).json({ error: 'DSAR request not found' });
    }
});

// POST /api/v1/consent - Create new consent record
app.post("/api/v1/consent", async (req, res) => {
    try {
        console.log('✅ CSR Dashboard: Creating new consent');
        console.log('Request body:', req.body);
        
        // Generate unique ID
        const consentCount = await Consent.countDocuments();
        const newConsentId = String(consentCount + 1);
        
        // Create consent data with proper structure
        const consentData = {
            id: newConsentId,
            partyId: req.body.partyId,
            customerId: req.body.partyId, // Use partyId as customerId for consistency
            purpose: req.body.purpose,
            status: req.body.status,
            channel: req.body.channel,
            geoLocation: req.body.geoLocation || 'Sri Lanka',
            privacyNoticeId: req.body.privacyNoticeId || 'PN-001',
            versionAccepted: req.body.versionAccepted || '1.0',
            recordSource: 'admin-dashboard',
            type: req.body.purpose, // Use purpose as type for compatibility
            consentType: req.body.purpose, // Use purpose as consentType for compatibility
            validFrom: req.body.validFor?.startDateTime ? new Date(req.body.validFor.startDateTime) : new Date(),
            validTo: req.body.validFor?.endDateTime ? new Date(req.body.validFor.endDateTime) : undefined,
            expiresAt: req.body.validFor?.endDateTime ? new Date(req.body.validFor.endDateTime) : undefined,
            grantedAt: req.body.status === 'granted' ? new Date() : undefined,
            timestampGranted: req.body.status === 'granted' ? new Date().toISOString() : undefined,
            deniedAt: req.body.status === 'revoked' ? new Date() : undefined,
            metadata: req.body.metadata || {}
        };
        
        // Save to MongoDB
        const newConsent = new Consent(consentData);
        const savedConsent = await newConsent.save();
        
        // Also add to in-memory array for compatibility with existing frontend
        const memoryConsent = {
            id: savedConsent.id,
            partyId: savedConsent.partyId,
            customerId: savedConsent.customerId,
            purpose: savedConsent.purpose,
            status: savedConsent.status,
            channel: savedConsent.channel,
            type: savedConsent.type,
            consentType: savedConsent.consentType,
            geoLocation: savedConsent.geoLocation,
            grantedAt: savedConsent.grantedAt,
            expiresAt: savedConsent.expiresAt,
            deniedAt: savedConsent.deniedAt
        };
        csrConsents.push(memoryConsent);
        
        console.log('✅ Consent saved to MongoDB:', savedConsent.id);
        res.json(savedConsent);
        
    } catch (error) {
        console.error('❌ Error creating consent:', error);
        res.status(500).json({ 
            error: true, 
            message: 'Failed to create consent',
            details: error.message 
        });
    }
});

// PUT /api/v1/consent/:id - Update consent status
app.put("/api/v1/consent/:id", async (req, res) => {
    try {
        console.log('✅ CSR Dashboard: Updating consent:', req.params.id);
        const consentId = req.params.id;
        
        // Update in MongoDB first
        let updatedConsent = await Consent.findOne({ id: consentId });
        
        if (updatedConsent) {
            // Update MongoDB document
            Object.assign(updatedConsent, req.body);
            
            if (req.body.status === 'granted') {
                updatedConsent.grantedAt = new Date();
                updatedConsent.timestampGranted = new Date().toISOString();
            } else if (req.body.status === 'revoked') {
                updatedConsent.revokedAt = new Date();
                updatedConsent.timestampRevoked = new Date().toISOString();
            }
            
            await updatedConsent.save();
            console.log('✅ Consent updated in MongoDB:', consentId);
            
            // Also update in-memory array for compatibility
            const consentIndex = csrConsents.findIndex(c => c.id === consentId);
            if (consentIndex >= 0) {
                csrConsents[consentIndex] = {
                    ...csrConsents[consentIndex],
                    ...req.body,
                    updatedAt: new Date().toISOString(),
                    grantedAt: req.body.status === 'granted' ? new Date().toISOString() : csrConsents[consentIndex].grantedAt,
                    revokedAt: req.body.status === 'revoked' ? new Date().toISOString() : csrConsents[consentIndex].revokedAt
                };
            }
            
            res.json(updatedConsent);
        } else {
            // Fallback to in-memory update
            const consentIndex = csrConsents.findIndex(c => c.id === consentId);
            
            if (consentIndex >= 0) {
                const updatedConsentMem = {
                    ...csrConsents[consentIndex],
                    ...req.body,
                    updatedAt: new Date().toISOString()
                };
                
                if (req.body.status === 'granted') {
                    updatedConsentMem.grantedAt = new Date().toISOString();
                } else if (req.body.status === 'revoked') {
                    updatedConsentMem.revokedAt = new Date().toISOString();
                }
                
                csrConsents[consentIndex] = updatedConsentMem;
                res.json(updatedConsentMem);
            } else {
                res.status(404).json({ error: 'Consent record not found' });
            }
        }
        
    } catch (error) {
        console.error('❌ Error updating consent:', error);
        res.status(500).json({ 
            error: true, 
            message: 'Failed to update consent',
            details: error.message 
        });
    }
});

// POST /api/v1/preferences - Create/Update preferences for CSR
app.post("/api/v1/preferences", (req, res) => {
    console.log('⚙️ CSR Dashboard: Creating/updating preferences');
    const newPrefs = {
        id: Date.now().toString(),
        ...req.body,
        updatedAt: new Date().toISOString()
    };
    customerPreferences.push(newPrefs);
    res.status(201).json(newPrefs);
});

// ===== COMPREHENSIVE PREFERENCE MANAGEMENT ENDPOINTS =====

// GET /api/v1/preferences/categories - Get all preference categories
app.get("/api/v1/preferences/categories", async (req, res) => {
    try {
        console.log('📂 Admin: Fetching preference categories');
        const categories = await PreferenceCategory.find({}).sort({ priority: -1, name: 1 });
        res.json({
            categories,
            totalCount: categories.length
        });
    } catch (error) {
        console.error('❌ Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories', details: error.message });
    }
});

// POST /api/v1/preferences/categories - Create preference category
app.post("/api/v1/preferences/categories", async (req, res) => {
    try {
        console.log('📂 Admin: Creating preference category');
        const categoryData = {
            id: Date.now().toString(),
            ...req.body,
            priority: req.body.priority || 0
        };
        
        const category = new PreferenceCategory(categoryData);
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        console.error('❌ Error creating category:', error);
        res.status(500).json({ error: 'Failed to create category', details: error.message });
    }
});

// PUT /api/v1/preferences/categories/:id - Update preference category
app.put("/api/v1/preferences/categories/:id", async (req, res) => {
    try {
        console.log('📂 Admin: Updating preference category:', req.params.id);
        const category = await PreferenceCategory.findOneAndUpdate(
            { id: req.params.id },
            { ...req.body, updatedAt: new Date() },
            { new: true }
        );
        
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        
        res.json(category);
    } catch (error) {
        console.error('❌ Error updating category:', error);
        res.status(500).json({ error: 'Failed to update category', details: error.message });
    }
});

// DELETE /api/v1/preferences/categories/:id - Delete preference category
app.delete("/api/v1/preferences/categories/:id", async (req, res) => {
    try {
        console.log('📂 Admin: Deleting preference category:', req.params.id);
        
        // Check if category has preferences
        const hasPreferences = await PreferenceItem.countDocuments({ categoryId: req.params.id });
        if (hasPreferences > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete category with existing preferences',
                details: `${hasPreferences} preferences found in this category`
            });
        }
        
        const category = await PreferenceCategory.findOneAndDelete({ id: req.params.id });
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('❌ Error deleting category:', error);
        res.status(500).json({ error: 'Failed to delete category', details: error.message });
    }
});

// ===== ADMIN DASHBOARD OVERVIEW ENDPOINT =====

// GET /api/v1/admin/dashboard/overview - Get comprehensive admin dashboard overview
app.get("/api/v1/admin/dashboard/overview", verifyToken, async (req, res) => {
    try {
        console.log('📊 Admin Dashboard: Fetching comprehensive overview data');
        
        // Fetch data from MongoDB using available Mongoose models
        const [consentsFromDB, dsarFromDB, preferencesFromDB, usersFromDB] = await Promise.all([
            Consent.find({}).sort({ createdAt: -1 }).lean(),
            DSARRequest.find({}).sort({ createdAt: -1 }).lean(),
            UserPreference.find({}).sort({ createdAt: -1 }).lean(),
            User.find({}).sort({ createdAt: -1 }).lean()
        ]);

        // Calculate comprehensive statistics
        const totalConsents = consentsFromDB.length;
        const grantedConsents = consentsFromDB.filter(c => c.status === 'granted').length;
        const revokedConsents = consentsFromDB.filter(c => c.status === 'revoked').length;
        const totalDSAR = dsarFromDB.length;
        const pendingDSAR = dsarFromDB.filter(d => d.status === 'pending').length;
        const totalPreferences = preferencesFromDB.length;
        const totalUsers = usersFromDB.length;

        // Get recent activity from consents (last 10)
        const recentActivity = consentsFromDB.slice(0, 10).map(consent => ({
            id: consent._id,
            type: 'consent',
            action: consent.status,
            purpose: consent.purpose,
            partyId: consent.partyId,
            timestamp: consent.createdAt,
            description: `Consent ${consent.status} for ${consent.purpose}`
        }));

        // Calculate compliance metrics
        const complianceScore = Math.round((grantedConsents / Math.max(totalConsents, 1)) * 100);
        
        // System health metrics
        const systemHealth = {
            servicesOnline: ['MongoDB', 'API Gateway', 'Consent Service', 'DSAR Service'],
            systemUptime: Math.floor(process.uptime()),
            lastBackup: new Date().toISOString(),
            databaseConnected: true
        };

        // Prepare response data
        const overview = {
            systemOverview: {
                totalConsents,
                grantedConsents,
                revokedConsents,
                totalPreferences,
                totalParties: totalUsers, // Users represent parties in our system
                totalDSAR,
                pendingDSAR,
                totalUsers
            },
            complianceMetrics: {
                complianceScore,
                consentGrantRate: totalConsents > 0 ? Math.round((grantedConsents / totalConsents) * 100) : 0,
                averageResponseTime: Math.floor(Math.random() * 100) + 50, // Simulated for now
                overdueItems: pendingDSAR,
                upcomingDeadlines: dsarFromDB.filter(d => d.status === 'pending').length
            },
            systemHealth,
            recentActivity,
            dataFreshness: new Date().toISOString()
        };

        console.log('✅ Admin Dashboard: Overview data compiled successfully');
        console.log(`📊 Stats: ${totalConsents} consents, ${totalUsers} users, ${totalDSAR} DSAR requests`);

        res.json({
            success: true,
            data: overview
        });

    } catch (error) {
        console.error('❌ Admin Dashboard Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard overview',
            error: error.message
        });
    }
});

// ===== ADMIN PREFERENCE MANAGEMENT ENDPOINTS =====

// GET /api/v1/preferences/admin - Get preference items with filtering for admin
app.get("/api/v1/preferences/admin", async (req, res) => {
    try {
        console.log('⚙️ Admin: Fetching preference items');
        const { 
            categoryId, 
            enabled, 
            type, 
            search, 
            limit = 20, 
            offset = 0, 
            sortBy = 'priority', 
            sortOrder = 'desc' 
        } = req.query;
        
        // Build query
        const query = {};
        if (categoryId) query.categoryId = categoryId;
        if (enabled !== undefined) query.enabled = enabled === 'true';
        if (type) query.type = type;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Execute query
        const sortObj = {};
        sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
        
        const preferences = await PreferenceItem.find(query)
            .sort(sortObj)
            .limit(parseInt(limit))
            .skip(parseInt(offset));
            
        const totalCount = await PreferenceItem.countDocuments(query);
        
        // Calculate real user counts for each preference item
        const preferencesWithUserCounts = await Promise.all(preferences.map(async (pref) => {
            try {
                // Count users who have this preference set (either enabled or disabled)
                const userCount = await UserPreference.countDocuments({
                    preferenceId: pref.id
                });
                
                // Count users who have enabled this preference specifically
                const enabledUserCount = await UserPreference.countDocuments({
                    preferenceId: pref.id,
                    value: true
                });
                
                const prefObj = pref.toObject();
                
                return {
                    ...prefObj,
                    // Replace the fake users count with real userCount
                    users: userCount,
                    userCount: userCount,
                    enabledUserCount: enabledUserCount,
                    // Add percentage of users who have this preference enabled
                    enabledPercentage: userCount > 0 ? Math.round((enabledUserCount / userCount) * 100) : 0
                };
            } catch (err) {
                console.error(`Error calculating user count for preference ${pref.id}:`, err);
                const prefObj = pref.toObject();
                return {
                    ...prefObj,
                    users: 0, // Replace fake count with 0
                    userCount: 0,
                    enabledUserCount: 0,
                    enabledPercentage: 0
                };
            }
        }));
        
        res.json({
            preferences: preferencesWithUserCounts,
            total: totalCount,
            totalCount,
            hasMore: totalCount > parseInt(offset) + parseInt(limit)
        });
    } catch (error) {
        console.error('❌ Error fetching preferences:', error);
        res.status(500).json({ error: 'Failed to fetch preferences', details: error.message });
    }
});

// GET /api/v1/preferences/admin/:id - Get specific preference item
app.get("/api/v1/preferences/admin/:id", async (req, res) => {
    try {
        console.log('🔴 ADMIN ROUTE HIT: /api/v1/preferences/admin/:id - ID param:', req.params.id);
        console.log('⚙️ Admin: Fetching preference item:', req.params.id);
        const preference = await PreferenceItem.findOne({ id: req.params.id });
        
        if (!preference) {
            return res.status(404).json({ error: 'Preference not found' });
        }
        
        res.json(preference);
    } catch (error) {
        console.error('❌ Error fetching preference:', error);
        res.status(500).json({ error: 'Failed to fetch preference', details: error.message });
    }
});

// POST /api/v1/preferences/admin - Create preference item
app.post("/api/v1/preferences/admin", async (req, res) => {
    try {
        console.log('⚙️ Admin: Creating preference item');
        
        // Verify category exists
        const category = await PreferenceCategory.findOne({ id: req.body.categoryId });
        if (!category) {
            return res.status(400).json({ error: 'Category not found' });
        }
        
        const preferenceData = {
            id: Date.now().toString(),
            ...req.body,
            users: 0,
            priority: req.body.priority || 0,
            enabled: req.body.enabled !== undefined ? req.body.enabled : true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const preference = new PreferenceItem(preferenceData);
        await preference.save();
        res.status(201).json(preference);
    } catch (error) {
        console.error('❌ Error creating preference:', error);
        res.status(500).json({ error: 'Failed to create preference', details: error.message });
    }
});

// PUT /api/v1/preferences/admin/:id - Update preference item
app.put("/api/v1/preferences/admin/:id", async (req, res) => {
    try {
        console.log('⚙️ Admin: Updating preference item:', req.params.id);
        const preference = await PreferenceItem.findOneAndUpdate(
            { id: req.params.id },
            { ...req.body, updatedAt: new Date() },
            { new: true }
        );
        
        if (!preference) {
            return res.status(404).json({ error: 'Preference not found' });
        }
        
        res.json(preference);
    } catch (error) {
        console.error('❌ Error updating preference:', error);
        res.status(500).json({ error: 'Failed to update preference', details: error.message });
    }
});

// DELETE /api/v1/preferences/admin/:id - Delete preference item
app.delete("/api/v1/preferences/admin/:id", async (req, res) => {
    try {
        console.log('⚙️ Admin: Deleting preference item:', req.params.id);
        
        // Delete associated user preferences
        await UserPreference.deleteMany({ preferenceId: req.params.id });
        
        const preference = await PreferenceItem.findOneAndDelete({ id: req.params.id });
        if (!preference) {
            return res.status(404).json({ error: 'Preference not found' });
        }
        
        res.json({ message: 'Preference deleted successfully' });
    } catch (error) {
        console.error('❌ Error deleting preference:', error);
        res.status(500).json({ error: 'Failed to delete preference', details: error.message });
    }
});

// PATCH /api/v1/preferences/admin/:id/toggle - Toggle preference enabled status
app.patch("/api/v1/preferences/admin/:id/toggle", async (req, res) => {
    try {
        console.log('⚙️ Admin: Toggling preference:', req.params.id);
        const preference = await PreferenceItem.findOneAndUpdate(
            { id: req.params.id },
            { enabled: req.body.enabled, updatedAt: new Date() },
            { new: true }
        );
        
        if (!preference) {
            return res.status(404).json({ error: 'Preference not found' });
        }
        
        res.json(preference);
    } catch (error) {
        console.error('❌ Error toggling preference:', error);
        res.status(500).json({ error: 'Failed to toggle preference', details: error.message });
    }
});

// GET /api/v1/users - Get all users for admin management
app.get("/api/v1/users", async (req, res) => {
    try {
        console.log('👥 Admin: Fetching all users from MongoDB');
        
        const { 
            role, 
            status, 
            search, 
            limit = 50, 
            offset = 0, 
            sortBy = 'createdAt', 
            sortOrder = 'desc' 
        } = req.query;
        
        // Build query
        const query = {};
        if (role && role !== 'all') query.role = role;
        if (status && status !== 'all') query.status = status;
        if (search) {
            query.$or = [
                { firstName: new RegExp(search, 'i') },
                { lastName: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') },
                { company: new RegExp(search, 'i') }
            ];
        }
        
        // Execute query
        const sortObj = {};
        sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
        
        const users = await User.find(query)
            .select('_id firstName lastName email phone company department jobTitle role status emailVerified isActive createdAt updatedAt lastLoginAt')
            .sort(sortObj)
            .limit(parseInt(limit))
            .skip(parseInt(offset))
            .lean();
            
        const totalCount = await User.countDocuments(query);
        
        // Transform users to match frontend expectations
        const transformedUsers = users.map(user => ({
            id: user._id.toString(),
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            phone: user.phone || '',
            role: user.role || 'customer',
            status: user.isActive ? 'active' : 'inactive',
            company: user.company || '',
            department: user.department || '',
            jobTitle: user.jobTitle || '',
            emailVerified: user.emailVerified || false,
            createdAt: user.createdAt,
            lastLogin: user.lastLoginAt || user.createdAt,
            permissions: [] // Could be extended based on role
        }));
        
        res.json({
            users: transformedUsers,
            totalCount,
            hasMore: totalCount > parseInt(offset) + parseInt(limit)
        });
    } catch (error) {
        console.error('❌ Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users', details: error.message });
    }
});

// POST /api/v1/users - Create new user (Admin only)
app.post("/api/v1/users", async (req, res) => {
    try {
        console.log('👥 Admin: Creating new user');
        
        const { 
            name,
            email, 
            password, 
            phone, 
            role = 'CSR',
            department,
            jobTitle,
            company = 'SLT-Mobitel'
        } = req.body;
        
        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                error: true,
                message: "Name, email, and password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                error: true,
                message: "Password must be at least 6 characters long"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                error: true,
                message: "User with this email already exists"
            });
        }
        
        // Split name into first and last name
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
        
        // Create new user
        const newUser = new User({
            email: email.toLowerCase(),
            password, // Will be hashed by the schema pre-save hook
            firstName,
            lastName,
            phone: phone || '',
            company: company || 'SLT-Mobitel',
            department: department || '',
            jobTitle: jobTitle || '',
            role: role || 'CSR',
            emailVerified: true, // Admin-created users are auto-verified
            isActive: true,
            acceptedTerms: true,
            acceptedPrivacy: true,
            language: 'en',
            createdBy: 'admin' // Track that this was admin-created
        });
        
        const savedUser = await newUser.save();
        console.log("New user created by admin:", savedUser.email, "ID:", savedUser._id);
        
        // Transform to match frontend expectations
        const responseUser = {
            id: savedUser._id.toString(),
            name: `${savedUser.firstName} ${savedUser.lastName}`,
            email: savedUser.email,
            phone: savedUser.phone || '',
            role: savedUser.role,
            status: savedUser.isActive ? 'active' : 'inactive',
            company: savedUser.company || '',
            department: savedUser.department || '',
            jobTitle: savedUser.jobTitle || '',
            emailVerified: savedUser.emailVerified,
            createdAt: savedUser.createdAt,
            lastLogin: null,
            permissions: []
        };
        
        res.status(201).json({
            error: false,
            message: "User created successfully",
            user: responseUser
        });
        
    } catch (error) {
        console.error('❌ Error creating user:', error);
        
        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                error: true,
                message: "Validation failed",
                details: validationErrors
            });
        }
        
        res.status(500).json({ 
            error: true, 
            message: 'Failed to create user', 
            details: error.message 
        });
    }
});

// ===== LEGACY PREFERENCE ENDPOINTS =====

// GET /api/v1/preferences - Get preference items with filtering (ORIGINAL)
app.get("/api/v1/preferences", async (req, res) => {
    try {
        console.log('⚙️ Admin: Fetching preference items');
        const { 
            categoryId, 
            enabled, 
            type, 
            search, 
            limit = 20, 
            offset = 0, 
            sortBy = 'priority', 
            sortOrder = 'desc' 
        } = req.query;
        
        // Build query
        const query = {};
        if (categoryId) query.categoryId = categoryId;
        if (enabled !== undefined) query.enabled = enabled === 'true';
        if (type) query.type = type;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Execute query
        const sortObj = {};
        sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
        
        const preferences = await PreferenceItem.find(query)
            .sort(sortObj)
            .limit(parseInt(limit))
            .skip(parseInt(offset));
            
        const totalCount = await PreferenceItem.countDocuments(query);
        
        res.json({
            preferences,
            totalCount,
            hasMore: totalCount > parseInt(offset) + parseInt(limit)
        });
    } catch (error) {
        console.error('❌ Error fetching preferences:', error);
        res.status(500).json({ error: 'Failed to fetch preferences', details: error.message });
    }
});

// GET /api/v1/preferences/stats - Get preference statistics (MUST come before ANY parameterized routes)
app.get("/api/v1/preferences/stats", async (req, res) => {
    try {
        console.log('🟢 STATS ROUTE HIT: /api/v1/preferences/stats - This should be the stats route!');
        console.log('📊 Admin: Fetching preference statistics');
        
        const totalPreferences = await PreferenceItem.countDocuments();
        const activePreferences = await PreferenceItem.countDocuments({ enabled: true });
        const totalUsers = await User.countDocuments();
        const categoriesCount = await PreferenceCategory.countDocuments();
        
        // Category stats
        const categories = await PreferenceCategory.find({});
        const categoryStats = {};
        
        for (const category of categories) {
            const count = await PreferenceItem.countDocuments({ categoryId: category.id });
            const enabled = await PreferenceItem.countDocuments({ categoryId: category.id, enabled: true });
            const users = await UserPreference.countDocuments({
                preferenceId: { $in: await PreferenceItem.find({ categoryId: category.id }).distinct('id') }
            });
            
            categoryStats[category.name] = {
                count,
                enabled,
                users: users || 0
            };
        }
        
        const customizedUserIds = await UserPreference.distinct('partyId');
        const customizedUsers = customizedUserIds.length;
        const engagementRate = totalUsers > 0 ? Math.round((customizedUsers / totalUsers) * 100) : 0;
        
        res.json({
            totalPreferences,
            activePreferences,
            totalUsers,
            categoriesCount,
            lastUpdated: new Date().toISOString(),
            categoryStats,
            userEngagement: {
                customizedUsers,
                defaultUsers: totalUsers - customizedUsers,
                engagementRate
            }
        });
    } catch (error) {
        console.error('❌ Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics', details: error.message });
    }
});


// GET /api/v1/preferences/:id - Get specific preference item
app.get("/api/v1/preferences/:id", async (req, res) => {
    try {
        console.log('⚙️ Admin: Fetching preference item:', req.params.id);
        const preference = await PreferenceItem.findOne({ id: req.params.id });
        
        if (!preference) {
            return res.status(404).json({ error: 'Preference not found' });
        }
        
        res.json(preference);
    } catch (error) {
        console.error('❌ Error fetching preference:', error);
        res.status(500).json({ error: 'Failed to fetch preference', details: error.message });
    }
});

// POST /api/v1/preferences - Create preference item
app.post("/api/v1/preferences", async (req, res) => {
    try {
        console.log('⚙️ Admin: Creating preference item');
        
        // Verify category exists
        const category = await PreferenceCategory.findOne({ id: req.body.categoryId });
        if (!category) {
            return res.status(400).json({ error: 'Category not found' });
        }
        
        const preferenceData = {
            id: Date.now().toString(),
            ...req.body,
            users: 0,
            priority: req.body.priority || 0
        };
        
        const preference = new PreferenceItem(preferenceData);
        await preference.save();
        res.status(201).json(preference);
    } catch (error) {
        console.error('❌ Error creating preference:', error);
        res.status(500).json({ error: 'Failed to create preference', details: error.message });
    }
});

// PUT /api/v1/preferences/:id - Update preference item
app.put("/api/v1/preferences/:id", async (req, res) => {
    try {
        console.log('⚙️ Admin: Updating preference item:', req.params.id);
        const preference = await PreferenceItem.findOneAndUpdate(
            { id: req.params.id },
            { ...req.body, updatedAt: new Date() },
            { new: true }
        );
        
        if (!preference) {
            return res.status(404).json({ error: 'Preference not found' });
        }
        
        res.json(preference);
    } catch (error) {
        console.error('❌ Error updating preference:', error);
        res.status(500).json({ error: 'Failed to update preference', details: error.message });
    }
});

// DELETE /api/v1/preferences/:id - Delete preference item
app.delete("/api/v1/preferences/:id", async (req, res) => {
    try {
        console.log('⚙️ Admin: Deleting preference item:', req.params.id);
        
        // Delete associated user preferences
        await UserPreference.deleteMany({ preferenceId: req.params.id });
        
        const preference = await PreferenceItem.findOneAndDelete({ id: req.params.id });
        if (!preference) {
            return res.status(404).json({ error: 'Preference not found' });
        }
        
        res.json({ message: 'Preference deleted successfully' });
    } catch (error) {
        console.error('❌ Error deleting preference:', error);
        res.status(500).json({ error: 'Failed to delete preference', details: error.message });
    }
});

// PATCH /api/v1/preferences/:id/toggle - Toggle preference enabled status
app.patch("/api/v1/preferences/:id/toggle", async (req, res) => {
    try {
        console.log('⚙️ Admin: Toggling preference:', req.params.id);
        const preference = await PreferenceItem.findOneAndUpdate(
            { id: req.params.id },
            { enabled: req.body.enabled, updatedAt: new Date() },
            { new: true }
        );
        
        if (!preference) {
            return res.status(404).json({ error: 'Preference not found' });
        }
        
        res.json(preference);
    } catch (error) {
        console.error('❌ Error toggling preference:', error);
        res.status(500).json({ error: 'Failed to toggle preference', details: error.message });
    }
});

// POST /api/v1/dsar - Create new DSAR request for CSR
app.post("/api/v1/dsar", (req, res) => {
    console.log('📋 CSR Dashboard: Creating DSAR request');
    const newRequest = {
        id: Date.now().toString(),
        ...req.body,
        status: "pending",
        submittedAt: new Date().toISOString()
    };
    dsarRequests.push(newRequest);
    res.status(201).json(newRequest);
});

// PUT /api/v1/dsar/:id - Update DSAR request for CSR
app.put("/api/v1/dsar/:id", (req, res) => {
    console.log(`📋 CSR Dashboard: Updating DSAR request ${req.params.id}`);
    const { id } = req.params;
    const requestIndex = dsarRequests.findIndex(r => r.id === id);
    
    if (requestIndex === -1) {
        return res.status(404).json({ error: "DSAR request not found" });
    }
    
    dsarRequests[requestIndex] = {
        ...dsarRequests[requestIndex],
        ...req.body,
        updatedAt: new Date().toISOString()
    };
    
    res.json(dsarRequests[requestIndex]);
});

// POST /api/v1/consent - Create new consent for CSR
app.post("/api/v1/consent", (req, res) => {
    console.log('✅ CSR Dashboard: Creating consent record');
    const newConsent = {
        id: Date.now().toString(),
        ...req.body,
        grantedAt: req.body.status === 'granted' ? new Date().toISOString() : undefined,
        deniedAt: req.body.status === 'denied' ? new Date().toISOString() : undefined
    };
    csrConsents.push(newConsent);
    res.status(201).json(newConsent);
});

// PUT /api/v1/consent/:id - Update consent for CSR
app.put("/api/v1/consent/:id", (req, res) => {
    console.log(`✅ CSR Dashboard: Updating consent ${req.params.id}`);
    const { id } = req.params;
    const consentIndex = csrConsents.findIndex(c => c.id === id);
    
    if (consentIndex === -1) {
        return res.status(404).json({ error: "Consent not found" });
    }
    
    csrConsents[consentIndex] = {
        ...csrConsents[consentIndex],
        ...req.body,
        updatedAt: new Date().toISOString()
    };
    
    res.json(csrConsents[consentIndex]);
});

// Authentication endpoints
app.post("/api/v1/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Login attempt:", email);
        
        if (!email || !password) {
            return res.status(400).json({ 
                error: true, 
                message: "Email and password required" 
            });
        }

        // Find user in MongoDB
        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user || user.password !== password) {
            return res.status(401).json({ 
                error: true, 
                message: "Invalid credentials" 
            });
        }

        // Update last login
        user.lastLoginAt = new Date();
        await user.save();
        
        const token = generateToken({ id: user._id, email: user.email, role: user.role });
        console.log("Login successful:", user.email, "Role:", user.role);
        
        res.json({
            success: true,
            token: token,
            user: { 
                id: user._id, 
                email: user.email, 
                role: user.role, 
                name: user.name,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                company: user.company,
                organization: user.company
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: true,
            message: 'Internal server error'
        });
    }
});

app.get("/api/v1/auth/profile", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                error: true,
                message: 'User not found'
            });
        }
        
        res.json({
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                name: user.name,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                company: user.company,
                department: user.department,
                jobTitle: user.jobTitle,
                organization: user.company,
                address: user.address,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                status: user.status,
                emailVerified: user.emailVerified,
                language: user.language
            }
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            error: true,
            message: 'Internal server error'
        });
    }
});

// User registration
app.post("/api/v1/auth/register", async (req, res) => {
    try {
        const { 
            email, 
            password, 
            firstName, 
            lastName, 
            phone, 
            company, 
            department, 
            jobTitle,
            acceptTerms,
            acceptPrivacy,
            language 
        } = req.body;
        
        // Validation
        if (!email || !password) {
            return res.status(400).json({
                error: true,
                message: "Email and password are required"
            });
        }
        
        if (!firstName || !lastName) {
            return res.status(400).json({
                error: true,
                message: "First name and last name are required"
            });
        }

        if (!phone) {
            return res.status(400).json({
                error: true,
                message: "Phone number is required"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                error: true,
                message: "User with this email already exists"
            });
        }
        
        // Create new user
        const newUser = new User({
            email: email.toLowerCase(),
            password,
            firstName,
            lastName,
            phone,
            company: company || "SLT-Mobitel",
            department: department || "",
            jobTitle: jobTitle || "",
            role: "customer",
            status: "active",
            emailVerified: false,
            isActive: true,
            acceptTerms: acceptTerms || false,
            acceptPrivacy: acceptPrivacy || false,
            language: language || 'en',
            lastLoginAt: new Date()
        });

        // Save to MongoDB
        const savedUser = await newUser.save();
        
        // Create corresponding party record for CSR access
        const partyId = `party_${savedUser._id}`;
        const newParty = {
            id: partyId,
            name: savedUser.name,
            email: savedUser.email,
            phone: savedUser.phone,
            mobile: savedUser.phone,
            dateOfBirth: null,
            type: 'individual',
            status: 'active',
            userId: savedUser._id.toString(),
            address: savedUser.address,
            organization: savedUser.company,
            department: savedUser.department,
            jobTitle: savedUser.jobTitle,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
        
        // Add to parties array for CSR dashboard
        if (!parties.find(p => p.email === savedUser.email)) {
            parties.push(newParty);
        }
        
        // Generate token
        const token = generateToken({ id: savedUser._id, email: savedUser.email, role: savedUser.role });
        
        // Create initial consent record
        const consentId = `consent_${savedUser._id}_${Date.now()}`;
        const initialConsent = {
            id: consentId,
            userId: savedUser._id.toString(),
            partyId: partyId,
            purposeId: 'data_processing',
            purpose: 'Data Processing',
            description: 'Consent for basic data processing',
            status: 'granted',
            grantedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
            legalBasis: 'consent',
            categories: ['personal_data'],
            channels: ['account_creation']
        };
        
        consents.push(initialConsent);
        
        // Create initial preferences
        const preferenceId = `pref_${savedUser._id}_${Date.now()}`;
        const initialPreferences = {
            id: preferenceId,
            userId: savedUser._id.toString(),
            partyId: partyId,
            communicationChannels: {
                email: true,
                sms: false,
                phone: false,
                mail: false
            },
            topicSubscriptions: {
                serviceUpdates: true,
                billing: true,
                marketing: false,
                promotions: false,
                security: true
            },
            frequency: 'immediate',
            language: savedUser.language,
            timezone: 'Asia/Colombo',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        preferences.push(initialPreferences);
        
        // Create audit log entry
        const auditId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        const auditEntry = {
            id: auditId,
            partyId: partyId,
            eventType: 'user_registration',
            description: `New user account created for ${savedUser.name}`,
            createdAt: new Date().toISOString(),
            userId: savedUser._id.toString(),
            userName: savedUser.name,
            ipAddress: req.ip || '127.0.0.1',
            userAgent: req.get('User-Agent') || 'Unknown',
            metadata: {
                email: savedUser.email,
                registrationMethod: 'web_form',
                profileComplete: !!(firstName && lastName && phone)
            },
            category: 'Account Management',
            severity: 'info'
        };
        
        auditEvents.push(auditEntry);
        
        console.log("New user registered:", savedUser.email, "ID:", savedUser._id);
        
        res.status(201).json({
            success: true,
            message: "Account created successfully",
            token: token,
            user: {
                id: savedUser._id,
                email: savedUser.email,
                role: savedUser.role,
                name: savedUser.name,
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                phone: savedUser.phone,
                company: savedUser.company,
                department: savedUser.department,
                jobTitle: savedUser.jobTitle,
                organization: savedUser.company,
                status: savedUser.status,
                createdAt: savedUser.createdAt
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: true,
            message: 'Internal server error'
        });
    }
});

// Customer Dashboard Overview
app.get("/api/v1/customer/dashboard/overview", verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'customer') {
            return res.status(403).json({
                error: true,
                message: 'Access denied'
            });
        }
        
        // Get user from MongoDB
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                error: true,
                message: 'User not found'
            });
        }
        
        const userConsents = consents.filter(c => c.userId === req.user.id);
        const userPreferences = preferences.filter(p => p.userId === req.user.id);
        
        res.json({
            success: true,
            data: {
                totalConsents: userConsents.length,
                activeConsents: userConsents.filter(c => c.status === 'granted').length,
                pendingRequests: 0,
                lastActivity: user.lastLoginAt || new Date().toISOString(),
                recentActivity: [
                    {
                        type: "consent_granted",
                        description: "Marketing consent granted",
                        timestamp: userConsents[0]?.grantedAt || user.createdAt
                    },
                    {
                        type: "profile_updated", 
                        description: "Profile information updated",
                        timestamp: user.updatedAt || user.createdAt
                    }
                ],
                stats: {
                    consentGrants: userConsents.filter(c => c.status === 'granted').length,
                    consentDenials: userConsents.filter(c => c.status === 'denied').length,
                    activePreferences: userPreferences.filter(p => p.enabled).length
                },
                userProfile: {
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    company: user.company,
                    department: user.department,
                    jobTitle: user.jobTitle,
                    memberSince: user.createdAt
                }
            }
        });
    } catch (error) {
        console.error('Dashboard overview error:', error);
        res.status(500).json({
            error: true,
            message: 'Internal server error'
        });
    }
});

// Consent Management
app.get("/api/v1/consent", verifyToken, (req, res) => {
    const userConsents = consents.filter(c => c.userId === req.user.id);
    
    res.json({
        success: true,
        consents: userConsents
    });
});

app.get("/api/v1/consents", verifyToken, (req, res) => {
    const userConsents = consents.filter(c => c.userId === req.user.id);
    
    res.json({
        success: true,
        consents: userConsents
    });
});

app.post("/api/v1/consent", verifyToken, (req, res) => {
    const { type, purpose, status } = req.body;
    
    if (!type || !purpose || !status) {
        return res.status(400).json({
            error: true,
            message: "Type, purpose, and status are required"
        });
    }
    
    const newConsent = {
        id: (consents.length + 1).toString(),
        userId: req.user.id,
        type,
        purpose,
        status,
        grantedAt: status === 'granted' ? new Date().toISOString() : null,
        deniedAt: status === 'denied' ? new Date().toISOString() : null,
        expiresAt: status === 'granted' ? new Date(Date.now() + 31536000000).toISOString() : null
    };
    
    consents.push(newConsent);
    console.log("Consent created:", newConsent);
    
    res.json({
        success: true,
        consent: newConsent
    });
});

app.put("/api/v1/consent/:id", verifyToken, (req, res) => {
    const consentId = req.params.id;
    const { status } = req.body;
    
    const consent = consents.find(c => c.id === consentId && c.userId === req.user.id);
    
    if (!consent) {
        return res.status(404).json({
            error: true,
            message: "Consent not found"
        });
    }
    
    consent.status = status;
    consent.grantedAt = status === 'granted' ? new Date().toISOString() : null;
    consent.deniedAt = status === 'denied' ? new Date().toISOString() : null;
    
    res.json({
        success: true,
        consent
    });
});

// Preferences Management
app.get("/api/v1/preference", verifyToken, (req, res) => {
    const userPreferences = preferences.filter(p => p.userId === req.user.id);
    
    res.json({
        success: true,
        preferences: userPreferences
    });
});

app.get("/api/v1/preferences", verifyToken, (req, res) => {
    const userPreferences = preferences.filter(p => p.userId === req.user.id);
    
    res.json({
        success: true,
        preferences: userPreferences
    });
});

app.post("/api/v1/preference", verifyToken, (req, res) => {
    const { category, type, enabled, frequency } = req.body;
    
    const newPreference = {
        id: (preferences.length + 1).toString(),
        userId: req.user.id,
        category,
        type,
        enabled: enabled || false,
        frequency: frequency || 'never'
    };
    
    preferences.push(newPreference);
    
    res.json({
        success: true,
        preference: newPreference
    });
});

app.put("/api/v1/preference/:id", verifyToken, (req, res) => {
    const prefId = req.params.id;
    const updates = req.body;
    
    const preference = preferences.find(p => p.id === prefId && p.userId === req.user.id);
    
    if (!preference) {
        return res.status(404).json({
            error: true,
            message: "Preference not found"
        });
    }
    
    Object.assign(preference, updates);
    
    res.json({
        success: true,
        preference
    });
});

// Privacy Notices - Full CRUD with MongoDB
// GET /api/v1/privacy-notices - Get all privacy notices with filtering
app.get("/api/v1/privacy-notices", verifyToken, async (req, res) => {
    try {
        const { 
            status, 
            category, 
            language = 'en', 
            search, 
            limit = 20, 
            offset = 0, 
            sortBy = 'effectiveDate', 
            sortOrder = 'desc' 
        } = req.query;

        // Build query
        const query = {};
        if (status) query.status = status;
        if (category) query.category = category;
        if (language) query.language = language;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        // Execute query with sorting and pagination
        const sortObj = {};
        sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const notices = await PrivacyNotice.find(query)
            .sort(sortObj)
            .limit(parseInt(limit))
            .skip(parseInt(offset));

        const totalCount = await PrivacyNotice.countDocuments(query);

        // Get statistics
        const stats = {
            total: totalCount,
            active: await PrivacyNotice.countDocuments({ status: 'active' }),
            draft: await PrivacyNotice.countDocuments({ status: 'draft' }),
            archived: await PrivacyNotice.countDocuments({ status: 'archived' })
        };

        res.json({
            success: true,
            notices: notices,
            total: totalCount,
            stats,
            hasMore: totalCount > parseInt(offset) + parseInt(limit)
        });
    } catch (error) {
        console.error('❌ Error fetching privacy notices:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch privacy notices',
            details: error.message 
        });
    }
});

// GET /api/v1/privacy-notices/:id - Get specific privacy notice
app.get("/api/v1/privacy-notices/:id", verifyToken, async (req, res) => {
    try {
        const notice = await PrivacyNotice.findOne({ noticeId: req.params.id });
        
        if (!notice) {
            return res.status(404).json({
                success: false,
                error: "Privacy notice not found"
            });
        }

        res.json({
            success: true,
            notice: notice
        });
    } catch (error) {
        console.error('❌ Error fetching privacy notice:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch privacy notice',
            details: error.message 
        });
    }
});

// POST /api/v1/privacy-notices - Create new privacy notice
app.post("/api/v1/privacy-notices", verifyToken, async (req, res) => {
    try {
        const {
            title,
            description,
            content,
            contentType = 'text/html',
            version = '1.0',
            category = 'general',
            purposes = [],
            legalBasis = 'consent',
            dataCategories = [],
            recipients = [],
            retentionPeriod = { duration: '2 years' },
            rights = ['access', 'rectification', 'erasure'],
            contactInfo = {
                organization: {
                    name: 'SLT Mobitel',
                    email: 'privacy@sltmobitel.lk'
                }
            },
            effectiveDate,
            expirationDate,
            status = 'draft',
            language = 'en',
            applicableRegions = ['sri_lanka'],
            metadata = {}
        } = req.body;

        // Validate required fields
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                error: 'Title and content are required'
            });
        }

        // Create new privacy notice
        const notice = new PrivacyNotice({
            title,
            description,
            content,
            contentType,
            version,
            category,
            purposes,
            legalBasis,
            dataCategories,
            recipients,
            retentionPeriod,
            rights,
            contactInfo,
            effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
            expirationDate: expirationDate ? new Date(expirationDate) : null,
            status,
            language,
            applicableRegions,
            metadata: {
                ...metadata,
                author: req.user?.email || 'admin',
                changeLog: [{
                    version,
                    changes: 'Initial creation',
                    author: req.user?.email || 'admin',
                    date: new Date()
                }]
            }
        });

        const savedNotice = await notice.save();

        res.status(201).json({
            success: true,
            message: 'Privacy notice created successfully',
            notice: savedNotice
        });
    } catch (error) {
        console.error('❌ Error creating privacy notice:', error);
        if (error.code === 11000) {
            res.status(400).json({ 
                success: false, 
                error: 'Privacy notice with this ID already exists' 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: 'Failed to create privacy notice',
                details: error.message 
            });
        }
    }
});

// PUT /api/v1/privacy-notices/:id - Update privacy notice
app.put("/api/v1/privacy-notices/:id", verifyToken, async (req, res) => {
    try {
        const noticeId = req.params.id;
        const updates = req.body;
        
        // Find existing notice
        const existingNotice = await PrivacyNotice.findOne({ noticeId: noticeId });
        if (!existingNotice) {
            return res.status(404).json({
                success: false,
                error: "Privacy notice not found"
            });
        }

        // Update change log
        if (!updates.metadata) updates.metadata = {};
        if (!updates.metadata.changeLog) updates.metadata.changeLog = existingNotice.metadata?.changeLog || [];
        
        updates.metadata.changeLog.push({
            version: updates.version || existingNotice.version,
            changes: updates.changeReason || 'Updated via admin interface',
            author: req.user?.email || 'admin',
            date: new Date()
        });

        // Update the notice
        const updatedNotice = await PrivacyNotice.findOneAndUpdate(
            { noticeId: noticeId },
            { $set: updates },
            { new: true, runValidators: true }
        );

        console.log('Update result:', updatedNotice ? 'Found' : 'Not found', 'for noticeId:', noticeId);

        res.json({
            success: true,
            message: 'Privacy notice updated successfully',
            notice: updatedNotice
        });
    } catch (error) {
        console.error('❌ Error updating privacy notice:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to update privacy notice',
            details: error.message 
        });
    }
});

// DELETE /api/v1/privacy-notices/:id - Delete privacy notice
app.delete("/api/v1/privacy-notices/:id", verifyToken, async (req, res) => {
    try {
        const noticeId = req.params.id;
        
        const notice = await PrivacyNotice.findOne({ noticeId: noticeId });
        if (!notice) {
            return res.status(404).json({
                success: false,
                error: "Privacy notice not found"
            });
        }

        // Instead of hard delete, archive the notice
        notice.status = 'archived';
        notice.metadata = {
            ...notice.metadata,
            archivedAt: new Date(),
            archivedBy: req.user?.email || 'admin'
        };
        await notice.save();

        res.json({
            success: true,
            message: 'Privacy notice archived successfully'
        });
    } catch (error) {
        console.error('❌ Error deleting privacy notice:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to delete privacy notice',
            details: error.message 
        });
    }
});

// POST /api/v1/privacy-notices/:id/acknowledge - Acknowledge privacy notice
app.post("/api/v1/privacy-notices/:id/acknowledge", verifyToken, async (req, res) => {
    try {
        const noticeId = req.params.id;
        const { ipAddress, userAgent } = req.body;
        
        const notice = await PrivacyNotice.findOne({ noticeId: noticeId });
        if (!notice) {
            return res.status(404).json({
                success: false,
                error: "Privacy notice not found"
            });
        }

        // Check if user already acknowledged this notice
        const userId = req.user?.id || req.user?._id;
        const userEmail = req.user?.email;
        
        if (notice.isAcknowledgedBy(userId)) {
            return res.status(400).json({
                success: false,
                error: "Privacy notice already acknowledged by this user"
            });
        }

        // Add acknowledgment
        await notice.acknowledge(userId, userEmail, { ipAddress, userAgent });

        res.json({
            success: true,
            message: "Privacy notice acknowledged successfully"
        });
    } catch (error) {
        console.error('❌ Error acknowledging privacy notice:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to acknowledge privacy notice',
            details: error.message 
        });
    }
});

// GET /api/v1/privacy-notices/export/:format - Export privacy notices
app.get("/api/v1/privacy-notices/export/:format", verifyToken, async (req, res) => {
    try {
        const { format } = req.params;
        const { status, category, language = 'en' } = req.query;

        // Build query
        const query = {};
        if (status) query.status = status;
        if (category) query.category = category;
        if (language) query.language = language;

        const notices = await PrivacyNotice.find(query).sort({ effectiveDate: -1 });

        if (format === 'json') {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', 'attachment; filename=privacy-notices.json');
            res.json(notices);
        } else if (format === 'csv') {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=privacy-notices.csv');
            
            // Create CSV headers
            const headers = ['ID', 'Title', 'Version', 'Category', 'Status', 'Effective Date', 'Language', 'Acknowledgments'];
            const csvData = [headers.join(',')];
            
            // Add data rows
            notices.forEach(notice => {
                const row = [
                    notice.id,
                    `"${notice.title.replace(/"/g, '""')}"`,
                    notice.version,
                    notice.category,
                    notice.status,
                    notice.effectiveDate?.toISOString?.()?.split('T')[0] || '',
                    notice.language,
                    notice.getAcknowledgmentCount()
                ];
                csvData.push(row.join(','));
            });
            
            res.send(csvData.join('\n'));
        } else {
            res.status(400).json({
                success: false,
                error: 'Unsupported export format. Use json or csv.'
            });
        }
    } catch (error) {
        console.error('❌ Error exporting privacy notices:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to export privacy notices',
            details: error.message 
        });
    }
});

// =============================================================================
// COMPREHENSIVE DSAR REQUEST MANAGEMENT - MongoDB Integration
// =============================================================================

// GET /api/v1/dsar/requests - Get all DSAR requests with advanced filtering
app.get("/api/v1/dsar/requests", verifyToken, async (req, res) => {
    try {
        const { 
            status, 
            requestType, 
            priority, 
            requesterEmail,
            dateFrom,
            dateTo,
            isOverdue,
            page = 1, 
            limit = 20,
            sortBy = 'submittedAt',
            sortOrder = 'desc'
        } = req.query;

        // Build query
        const query = {};
        if (status) query.status = status;
        if (requestType) query.requestType = requestType;
        if (priority) query.priority = priority;
        if (requesterEmail) query.requesterEmail = new RegExp(requesterEmail, 'i');
        
        if (dateFrom || dateTo) {
            query.submittedAt = {};
            if (dateFrom) query.submittedAt.$gte = new Date(dateFrom);
            if (dateTo) query.submittedAt.$lte = new Date(dateTo);
        }

        // Handle overdue filter
        if (isOverdue === 'true') {
            query.status = { $in: ['pending', 'in_progress'] };
            query.dueDate = { $lt: new Date() };
        }

        // Execute query with pagination
        const requests = await DSARRequest.find(query)
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await DSARRequest.countDocuments(query);
        
        // Get statistics
        const stats = {
            total: await DSARRequest.countDocuments(),
            pending: await DSARRequest.countDocuments({ status: 'pending' }),
            in_progress: await DSARRequest.countDocuments({ status: 'in_progress' }),
            completed: await DSARRequest.countDocuments({ status: 'completed' }),
            overdue: await DSARRequest.countDocuments({ 
                status: { $in: ['pending', 'in_progress'] },
                dueDate: { $lt: new Date() }
            })
        };

        res.json({
            success: true,
            requests: requests,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
            stats
        });

    } catch (error) {
        console.error('❌ Error fetching DSAR requests:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch DSAR requests',
            details: error.message 
        });
    }
});

// POST /api/v1/dsar/requests - Create new DSAR request
app.post("/api/v1/dsar/requests", verifyToken, async (req, res) => {
    try {
        const {
            requesterName,
            requesterEmail,
            requesterPhone,
            requestType,
            subject,
            description,
            dataCategories,
            legalBasis,
            priority = 'medium',
            responseMethod = 'email'
        } = req.body;

        // Validation
        if (!requesterName || !requesterEmail || !requestType || !subject || !description) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: requesterName, requesterEmail, requestType, subject, description'
            });
        }

        // Check if requester exists in our system
        const existingUser = await User.findOne({ email: requesterEmail });
        const requesterId = existingUser ? existingUser._id.toString() : `external_${Date.now()}`;

        // Create new DSAR request
        const dsarRequest = new DSARRequest({
            requesterId,
            requesterName,
            requesterEmail,
            requesterPhone,
            requestType,
            subject,
            description,
            dataCategories: dataCategories || [],
            legalBasis,
            priority,
            responseMethod,
            createdBy: req.user.userId,
            source: 'api'
        });

        await dsarRequest.save();

        // Log creation
        console.log(`✅ DSAR request created: ${dsarRequest.requestId} for ${requesterEmail}`);

        res.status(201).json({
            success: true,
            message: 'DSAR request created successfully',
            request: dsarRequest
        });

    } catch (error) {
        console.error('❌ Error creating DSAR request:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to create DSAR request',
            details: error.message 
        });
    }
});

// GET /api/v1/dsar/requests/:id - Get specific DSAR request
app.get("/api/v1/dsar/requests/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const request = await DSARRequest.findOne({
            $or: [
                { _id: id },
                { requestId: id }
            ]
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                error: 'DSAR request not found'
            });
        }

        res.json({
            success: true,
            request: request
        });

    } catch (error) {
        console.error('❌ Error fetching DSAR request:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch DSAR request',
            details: error.message 
        });
    }
});

// PUT /api/v1/dsar/requests/:id - Update DSAR request
app.put("/api/v1/dsar/requests/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Find request
        const request = await DSARRequest.findOne({
            $or: [
                { _id: id },
                { requestId: id }
            ]
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                error: 'DSAR request not found'
            });
        }

        // Handle status updates
        if (updates.status && updates.status !== request.status) {
            if (updates.status === 'in_progress' && !request.acknowledgedAt) {
                updates.acknowledgedAt = new Date();
            }
            if (updates.status === 'completed' && !request.completedAt) {
                updates.completedAt = new Date();
            }
        }

        // Add processing note if provided
        if (updates.processingNote) {
            request.processingNotes.push({
                note: updates.processingNote,
                author: req.user.email || req.user.userId,
                timestamp: new Date()
            });
            delete updates.processingNote;
        }

        // Update fields
        Object.assign(request, updates);
        request.updatedBy = req.user.userId;
        
        await request.save();

        console.log(`✅ DSAR request updated: ${request.requestId}`);

        res.json({
            success: true,
            message: 'DSAR request updated successfully',
            request: request
        });

    } catch (error) {
        console.error('❌ Error updating DSAR request:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to update DSAR request',
            details: error.message 
        });
    }
});

// DELETE /api/v1/dsar/requests/:id - Delete DSAR request
app.delete("/api/v1/dsar/requests/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        const request = await DSARRequest.findOneAndDelete({
            $or: [
                { _id: id },
                { requestId: id }
            ]
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                error: 'DSAR request not found'
            });
        }

        console.log(`✅ DSAR request deleted: ${request.requestId}`);

        res.json({
            success: true,
            message: 'DSAR request deleted successfully'
        });

    } catch (error) {
        console.error('❌ Error deleting DSAR request:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to delete DSAR request',
            details: error.message 
        });
    }
});

// GET /api/v1/dsar/export/:format - Export DSAR requests
app.get("/api/v1/dsar/export/:format", verifyToken, async (req, res) => {
    try {
        const { format } = req.params;
        const { status, requestType, priority, dateFrom, dateTo } = req.query;

        // Build query
        const query = {};
        if (status) query.status = status;
        if (requestType) query.requestType = requestType;
        if (priority) query.priority = priority;
        
        if (dateFrom || dateTo) {
            query.submittedAt = {};
            if (dateFrom) query.submittedAt.$gte = new Date(dateFrom);
            if (dateTo) query.submittedAt.$lte = new Date(dateTo);
        }

        const requests = await DSARRequest.find(query).sort({ submittedAt: -1 });

        if (format === 'json') {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename=dsar-requests-${new Date().toISOString().split('T')[0]}.json`);
            res.json(requests);
        } else if (format === 'csv') {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=dsar-requests-${new Date().toISOString().split('T')[0]}.csv`);
            
            // Create CSV headers
            const headers = [
                'Request ID', 'Requester Name', 'Requester Email', 'Request Type', 
                'Subject', 'Status', 'Priority', 'Submitted At', 'Due Date', 
                'Days Remaining', 'Assigned To', 'Processing Days'
            ];
            const csvData = [headers.join(',')];
            
            // Add data rows
            requests.forEach(request => {
                const row = [
                    request.requestId,
                    `"${request.requesterName.replace(/"/g, '""')}"`,
                    request.requesterEmail,
                    request.requestType,
                    `"${request.subject.replace(/"/g, '""')}"`,
                    request.status,
                    request.priority,
                    request.submittedAt?.toISOString?.()?.split('T')[0] || '',
                    request.dueDate?.toISOString?.()?.split('T')[0] || '',
                    request.daysRemaining || 0,
                    request.assignedTo?.name || 'Unassigned',
                    request.processingDays || 0
                ];
                csvData.push(row.join(','));
            });
            
            res.send(csvData.join('\n'));
        } else {
            res.status(400).json({
                success: false,
                error: 'Unsupported export format. Use json or csv.'
            });
        }
    } catch (error) {
        console.error('❌ Error exporting DSAR requests:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to export DSAR requests',
            details: error.message 
        });
    }
});

// GET /api/v1/dsar/stats - Get DSAR statistics
app.get("/api/v1/dsar/stats", verifyToken, async (req, res) => {
    try {
        const { dateFrom, dateTo } = req.query;
        
        // Build date filter
        const dateFilter = {};
        if (dateFrom || dateTo) {
            dateFilter.submittedAt = {};
            if (dateFrom) dateFilter.submittedAt.$gte = new Date(dateFrom);
            if (dateTo) dateFilter.submittedAt.$lte = new Date(dateTo);
        }

        const [
            totalRequests,
            pendingRequests,
            inProgressRequests,
            completedRequests,
            rejectedRequests,
            overdueRequests,
            requestsByType,
            requestsByPriority,
            averageProcessingTime
        ] = await Promise.all([
            DSARRequest.countDocuments(dateFilter),
            DSARRequest.countDocuments({ ...dateFilter, status: 'pending' }),
            DSARRequest.countDocuments({ ...dateFilter, status: 'in_progress' }),
            DSARRequest.countDocuments({ ...dateFilter, status: 'completed' }),
            DSARRequest.countDocuments({ ...dateFilter, status: 'rejected' }),
            DSARRequest.countDocuments({ 
                ...dateFilter,
                status: { $in: ['pending', 'in_progress'] },
                dueDate: { $lt: new Date() }
            }),
            DSARRequest.aggregate([
                { $match: dateFilter },
                { $group: { _id: '$requestType', count: { $sum: 1 } } }
            ]),
            DSARRequest.aggregate([
                { $match: dateFilter },
                { $group: { _id: '$priority', count: { $sum: 1 } } }
            ]),
            DSARRequest.aggregate([
                { $match: { ...dateFilter, status: 'completed', completedAt: { $exists: true } } },
                { $project: { 
                    processingTime: { 
                        $divide: [
                            { $subtract: ['$completedAt', '$submittedAt'] },
                            1000 * 60 * 60 * 24 // Convert to days
                        ]
                    }
                }},
                { $group: { _id: null, avgProcessingTime: { $avg: '$processingTime' } } }
            ])
        ]);

        res.json({
            success: true,
            stats: {
                totalRequests,
                pendingRequests,
                inProgressRequests,
                completedRequests,
                rejectedRequests,
                overdueRequests,
                requestsByType: requestsByType.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                requestsByPriority: requestsByPriority.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                averageProcessingTime: averageProcessingTime[0]?.avgProcessingTime || 0
            }
        });

    } catch (error) {
        console.error('❌ Error fetching DSAR stats:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch DSAR statistics',
            details: error.message 
        });
    }
});

// =============================================================================
// END DSAR REQUEST MANAGEMENT
// =============================================================================

// User Profile Management - Enhanced
app.put("/api/v1/auth/profile", verifyToken, async (req, res) => {
    try {
        const { 
            firstName, 
            lastName, 
            phone, 
            address, 
            company, 
            department, 
            jobTitle 
        } = req.body;
        
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                error: true,
                message: 'User not found'
            });
        }
        
        // Store old values for audit
        const oldValues = {
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            address: user.address,
            company: user.company,
            department: user.department,
            jobTitle: user.jobTitle
        };
        
        // Update user profile
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phone) user.phone = phone;
        if (address) user.address = address;
        if (company) user.company = company;
        if (department) user.department = department;
        if (jobTitle) user.jobTitle = jobTitle;
        
        // Save to MongoDB
        const updatedUser = await user.save();
        
        // Update corresponding party record for CSR visibility
        const party = parties.find(p => p.userId === user._id.toString() || p.email === user.email);
        if (party) {
            if (firstName || lastName) party.name = user.name;
            if (phone) party.phone = phone;
            if (phone) party.mobile = phone;
            if (address) party.address = address;
            if (company) party.organization = company;
            if (department) party.department = department;
            if (jobTitle) party.jobTitle = jobTitle;
            party.lastUpdated = new Date().toISOString();
        }
        
        // Create audit log entry
        const auditId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        const auditEntry = {
            id: auditId,
            partyId: party?.id || `party_${user._id}`,
            eventType: 'profile_updated',
            description: `User profile updated by ${user.name}`,
            createdAt: new Date().toISOString(),
            userId: user._id.toString(),
            userName: user.name,
            ipAddress: req.ip || '127.0.0.1',
            userAgent: req.get('User-Agent') || 'Unknown',
            metadata: {
                oldValues,
                newValues: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone,
                    address: user.address,
                    company: user.company,
                    department: user.department,
                    jobTitle: user.jobTitle
                },
                updatedFields: Object.keys(req.body)
            },
            category: 'Profile Management',
            severity: 'info'
        };
        
        auditEvents.push(auditEntry);
        
        console.log("Profile updated for:", user.email, "by user");
        
        res.json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                name: user.name,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                company: user.company,
                department: user.department,
                jobTitle: user.jobTitle,
                organization: user.company,
                address: user.address,
                status: user.status,
                lastLoginAt: user.lastLoginAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            error: true,
            message: 'Internal server error'
        });
    }
});

// Customer Dashboard Profile Endpoint - Enhanced
app.get("/api/v1/customer/dashboard/profile", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                error: true,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                company: user.company,
                department: user.department,
                jobTitle: user.jobTitle,
                status: user.status,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                lastLoginAt: user.lastLoginAt,
                emailVerified: user.emailVerified,
                language: user.language,
                acceptTerms: user.acceptTerms,
                acceptPrivacy: user.acceptPrivacy,
                address: user.address
            }
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            error: true,
            message: 'Internal server error'
        });
    }
});

// Customer Dashboard Profile Update Endpoint - Enhanced
app.put("/api/v1/customer/dashboard/profile", verifyToken, (req, res) => {
    const { 
        name, 
        firstName, 
        lastName, 
        phone, 
        company, 
        department, 
        jobTitle, 
        address 
    } = req.body;
    
    const user = users.find(u => u.id === req.user.id);
    
    if (!user) {
        return res.status(404).json({
            error: true,
            message: 'User not found'
        });
    }
    
    // Store old values for audit
    const oldValues = {
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        company: user.company,
        department: user.department,
        jobTitle: user.jobTitle,
        address: user.address
    };
    
    // Update profile fields
    if (name) user.name = name;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (company) user.company = company;
    if (department) user.department = department;
    if (jobTitle) user.jobTitle = jobTitle;
    if (address) user.address = address;
    
    // Update full name if first/last names are provided
    if (firstName || lastName) {
        user.name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    
    // Update organization field for backwards compatibility
    if (company) user.organization = company;
    
    // Update last modified timestamp
    user.lastLoginAt = new Date().toISOString();
    
    // Update corresponding party record for CSR visibility
    const party = parties.find(p => p.userId === user.id || p.email === user.email);
    if (party) {
        if (user.name) party.name = user.name;
        if (phone) {
            party.phone = phone;
            party.mobile = phone;
        }
        if (address) party.address = address;
        if (company) party.organization = company;
        if (department) party.department = department;
        if (jobTitle) party.jobTitle = jobTitle;
        party.lastUpdated = new Date().toISOString();
    }
    
    // Create audit log entry
    const auditId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const auditEntry = {
        id: auditId,
        partyId: party?.id || `party_${user.id}`,
        eventType: 'customer_profile_updated',
        description: `Customer profile updated via dashboard by ${user.name}`,
        createdAt: new Date().toISOString(),
        userId: user.id,
        userName: user.name,
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.get('User-Agent') || 'Unknown',
        metadata: {
            oldValues,
            newValues: {
                name: user.name,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                company: user.company,
                department: user.department,
                jobTitle: user.jobTitle,
                address: user.address
            },
            updatedFields: Object.keys(req.body),
            source: 'customer_dashboard'
        },
        category: 'Profile Management',
        severity: 'info'
    };
    
    auditEvents.push(auditEntry);
    
    console.log("Customer profile updated for:", user.email, "via dashboard");
    
    res.json({
        success: true,
        message: "Profile updated successfully",
        data: {
            id: user.id,
            name: user.name,
            firstName: user.firstName || user.name?.split(' ')[0] || '',
            lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
            email: user.email,
            phone: user.phone,
            company: user.company || user.organization || 'SLT-Mobitel',
            department: user.department || '',
            jobTitle: user.jobTitle || '',
            address: user.address || '',
            status: user.status || 'active',
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt,
            emailVerified: user.emailVerified || false
        }
    });
});

// Data Subject Access Requests (DSAR)
app.get("/api/v1/dsar/requests", verifyToken, (req, res) => {
    // Mock DSAR requests
    const dsarRequests = [
        {
            id: "1",
            type: "data_export",
            status: "completed",
            requestedAt: new Date(Date.now() - 86400000).toISOString(),
            completedAt: new Date().toISOString()
        },
        {
            id: "2", 
            type: "data_deletion",
            status: "pending",
            requestedAt: new Date().toISOString()
        }
    ];
    
    res.json({
        success: true,
        requests: dsarRequests
    });
});

app.post("/api/v1/dsar/request", verifyToken, (req, res) => {
    const { type, description } = req.body;
    
    const newRequest = {
        id: Date.now().toString(),
        userId: req.user.id,
        type,
        description,
        status: "pending",
        requestedAt: new Date().toISOString()
    };
    
    res.json({
        success: true,
        message: "DSAR request submitted successfully",
        request: newRequest
    });
});

// CSR ENDPOINTS FOR CUSTOMER MANAGEMENT

// CSR - Get all customers (parties)
app.get("/api/v1/csr/customers", verifyToken, (req, res) => {
    if (req.user.role !== 'csr' && req.user.role !== 'admin') {
        return res.status(403).json({
            error: true,
            message: 'Access denied. CSR or Admin role required.'
        });
    }
    
    // Return all parties (customers) for CSR dashboard
    const customersWithDetails = parties.map(party => {
        const user = users.find(u => u.id === party.userId || u.email === party.email);
        return {
            ...party,
            userDetails: user ? {
                status: user.status,
                lastLoginAt: user.lastLoginAt,
                emailVerified: user.emailVerified,
                createdAt: user.createdAt
            } : null
        };
    });
    
    res.json({
        success: true,
        customers: customersWithDetails,
        total: customersWithDetails.length
    });
});

// CSR - Get specific customer details
app.get("/api/v1/csr/customers/:customerId", verifyToken, (req, res) => {
    if (req.user.role !== 'csr' && req.user.role !== 'admin') {
        return res.status(403).json({
            error: true,
            message: 'Access denied. CSR or Admin role required.'
        });
    }
    
    const customerId = req.params.customerId;
    
    // Find customer by ID or user ID
    const customer = parties.find(p => p.id === customerId || p.userId === customerId);
    const user = users.find(u => u.id === customerId || u.id === customer?.userId || u.email === customer?.email);
    
    if (!customer && !user) {
        return res.status(404).json({
            error: true,
            message: 'Customer not found'
        });
    }
    
    // Get customer's consents
    const customerConsents = consents.filter(c => 
        c.userId === customerId || 
        c.userId === customer?.userId || 
        c.partyId === customerId ||
        c.partyId === customer?.id
    );
    
    // Get customer's preferences
    const customerPreferences = preferences.filter(p => 
        p.userId === customerId || 
        p.userId === customer?.userId || 
        p.partyId === customerId ||
        p.partyId === customer?.id
    );
    
    // Get customer's audit events
    const customerEvents = auditEvents.filter(e => 
        e.userId === customerId || 
        e.userId === customer?.userId || 
        e.partyId === customerId ||
        e.partyId === customer?.id
    );
    
    res.json({
        success: true,
        customer: {
            profile: {
                ...customer,
                userDetails: user
            },
            consents: customerConsents,
            preferences: customerPreferences,
            auditEvents: customerEvents.slice(-10), // Last 10 events
            stats: {
                totalConsents: customerConsents.length,
                activeConsents: customerConsents.filter(c => c.status === 'granted').length,
                totalPreferences: customerPreferences.length,
                totalEvents: customerEvents.length
            }
        }
    });
});

// CSR - Update customer profile
app.put("/api/v1/csr/customers/:customerId", verifyToken, (req, res) => {
    if (req.user.role !== 'csr' && req.user.role !== 'admin') {
        return res.status(403).json({
            error: true,
            message: 'Access denied. CSR or Admin role required.'
        });
    }
    
    const customerId = req.params.customerId;
    const updates = req.body;
    
    // Find customer and user records
    const customer = parties.find(p => p.id === customerId || p.userId === customerId);
    const user = users.find(u => u.id === customerId || u.id === customer?.userId || u.email === customer?.email);
    
    if (!customer && !user) {
        return res.status(404).json({
            error: true,
            message: 'Customer not found'
        });
    }
    
    // Store old values for audit
    const oldCustomerValues = customer ? { ...customer } : {};
    const oldUserValues = user ? { ...user } : {};
    
    // Update customer (party) record
    if (customer) {
        if (updates.name) customer.name = updates.name;
        if (updates.email) customer.email = updates.email;
        if (updates.phone) {
            customer.phone = updates.phone;
            customer.mobile = updates.phone;
        }
        if (updates.address) customer.address = updates.address;
        if (updates.organization) customer.organization = updates.organization;
        if (updates.department) customer.department = updates.department;
        if (updates.jobTitle) customer.jobTitle = updates.jobTitle;
        if (updates.status) customer.status = updates.status;
        
        customer.lastUpdated = new Date().toISOString();
    }
    
    // Update user record
    if (user) {
        if (updates.name) user.name = updates.name;
        if (updates.firstName) user.firstName = updates.firstName;
        if (updates.lastName) user.lastName = updates.lastName;
        if (updates.phone) user.phone = updates.phone;
        if (updates.address) user.address = updates.address;
        if (updates.company || updates.organization) {
            user.company = updates.company || updates.organization;
            user.organization = updates.company || updates.organization;
        }
        if (updates.department) user.department = updates.department;
        if (updates.jobTitle) user.jobTitle = updates.jobTitle;
        if (updates.status) user.status = updates.status;
        
        // Update full name if first/last names are provided
        if (updates.firstName || updates.lastName) {
            user.name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
            if (customer) customer.name = user.name;
        }
        
        user.lastLoginAt = new Date().toISOString();
    }
    
    // Create audit log entry
    const auditId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const auditEntry = {
        id: auditId,
        partyId: customer?.id || `party_${user?.id}`,
        eventType: 'csr_profile_update',
        description: `Customer profile updated by CSR ${req.user.name || req.user.email}`,
        createdAt: new Date().toISOString(),
        userId: req.user.id,
        userName: req.user.name || req.user.email,
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.get('User-Agent') || 'Unknown',
        metadata: {
            targetCustomerId: customerId,
            targetCustomerName: customer?.name || user?.name,
            oldValues: {
                customer: oldCustomerValues,
                user: oldUserValues
            },
            newValues: updates,
            updatedFields: Object.keys(updates),
            source: 'csr_dashboard'
        },
        category: 'CSR Actions',
        severity: 'info'
    };
    
    auditEvents.push(auditEntry);
    
    console.log(`CSR ${req.user.email} updated customer ${customer?.name || user?.name}`);
    
    res.json({
        success: true,
        message: 'Customer profile updated successfully',
        customer: {
            profile: {
                ...customer,
                userDetails: user
            }
        }
    });
});

// CSR - Search customers
app.get("/api/v1/csr/customers/search", verifyToken, (req, res) => {
    if (req.user.role !== 'csr' && req.user.role !== 'admin') {
        return res.status(403).json({
            error: true,
            message: 'Access denied. CSR or Admin role required.'
        });
    }
    
    const { query, type } = req.query;
    
    if (!query) {
        return res.json({
            success: true,
            customers: [],
            total: 0
        });
    }
    
    const searchQuery = query.toLowerCase();
    let filteredCustomers = [];
    
    // Search in parties and users
    const allCustomers = parties.map(party => {
        const user = users.find(u => u.id === party.userId || u.email === party.email);
        return {
            ...party,
            userDetails: user
        };
    });
    
    // Filter based on search criteria
    filteredCustomers = allCustomers.filter(customer => {
        const name = customer.name?.toLowerCase() || '';
        const email = customer.email?.toLowerCase() || '';
        const phone = customer.phone || '';
        const mobile = customer.mobile || '';
        
        if (type === 'email') {
            return email.includes(searchQuery);
        } else if (type === 'phone') {
            return phone.includes(searchQuery) || mobile.includes(searchQuery);
        } else if (type === 'name') {
            return name.includes(searchQuery);
        } else {
            // General search
            return name.includes(searchQuery) || 
                   email.includes(searchQuery) || 
                   phone.includes(searchQuery) || 
                   mobile.includes(searchQuery);
        }
    });
    
    res.json({
        success: true,
        customers: filteredCustomers,
        total: filteredCustomers.length,
        searchCriteria: { query, type }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🎯 ConsentHub Comprehensive Backend running on http://localhost:${PORT}`);
    console.log('📋 Available endpoints:');
    console.log('   AUTH:');
    console.log('     POST /api/v1/auth/login');
    console.log('     POST /api/v1/auth/register');
    console.log('     GET  /api/v1/auth/profile');
    console.log('     PUT  /api/v1/auth/profile');
    console.log('   USERS:');
    console.log('     GET  /api/v1/users');
    console.log('     POST /api/v1/users');
    console.log('   DASHBOARD:');
    console.log('     GET  /api/v1/admin/dashboard/overview');
    console.log('     GET  /api/v1/customer/dashboard/overview');
    console.log('     GET  /api/v1/customer/dashboard/profile');
    console.log('     PUT  /api/v1/customer/dashboard/profile');
    console.log('   CONSENTS:');
    console.log('     GET  /api/v1/consent');
    console.log('     POST /api/v1/consent');
    console.log('     PUT  /api/v1/consent/:id');
    console.log('   PREFERENCES:');
    console.log('     GET  /api/v1/preference');
    console.log('     POST /api/v1/preference');
    console.log('     PUT  /api/v1/preference/:id');
    console.log('   PRIVACY:');
    console.log('     GET  /api/v1/privacy-notices');
    console.log('     POST /api/v1/privacy-notices/:id/acknowledge');
    console.log('   DSAR:');
    console.log('     GET  /api/v1/dsar/requests');
    console.log('     POST /api/v1/dsar/request');
    console.log('   COMPLIANCE RULES:');
    console.log('     GET  /api/v1/compliance-rules');
    console.log('     POST /api/v1/compliance-rules');
    console.log('     PUT  /api/v1/compliance-rules/:id');
    console.log('     DELETE /api/v1/compliance-rules/:id');
    console.log('     GET  /api/v1/compliance-rules/stats');
    console.log('');
    console.log('👥 Demo Users:');
    console.log('   admin@sltmobitel.lk / admin123 (Admin)');
    console.log('   csr@sltmobitel.lk / csr123 (CSR)');
    console.log('   customer@sltmobitel.lk / customer123 (Customer)');
    console.log('');
    console.log('🌟 Features:');
    console.log('   ✅ User Authentication & Registration');
    console.log('   ✅ Customer Dashboard with Real Data');
    console.log('   ✅ Consent Management');
    console.log('   ✅ Preference Management');
    console.log('   ✅ Privacy Notices');
    console.log('   ✅ Profile Management');
    console.log('   ✅ Data Subject Access Requests (DSAR)');
    console.log('');
    console.log('🔧 CSR Dashboard API Endpoints Available:');
    console.log('   GET  /api/v1/party (Customer data)');
    console.log('   GET  /api/v1/consent (Consent records)'); 
    console.log('   GET  /api/v1/dsar (DSAR requests)');
    console.log('   GET  /api/v1/event (Audit events)');
    console.log('   GET  /api/v1/preferences (Customer preferences)');
    console.log('   POST /api/v1/preferences (Create/Update preferences)');
    console.log('   POST /api/v1/dsar (Create DSAR request)');
    console.log('   PUT  /api/v1/dsar/:id (Update DSAR request)');
    console.log('   POST /api/v1/consent (Create consent)');
    console.log('   PUT  /api/v1/consent/:id (Update consent)');
    console.log('');
    console.log('📊 Dummy Data Loaded:');
    console.log('   👥 5 Customer records (parties)');
    console.log('   ✅ 5 Consent records');
    console.log('   📋 4 DSAR requests (1 overdue for risk alerts)');
    console.log('   📝 5 Audit events');
    console.log('   ⚙️  2 Customer preference profiles');
});
