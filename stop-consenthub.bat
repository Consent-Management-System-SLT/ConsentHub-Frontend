@echo off
echo ========================================
echo    ConsentHub System Stopper
echo ========================================
echo.
echo Stopping all ConsentHub services...
echo.

echo [1/3] Stopping Node.js processes...
taskkill /f /im node.exe 2>nul
if %errorlevel% equ 0 (
    echo   - Node.js processes stopped
) else (
    echo   - No Node.js processes found
)

echo.
echo [2/3] Stopping npm processes...
taskkill /f /im npm.exe 2>nul
if %errorlevel% equ 0 (
    echo   - npm processes stopped
) else (
    echo   - No npm processes found
)

echo.
echo [3/3] Closing ConsentHub windows...
taskkill /f /fi "WINDOWTITLE eq ConsentHub*" 2>nul
taskkill /f /fi "WINDOWTITLE eq Customer Service*" 2>nul
taskkill /f /fi "WINDOWTITLE eq CSR Service*" 2>nul
taskkill /f /fi "WINDOWTITLE eq Frontend*" 2>nul
taskkill /f /fi "WINDOWTITLE eq API Gateway*" 2>nul

echo.
echo ========================================
echo    ConsentHub Services Stopped
echo ========================================
echo.
echo All ConsentHub services have been stopped.
echo Ports 3000, 3011, 3012, 5173 are now available.
echo.
echo To restart the system, run:
echo   start-consenthub-complete.bat
echo.
pause
