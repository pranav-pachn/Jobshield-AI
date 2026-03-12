#!/usr/bin/env bash
set -euo pipefail

echo "[JobShield] Starting deployment checks..."

echo "[JobShield] Running backend build..."
(cd backend && npm run build)

echo "[JobShield] Running frontend build..."
(cd frontend && npm run build)

echo "[JobShield] Running AI service quick import test..."
python -c "import fastapi, pydantic; print('AI service dependencies OK')"

echo "[JobShield] Deployment checks passed."
echo "[JobShield] Integrate this script with your CI/CD pipeline for production deploy."
