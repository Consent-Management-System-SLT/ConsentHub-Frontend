# ConsentHub Backend Services Startup Script
Write-Host "=== Starting ConsentHub Backend Services ===" -ForegroundColor Blue

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        return $connection -ne $null
    } catch {
        return $false
    }
}

# Function to kill process on port
function Stop-ProcessOnPort {
    param([int]$Port)
    Write-Host "Killing existing process on port $Port..." -ForegroundColor Yellow
    try {
        $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
        foreach ($pid in $processes) {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
        Start-Sleep -Seconds 2
    } catch {
        Write-Host "No process found on port $Port" -ForegroundColor Gray
    }
}

# Function to start a service
function Start-Service {
    param(
        [string]$ServiceName,
        [int]$Port,
        [string]$ScriptFile
    )
    
    Write-Host "Starting $ServiceName on port $Port..." -ForegroundColor Blue
    
    # Check if port is in use and kill existing process
    if (Test-Port -Port $Port) {
        Stop-ProcessOnPort -Port $Port
    }
    
    # Create logs directory if it doesn't exist
    if (!(Test-Path "logs")) {
        New-Item -ItemType Directory -Path "logs" -Force | Out-Null
    }
    
    # Start the service
    $process = Start-Process -FilePath "node" -ArgumentList "backend\$ScriptFile" -WindowStyle Hidden -PassThru -RedirectStandardOutput "logs\$ServiceName.log" -RedirectStandardError "logs\$ServiceName-error.log"
    
    Write-Host "✓ $ServiceName started (PID: $($process.Id))" -ForegroundColor Green
    $process.Id | Out-File -FilePath "logs\$ServiceName.pid"
    
    Start-Sleep -Seconds 1
}

Write-Host "Stopping any existing services..." -ForegroundColor Yellow

# Stop existing services
Stop-ProcessOnPort -Port 3008  # Auth Service
Stop-ProcessOnPort -Port 3011  # Customer Service  
Stop-ProcessOnPort -Port 3012  # Consent Service
Stop-ProcessOnPort -Port 3013  # Preference Service
Stop-ProcessOnPort -Port 3014  # Privacy Notice Service
Stop-ProcessOnPort -Port 3015  # DSAR Service

Write-Host "Starting all services..." -ForegroundColor Blue

# Create logs directory
if (!(Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" -Force | Out-Null
}

# Start Auth Service (already exists)
Write-Host "Starting Simple Auth Service on port 3008..." -ForegroundColor Blue
$authProcess = Start-Process -FilePath "node" -ArgumentList "backend\simple-auth-server.js" -WindowStyle Hidden -PassThru -RedirectStandardOutput "logs\auth-service.log" -RedirectStandardError "logs\auth-service-error.log"
Write-Host "✓ Auth Service started (PID: $($authProcess.Id))" -ForegroundColor Green
$authProcess.Id | Out-File -FilePath "logs\auth-service.pid"

# Start Customer Service (if exists)
if (Test-Path "backend\simple-server.js") {
    Write-Host "Starting Customer Service on port 3011..." -ForegroundColor Blue
    $customerProcess = Start-Process -FilePath "node" -ArgumentList "backend\simple-server.js" -WindowStyle Hidden -PassThru -RedirectStandardOutput "logs\customer-service.log" -RedirectStandardError "logs\customer-service-error.log"
    Write-Host "✓ Customer Service started (PID: $($customerProcess.Id))" -ForegroundColor Green
    $customerProcess.Id | Out-File -FilePath "logs\customer-service.pid"
}

# Start new microservices
Start-Service -ServiceName "Consent-Service" -Port 3012 -ScriptFile "consent-service.js"
Start-Service -ServiceName "Preference-Service" -Port 3013 -ScriptFile "preference-service.js"
Start-Service -ServiceName "Privacy-Notice-Service" -Port 3014 -ScriptFile "privacy-notice-service.js"
Start-Service -ServiceName "DSAR-Service" -Port 3015 -ScriptFile "dsar-service.js"

Write-Host ""
Write-Host "=== All Services Started Successfully! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Service Endpoints:" -ForegroundColor Blue
Write-Host "  • Auth Service:           http://localhost:3008" -ForegroundColor Green
Write-Host "  • Customer Service:       http://localhost:3011" -ForegroundColor Green
Write-Host "  • Consent Service:        http://localhost:3012" -ForegroundColor Green
Write-Host "  • Preference Service:     http://localhost:3013" -ForegroundColor Green
Write-Host "  • Privacy Notice Service: http://localhost:3014" -ForegroundColor Green
Write-Host "  • DSAR Service:           http://localhost:3015" -ForegroundColor Green
Write-Host ""
Write-Host "Logs are available in the 'logs' directory" -ForegroundColor Yellow
Write-Host "Use 'stop-all-services.ps1' to stop all services" -ForegroundColor Yellow
Write-Host ""
Write-Host "Frontend:" -ForegroundColor Blue
Write-Host "  • Customer Dashboard:     http://localhost:5174" -ForegroundColor Green
