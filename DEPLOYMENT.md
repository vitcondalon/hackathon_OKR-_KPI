# OKR / KPI VPS Deployment

This project can be deployed on an Ubuntu VPS without a domain by exposing:

- app via Nginx on `http://YOUR_VPS_PUBLIC_IP`
- frontend service on internal port `3000`
- backend API on internal port `8000`

## 1. Prepare the server

```bash
sudo apt update
sudo apt install -y git python3 python3-venv python3-pip postgresql postgresql-contrib nodejs npm
```

Clone the repository:

```bash
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www
git clone <YOUR_GITHUB_REPO_URL> okr-kpi
cd okr-kpi
```

## 2. Configure PostgreSQL

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE okr_kpi;
CREATE USER okr_user WITH PASSWORD 'change_this_password';
GRANT ALL PRIVILEGES ON DATABASE okr_kpi TO okr_user;
\q
```

## 3. Configure the backend

```bash
cd /var/www/okr-kpi/backend
python3 -m venv .venv
.venv/bin/pip install --upgrade pip
.venv/bin/pip install -r requirements.txt
cp .env.example .env
```

Edit `backend/.env` and set:

- `APP_ENV=production`
- `APP_DEBUG=false`
- `DATABASE_URL=postgresql+psycopg://okr_user:change_this_password@127.0.0.1:5432/okr_kpi`
- `BACKEND_CORS_ORIGINS=http://YOUR_VPS_PUBLIC_IP,http://YOUR_VPS_PUBLIC_IP:3000`
- `JWT_SECRET_KEY` to a long random secret
- `ADMIN_SEED_PASSWORD` to a strong password

Seed the first admin:

```bash
cd /var/www/okr-kpi/backend
.venv/bin/python create_admin.py
```

## 4. Configure the frontend

```bash
cd /var/www/okr-kpi/frontend
cp .env.example .env.local
npm ci
```

Edit `frontend/.env.local` and set:

- `NEXT_PUBLIC_API_URL=/api`

Then build the production frontend:

```bash
cd /var/www/okr-kpi/frontend
npm run build
```

## 5. Create systemd services

Copy the provided service files:

```bash
sudo cp /var/www/okr-kpi/deploy/systemd/okr-kpi-backend.service /etc/systemd/system/
sudo cp /var/www/okr-kpi/deploy/systemd/okr-kpi-frontend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable okr-kpi-backend okr-kpi-frontend
sudo systemctl start okr-kpi-backend okr-kpi-frontend
```

Check status:

```bash
sudo systemctl status okr-kpi-backend
sudo systemctl status okr-kpi-frontend
```

Important:

- `NEXT_PUBLIC_API_URL` is compiled into the frontend bundle at build time.
- After changing `frontend/.env.local`, you must run `npm run build` again before restarting the frontend service.
- The frontend systemd service does not need to read `.env.local` at runtime when using `next start`.

## 6. Open firewall ports

```bash
sudo apt install -y nginx
sudo cp /var/www/okr-kpi/deploy/nginx/okr-kpi.conf /etc/nginx/sites-available/okr-kpi.conf
sudo ln -s /etc/nginx/sites-available/okr-kpi.conf /etc/nginx/sites-enabled/okr-kpi.conf
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
sudo ufw allow 80/tcp
sudo ufw enable
```

## 7. Update later from GitHub

Use the included script:

```bash
cd /var/www/okr-kpi
chmod +x deploy/update_app.sh
./deploy/update_app.sh
```

This script will:

- pull the latest code from GitHub
- reinstall backend dependencies
- re-run the idempotent admin seed script
- rebuild the frontend
- restart both services

## Notes

- The root workspace should be a real Git repository before deployment.
- SQLite files in `backend/*.db` are local/dev artifacts and should not be used on the VPS.
- The frontend now works cleanly behind Nginx with `NEXT_PUBLIC_API_URL=/api`.
- Ports `3000` and `8000` do not need to be public when Nginx is used on port `80`.
