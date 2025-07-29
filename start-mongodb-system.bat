@echo off
echo ========================================
echo ConsentHub - MongoDB Setup and Start
echo ========================================
echo.

echo [1/4] Installing dependencies...
call npm install
if errorlevel 1 (
    echo Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/4] Setting up MongoDB database...
node seedDatabase.js
if errorlevel 1 (
    echo Failed to seed database
    pause
    exit /b 1
)

echo.
echo [3/4] Starting backend server...
start "Backend Server" cmd /k "echo Starting backend server on port 3001... && node comprehensive-backend.js"

echo.
echo [4/4] Starting frontend development server...
timeout /t 3 /nobreak > nul
start "Frontend Server" cmd /k "echo Starting frontend server on port 5173... && npm run dev"

echo.
echo ========================================
echo ConsentHub is starting...
echo ========================================
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Test credentials:
echo - Admin:    admin@sltmobitel.lk / admin123
echo - Customer: customer@sltmobitel.lk / customer123  
echo - CSR:      csr@sltmobitel.lk / csr123
echo.
echo Press any key to open browser...
pause > nul

start http://localhost:5173

echo.
echo To stop the servers, close the terminal windows.
echo.
pause
