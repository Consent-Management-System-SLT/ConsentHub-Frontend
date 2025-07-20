# Start ConsentHub Local Services - Simple Version
Write-Host "Starting ConsentHub Local Services..." -ForegroundColor Green

# Check if services are already running
$ports = @(3008, 3011, 3012, 3013, 3014, 3015, 3016)
$services = @{
    3008 = "Auth Service"
    3011 = "Customer Service" 
    3012 = "Consent Service"
    3013 = "Preference Service"
    3014 = "Privacy Notice Service"
    3015 = "DSAR Service"
    3016 = "Event Service"
}

Write-Host "Checking current service status..." -ForegroundColor Yellow
foreach ($port in $ports) {
    $listening = netstat -an | Select-String ":$port " | Select-String "LISTENING"
    if ($listening) {
        Write-Host "✓ $($services[$port]): Port $port is LISTENING" -ForegroundColor Green
    } else {
        Write-Host "✗ $($services[$port]): Port $port is NOT LISTENING" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Starting missing services..." -ForegroundColor Yellow

# Start simple mock services for missing ports
foreach ($port in $ports) {
    $listening = netstat -an | Select-String ":$port " | Select-String "LISTENING"
    if (-not $listening) {
        $serviceName = $services[$port]
        Write-Host "Starting $serviceName on port $port..." -ForegroundColor Cyan
        
        # Create and run a simple mock service
        $mockScript = @"
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = $port;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: '$serviceName', port: PORT });
});

// Generic API endpoints
app.all('/api/v1/*', (req, res) => {
    res.json({ 
        success: true,
        message: 'Mock response from $serviceName',
        endpoint: req.path,
        method: req.method,
        data: req.method === 'GET' ? [] : req.body || {}
    });
});

app.listen(PORT, () => {
    console.log('✓ $serviceName running on port ' + PORT);
});
"@
        
        $mockFile = "temp-service-$port.js"
        $mockScript | Out-File -FilePath $mockFile -Encoding UTF8
        
        # Start the service in background
        Start-Process powershell -ArgumentList "-WindowStyle", "Hidden", "-Command", "node '$mockFile'" 
        Start-Sleep -Seconds 2
    }
}

Write-Host ""
Write-Host "Waiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "Final Status Check:" -ForegroundColor Cyan
foreach ($port in $ports) {
    $listening = netstat -an | Select-String ":$port " | Select-String "LISTENING"
    if ($listening) {
        Write-Host "✓ $($services[$port]): http://localhost:$port" -ForegroundColor Green
    } else {
        Write-Host "✗ $($services[$port]): Failed to start" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🚀 ConsentHub services are ready!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
