#!/usr/bin/env sh
set -e

echo "[backend] Running database migrations (alembic upgrade head)..."
alembic upgrade head

echo "[backend] Starting API server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
