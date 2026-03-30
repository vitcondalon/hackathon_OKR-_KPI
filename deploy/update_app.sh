#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/okr-kpi}"
BRANCH="${BRANCH:-main}"
BACKEND_SERVICE="${BACKEND_SERVICE:-okr-kpi-backend}"
NGINX_SERVICE="${NGINX_SERVICE:-nginx}"

cd "$APP_DIR"
git fetch origin
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

echo "[1/4] Installing backend dependencies..."
cd "$APP_DIR/backend"
npm ci

echo "[2/4] Installing frontend dependencies..."
cd "$APP_DIR/frontend"
npm ci

echo "[3/4] Building frontend dist..."
npm run build

echo "[4/4] Restarting backend and reloading nginx..."
sudo systemctl restart "$BACKEND_SERVICE"
sudo systemctl reload "$NGINX_SERVICE"

echo "Deployment update complete."
