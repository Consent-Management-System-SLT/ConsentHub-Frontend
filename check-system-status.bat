@echo off
echo ========================================
echo    ConsentHub System Status Checker
echo ========================================
echo.
echo Checking ConsentHub system status...
echo.

echo [1/4] Checking Node.js installation...
where node >nul 2>&1
if %errorlevel% equ 0 (
    node --version
    echo   ✓ Node.js is installed
) else (
    echo   ✗ Node.js is NOT installed
)

echo.
echo [2/4] Checking npm installation...
where npm >nul 2>&1
if %errorlevel% equ 0 (
    npm --version
    echo   ✓ npm is installed
) else (
    echo   ✗ npm is NOT installed
)

echo.
echo [3/4] Checking port availability...
netstat -ano | findstr :3000 >nul
if %errorlevel% equ 0 (
    echo   Port 3000: OCCUPIED (API Gateway)
) else (
    echo   Port 3000: AVAILABLE
)

netstat -ano | findstr :3011 >nul
if %errorlevel% equ 0 (
    echo   Port 3011: OCCUPIED (Customer Service)
) else (
    echo   Port 3011: AVAILABLE
)

netstat -ano | findstr :5173 >nul
if %errorlevel% equ 0 (
    echo   Port 5173: OCCUPIED (Frontend)
) else (
    echo   Port 5173: AVAILABLE
)

echo.
echo [4/4] Testing service connectivity...
echo.
echo Testing API Gateway...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000/health' -TimeoutSec 5 -UseBasicParsing; Write-Host '  ✓ API Gateway: HEALTHY' } catch { Write-Host '  ✗ API Gateway: NOT RESPONDING' }"

echo.
echo Testing Customer Service...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3011/health' -TimeoutSec 5 -UseBasicParsing; Write-Host '  ✓ Customer Service: HEALTHY' } catch { Write-Host '  ✗ Customer Service: NOT RESPONDING' }"

echo.
echo Testing Frontend...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5173' -TimeoutSec 5 -UseBasicParsing; Write-Host '  ✓ Frontend: HEALTHY' } catch { Write-Host '  ✗ Frontend: NOT RESPONDING' }"

echo.
echo ========================================
echo    System Status Check Complete
echo ========================================
echo.
echo If all services are healthy, you can access:
echo   Frontend: http://localhost:5173
echo   API Docs: http://localhost:3000/api-docs
echo.
echo If services are not responding, run:
echo   start-consenthub-complete.bat
echo.
pause
