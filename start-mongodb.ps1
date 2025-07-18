# ConsentHub MongoDB Start Script (PowerShell)

Write-Host "[*] Starting ConsentHub with MongoDB Integration..." -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] npm is not installed. Please install npm first." -ForegroundColor Red
    exit 1
}

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "[*] Installing frontend dependencies..." -ForegroundColor Blue
    npm install
}

# Check if backend dependencies are installed
if (-not (Test-Path "backend/node_modules")) {
    Write-Host "[*] Installing backend dependencies..." -ForegroundColor Blue
    Set-Location backend
    npm install
    Set-Location ..
}

# Stop any existing processes
Write-Host "[*] Stopping existing processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe /T 2>$null

# Start MongoDB-enabled backend server
Write-Host "[*] Starting MongoDB-enabled backend server..." -ForegroundColor Yellow
Set-Location backend
Start-Process -FilePath "node" -ArgumentList "mongodb-server.js" -NoNewWindow -PassThru
Start-Sleep -Seconds 3

# Test database connection
Write-Host "[*] Testing database connection..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET
    if ($healthCheck.database -eq "connected") {
        Write-Host "[OK] Database connection successful!" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] Database connection issue detected" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[ERROR] Could not connect to backend server" -ForegroundColor Red
}

# Start frontend
Write-Host "[*] Starting frontend..." -ForegroundColor Yellow
Set-Location ..
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -NoNewWindow -PassThru

# Display startup information
Write-Host ""
Write-Host "[*] ConsentHub with MongoDB is starting up!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "Backend API: http://localhost:3000" -ForegroundColor Green
Write-Host "API Documentation: http://localhost:3000/api-docs" -ForegroundColor Green
Write-Host "Database: MongoDB Atlas (consentDB)" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "Available Endpoints:" -ForegroundColor Cyan
Write-Host "  - GET/POST /api/v1/consent" -ForegroundColor Cyan
Write-Host "  - GET/POST /api/v1/preference" -ForegroundColor Cyan
Write-Host "  - GET/POST /api/v1/party" -ForegroundColor Cyan
Write-Host "  - GET/POST /api/v1/dsar" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow

# Keep the script running
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} catch {
    Write-Host "[*] Shutting down ConsentHub..." -ForegroundColor Yellow
}
