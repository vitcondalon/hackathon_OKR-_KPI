# Deployment Guide

This project is deployed as:
- Backend Node.js API on `127.0.0.1:8000`
- Frontend Vite build output in `frontend/dist`
- Nginx serves frontend static files and proxies `/api` to backend

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
