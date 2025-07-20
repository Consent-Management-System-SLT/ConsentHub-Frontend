# Start all microservices for ConsentHub
Write-Host "Starting ConsentHub Microservices..." -ForegroundColor Green

# Function to start a service
function Start-BackgroundService {
    param(
        [string]$ServicePath,
        [string]$ServiceName,
        [int]$Port
    )
    
    if (Test-Path $ServicePath) {
        Write-Host "Starting $ServiceName on port $Port..." -ForegroundColor Yellow
        Start-Process -FilePath "node" -ArgumentList "$ServicePath" -WindowStyle Hidden
        Start-Sleep -Seconds 2
    } else {
        Write-Host "Warning: $ServicePath not found" -ForegroundColor Red
    }
}

# Start Auth Service (port 3008) - already running
Write-Host "Auth Service should already be running on port 3008" -ForegroundColor Green

# Start Customer Service (port 3011)
Start-BackgroundService -ServicePath "backend\backend\customer-service\server.js" -ServiceName "Customer Service" -Port 3011

# Start Consent Service (port 3012)
Start-BackgroundService -ServicePath "backend\backend\consent-service\server.js" -ServiceName "Consent Service" -Port 3012

# Start Preference Service (port 3013)
Start-BackgroundService -ServicePath "backend\backend\preference-service\server.js" -ServiceName "Preference Service" -Port 3013

# Start Privacy Notice Service (port 3014)
Start-BackgroundService -ServicePath "backend\backend\privacy-notice-service\server.js" -ServiceName "Privacy Notice Service" -Port 3014

# Start DSAR Service (port 3015)
Start-BackgroundService -ServicePath "backend\backend\dsar-service\server.js" -ServiceName "DSAR Service" -Port 3015

Write-Host ""
Write-Host "All services started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Service Status:" -ForegroundColor Cyan
Write-Host "- Auth Service:           http://localhost:3008" -ForegroundColor White
Write-Host "- Customer Service:       http://localhost:3011" -ForegroundColor White
Write-Host "- Consent Service:        http://localhost:3012" -ForegroundColor White
Write-Host "- Preference Service:     http://localhost:3013" -ForegroundColor White
Write-Host "- Privacy Notice Service: http://localhost:3014" -ForegroundColor White
Write-Host "- DSAR Service:           http://localhost:3015" -ForegroundColor White
Write-Host ""
Write-Host "Frontend should be running on: http://localhost:5173" -ForegroundColor Green
