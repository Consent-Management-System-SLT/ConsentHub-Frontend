# ConsentHub Working Demo - Fixed Version
# This version properly starts the backend services for authentication

Write-Host "🎯 ConsentHub Working Demo - Starting System" -ForegroundColor Green
Write-Host ""

# System requirements check
Write-Host "🔍 Checking system requirements..." -ForegroundColor Yellow

# Node.js check
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if dependencies are installed
Write-Host ""
Write-Host "📦 Checking dependencies..." -ForegroundColor Yellow

if (!(Test-Path "node_modules")) {
    Write-Host "⚠️  Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "✅ Dependencies ready" -ForegroundColor Green

# Create demo environment file
Write-Host ""
Write-Host "🛠️  Setting up demo environment..." -ForegroundColor Yellow

$envContent = @"
# ConsentHub Demo Environment
NODE_ENV=development
VITE_API_BASE_URL=http://localhost:3001/api/v1

# Demo mode settings
DEMO_MODE=true
USE_MOCK_DATA=true

# JWT for demo
JWT_SECRET=demo-jwt-secret-do-not-use-in-production

# Service ports
API_GATEWAY_PORT=3001
AUTH_SERVICE_PORT=3002
CONSENT_SERVICE_PORT=3003
PREFERENCE_SERVICE_PORT=3004
"@

$envContent | Out-File -FilePath ".env.local" -Encoding UTF8
Write-Host "✅ Demo environment configured" -ForegroundColor Green

# Start backend services first
Write-Host ""
Write-Host "🔐 Starting Simple Auth Server (Port 3001)..." -ForegroundColor Blue

# Create a simple backend server that handles authentication
$backendScript = @'
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Demo users database
const users = [
    {
        id: '1',
        email: 'admin@sltmobitel.lk',
        password: 'admin123',
        role: 'admin',
        name: 'Admin User',
        organization: 'SLT-Mobitel'
    },
    {
        id: '2', 
        email: 'csr@sltmobitel.lk',
        password: 'csr123',
        role: 'csr',
        name: 'CSR User',
        organization: 'SLT-Mobitel'
    },
    {
        id: '3',
        email: 'customer@sltmobitel.lk',
        password: 'customer123',
        role: 'customer',
        name: 'Customer User',
        organization: 'SLT-Mobitel'
    },
    {
        id: '4',
        email: 'customer@example.com',
        password: 'customer123',
        role: 'customer',
        name: 'Demo Customer',
        organization: 'SLT-Mobitel'
    }
];

// Generate simple JWT-like token
function generateToken(user) {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        organization: user.organization,
        iat: Date.now()
    };
    return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// Health check
app.get('/api/v1/health', (req, res) => {
    res.json({ status: 'ok', message: 'ConsentHub Demo Backend Running' });
});

// Authentication endpoint
app.post('/api/v1/auth/login', (req, res) => {
    console.log('🔐 Login attempt:', req.body);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({
            error: true,
            message: 'Email and password are required'
        });
    }
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        return res.status(401).json({
            error: true,
            message: 'Invalid credentials'
        });
    }
    
    const token = generateToken(user);
    
    console.log('✅ Login successful for:', user.email, 'Role:', user.role);
    
    res.json({
        success: true,
        token: token,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            organization: user.organization
        }
    });
});

// Profile endpoint
app.get('/api/v1/auth/profile', (req, res) => {
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
        const user = users.find(u => u.id === payload.id);
        
        if (!user) {
            return res.status(401).json({
                error: true,
                message: 'Invalid token'
            });
        }
        
        res.json({
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name,
                organization: user.organization
            }
        });
    } catch (error) {
        res.status(401).json({
            error: true,
            message: 'Invalid token format'
        });
    }
});

// Mock consent endpoints
app.get('/api/v1/consents', (req, res) => {
    res.json({
        consents: [
            {
                id: '1',
                type: 'marketing',
                status: 'granted',
                purpose: 'Email marketing communications',
                grantedAt: new Date().toISOString()
            }
        ]
    });
});

app.post('/api/v1/consents', (req, res) => {
    console.log('📝 Consent granted:', req.body);
    res.json({
        success: true,
        consent: {
            id: Date.now().toString(),
            ...req.body,
            grantedAt: new Date().toISOString()
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🎯 ConsentHub Demo Backend running on http://localhost:${PORT}`);
    console.log('📋 Available endpoints:');
    console.log('   POST /api/v1/auth/login');
    console.log('   GET  /api/v1/auth/profile');
    console.log('   GET  /api/v1/consents');
    console.log('   POST /api/v1/consents');
    console.log('');
    console.log('👥 Demo Users:');
    console.log('   admin@sltmobitel.lk / admin123 (Admin)');
    console.log('   csr@sltmobitel.lk / csr123 (CSR)');
    console.log('   customer@sltmobitel.lk / customer123 (Customer)');
});
'@

# Save the backend script
$backendScript | Out-File -FilePath "demo-backend.js" -Encoding UTF8

# Start the backend server
Start-Process powershell -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", "node demo-backend.js") -WorkingDirectory $PWD
Start-Sleep -Seconds 3

# Test if backend is running
Write-Host "🔍 Testing backend connection..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/v1/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend server is running!" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Backend server may still be starting..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
}

# Start the frontend
Write-Host ""
Write-Host "🎨 Starting Frontend Application..." -ForegroundColor Green
Start-Process powershell -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", "npm run dev") -WorkingDirectory $PWD
Start-Sleep -Seconds 3

# Display system information
Write-Host ""
Write-Host "🎉 ConsentHub Demo System Started!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access Points:" -ForegroundColor Cyan
Write-Host "   📱 Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host "   🔐 Backend:   http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "👥 Demo Credentials:" -ForegroundColor Cyan
Write-Host "   📧 admin@sltmobitel.lk    Password: admin123" -ForegroundColor White
Write-Host "   📧 csr@sltmobitel.lk      Password: csr123" -ForegroundColor White
Write-Host "   📧 customer@sltmobitel.lk Password: customer123" -ForegroundColor White
Write-Host ""
Write-Host "🎯 The authentication should now work!" -ForegroundColor Green
Write-Host "   Try logging in with any of the demo credentials above." -ForegroundColor Cyan
Write-Host ""
Write-Host "🛑 To stop the demo:" -ForegroundColor Red
Write-Host "   Close the PowerShell windows or press Ctrl+C in each" -ForegroundColor White

# Monitor the system
Write-Host ""
Write-Host "🔍 System Monitor - Checking status..." -ForegroundColor Yellow

$maxAttempts = 10
$attempt = 1

while ($attempt -le $maxAttempts) {
    $timestamp = Get-Date -Format "HH:mm:ss"
    
    # Check backend
    try {
        $backendResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/v1/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($backendResponse.StatusCode -eq 200) {
            Write-Host "[$timestamp] ✅ Backend: Running (http://localhost:3001)" -ForegroundColor Green
            $backendOk = $true
        } else {
            $backendOk = $false
        }
    } catch {
        Write-Host "[$timestamp] ⚠️  Backend: Starting... (attempt $attempt/$maxAttempts)" -ForegroundColor Yellow
        $backendOk = $false
    }
    
    # Check frontend
    try {
        $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($frontendResponse.StatusCode -eq 200) {
            Write-Host "[$timestamp] ✅ Frontend: Running (http://localhost:5173)" -ForegroundColor Green
            $frontendOk = $true
        } else {
            $frontendOk = $false
        }
    } catch {
        Write-Host "[$timestamp] ⚠️  Frontend: Starting... (attempt $attempt/$maxAttempts)" -ForegroundColor Yellow
        $frontendOk = $false
    }
    
    if ($backendOk -and $frontendOk) {
        Write-Host ""
        Write-Host "🎉 SYSTEM READY! Both services are running!" -ForegroundColor Green
        Write-Host "   🌐 Visit http://localhost:5173 to use ConsentHub" -ForegroundColor Cyan
        Write-Host "   🔐 Login with: customer@sltmobitel.lk / customer123" -ForegroundColor White
        Write-Host ""
        break
    }
    
    $attempt++
    Start-Sleep -Seconds 5
}

if ($attempt -gt $maxAttempts) {
    Write-Host ""
    Write-Host "⚠️  Some services may still be starting. Please check manually:" -ForegroundColor Yellow
    Write-Host "   Backend: http://localhost:3001/api/v1/health" -ForegroundColor White
    Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
}

Write-Host ""
Write-Host "Press any key to exit monitoring..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
