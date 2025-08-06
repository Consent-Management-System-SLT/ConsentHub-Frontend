# Simple ConsentHub Startup Script
# Starts services using concurrently for simpler management

Write-Host "🚀 Starting ConsentHub (Simple Mode)..." -ForegroundColor Green

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Install concurrently if not present
Write-Host "📦 Checking for concurrently..." -ForegroundColor Yellow
try {
    npm list -g concurrently >$null 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Installing concurrently globally..." -ForegroundColor Yellow
        npm install -g concurrently
    }
    Write-Host "✅ Concurrently available" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not install concurrently. Using alternative method." -ForegroundColor Yellow
}

# Create environment file if it doesn't exist
if (!(Test-Path ".env")) {
    Write-Host "📝 Creating environment file..." -ForegroundColor Yellow
    $envContent = @"
MONGODB_URI=mongodb://localhost:27017/consenthub
JWT_SECRET=consent-hub-jwt-secret
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
VITE_API_BASE_URL=http://localhost:3001/api/v1
"@
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
}

# Install dependencies if needed
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    Set-Location backend
    npm install
    Set-Location ..
}

Write-Host ""
Write-Host "🚀 Starting all services concurrently..." -ForegroundColor Green
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   API:      http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow
Write-Host ""

# Start everything using npm scripts
try {
    if (Get-Command concurrently -ErrorAction SilentlyContinue) {
        # Use concurrently for better output management
        npx concurrently -c "cyan,yellow,green,red,blue,magenta" `
            "npm run dev" `
            "cd backend && npm run start:all" `
            --names "Frontend,Backend" `
            --kill-others-on-fail
    } else {
        # Fallback: start services in background
        Write-Host "Starting backend services..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-Command", "cd '$PWD\backend'; npm run start:all" -WindowStyle Minimized
        
        Start-Sleep -Seconds 5
        
        Write-Host "Starting frontend..." -ForegroundColor Yellow
        npm run dev
    }
} catch {
    Write-Host "❌ Error starting services: $_" -ForegroundColor Red
    Write-Host "Try running: npm run start:full" -ForegroundColor Yellow
}
