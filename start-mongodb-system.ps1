# ConsentHub - MongoDB Setup and Start Script
Write-Host "========================================" -ForegroundColor Green
Write-Host "ConsentHub - MongoDB Setup and Start" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "[1/4] Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[2/4] Setting up MongoDB database..." -ForegroundColor Yellow
node seedDatabase.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to seed database" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[3/4] Starting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Starting backend server on port 3001...' -ForegroundColor Cyan; node comprehensive-backend.js"

Write-Host ""
Write-Host "[4/4] Starting frontend development server..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Starting frontend server on port 5173...' -ForegroundColor Cyan; npm run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "ConsentHub is starting..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Backend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test credentials:" -ForegroundColor Yellow
Write-Host "- Admin:    admin@sltmobitel.lk / admin123" -ForegroundColor White
Write-Host "- Customer: customer@sltmobitel.lk / customer123" -ForegroundColor White  
Write-Host "- CSR:      csr@sltmobitel.lk / csr123" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to open browser..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "To stop the servers, close the PowerShell windows." -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to exit"
