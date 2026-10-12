"""
UniSwap - Sol Plaatje University Campus Marketplace
Root Runner for VS Code and Command Line.

Allows anyone opening this folder in VS Code to click 'Run' or execute
`python run.py` directly from the project root.
"""
import os
import sys
import subprocess
import webbrowser
import threading
import time

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
DB_FILE = os.path.join(BACKEND_DIR, "db.sqlite3")

# Ensure working directory is backend
os.chdir(BACKEND_DIR)

# Prefer virtualenv python if present
venv_python_win = os.path.join(BACKEND_DIR, ".venv", "Scripts", "python.exe")
venv_python_nix = os.path.join(BACKEND_DIR, ".venv", "bin", "python")

if os.path.exists(venv_python_win):
    python_bin = venv_python_win
elif os.path.exists(venv_python_nix):
    python_bin = venv_python_nix
else:
    print("\n[Setup] Initializing virtual environment...")
    subprocess.run([sys.executable, "-m", "venv", ".venv"], check=True)
    if os.path.exists(venv_python_win):
        python_bin = venv_python_win
    elif os.path.exists(venv_python_nix):
        python_bin = venv_python_nix
    else:
        python_bin = sys.executable
    print("[Setup] Installing requirements...")
    subprocess.run([python_bin, "-m", "pip", "install", "-r", "requirements.txt"], check=True)

print("=" * 60)
print("  UniSwap @ SPU - Campus Circular Marketplace")
print("=" * 60)
print(f"Working Directory: {BACKEND_DIR}")
print(f"Using Python:      {python_bin}")

# Check if database exists, if not run migrations and seed data
if not os.path.exists(DB_FILE):
    print("\n[Database] Initializing database migrations...")
    subprocess.run([python_bin, "manage.py", "migrate"], check=True)
    print("\n[Database] Seeding 24 real campus listings & categories...")
    subprocess.run([python_bin, "seed_data.py"], check=True)

def open_browser():
    time.sleep(1.5)
    print("\n[Browser] Opening http://127.0.0.1:8000/ ...")
    webbrowser.open("http://127.0.0.1:8000/")

threading.Thread(target=open_browser, daemon=True).start()

print("\n[Server] Starting Django Development Server on http://127.0.0.1:8000/ ...")
print("Press Ctrl+C to stop the server.\n")

try:
    subprocess.run([python_bin, "manage.py", "runserver", "127.0.0.1:8000"])
except KeyboardInterrupt:
    print("\nServer stopped.")
