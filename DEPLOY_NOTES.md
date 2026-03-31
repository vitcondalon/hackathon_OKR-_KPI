# DEPLOY NOTES (Vite + Node.js + PostgreSQL)

## 1. Frontend API Base URL

Frontend must use only one env variable:

```env
VITE_API_BASE_URL=/api
```

- Do not use `VITE_API_URL`.
- Do not hardcode `http://localhost:8000` in production.
- Current frontend fallback is `/api` when env is missing.

## 2. Backend API + Login Contract

- Backend API prefix: `/api`
- Login endpoint: `POST /api/auth/login`
- Login payload:

```json
{
  "identifier": "admin@okr.local",
  "password": "Admin@123"
}
```

## 3. Nginx Production Mapping

Use Nginx to serve static frontend build and reverse proxy `/api`:

```nginx
server {
    listen 80;
    server_name _;

    root /var/www/okr-kpi/frontend/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Important:
- `proxy_pass http://127.0.0.1:8000;` (no trailing slash) to keep `/api` prefix intact.
- Keep public access on `80/443` only, and keep app processes internal (`127.0.0.1:*`).

## 3.1 Cloudflare SSL (Recommended)

- DNS records for `@` and `www` should be **Proxied**.
- Use SSL mode `Full` or `Full (strict)`. Avoid `Flexible`.
- For `Full (strict)`, install a Cloudflare Origin CA certificate/key on Nginx.
- Prevent redirect loops: avoid duplicate or conflicting HTTPS redirects between Cloudflare and origin.

## 4. Backend Production Env

Recommended `backend/.env`:

```env
NODE_ENV=production
HOST=127.0.0.1
PORT=8000
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/okr_kpi_db
JWT_SECRET=replace_with_long_random_secret
JWT_EXPIRES_IN=1d
FUNNY_ENABLED=true
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
GEMINI_TIMEOUT_MS=8000
```

## 5. Reseed Demo Data

```bash
cd /var/www/okr-kpi/backend
npm run seed
```

Demo users:
- `admin@okr.local / Admin@123`
- `manager.eng@okr.local / Manager@123`
- `manager.sales@okr.local / Manager@123`
- `manager.hr@okr.local / Manager@123`
- `lan@okr.local / Employee@123`
- `nam@okr.local / Employee@123`
- `ha@okr.local / Employee@123`

## 6. Typical Release Steps On VPS

```bash
cd /var/www/okr-kpi
git pull
cd backend && npm ci
cd ../frontend && npm ci && npm run build
sudo systemctl restart okr-kpi-backend
sudo systemctl reload nginx
```

## 7. Deploy Script Notes

`deploy/update_app.sh` now:
- checks required env files,
- removes default nginx site on `--init` by default (can disable via `DISABLE_DEFAULT_NGINX_SITE=false`),
- retries backend health check (`BACKEND_STARTUP_RETRIES`, default `30`) before failing.
