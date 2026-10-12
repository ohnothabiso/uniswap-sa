#!/usr/bin/env bash
# ====================================================
# Starting UniSwap - SPU Campus Marketplace (Linux/macOS)
# ====================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/backend"

if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
    source .venv/bin/activate
    echo "Installing dependencies..."
    pip install -r requirements.txt
else
    source .venv/bin/activate
fi

if [ ! -f "db.sqlite3" ]; then
    echo "Setting up database and initial seed data..."
    python manage.py migrate
    python seed_data.py
fi

echo "Starting UniSwap server on http://127.0.0.1:8000/ ..."
if command -v xdg-open > /dev/null; then
    xdg-open "http://127.0.0.1:8000/" &
elif command -v open > /dev/null; then
    open "http://127.0.0.1:8000/" &
fi

python manage.py runserver 127.0.0.1:8000
