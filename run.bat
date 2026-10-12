@echo off
setlocal
echo ====================================================
echo Starting UniSwap - SPU Campus Marketplace
echo ====================================================

cd /d "%~dp0backend"

:: Detect Python command
set "PY_CMD=python"
where python >nul 2>&1
if errorlevel 1 (
    where py >nul 2>&1
    if not errorlevel 1 (
        set "PY_CMD=py -3"
    ) else (
        echo [ERROR] Python is not installed or not found in PATH!
        echo Please install Python 3.10 or higher from https://www.python.org/
        pause
        exit /b 1
    )
)

:: Create and configure virtual environment if needed
if not exist ".venv\Scripts\python.exe" (
    echo [1/3] Creating isolated virtual environment...
    %PY_CMD% -m venv .venv
    echo [2/3] Installing dependencies...
    .venv\Scripts\python.exe -m pip install -r requirements.txt
)

:: Migrate and seed data if database is not present
if not exist "db.sqlite3" (
    echo [3/3] Setting up database and seeding 24 campus listings...
    .venv\Scripts\python.exe manage.py migrate
    .venv\Scripts\python.exe seed_data.py
)

echo ====================================================
echo UniSwap is launching!
echo Serving React Application + REST API on http://127.0.0.1:8000/
echo ====================================================
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://127.0.0.1:8000/"
.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
pause
