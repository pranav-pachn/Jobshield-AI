#!/usr/bin/env bash
set -euo pipefail

echo "[JobShield] Starting development environment..."

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required to run this script."
  exit 1
fi

if ! command -v docker-compose >/dev/null 2>&1; then
  echo "docker-compose is required to run this script."
  exit 1
fi

docker-compose up --build
