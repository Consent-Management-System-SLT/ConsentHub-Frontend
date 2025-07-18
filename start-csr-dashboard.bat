@echo off
echo ========================================
echo    ConsentHub CSR Dashboard Startup
echo ========================================
echo.
echo Starting services for CSR (Customer Service Representative) Dashboard...
echo.

REM Check dependencies
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo [1/4] Installing dependencies...
call npm install
cd backend
call npm install swagger-jsdoc swagger-ui-express express-rate-limit
cd ..

echo.
echo [2/4] Starting Customer Service (for customer data)...
start "Customer Service" cmd /k "cd /d %~dp0backend\backend\customer-service && npm start"
timeout /t 3 /nobreak >nul

echo.
echo [3/4] Starting CSR Service...
start "CSR Service" cmd /k "cd /d %~dp0backend\backend\csr-service && npm start"
timeout /t 3 /nobreak >nul

echo.
echo [4/4] Starting Frontend...
start "Frontend" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo    CSR Dashboard Ready!
echo ========================================
echo.
echo ACCESS URL: http://localhost:5173
echo.
echo DEMO LOGIN:
echo   Email:    csr@sltmobitel.lk
echo   Password: csr123
echo.
echo FEATURES AVAILABLE:
echo   - Customer Search
echo   - Consent Management
echo   - Customer Profile Access
echo   - DSAR Request Processing
echo   - Audit Log Viewing
echo   - Bulk Operations
echo.
echo API DOCUMENTATION:
echo   CSR API: http://localhost:3012/api-docs
echo   Customer API: http://localhost:3011/api-docs
echo.
echo Press any key to open the application...
pause >nul

start http://localhost:5173

echo.
echo CSR Dashboard is running!
pause
