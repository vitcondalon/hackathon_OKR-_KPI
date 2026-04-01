# Deployment Guide

This project is deployed as:
- Backend Node.js API on `127.0.0.1:8000`
- Frontend Vite build output in `frontend/dist`
- Nginx serves frontend static files and proxies `/api` to backend
- Public traffic should go through Nginx on `80/443` (do not expose app ports directly)

See full production checklist in [DEPLOY_NOTES.md](./DEPLOY_NOTES.md).

## Quick Start

1. Configure backend env from `backend/.env.example`.
2. Configure frontend env from `frontend/.env.example` (`VITE_API_BASE_URL=/api`).
3. Build frontend:

```bash
cd frontend
npm ci
npm run build
```

4. Run backend:

```bash
cd backend
npm ci
npm start
```

5. Configure Nginx with `deploy/nginx/okr-kpi.conf` and reload Nginx.

## GitHub Actions CI/CD

This project can auto-deploy to a VPS when code is pushed to `main`.

Workflow file:
- `.github/workflows/deploy.yml`

Flow:
- GitHub Actions starts on `push` to `main`
- The workflow connects to the VPS over SSH
- It runs `deploy/update_app.sh`
- The script pulls the latest code, installs dependencies, builds the frontend, restarts backend, and reloads Nginx

Required GitHub repository secrets:
- `VPS_HOST`: public IP or domain of the VPS
- `VPS_PORT`: SSH port, usually `22`
- `VPS_USER`: deploy user on the VPS
- `VPS_SSH_KEY`: private SSH key for that user
- `VPS_KNOWN_HOSTS`: output of `ssh-keyscan -H <your-vps-host>`
- `APP_DIR`: optional, defaults to `/var/www/okr-kpi`

Recommended VPS setup:
- The app repository already exists at `/var/www/okr-kpi`
- The deploy user can access that directory
- The deploy user can run the required `sudo systemctl` and `sudo nginx -t` commands from `deploy/update_app.sh`

Typical first-time setup:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy"
ssh-copy-id -i ~/.ssh/id_ed25519.pub <user>@<your-vps-host>
ssh-keyscan -H <your-vps-host>
```

Then add the private key and host fingerprint to GitHub repository secrets.

## Cloudflare (Recommended)

If your DNS is on Cloudflare:

1. Keep DNS `A` records (`@`, `www`) as **Proxied** (orange cloud).
2. Use SSL mode `Full` or `Full (strict)`, not `Flexible`.
3. If using `Full (strict)`, install Cloudflare Origin CA cert on Nginx first.
4. Avoid redirect loops by not stacking conflicting redirects between Cloudflare and origin.
