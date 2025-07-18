@echo off
echo ========================================
echo    ConsentHub Complete System Startup
echo ========================================
echo.
echo Starting all services for Customer, CSR, and Admin dashboards...
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo [1/6] Installing dependencies...
echo.

REM Install frontend dependencies
echo Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
call npm install
call npm install swagger-jsdoc swagger-ui-express express-rate-limit
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo [2/6] Starting API Gateway...
echo.

REM Start API Gateway
start "ConsentHub API Gateway" cmd /k "cd /d %~dp0backend\backend\api-gateway && npm start"
timeout /t 3 /nobreak >nul

echo.
echo [3/6] Starting Customer Service (Port 3011)...
echo.

REM Start Customer Service
start "ConsentHub Customer Service" cmd /k "cd /d %~dp0backend\backend\customer-service && npm start"
timeout /t 3 /nobreak >nul

echo.
echo [4/6] Starting CSR Service...
echo.

REM Start CSR Service
start "ConsentHub CSR Service" cmd /k "cd /d %~dp0backend\backend\csr-service && npm start"
timeout /t 3 /nobreak >nul

echo.
echo [5/6] Starting Core Backend Services...
echo.

REM Start essential backend services
start "ConsentHub Consent Service" cmd /k "cd /d %~dp0backend\backend\consent-service && npm install swagger-jsdoc swagger-ui-express && npm start"
timeout /t 2 /nobreak >nul

start "ConsentHub Privacy Notice Service" cmd /k "cd /d %~dp0backend\backend\privacy-notice-service && npm install swagger-jsdoc swagger-ui-express && npm start"
timeout /t 2 /nobreak >nul

start "ConsentHub Auth Service" cmd /k "cd /d %~dp0backend\backend\auth-service && npm install express-rate-limit && npm start"
timeout /t 2 /nobreak >nul

start "ConsentHub DSAR Service" cmd /k "cd /d %~dp0backend\backend\dsar-service && npm install swagger-jsdoc swagger-ui-express && npm start"
timeout /t 2 /nobreak >nul

echo.
echo [6/6] Starting Frontend Application...
echo.

REM Go back to root directory
cd /d %~dp0

REM Start Frontend
start "ConsentHub Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo    ConsentHub System Started Successfully!
echo ========================================
echo.
echo FRONTEND ACCESS:
echo   Customer Dashboard: http://localhost:5173
echo   CSR Dashboard:      http://localhost:5173  
echo   Admin Dashboard:    http://localhost:5173
echo.
echo DEMO LOGIN CREDENTIALS:
echo   Customer: customer@sltmobitel.lk / customer123
echo   CSR:      csr@sltmobitel.lk / csr123
echo   Admin:    admin@sltmobitel.lk / admin123
echo.
echo API DOCUMENTATION:
echo   Customer API:    http://localhost:3011/api-docs
echo   CSR API:         http://localhost:3012/api-docs
echo   Main API:        http://localhost:3000/api-docs
echo.
echo HEALTH CHECKS:
echo   Customer Service: http://localhost:3011/health
echo   API Gateway:      http://localhost:3000/health
echo   Frontend:         http://localhost:5173
echo.
echo Press any key to open the application in your browser...
pause >nul

REM Open browser
start http://localhost:5173

echo.
echo System is running! Close terminal windows to stop services.
echo.
pause
