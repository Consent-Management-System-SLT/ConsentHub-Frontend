# ConsentHub Local Development Startup Script
Write-Host "Starting ConsentHub Local Development Environment" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

$projectPath = "c:\Users\Ojitha Rajapaksha\Downloads\Consent Management System\project"

Write-Host ""
Write-Host "🚀 Starting Backend Server..." -ForegroundColor Yellow
Write-Host ""

# Start backend in a new PowerShell window
$backendScript = {
    Set-Location "c:\Users\Ojitha Rajapaksha\Downloads\Consent Management System\project"
    Write-Host "Starting ConsentHub Backend on port 3001..." -ForegroundColor Green
    node comprehensive-backend.js
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", "& {$($backendScript.ToString())}"

Write-Host "⏳ Waiting for backend to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "🌐 Starting Frontend Development Server..." -ForegroundColor Yellow
Write-Host ""

# Start frontend in a new PowerShell window
$frontendScript = {
    Set-Location "c:\Users\Ojitha Rajapaksha\Downloads\Consent Management System\project"
    Write-Host "Starting ConsentHub Frontend on port 5173..." -ForegroundColor Green
    npm run dev
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", "& {$($frontendScript.ToString())}"

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "🎉 ConsentHub is starting up!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Frontend will be available at: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔧 Backend will be available at: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "👤 Demo Accounts:" -ForegroundColor Yellow
Write-Host "   🔧 Admin: admin@sltmobitel.lk / admin123" -ForegroundColor White
Write-Host "   📞 CSR: csr@sltmobitel.lk / csr123" -ForegroundColor White  
Write-Host "   👨‍💼 Customer: customer@sltmobitel.lk / customer123" -ForegroundColor White
Write-Host ""
Write-Host "Both servers are starting in separate windows." -ForegroundColor Yellow
Write-Host "⏳ Please wait 10-15 seconds for both services to fully start." -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
