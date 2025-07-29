#!/usr/bin/env node

/**
 * ConsentHub Production Backend Server
 * Optimized for Render deployment with MongoDB Atlas
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database and models
const connectDB = require('./config/database');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 10000;

console.log('🚀 Starting ConsentHub Production Backend...');
console.log('📊 Environment:', process.env.NODE_ENV || 'development');
console.log('🔗 Port:', PORT);

// Connect to MongoDB Atlas
connectDB();

// Enhanced CORS for production
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
app.use(express.json({ limit: '10mb' }));

// Utility functions
function generateToken(user) {
    const payload = { 
        id: user.id || user._id, 
        email: user.email, 
        role: user.role, 
        name: user.name || `${user.firstName} ${user.lastName}`,
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

// Health check endpoint
app.get("/", (req, res) => {
    res.json({ 
        status: "ok", 
        message: "ConsentHub Backend API Running",
        timestamp: new Date().toISOString(),
        version: "1.0.0"
    });
});

app.get("/api/v1/health", (req, res) => {
    res.json({ 
        status: "ok", 
        message: "ConsentHub Backend Running",
        timestamp: new Date().toISOString(),
        database: "MongoDB Atlas Connected",
        environment: process.env.NODE_ENV || 'development'
    });
});

// Authentication endpoints
app.post("/api/v1/auth/register", async (req, res) => {
    try {
        console.log('📝 Registration request received:', req.body.email);
        
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
        
        // Generate token
        const token = generateToken(savedUser);
        
        console.log('✅ User registered successfully:', savedUser.email, 'ID:', savedUser._id);
        
        res.status(201).json({
            success: true,
            message: "Account created successfully",
            token: token,
            user: { 
                id: savedUser._id, 
                email: savedUser.email, 
                role: savedUser.role, 
                name: `${savedUser.firstName} ${savedUser.lastName}`,
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                phone: savedUser.phone,
                company: savedUser.company,
                organization: savedUser.company
            }
        });
        
    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({
            error: true,
            message: 'Internal server error during registration'
        });
    }
});

app.post("/api/v1/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("🔐 Login attempt:", email);
        
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
        
        const token = generateToken(user);
        console.log("✅ Login successful:", user.email, "Role:", user.role);
        
        res.json({
            success: true,
            token: token,
            user: { 
                id: user._id, 
                email: user.email, 
                role: user.role, 
                name: `${user.firstName} ${user.lastName}`,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                company: user.company,
                organization: user.company
            }
        });
    } catch (error) {
        console.error('❌ Login error:', error);
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
            success: true,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                name: `${user.firstName} ${user.lastName}`,
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
        console.error('❌ Profile fetch error:', error);
        res.status(500).json({
            error: true,
            message: 'Internal server error'
        });
    }
});

// Customer Dashboard endpoints
app.get("/api/v1/customer/dashboard/overview", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                error: true,
                message: 'User not found'
            });
        }

        // Mock dashboard data for production
        const dashboardData = {
            profile: {
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                phone: user.phone,
                company: user.company,
                memberSince: user.createdAt
            },
            consents: {
                total: 3,
                active: 2,
                pending: 1
            },
            activities: {
                lastLogin: user.lastLoginAt,
                profileUpdates: 0,
                consentUpdates: 2
            }
        };

        res.json({
            success: true,
            data: dashboardData
        });
    } catch (error) {
        console.error('❌ Dashboard overview error:', error);
        res.status(500).json({
            error: true,
            message: 'Internal server error'
        });
    }
});

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
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                company: user.company,
                department: user.department,
                jobTitle: user.jobTitle,
                createdAt: user.createdAt,
                status: user.status
            }
        });
    } catch (error) {
        console.error('❌ Profile fetch error:', error);
        res.status(500).json({
            error: true,
            message: 'Internal server error'
        });
    }
});

// Catch-all for undefined routes
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Endpoint ${req.originalUrl} not found`,
        availableEndpoints: [
            'GET /',
            'GET /api/v1/health',
            'POST /api/v1/auth/register',
            'POST /api/v1/auth/login',
            'GET /api/v1/auth/profile',
            'GET /api/v1/customer/dashboard/overview',
            'GET /api/v1/customer/dashboard/profile'
        ]
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('🚨 Server Error:', error);
    res.status(500).json({
        error: true,
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 ConsentHub Backend running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/v1/health`);
    console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/v1/auth/*`);
    console.log(`📱 Dashboard endpoints: http://localhost:${PORT}/api/v1/customer/dashboard/*`);
});

module.exports = app;
