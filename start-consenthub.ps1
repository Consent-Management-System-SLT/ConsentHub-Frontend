# ConsentHub Full Stack Start Script (PowerShell)

Write-Host "[*] Starting ConsentHub Full Stack Application..." -ForegroundColor Green
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

Write-Host "[*] Installing dependencies..." -ForegroundColor Blue

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
npm install

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install

# Install individual service dependencies
Write-Host "Installing service dependencies..." -ForegroundColor Yellow
npm run install:all

Set-Location ..

Write-Host "[OK] Dependencies installed successfully!" -ForegroundColor Green

# Start the application
Write-Host "[*] Starting application..." -ForegroundColor Blue

# Start backend services
Write-Host "Starting backend services..." -ForegroundColor Yellow
Set-Location backend
Start-Process -FilePath "npm" -ArgumentList "run", "start:all" -NoNewWindow -PassThru
Start-Sleep -Seconds 5

# Start frontend
Write-Host "Starting frontend..." -ForegroundColor Yellow
Set-Location ..
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -NoNewWindow -PassThru

# Display startup information
Write-Host ""
Write-Host "[*] ConsentHub is starting up!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "Backend API Gateway: http://localhost:3000" -ForegroundColor Green
Write-Host "Swagger Documentation: http://localhost:3000/docs" -ForegroundColor Green
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
