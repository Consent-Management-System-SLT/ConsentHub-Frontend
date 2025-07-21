const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3001;

app.use(cors());
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

// Authentication endpoints
app.post("/api/v1/auth/login", (req, res) => {
    const { email, password } = req.body;
    console.log("Login attempt:", email);
    
    if (!email || !password) {
        return res.status(400).json({ 
            error: true, 
            message: "Email and password required" 
        });
    }
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        return res.status(401).json({ 
            error: true, 
            message: "Invalid credentials" 
        });
    }
    
    const token = generateToken(user);
    console.log("Login successful:", user.email, "Role:", user.role);
    
    res.json({
        success: true,
        token: token,
        user: { 
            id: user.id, 
            email: user.email, 
            role: user.role, 
            name: user.name,
            phone: user.phone,
            organization: user.organization
        }
    });
});

app.get("/api/v1/auth/profile", verifyToken, (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    
    if (!user) {
        return res.status(404).json({
            error: true,
            message: 'User not found'
        });
    }
    
    res.json({
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            phone: user.phone,
            organization: user.organization,
            address: user.address,
            createdAt: user.createdAt
        }
    });
});

// User registration
app.post("/api/v1/auth/register", (req, res) => {
    const { email, password, name, phone, address } = req.body;
    
    if (!email || !password || !name) {
        return res.status(400).json({
            error: true,
            message: "Email, password, and name are required"
        });
    }
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
        return res.status(400).json({
            error: true,
            message: "User with this email already exists"
        });
    }
    
    const newUser = {
        id: (users.length + 1).toString(),
        email,
        password,
        name,
        phone: phone || "",
        address: address || "",
        role: "customer",
        organization: "SLT-Mobitel",
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    
    const token = generateToken(newUser);
    console.log("New user registered:", newUser.email);
    
    res.status(201).json({
        success: true,
        message: "Account created successfully",
        token: token,
        user: {
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
            name: newUser.name,
            phone: newUser.phone,
            organization: newUser.organization
        }
    });
});

// Customer Dashboard Overview
app.get("/api/v1/customer/dashboard/overview", verifyToken, (req, res) => {
    if (req.user.role !== 'customer') {
        return res.status(403).json({
            error: true,
            message: 'Access denied'
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
            lastActivity: new Date().toISOString(),
            recentActivity: [
                {
                    type: "consent_granted",
                    description: "Marketing consent granted",
                    timestamp: userConsents[0]?.grantedAt || new Date().toISOString()
                },
                {
                    type: "profile_updated", 
                    description: "Profile information updated",
                    timestamp: new Date(Date.now() - 86400000).toISOString()
                }
            ],
            stats: {
                consentGrants: userConsents.filter(c => c.status === 'granted').length,
                consentDenials: userConsents.filter(c => c.status === 'denied').length,
                activePreferences: userPreferences.filter(p => p.enabled).length
            }
        }
    });
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

// User Profile Management
app.put("/api/v1/auth/profile", verifyToken, (req, res) => {
    const { name, phone, address } = req.body;
    
    const user = users.find(u => u.id === req.user.id);
    
    if (!user) {
        return res.status(404).json({
            error: true,
            message: 'User not found'
        });
    }
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    
    console.log("Profile updated for:", user.email);
    
    res.json({
        success: true,
        message: "Profile updated successfully",
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            phone: user.phone,
            organization: user.organization,
            address: user.address
        }
    });
});

// Customer Dashboard Profile Endpoint
app.get("/api/v1/customer/dashboard/profile", verifyToken, (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    
    if (!user) {
        return res.status(404).json({
            error: true,
            message: 'User not found'
        });
    }
    
    res.json({
        success: true,
        data: {
            id: user.id,
            name: user.name,
            firstName: user.name?.split(' ')[0] || '',
            lastName: user.name?.split(' ').slice(1).join(' ') || '',
            email: user.email,
            phone: user.phone,
            company: user.organization || 'SLT-Mobitel',
            department: user.department || '',
            jobTitle: user.jobTitle || '',
            status: user.status || 'active',
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt
        }
    });
});

// Customer Dashboard Profile Update Endpoint  
app.put("/api/v1/customer/dashboard/profile", verifyToken, (req, res) => {
    const { name, firstName, lastName, phone, company, department, jobTitle } = req.body;
    
    const user = users.find(u => u.id === req.user.id);
    
    if (!user) {
        return res.status(404).json({
            error: true,
            message: 'User not found'
        });
    }
    
    // Update profile fields
    if (name) user.name = name;
    if (firstName && lastName) user.name = `${firstName} ${lastName}`;
    if (phone) user.phone = phone;
    if (company) user.organization = company;
    if (department) user.department = department;  
    if (jobTitle) user.jobTitle = jobTitle;
    
    console.log("Customer profile updated for:", user.email);
    
    res.json({
        success: true,
        message: "Profile updated successfully",
        data: {
            id: user.id,
            name: user.name,
            firstName: user.name?.split(' ')[0] || '',
            lastName: user.name?.split(' ').slice(1).join(' ') || '',
            email: user.email,
            phone: user.phone,
            company: user.organization || 'SLT-Mobitel',
            department: user.department || '',
            jobTitle: user.jobTitle || '',
            status: user.status || 'active',
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt
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
});
