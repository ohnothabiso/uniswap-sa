@echo off
echo ====================================================
echo Starting UniSwap SA - Full Stack Application
echo Sol Plaatje University Campus Marketplace
echo ====================================================

echo [1/3] Starting Django Backend on http://127.0.0.1:8000 ...
start "UniSwap Backend" cmd /k "cd /d %~dp0backend && call .venv\Scripts\activate.bat && python manage.py migrate && python manage.py runserver 127.0.0.1:8000"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Vite React Frontend on http://127.0.0.1:5173 ...
start "UniSwap Frontend" cmd /k "cd /d %~dp0frontend && npm run dev -- --host 127.0.0.1 --port 5173"

timeout /t 3 /nobreak >nul

echo [3/3] Launching Web Browser ...
start http://127.0.0.1:5173/

echo ====================================================
echo UniSwap SA is running!
echo Frontend: http://127.0.0.1:5173
echo Backend API: http://127.0.0.1:8000/api/
echo ====================================================
