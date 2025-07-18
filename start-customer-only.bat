@echo off
echo ========================================
echo    ConsentHub Quick Start (Customer Only)
echo ========================================
echo.
echo Starting essential services for Customer Dashboard...
echo.

REM Check dependencies
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo [1/3] Installing dependencies...
call npm install
cd backend
call npm install swagger-jsdoc swagger-ui-express express-rate-limit
cd ..

echo.
echo [2/3] Starting Customer Service...
start "Customer Service" cmd /k "cd /d %~dp0backend\backend\customer-service && npm start"
timeout /t 5 /nobreak >nul

echo.
echo [3/3] Starting Frontend...
start "Frontend" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo    Customer Dashboard Ready!
echo ========================================
echo.
echo ACCESS URL: http://localhost:5173
echo.
echo DEMO LOGIN:
echo   Email:    customer@sltmobitel.lk
echo   Password: customer123
echo.
echo FEATURES AVAILABLE:
echo   - Consent Management
echo   - Communication Preferences  
echo   - Privacy Notices
echo   - DSAR Requests
echo   - Profile Management
echo.
echo Press any key to open the application...
pause >nul

start http://localhost:5173

echo.
echo Customer Dashboard is running!
pause
