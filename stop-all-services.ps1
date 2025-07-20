# ConsentHub Backend Services Stop Script
Write-Host "=== Stopping ConsentHub Backend Services ===" -ForegroundColor Blue

# Function to stop process on port
function Stop-ProcessOnPort {
    param([int]$Port, [string]$ServiceName)
    Write-Host "Stopping $ServiceName (port $Port)..." -ForegroundColor Yellow
    try {
        $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
        if ($processes) {
            foreach ($pid in $processes) {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            }
            Write-Host "✓ $ServiceName stopped" -ForegroundColor Green
        } else {
            Write-Host "- $ServiceName not running" -ForegroundColor Gray
        }
    } catch {
        Write-Host "- No process found for $ServiceName" -ForegroundColor Gray
    }
}

# Function to stop process by PID file
function Stop-ProcessByPidFile {
    param([string]$PidFile, [string]$ServiceName)
    if (Test-Path $PidFile) {
        try {
            $pid = Get-Content $PidFile
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
            Write-Host "✓ $ServiceName stopped (PID: $pid)" -ForegroundColor Green
        } catch {
            Write-Host "- Could not stop $ServiceName from PID file" -ForegroundColor Gray
        }
    }
}

Write-Host "Stopping all services..." -ForegroundColor Blue

# Stop services by port
Stop-ProcessOnPort -Port 3008 -ServiceName "Auth Service"
Stop-ProcessOnPort -Port 3011 -ServiceName "Customer Service"
Stop-ProcessOnPort -Port 3012 -ServiceName "Consent Service"
Stop-ProcessOnPort -Port 3013 -ServiceName "Preference Service"
Stop-ProcessOnPort -Port 3014 -ServiceName "Privacy Notice Service"
Stop-ProcessOnPort -Port 3015 -ServiceName "DSAR Service"

# Also try to stop using PID files if they exist
if (Test-Path "logs") {
    Stop-ProcessByPidFile -PidFile "logs\auth-service.pid" -ServiceName "Auth Service"
    Stop-ProcessByPidFile -PidFile "logs\customer-service.pid" -ServiceName "Customer Service"
    Stop-ProcessByPidFile -PidFile "logs\Consent-Service.pid" -ServiceName "Consent Service"
    Stop-ProcessByPidFile -PidFile "logs\Preference-Service.pid" -ServiceName "Preference Service"
    Stop-ProcessByPidFile -PidFile "logs\Privacy-Notice-Service.pid" -ServiceName "Privacy Notice Service"
    Stop-ProcessByPidFile -PidFile "logs\DSAR-Service.pid" -ServiceName "DSAR Service"
}

Write-Host ""
Write-Host "=== All Services Stopped ===" -ForegroundColor Green
Write-Host ""
Write-Host "Log files are preserved in the 'logs' directory" -ForegroundColor Blue
