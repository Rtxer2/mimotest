#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

if [ "$1" = "prod" ]; then
    echo "=== Production Mode ==="
    echo ""
    echo "[1/3] Starting PostgreSQL..."
    docker-compose up -d postgres

    echo "[2/3] Building frontend..."
    cd "$ROOT/frontend"
    npm run build
    mkdir -p "$ROOT/backend/frontend/dist"
    cp -r dist/* "$ROOT/backend/frontend/dist/"

    echo "[3/3] Starting server..."
    cd "$ROOT/backend"
    source .venv/bin/activate
    alembic upgrade head
    echo ""
    echo "================================"
    echo "  Application: http://localhost:8000"
    echo "  API Docs:    http://localhost:8000/docs"
    echo "  Admin:       admin@erp.local / admin123"
    echo "================================"
    uvicorn app.main:app --host 0.0.0.0 --port 8000
else
    cleanup() {
        echo "Stopping services..."
        kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
        wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
        echo "Done."
    }
    trap cleanup EXIT INT TERM

    echo "=== Development Mode ==="
    echo ""
    echo "Starting PostgreSQL..."
    docker-compose up -d postgres

    echo ""
    echo "Starting Backend (port 8000)..."
    cd "$ROOT/backend"
    source .venv/bin/activate
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
    BACKEND_PID=$!

    echo ""
    echo "Starting Frontend (port 5173)..."
    cd "$ROOT/frontend"
    npm run dev &
    FRONTEND_PID=$!

    echo ""
    echo "================================"
    echo "  Frontend:  http://localhost:5173"
    echo "  Backend:   http://localhost:8000"
    echo "  API Docs:  http://localhost:8000/docs"
    echo "================================"
    echo ""
    echo "Press Ctrl+C to stop all services."
    wait
fi
