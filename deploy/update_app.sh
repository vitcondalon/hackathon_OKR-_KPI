#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/okr-kpi}"
BRANCH="${BRANCH:-main}"
BACKEND_SERVICE="${BACKEND_SERVICE:-okr-kpi-backend}"
FRONTEND_SERVICE="${FRONTEND_SERVICE:-okr-kpi-frontend}"

cd "$APP_DIR"
git fetch origin
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

python3 -m venv backend/.venv
backend/.venv/bin/pip install --upgrade pip
backend/.venv/bin/pip install -r backend/requirements.txt
backend/.venv/bin/python backend/create_admin.py

cd "$APP_DIR/frontend"
npm ci
npm run build

sudo systemctl restart "$BACKEND_SERVICE"
sudo systemctl restart "$FRONTEND_SERVICE"

echo "Deployment update complete."
