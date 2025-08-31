# =================================================================
# ConsentHub Privacy Management System - Production Mode Startup
# =================================================================
# This PowerShell script starts the frontend in production mode
# connecting to the deployed Render backend
# =================================================================

$Host.UI.RawUI.WindowTitle = "ConsentHub Production Mode"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "🚀 ConsentHub Privacy Management System" -ForegroundColor Green
Write-Host "   Production Mode Startup" -ForegroundColor Green  
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
    } else {
        Write-Status "Node.js not found! Please install Node.js from https://nodejs.org/" "ERROR"
        Read-Host "Press Enter to exit"
        exit 1
    }
} catch {
    Write-Status "Node.js not found! Please install Node.js from https://nodejs.org/" "ERROR"
    Read-Host "Press Enter to exit"
    exit 1
}

# Check backend connectivity
Write-Status "Testing production backend connectivity..." "INFO"
try {
    $response = Invoke-WebRequest -Uri "https://consenthub-backend.onrender.com/health" -Method GET -TimeoutSec 10 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Status "Production backend is accessible" "SUCCESS"
    } else {
        Write-Status "Backend responded with status: $($response.StatusCode)" "WARNING"
    }
} catch {
    Write-Status "Backend connectivity test failed - continuing anyway" "WARNING"
    Write-Host "   This is normal if the backend is starting up or in sleep mode" -ForegroundColor Yellow
}

# Set production environment
Write-Status "Configuring production environment..." "INFO"
$env:NODE_ENV = "production"
$env:VITE_NODE_ENV = "production"

# Copy production environment file
if (Test-Path ".env.production") {
    Copy-Item ".env.production" ".env.local" -Force
    Write-Status "Production environment configured" "SUCCESS"
} else {
    Write-Status "Production environment file not found!" "ERROR"
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "🌐 Starting ConsentHub in Production Mode" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Production Configuration:" -ForegroundColor Green
Write-Host "  Frontend (Local Dev): http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend (Render): https://consenthub-backend.onrender.com" -ForegroundColor Cyan
Write-Host "  Database: MongoDB Atlas (Cloud)" -ForegroundColor Cyan
Write-Host "  WebSocket: Production Real-time Updates" -ForegroundColor Cyan
Write-Host ""

Write-Host "Production Login Credentials:" -ForegroundColor Green
Write-Host "  Admin: admin@sltmobitel.lk / admin123" -ForegroundColor Yellow
Write-Host "  CSR: csr@sltmobitel.lk / csr123" -ForegroundColor Yellow
Write-Host "  Customer: customer@sltmobitel.lk / customer123" -ForegroundColor Yellow
Write-Host ""

Write-Host "Press Ctrl+C to stop the frontend server" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Start frontend in production mode
Write-Status "Starting Frontend in Production Mode..." "INFO"
Write-Host "   This will connect to your deployed Render backend..." -ForegroundColor Green
Write-Host "   Opening browser automatically..." -ForegroundColor Green
Write-Host ""

# Start Vite in production mode
npm run dev

# Cleanup on exit
Write-Host ""
Write-Status "Frontend server stopped" "INFO"
Write-Host "Production mode session ended" -ForegroundColor Green
