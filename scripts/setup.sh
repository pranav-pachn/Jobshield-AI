#!/usr/bin/env bash
set -euo pipefail

echo "[JobShield] Running initial setup..."

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required but not installed."
  exit 1
fi

if ! command -v python >/dev/null 2>&1; then
  echo "python is required but not installed."
  exit 1
fi

echo "[JobShield] Installing frontend dependencies..."
(cd frontend && npm install)

echo "[JobShield] Installing backend dependencies..."
(cd backend && npm install)

echo "[JobShield] Installing AI service dependencies..."
python -m pip install -r ai-service/requirements.txt

echo "[JobShield] Setup complete."
