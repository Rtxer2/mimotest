#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "=== SmartFactory ERP Deployment ==="
echo ""

# Check prerequisites
command -v python3 >/dev/null 2>&1 || { echo "Error: python3 not found"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Error: node not found"; exit 1; }

# Setup backend
echo "[1/4] Setting up backend..."
cd "$ROOT/backend"
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
fi
source .venv/bin/activate
pip install -q -r requirements.txt

# Build frontend
echo "[2/4] Building frontend..."
cd "$ROOT/frontend"
npm install -q
npm run build

# Copy frontend dist to backend
echo "[3/4] Copying frontend build..."
mkdir -p "$ROOT/backend/frontend/dist"
cp -r "$ROOT/frontend/dist/"* "$ROOT/backend/frontend/dist/"

# Run migrations
echo "[4/4] Running database migrations..."
cd "$ROOT/backend"
source .venv/bin/activate

# Start PostgreSQL if Docker is available
if command -v docker >/dev/null 2>&1; then
    echo "Starting PostgreSQL..."
    docker-compose up -d postgres 2>/dev/null || true
    sleep 2
fi

alembic upgrade head 2>/dev/null || echo "Warning: Migration failed (database may not be running)"

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "To start the application:"
echo "  cd backend && source .venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8000"
echo ""
echo "Or use the start script:"
echo "  ./start.sh"
echo ""
echo "Access at: http://localhost:8000"
echo "Admin login: admin@erp.local / admin123"
