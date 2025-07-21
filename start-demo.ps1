# ConsentHub Quick Demo - Local Development
# Demonstrates the system startup without requiring MongoDB installation

Write-Host "🎯 ConsentHub Quick Demo - Starting Local Development Environment" -ForegroundColor Green
Write-Host ""

# System requirements check
Write-Host "🔍 Checking system requirements..." -ForegroundColor Yellow

# Node.js check
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    
    $version = [version]($nodeVersion -replace 'v', '')
    if ($version -lt [version]"18.0.0") {
        Write-Host "⚠️  Recommended: Node.js 18.0.0 or higher" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Node.js not found. Please install from https://nodejs.org/" -ForegroundColor Red
    Write-Host "   Required: Node.js 18.0.0 or higher" -ForegroundColor Yellow
    exit 1
}

# Check if dependencies are installed
Write-Host ""
Write-Host "📦 Checking dependencies..." -ForegroundColor Yellow

if (!(Test-Path "node_modules")) {
    Write-Host "⚠️  Root dependencies not installed. Installing..." -ForegroundColor Yellow
    npm install
}

if (!(Test-Path "backend\node_modules")) {
    Write-Host "⚠️  Backend dependencies not installed. Installing..." -ForegroundColor Yellow
    cd backend
    npm install
    cd ..
}

Write-Host "✅ Dependencies ready" -ForegroundColor Green

# Create demo environment
Write-Host ""
Write-Host "🛠️  Setting up demo environment..." -ForegroundColor Yellow

if (!(Test-Path ".env")) {
    $envContent = @"
# ConsentHub Demo Environment
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
VITE_API_BASE_URL=http://localhost:3001/api/v1

# Demo mode (no database required)
DEMO_MODE=true
USE_MOCK_DATA=true

# JWT for demo
JWT_SECRET=demo-jwt-secret-do-not-use-in-production

# Service ports
API_GATEWAY_PORT=3001
AUTH_SERVICE_PORT=3002
CONSENT_SERVICE_PORT=3003
PREFERENCE_SERVICE_PORT=3004

# Logging
LOG_LEVEL=info
"@
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ Demo environment file created" -ForegroundColor Green
}

# Start demo system
Write-Host ""
Write-Host "🚀 Starting ConsentHub Demo System..." -ForegroundColor Green
Write-Host "   This will start a simplified version that works without MongoDB" -ForegroundColor Cyan
Write-Host ""

# Start the simple auth server first (this works without MongoDB)
Write-Host "🔐 Starting Simple Auth Server..." -ForegroundColor Blue
$authScript = @"
Write-Host '🔐 ConsentHub Simple Auth Server' -ForegroundColor Blue
Write-Host '   Port: 3002' -ForegroundColor White
Write-Host '   Demo Mode: Enabled' -ForegroundColor Yellow
Write-Host ''
node simple-auth-server.js
"@

Start-Process powershell -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", $authScript
Start-Sleep -Seconds 3

# Start the frontend with mock services
Write-Host "🎨 Starting Frontend with Mock Services..." -ForegroundColor Green
$frontendScript = @"
Write-Host '🎨 ConsentHub Frontend Application' -ForegroundColor Green
Write-Host '   URL: http://localhost:5173' -ForegroundColor White
Write-Host '   Mode: Demo with Mock Backend' -ForegroundColor Yellow
Write-Host ''
Write-Host '📋 Demo Features Available:' -ForegroundColor Cyan
Write-Host '   - Privacy Consent Management' -ForegroundColor White
Write-Host '   - Communication Preferences' -ForegroundColor White
Write-Host '   - Privacy Notices' -ForegroundColor White
Write-Host '   - Customer Dashboard' -ForegroundColor White
Write-Host '   - Admin Dashboard' -ForegroundColor White
Write-Host ''
npm run dev
"@

Start-Process powershell -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", $frontendScript
Start-Sleep -Seconds 3

# Display system information
Write-Host ""
Write-Host "🎉 ConsentHub Demo System Started!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Demo Access Points:" -ForegroundColor Cyan
Write-Host "   📱 Frontend Application:  http://localhost:5173" -ForegroundColor White
Write-Host "   🔐 Simple Auth Server:    http://localhost:3002" -ForegroundColor White
Write-Host "   📚 Mock API Endpoints:    Built into frontend" -ForegroundColor White
Write-Host ""
Write-Host "👥 Demo User Accounts:" -ForegroundColor Cyan
Write-Host "   📧 admin@sltmobitel.lk    Password: admin123" -ForegroundColor White
Write-Host "   📧 csr@sltmobitel.lk      Password: csr123" -ForegroundColor White
Write-Host "   📧 customer@example.com   Password: customer123" -ForegroundColor White
Write-Host ""
Write-Host "🎯 What You Can Test:" -ForegroundColor Cyan
Write-Host "   ✅ User authentication and role-based access" -ForegroundColor White
Write-Host "   ✅ Privacy consent management workflows" -ForegroundColor White
Write-Host "   ✅ Communication preferences setup" -ForegroundColor White
Write-Host "   ✅ Privacy notice acceptance" -ForegroundColor White
Write-Host "   ✅ Customer dashboard functionality" -ForegroundColor White
Write-Host "   ✅ Admin dashboard and reporting" -ForegroundColor White
Write-Host "   ✅ CSR tools and customer search" -ForegroundColor White
Write-Host ""
Write-Host "📋 Next Steps for Full System:" -ForegroundColor Yellow
Write-Host "   1. Install MongoDB (recommended: MongoDB Compass)" -ForegroundColor White
Write-Host "   2. Run: .\start-mongodb.ps1" -ForegroundColor White
Write-Host "   3. Run: .\start-consenthub.ps1" -ForegroundColor White
Write-Host ""
Write-Host "🛑 To Stop Demo:" -ForegroundColor Red
Write-Host "   Close all PowerShell windows or press Ctrl+C in each" -ForegroundColor White
Write-Host ""

# Monitor demo system
Write-Host "🔍 Demo System Monitor (checking every 30 seconds...)" -ForegroundColor Yellow
Write-Host "   Press Ctrl+C to stop monitoring" -ForegroundColor Cyan
Write-Host ""

try {
    while ($true) {
        $timestamp = Get-Date -Format "HH:mm:ss"
        
        # Check frontend
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Host "[$timestamp] ✅ Frontend: Running (http://localhost:5173)" -ForegroundColor Green
            }
        } catch {
            Write-Host "[$timestamp] ❌ Frontend: Not responding" -ForegroundColor Red
        }
        
        # Check auth server
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3002/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Host "[$timestamp] ✅ Auth Server: Running (http://localhost:3002)" -ForegroundColor Green
            }
        } catch {
            Write-Host "[$timestamp] ❌ Auth Server: Not responding" -ForegroundColor Red
        }
        
        Write-Host "[$timestamp] 🎯 Demo system active - visit http://localhost:5173" -ForegroundColor Cyan
        Start-Sleep -Seconds 30
    }
} catch {
    Write-Host ""
    Write-Host "🛑 Demo monitoring stopped." -ForegroundColor Yellow
    Write-Host "   Demo services may still be running in background windows." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "👋 Thank you for trying ConsentHub!" -ForegroundColor Green
}
