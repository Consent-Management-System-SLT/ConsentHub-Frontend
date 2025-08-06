const express = require("express");
const cors = require("cors");
require('dotenv').config();
const connectDB = require('./config/database');
const User = require('./models/User');
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
function generateToken(user) {
    const payload = { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        name: user.name,
        phone: user.phone,
        iat: Date.now() 
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
        req.user = payload;
        next();
    } catch (error) {
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
app.get("/api/v1/party", (req, res) => {
    console.log('🔍 CSR Dashboard: Fetching party/customer data');
    res.json(parties);
});

// GET /api/v1/consent - Get all consents for CSR  
app.get("/api/v1/consent", (req, res) => {
    console.log('✅ CSR Dashboard: Fetching consent data');
    res.json(csrConsents);
});

// GET /api/v1/dsar - Get all DSAR requests for CSR
app.get("/api/v1/dsar", (req, res) => {
    console.log('📋 CSR Dashboard: Fetching DSAR data');
    res.json(dsarRequests);
});

// GET /api/v1/event - Get all audit events for CSR
app.get("/api/v1/event", (req, res) => {
    console.log('📝 CSR Dashboard: Fetching event/audit data');
    res.json(auditEvents);
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
app.post("/api/v1/consent", (req, res) => {
    console.log('✅ CSR Dashboard: Creating new consent');
    const newConsent = {
        id: String(csrConsents.length + 1),
        ...req.body,
        grantedAt: req.body.status === 'granted' ? new Date().toISOString() : undefined,
        deniedAt: req.body.status === 'denied' ? new Date().toISOString() : undefined
    };
    csrConsents.push(newConsent);
    res.json(newConsent);
});

// PUT /api/v1/consent/:id - Update consent status
app.put("/api/v1/consent/:id", (req, res) => {
    console.log('✅ CSR Dashboard: Updating consent:', req.params.id);
    const consentId = req.params.id;
    const consentIndex = csrConsents.findIndex(c => c.id === consentId);
    
    if (consentIndex >= 0) {
        const updatedConsent = {
            ...csrConsents[consentIndex],
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        
        if (req.body.status === 'granted') {
            updatedConsent.grantedAt = new Date().toISOString();
        } else if (req.body.status === 'denied') {
            updatedConsent.deniedAt = new Date().toISOString();
        } else if (req.body.status === 'revoked') {
            updatedConsent.revokedAt = new Date().toISOString();
        }
        
        csrConsents[consentIndex] = updatedConsent;
        res.json(updatedConsent);
    } else {
        res.status(404).json({ error: 'Consent record not found' });
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

// Privacy Notices
app.get("/api/v1/privacy-notices", verifyToken, (req, res) => {
    res.json({
        success: true,
        notices: privacyNotices
    });
});

app.post("/api/v1/privacy-notices/:id/acknowledge", verifyToken, (req, res) => {
    const noticeId = req.params.id;
    const notice = privacyNotices.find(n => n.id === noticeId);
    
    if (!notice) {
        return res.status(404).json({
            error: true,
            message: "Privacy notice not found"
        });
    }
    
    notice.acknowledged = true;
    notice.acknowledgedAt = new Date().toISOString();
    notice.acknowledgedBy = req.user.id;
    
    res.json({
        success: true,
        message: "Privacy notice acknowledged"
    });
});

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
    console.log('   DASHBOARD:');
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
