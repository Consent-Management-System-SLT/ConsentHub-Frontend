# ConsentHub System Startup Script
# This script starts all microservices and the frontend application

Write-Host "🚀 Starting ConsentHub Privacy Management System..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
    
    # Check if version is >= 18.0.0
    $version = [version]($nodeVersion -replace 'v', '')
    if ($version -lt [version]"18.0.0") {
        Write-Host "❌ Node.js version 18.0.0 or higher required. Please upgrade Node.js." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if MongoDB is running
Write-Host "🔍 Checking MongoDB connection..." -ForegroundColor Yellow
try {
    $mongoTest = mongosh --eval "db.runCommand({ ping: 1 })" --quiet 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ MongoDB is running" -ForegroundColor Green
    } else {
        throw "MongoDB not responding"
    }
} catch {
    Write-Host "⚠️  MongoDB not detected. Please ensure MongoDB is running:" -ForegroundColor Yellow
    Write-Host "   - If using MongoDB Compass, open the application" -ForegroundColor Yellow
    Write-Host "   - If using Community Server: mongod --dbpath C:\data\db" -ForegroundColor Yellow
    Write-Host "   - Or continue anyway (some features may not work)" -ForegroundColor Yellow
    
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 1
    }
}

# Create environment file if it doesn't exist
if (!(Test-Path ".env")) {
    Write-Host "📝 Creating environment file..." -ForegroundColor Yellow
    
    $envContent = @"
# ConsentHub Environment Configuration
MONGODB_URI=mongodb://localhost:27017/consenthub
REDIS_URL=redis://localhost:6379
JWT_SECRET=consent-hub-super-secret-jwt-key-2024-change-in-production
NODE_ENV=development
LOG_LEVEL=info

# Service Ports
API_GATEWAY_PORT=3001
AUTH_SERVICE_PORT=3002
CONSENT_SERVICE_PORT=3003
PREFERENCE_SERVICE_PORT=3004
PRIVACY_NOTICE_SERVICE_PORT=3005
ANALYTICS_SERVICE_PORT=3006
AGREEMENT_SERVICE_PORT=3007
EVENT_SERVICE_PORT=3008
PARTY_SERVICE_PORT=3009
DSAR_SERVICE_PORT=3010

# Frontend
FRONTEND_URL=http://localhost:3000
VITE_API_BASE_URL=http://localhost:3001/api/v1

# Security
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
SESSION_SECRET=consent-hub-session-secret-2024
"@
    
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ Environment file created" -ForegroundColor Green
}

# Install dependencies if node_modules doesn't exist
if (!(Test-Path "node_modules") -or !(Test-Path "backend\node_modules")) {
    Write-Host "📦 Installing dependencies (this may take a few minutes)..." -ForegroundColor Yellow
    
    # Install root dependencies
    npm install
    
    # Install backend dependencies
    Set-Location backend
    npm install
    
    # Install all microservice dependencies
    $services = @(
        "api-gateway",
        "auth-service", 
        "consent-service",
        "preference-service",
        "privacy-notice-service",
        "analytics-service",
        "agreement-service",
        "event-service",
        "party-service",
        "dsar-service",
        "customer-service",
        "csr-service"
    )
    
    foreach ($service in $services) {
        $servicePath = "backend\$service"
        if (Test-Path $servicePath) {
            Write-Host "   Installing $service dependencies..." -ForegroundColor Cyan
            Set-Location $servicePath
            npm install --silent
            Set-Location "..\..\.."
        }
    }
    
    Set-Location ..
    Write-Host "✅ All dependencies installed" -ForegroundColor Green
}

# Function to check if port is available
function Test-Port {
    param([int]$Port)
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
        $listener.Start()
        $listener.Stop()
        return $true
    } catch {
        return $false
    }
}

# Check required ports
$requiredPorts = @(3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010)
$usedPorts = @()

foreach ($port in $requiredPorts) {
    if (!(Test-Port $port)) {
        $usedPorts += $port
    }
}

if ($usedPorts.Count -gt 0) {
    Write-Host "⚠️  The following ports are already in use: $($usedPorts -join ', ')" -ForegroundColor Yellow
    Write-Host "   You can:" -ForegroundColor Yellow
    Write-Host "   1. Kill processes using these ports: netstat -ano | findstr :[PORT]" -ForegroundColor Yellow
    Write-Host "   2. Continue anyway (services on used ports may fail to start)" -ForegroundColor Yellow
    
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 1
    }
}

Write-Host ""
Write-Host "🚀 Starting ConsentHub services..." -ForegroundColor Green
Write-Host "   This will open multiple terminal windows for each service." -ForegroundColor Cyan
Write-Host "   Close this window or press Ctrl+C to stop all services." -ForegroundColor Cyan
Write-Host ""

# Start services in order with proper dependencies
$services = @(
    @{Name="API Gateway"; Path="backend\backend\api-gateway"; Port=3001; Color="Blue"},
    @{Name="Auth Service"; Path="backend\backend\auth-service"; Port=3002; Color="Magenta"},
    @{Name="Event Service"; Path="backend\backend\event-service"; Port=3008; Color="DarkYellow"},
    @{Name="Party Service"; Path="backend\backend\party-service"; Port=3009; Color="DarkGreen"},
    @{Name="Consent Service"; Path="backend\backend\consent-service"; Port=3003; Color="Red"},
    @{Name="Preference Service"; Path="backend\backend\preference-service"; Port=3004; Color="DarkCyan"},
    @{Name="Privacy Notice Service"; Path="backend\backend\privacy-notice-service"; Port=3005; Color="DarkBlue"},
    @{Name="Analytics Service"; Path="backend\backend\analytics-service"; Port=3006; Color="DarkMagenta"},
    @{Name="Agreement Service"; Path="backend\backend\agreement-service"; Port=3007; Color="Yellow"},
    @{Name="DSAR Service"; Path="backend\backend\dsar-service"; Port=3010; Color="Cyan"}
)

# Start backend services
foreach ($service in $services) {
    if (Test-Path $service.Path) {
        Write-Host "🔄 Starting $($service.Name) on port $($service.Port)..." -ForegroundColor $service.Color
        
        $startScript = @"
Write-Host '🚀 Starting $($service.Name)' -ForegroundColor $($service.Color)
Set-Location '$($service.Path)'
if (Test-Path 'package.json') {
    npm start
} else {
    Write-Host '❌ package.json not found in $($service.Path)' -ForegroundColor Red
    Read-Host 'Press Enter to close...'
}
"@
        
        Start-Process powershell -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", $startScript
        Start-Sleep -Seconds 2  # Give each service time to start
    } else {
        Write-Host "⚠️  Service path not found: $($service.Path)" -ForegroundColor Yellow
    }
}

# Wait for backend services to initialize
Write-Host "⏳ Waiting for backend services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Start frontend
Write-Host "🎨 Starting Frontend Application..." -ForegroundColor Green
$frontendScript = @"
Write-Host '🎨 Starting ConsentHub Frontend' -ForegroundColor Green
if (Test-Path 'package.json') {
    npm run dev
} else {
    Write-Host '❌ Frontend package.json not found' -ForegroundColor Red
    Read-Host 'Press Enter to close...'
}
"@

Start-Process powershell -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", $frontendScript

# Wait a bit more for frontend to start
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "🎉 ConsentHub System Started Successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Access Points:" -ForegroundColor Cyan
Write-Host "   Frontend:          http://localhost:3000" -ForegroundColor White
Write-Host "   API Gateway:       http://localhost:3001" -ForegroundColor White
Write-Host "   API Documentation: http://localhost:3001/api-docs" -ForegroundColor White
Write-Host "   System Health:     http://localhost:3001/health" -ForegroundColor White
Write-Host ""
Write-Host "👥 Test Accounts:" -ForegroundColor Cyan
Write-Host "   Admin:    admin@sltmobitel.lk / admin123" -ForegroundColor White
Write-Host "   CSR:      csr@sltmobitel.lk / csr123" -ForegroundColor White
Write-Host "   Customer: customer@example.com / customer123" -ForegroundColor White
Write-Host ""
Write-Host "🛠️  Service Management:" -ForegroundColor Cyan
Write-Host "   Stop All Services: Close this window or Ctrl+C" -ForegroundColor White
Write-Host "   View Logs:        Check individual service windows" -ForegroundColor White
Write-Host "   Restart Service:  Close service window and restart" -ForegroundColor White
Write-Host ""

# Keep the script running to monitor services
try {
    Write-Host "🔍 Monitoring services... (Press Ctrl+C to stop all services)" -ForegroundColor Yellow
    Write-Host ""
    
    while ($true) {
        # Check if services are responding
        $timestamp = Get-Date -Format "HH:mm:ss"
        
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                Write-Host "[$timestamp] ✅ API Gateway: Healthy" -ForegroundColor Green
            }
        } catch {
            Write-Host "[$timestamp] ❌ API Gateway: Not responding" -ForegroundColor Red
        }
        
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                Write-Host "[$timestamp] ✅ Frontend: Healthy" -ForegroundColor Green
            }
        } catch {
            Write-Host "[$timestamp] ❌ Frontend: Not responding" -ForegroundColor Red
        }
        
        Start-Sleep -Seconds 30  # Check every 30 seconds
    }
} catch {
    Write-Host ""
    Write-Host "🛑 Shutting down ConsentHub services..." -ForegroundColor Yellow
    Write-Host "   Individual service windows will remain open." -ForegroundColor Cyan
    Write-Host "   Close them manually to fully stop all services." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "👋 Thank you for using ConsentHub!" -ForegroundColor Green
}
