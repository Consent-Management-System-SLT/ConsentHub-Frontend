# ConsentHub Simple Start Script (PowerShell)
# This script starts just the frontend and a simple backend server

Write-Host "[*] Starting ConsentHub Simple Mode..." -ForegroundColor Green
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

# Install frontend dependencies (if not already installed)
if (-not (Test-Path "node_modules")) {
    Write-Host "[*] Installing frontend dependencies..." -ForegroundColor Blue
    npm install
}

# Start simple backend server
Write-Host "[*] Starting simple backend server..." -ForegroundColor Yellow
Set-Location backend
Start-Process -FilePath "node" -ArgumentList "simple-server.js" -NoNewWindow -PassThru
Start-Sleep -Seconds 2

# Start frontend
Write-Host "[*] Starting frontend..." -ForegroundColor Yellow
Set-Location ..
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -NoNewWindow -PassThru

# Display startup information
Write-Host ""
Write-Host "[*] ConsentHub Simple Mode is starting up!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "Backend: http://localhost:3000" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow

# Keep the script running
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} catch {
    Write-Host "[*] Shutting down ConsentHub Simple Mode..." -ForegroundColor Yellow
}
