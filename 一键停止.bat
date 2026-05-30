@echo off
setlocal

echo Stopping backend window...
taskkill /FI "WINDOWTITLE eq ZYUF-Backend" /T /F >nul 2>nul

echo Stopping frontend window...
taskkill /FI "WINDOWTITLE eq ZYUF-Frontend" /T /F >nul 2>nul

echo.
echo Stop commands executed.
pause
