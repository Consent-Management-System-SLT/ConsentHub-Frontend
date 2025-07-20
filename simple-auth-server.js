// Simple in-memory auth service for testing
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3008; // Different port to avoid conflicts

// In-memory user storage for testing
const users = new Map();

app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:5175', 
    'http://localhost:3000',
    'https://consent-management-system-api.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

app.use(express.json());

// Handle preflight requests explicitly
app.options('/api/v1/auth/auth/register', (req, res) => {
  const allowedOrigins = [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:5175', 
    'http://localhost:3000',
    'https://consent-management-system-api.vercel.app'
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

app.options('/api/v1/auth/auth/login', (req, res) => {
  const allowedOrigins = [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:5175', 
    'http://localhost:3000',
    'https://consent-management-system-api.vercel.app'
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Health check
app.get('/api/v1/auth/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'simple-auth-service',
    timestamp: new Date().toISOString()
  });
});

// Registration endpoint
app.post('/api/v1/auth/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required'
        }
      });
    }

    // Check if user already exists
    if (users.has(email)) {
      return res.status(409).json({
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email already exists'
        }
      });
    }

    const userId = 'user_' + Date.now();
    
    // Store user (simple password storage for testing)
    const userData = {
      id: userId,
      email: email,
      name: name || 'Unknown User',
      phone: phone,
      password: password, // Simple storage for testing
      role: 'customer',
      createdAt: new Date().toISOString()
    };
    
    users.set(email, userData);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: userId,
        email: email,
        role: 'customer'
      },
      'simple-jwt-secret',
      { expiresIn: '24h' }
    );

    console.log(`✅ User registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token: token,
      user: {
        id: userId,
        email: email,
        name: name,
        phone: phone,
        role: 'customer',
        createdAt: userData.createdAt,
        status: 'active',
        isActive: true,
        emailVerified: true
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: {
        code: 'REGISTRATION_ERROR',
        message: 'Failed to register user'
      }
    });
  }
});

// Login endpoint
app.post('/api/v1/auth/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required'
        }
      });
    }

    // Find user
    const user = users.get(email);
    if (!user) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Simple password check for testing
    if (password !== user.password) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role
      },
      'simple-jwt-secret',
      { expiresIn: '24h' }
    );

    console.log(`✅ User logged in: ${email}`);

    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        status: 'active',
        isActive: true,
        emailVerified: true
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: {
        code: 'LOGIN_ERROR',
        message: 'Failed to login'
      }
    });
  }
});

// Get user profile endpoint
app.get('/api/v1/auth/auth/profile', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authorization header is required'
        }
      });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, 'simple-jwt-secret');
      const user = Array.from(users.values()).find(u => u.id === decoded.userId);
      
      if (!user) {
        return res.status(404).json({
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt,
          status: 'active',
          isActive: true,
          emailVerified: true
        }
      });

    } catch (jwtError) {
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token'
        }
      });
    }

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      error: {
        code: 'PROFILE_ERROR',
        message: 'Failed to get user profile'
      }
    });
  }
});

// Debug endpoint to see registered users (for development only)
app.get('/api/v1/auth/users', (req, res) => {
  const userList = Array.from(users.values()).map(user => ({
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt
  }));
  
  res.json({
    success: true,
    data: {
      users: userList,
      totalUsers: userList.length
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Simple Auth Service running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/v1/auth/health`);
});
