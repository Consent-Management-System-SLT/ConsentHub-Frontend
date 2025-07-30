# =================================================================
# ConsentHub Privacy Management System - Complete System Startup
# =================================================================
# This PowerShell script starts the complete ConsentHub system including:
# - MongoDB database check
# - Backend API server (comprehensive-backend.js)
# - Frontend development server (Vite)
# =================================================================

$Host.UI.RawUI.WindowTitle = "ConsentHub System Startup"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "🚀 ConsentHub Privacy Management System" -ForegroundColor Green
Write-Host "   Complete System Startup" -ForegroundColor Green  
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Function to display colored status messages
function Write-Status {
    param(
        [string]$Message,
        [string]$Status = "INFO",
        [string]$Color = "White"
    )
    
    $statusIcon = switch ($Status) {
        "SUCCESS" { "[SUCCESS]"; $Color = "Green" }
        "ERROR" { "[ERROR]"; $Color = "Red" }
        "WARNING" { "[WARNING]"; $Color = "Yellow" }
        "INFO" { "[INFO]"; $Color = "Cyan" }
        default { "[INFO]"; $Color = "White" }
    }
    Write-Host "$statusIcon $Message" -ForegroundColor $Color
}

# Check if Node.js is installed
Write-Status "Checking Node.js installation..." "INFO"
try {
    $nodeVersion = node --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Status "Node.js version: $nodeVersion" "SUCCESS"
        
        # Check if version is >= 18.0.0
        $version = [version]($nodeVersion -replace 'v', '')
        if ($version -lt [version]"18.0.0") {
            Write-Status "Node.js version 18.0.0 or higher required. Current: $nodeVersion" "ERROR"
            Write-Host "Please upgrade Node.js from: https://nodejs.org/" -ForegroundColor Yellow
            Read-Host "Press Enter to exit"
            exit 1
        }
    } else {
        throw "Node.js not found"
    }
} catch {
    Write-Status "Node.js not found!" "ERROR"
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Required version: 18.0.0 or higher" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check MongoDB connection
Write-Host ""
Write-Status "Checking MongoDB connection..." "INFO"
try {
    $mongoTest = mongosh --eval "db.runCommand({ ping: 1 })" --quiet 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Status "MongoDB is running" "SUCCESS"
    } else {
        throw "MongoDB not responding"
    }
} catch {
    Write-Status "MongoDB not detected!" "WARNING"
    Write-Host "   Please ensure MongoDB is running:" -ForegroundColor Yellow
    Write-Host "   - If using MongoDB Compass, open the application" -ForegroundColor Yellow
    Write-Host "   - If using Community Server: mongod --dbpath C:\data\db" -ForegroundColor Yellow
    Write-Host "   - Or install Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest" -ForegroundColor Yellow
    Write-Host ""
    
    $continue = Read-Host "Continue anyway? Some features may not work (Y/n)"
    if ($continue -eq "n" -or $continue -eq "N") {
        exit 1
    }
    Write-Host "Continuing without MongoDB..." -ForegroundColor Yellow
}

# Create environment file if it doesn't exist
Write-Host ""
Write-Status "Setting up environment configuration..." "INFO"
if (!(Test-Path ".env")) {
    Write-Host "Creating .env file with default settings..." -ForegroundColor Yellow
    
    $envContent = @"
# ConsentHub Environment Configuration
MONGODB_URI=mongodb://localhost:27017/consenthub
JWT_SECRET=consent-hub-jwt-secret-change-in-production
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
VITE_API_BASE_URL=http://localhost:3001/api/v1

# Optional Redis configuration
REDIS_URL=redis://localhost:6379

# CORS Settings
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
"@
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Status "Environment file created" "SUCCESS"
} else {
    Write-Status "Environment file exists" "SUCCESS"
}

# Install dependencies if node_modules doesn't exist
Write-Host ""
Write-Status "Checking dependencies..." "INFO"
if (!(Test-Path "node_modules")) {
    Write-Host "Installing main project dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Status "Failed to install dependencies" "ERROR"
        Read-Host "Press Enter to exit"
        exit 1
    }
} else {
    Write-Status "Main dependencies installed" "SUCCESS"
}

# Check backend dependencies
if (!(Test-Path "backend\node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Status "Failed to install backend dependencies" "ERROR"
        Read-Host "Press Enter to exit"
        exit 1
    }
    Set-Location ..
} else {
    Write-Status "Backend dependencies installed" "SUCCESS"
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "🚀 Starting ConsentHub System Services" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services will start in the following order:" -ForegroundColor White
Write-Host "  1. Backend API Server (Port 3001)" -ForegroundColor Cyan
Write-Host "  2. Frontend Development Server (Port 5173)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access URLs:" -ForegroundColor White
Write-Host "  Frontend Application: " -NoNewline -ForegroundColor White
Write-Host "http://localhost:5173" -ForegroundColor Green
Write-Host "  Backend API: " -NoNewline -ForegroundColor White  
Write-Host "http://localhost:3001" -ForegroundColor Green
Write-Host "  API Documentation: " -NoNewline -ForegroundColor White
Write-Host "http://localhost:3001/api-docs" -ForegroundColor Green
Write-Host ""
Write-Host "Default Login Credentials:" -ForegroundColor White
Write-Host "  Admin: " -NoNewline -ForegroundColor White
Write-Host "admin@sltmobitel.lk / admin123" -ForegroundColor Yellow
Write-Host "  CSR: " -NoNewline -ForegroundColor White
Write-Host "csr@sltmobitel.lk / csr123" -ForegroundColor Yellow
Write-Host "  Customer: " -NoNewline -ForegroundColor White
Write-Host "customer@sltmobitel.lk / customer123" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Red
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Start backend server in a new PowerShell window
Write-Status "Starting Backend API Server..." "INFO"
$backendProcess = Start-Process powershell -ArgumentList "-Command", "Set-Location '$PWD'; node comprehensive-backend.js; Read-Host 'Backend server stopped. Press Enter to close'" -PassThru
Write-Host "   Backend server started in separate window (PID: $($backendProcess.Id))" -ForegroundColor Green

# Wait a moment for backend to start
Write-Host "   Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start frontend development server
Write-Status "Starting Frontend Development Server..." "INFO"
Write-Host "   This will open your default browser automatically..." -ForegroundColor Yellow
Write-Host ""

# Set up cleanup on exit
$cleanup = {
    Write-Host ""
    Write-Host "Shutting down services..." -ForegroundColor Yellow
    try {
        if (Get-Process -Id $backendProcess.Id -ErrorAction SilentlyContinue) {
            Stop-Process -Id $backendProcess.Id -Force
            Write-Host "   Backend server stopped" -ForegroundColor Green
        }
    } catch {
        Write-Host "   Backend server may have already stopped" -ForegroundColor Yellow
    }
    Write-Host "ConsentHub system shutdown complete" -ForegroundColor Green
}

# Register cleanup on Ctrl+C
[Console]::TreatControlCAsInput = $false
$null = Register-ObjectEvent -InputObject ([Console]) -EventName CancelKeyPress -Action $cleanup

try {
    # Run the frontend server (this will block until stopped)
    npm run dev
} catch {
    Write-Host ""
    Write-Status "Frontend server encountered an error" "ERROR"
} finally {
    # Cleanup
    & $cleanup
}

Write-Host ""
Write-Host "System startup script completed." -ForegroundColor Cyan
Read-Host "Press Enter to exit"
