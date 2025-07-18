require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Import route modules
const customerRoutes = require('./routes/customers');
const auditRoutes = require('./routes/audit');
const consentRoutes = require('./routes/consent');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/consent-management')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://consent-management-system-api.vercel.app',
      'https://consent-management-system-front-end.vercel.app',
      'https://agreement-management-backend.onrender.com'
    ];
    
    console.log('CORS request from origin:', origin);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    console.log('CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  preflightContinue: false
}));

// Additional CORS headers for preflight requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }
  
  next();
});

app.use(bodyParser.json());

// TMF Forum API Routes - TMF632 Privacy Management
app.use('/tmf-api/partyPrivacyManagement/v4/privacyConsent', consentRoutes);
app.use('/tmf-api/partyManagement/v4/party', customerRoutes);
app.use('/tmf-api/eventManagement/v4/event', auditRoutes);
app.use('/api/consent', consentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: ['TMF632-Privacy', 'TMF641-Party', 'TMF669-Event']
  });
});

// CORS test endpoint
app.get('/test-cors', (req, res) => {
  res.json({
    message: 'CORS is working!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Consent Management System info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    system: 'ConsentHub - Privacy Management System',
    version: '1.0.0',
    apis: [
      'TMF632 - Party Privacy Management',
      'TMF641 - Party Management', 
      'TMF669 - Event Management'
    ],
    compliance: 'PDPA Sri Lanka 2022'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 ConsentHub API running on http://localhost:${PORT}`);
  console.log(`�️  TMF632 Privacy API: http://localhost:${PORT}/tmf-api/partyPrivacyManagement/v4/privacyConsent`);
  console.log(`👥 TMF641 Party API: http://localhost:${PORT}/tmf-api/partyManagement/v4/party`);
  console.log(`📊 TMF669 Event API: http://localhost:${PORT}/tmf-api/eventManagement/v4/event`);
  console.log(`� Consent API: http://localhost:${PORT}/api/consent`);
});