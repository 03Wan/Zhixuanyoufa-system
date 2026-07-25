@echo off
setlocal enabledelayedexpansion
chcp 936 >nul

set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%backend"
set "FRONTEND_DIR=%ROOT_DIR%frontend+"
set "LOG_FILE=%ROOT_DIR%startup.log"
set "FRONTEND_URL=http://localhost:5073/home-public"

call :log "==== START %date% %time% ===="
call :log "ROOT_DIR=%ROOT_DIR%"
call :log "BACKEND_DIR=%BACKEND_DIR%"
call :log "FRONTEND_DIR=%FRONTEND_DIR%"

where npm >nul 2>nul
if errorlevel 1 (
  call :fatal "npm not found. Please install Node.js 18+ and restart terminal."
)

if not exist "%BACKEND_DIR%\package.json" (
  call :fatal "backend\\package.json not found. Please run this script in project root."
)

if not exist "%FRONTEND_DIR%\package.json" (
  call :fatal "frontend+\\package.json not found. Please run this script in project root."
)

call :step "[0/8] Checking env files..."
if not exist "%BACKEND_DIR%\.env" (
  if exist "%BACKEND_DIR%\.env.example" (
    copy /Y "%BACKEND_DIR%\.env.example" "%BACKEND_DIR%\.env" >nul
    call :log "[INFO] backend .env created from .env.example"
  ) else (
    call :log "[WARN] backend .env.example not found"
  )
)
if not exist "%FRONTEND_DIR%\.env" (
  if exist "%FRONTEND_DIR%\.env.example" (
    copy /Y "%FRONTEND_DIR%\.env.example" "%FRONTEND_DIR%\.env" >nul
    call :log "[INFO] frontend .env created from .env.example"
  ) else (
    call :log "[WARN] frontend .env.example not found"
  )
)

call :step "[1/8] Checking ports 3000/5073..."
call :check_port 3000
if errorlevel 1 call :fatal "Port 3000 is already in use. Please free it first."
call :check_port 5073
if errorlevel 1 call :fatal "Port 5073 is already in use. Please free it first."

call :step "[2/8] Installing backend dependencies..."
cd /d "%BACKEND_DIR%" || call :fatal "Cannot enter backend directory."
call npm.cmd install --no-audit --no-fund >> "%LOG_FILE%" 2>&1
if errorlevel 1 call :fatal "Backend dependency installation failed. See startup.log"

call :step "[3/8] Generating Prisma client..."
call npm.cmd run prisma:generate >> "%LOG_FILE%" 2>&1
if errorlevel 1 call :log "[WARN] Prisma generate failed. Backend may not work before DB/config is fixed."

call :step "[4/8] Installing frontend dependencies..."
cd /d "%FRONTEND_DIR%" || call :fatal "Cannot enter frontend+ directory."
call npm.cmd install --no-audit --no-fund >> "%LOG_FILE%" 2>&1
if errorlevel 1 call :fatal "Frontend dependency installation failed. See startup.log"

call :step "[5/8] Starting backend service window..."
start "ZYUF-Backend" cmd /k "cd /d ""%BACKEND_DIR%"" && set PORT=3000 && npm.cmd run start:dev"

call :step "[6/8] Waiting backend startup..."
timeout /t 4 /nobreak >nul

call :step "[7/8] Starting frontend service window..."
start "ZYUF-Frontend" cmd /k "cd /d ""%FRONTEND_DIR%"" && npm.cmd run dev -- --host 0.0.0.0 --port 5073"

call :step "[8/8] Opening browser..."
timeout /t 4 /nobreak >nul
start "" "%FRONTEND_URL%"

call :log "==== DONE %date% %time% ===="
echo.
echo Startup finished. If anything failed, check: %LOG_FILE%
pause
exit /b 0

:check_port
set "PORT=%~1"
for /f "tokens=*" %%i in ('netstat -ano ^| findstr /R /C:":%PORT% .*LISTENING"') do (
  call :log "[ERROR] Port %PORT% busy: %%i"
  exit /b 1
)
exit /b 0

:step
echo %~1
call :log "%~1"
exit /b 0

:log
echo %~1>> "%LOG_FILE%"
exit /b 0

:fatal
echo [ERROR] %~1
call :log "[ERROR] %~1"
echo.
echo Startup stopped. Check log: %LOG_FILE%
pause
exit /b 1

