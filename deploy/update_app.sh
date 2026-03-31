#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/okr-kpi}"
BRANCH="${BRANCH:-main}"
BACKEND_SERVICE="${BACKEND_SERVICE:-okr-kpi-backend}"
NGINX_SERVICE="${NGINX_SERVICE:-nginx}"
BACKEND_ENV_FILE="${BACKEND_ENV_FILE:-$APP_DIR/backend/.env}"
FRONTEND_ENV_FILE="${FRONTEND_ENV_FILE:-$APP_DIR/frontend/.env}"
BACKEND_HEALTH_URL="${BACKEND_HEALTH_URL:-http://127.0.0.1:8000/health}"
GUIDE_INFO_URL="${GUIDE_INFO_URL:-http://127.0.0.1:8000/api/guides/user-guide}"

DO_INIT="false"
DO_SEED="false"

for arg in "$@"; do
  case "$arg" in
    --init)
      DO_INIT="true"
      ;;
    --seed)
      DO_SEED="true"
      ;;
    *)
      echo "Unknown option: $arg"
      echo "Usage: bash deploy/update_app.sh [--init] [--seed]"
      exit 1
      ;;
  esac
done

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1"
    exit 1
  fi
}

print_step() {
  echo
  echo "==> $1"
}

require_cmd git
require_cmd npm
require_cmd curl

if [[ ! -d "$APP_DIR/.git" ]]; then
  echo "APP_DIR is not a git repository: $APP_DIR"
  exit 1
fi

if [[ ! -f "$BACKEND_ENV_FILE" ]]; then
  echo "Missing backend env file: $BACKEND_ENV_FILE"
  echo "Create it before deploy."
  exit 1
fi

if [[ ! -f "$FRONTEND_ENV_FILE" ]]; then
  echo "Missing frontend env file: $FRONTEND_ENV_FILE"
  echo "Create it before deploy."
  exit 1
fi

if [[ "$DO_INIT" == "true" ]]; then
  print_step "First-time setup: installing systemd and nginx config"
  sudo cp "$APP_DIR/deploy/systemd/okr-kpi-backend.service" "/etc/systemd/system/$BACKEND_SERVICE.service"
  sudo cp "$APP_DIR/deploy/nginx/okr-kpi.conf" "/etc/nginx/sites-available/okr-kpi"
  sudo ln -sf "/etc/nginx/sites-available/okr-kpi" "/etc/nginx/sites-enabled/okr-kpi"
  sudo systemctl daemon-reload
  sudo nginx -t
fi

print_step "Updating source code"
cd "$APP_DIR"
git fetch origin
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

print_step "Installing backend dependencies"
cd "$APP_DIR/backend"
npm ci

if [[ "$DO_SEED" == "true" ]]; then
  print_step "Seeding demo data"
  npm run seed
fi

print_step "Installing frontend dependencies"
cd "$APP_DIR/frontend"
npm ci

print_step "Building frontend"
npm run build

print_step "Restarting services"
sudo systemctl restart "$BACKEND_SERVICE"
sudo nginx -t
sudo systemctl reload "$NGINX_SERVICE"

print_step "Running smoke checks"
curl -fsS "$BACKEND_HEALTH_URL" >/dev/null
curl -fsS "$GUIDE_INFO_URL" >/dev/null
sudo systemctl is-active --quiet "$BACKEND_SERVICE"

echo
echo "Deployment completed successfully."
echo "Backend service: $BACKEND_SERVICE"
echo "Health check: $BACKEND_HEALTH_URL"
