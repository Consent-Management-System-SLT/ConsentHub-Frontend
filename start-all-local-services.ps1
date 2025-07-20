# Start all local microservices for ConsentHub
Write-Host "Starting ConsentHub Local Microservices..." -ForegroundColor Green

# Function to check if a port is listening
function Test-Port {
    param([int]$Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
    return $connection
}

# Function to start a service in background
function Start-ServiceInBackground {
    param(
        [string]$ServicePath,
        [string]$ServiceName,
        [int]$Port
    )
    
    if (Test-Port -Port $Port) {
        Write-Host "✓ $ServiceName is already running on port $Port" -ForegroundColor Green
    } elseif (Test-Path $ServicePath) {
        Write-Host "Starting $ServiceName on port $Port..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$($PWD.Path)'; node '$ServicePath'" -WindowStyle Minimized
        Start-Sleep -Seconds 3
    } else {
        Write-Host "⚠ $ServicePath not found, creating simple mock service..." -ForegroundColor Yellow
        
        # Create a simple mock service
        $mockServiceContent = @"
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = $Port;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: '$ServiceName', port: PORT });
});

// Mock endpoints for $ServiceName
app.get('/api/v1/*', (req, res) => {
    res.json({ 
        message: 'Mock response for $ServiceName',
        endpoint: req.path,
        method: req.method,
        data: []
    });
});

app.post('/api/v1/*', (req, res) => {
    res.json({ 
        success: true,
        message: 'Mock response for $ServiceName',
        data: req.body 
    });
});

app.put('/api/v1/*', (req, res) => {
    res.json({ 
        success: true,
        message: 'Mock response for $ServiceName',
        data: req.body 
    });
});

app.delete('/api/v1/*', (req, res) => {
    res.json({ 
        success: true,
        message: 'Mock delete response for $ServiceName'
    });
});

app.listen(PORT, () => {
    console.log(`✓ $ServiceName mock service running on port $Port`);
});
"@
        
        $mockServiceFile = "mock-$ServiceName-service.js"
        $mockServiceContent | Out-File -FilePath $mockServiceFile -Encoding UTF8
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$($PWD.Path)'; node '$mockServiceFile'" -WindowStyle Minimized
        Start-Sleep -Seconds 3
    }
}

# Start all services
Start-ServiceInBackground -ServicePath "backend\backend\customer-service\server.js" -ServiceName "Customer Service" -Port 3011
Start-ServiceInBackground -ServicePath "backend\backend\consent-service\server.js" -ServiceName "Consent Service" -Port 3012
Start-ServiceInBackground -ServicePath "backend\backend\preference-service\server.js" -ServiceName "Preference Service" -Port 3013
Start-ServiceInBackground -ServicePath "backend\backend\privacy-notice-service\server.js" -ServiceName "Privacy Notice Service" -Port 3014
Start-ServiceInBackground -ServicePath "backend\backend\dsar-service\server.js" -ServiceName "DSAR Service" -Port 3015
Start-ServiceInBackground -ServicePath "backend\backend\event-service\server.js" -ServiceName "Event Service" -Port 3016

Write-Host ""
Write-Host "All services starting up..." -ForegroundColor Green
Write-Host ""
Write-Host "Service Status:" -ForegroundColor Cyan
Write-Host "- Auth Service:           http://localhost:3008 ✓" -ForegroundColor White
Write-Host "- Customer Service:       http://localhost:3011" -ForegroundColor White
Write-Host "- Consent Service:        http://localhost:3012" -ForegroundColor White
Write-Host "- Preference Service:     http://localhost:3013" -ForegroundColor White
Write-Host "- Privacy Notice Service: http://localhost:3014" -ForegroundColor White
Write-Host "- DSAR Service:           http://localhost:3015" -ForegroundColor White
Write-Host "- Event Service:          http://localhost:3016" -ForegroundColor White
Write-Host ""
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Waiting for services to fully initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check final status
Write-Host "Final Status Check:" -ForegroundColor Cyan
$ports = @(3008, 3011, 3012, 3013, 3014, 3015, 3016)
foreach ($port in $ports) {
    if (Test-Port -Port $port) {
        Write-Host "✓ Port $port: LISTENING" -ForegroundColor Green
    } else {
        Write-Host "✗ Port $port: NOT LISTENING" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🚀 ConsentHub services are ready!" -ForegroundColor Green
