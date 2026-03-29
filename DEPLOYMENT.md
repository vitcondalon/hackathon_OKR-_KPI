# Deployment Guide (Express + Vite)

## 1. System packages

```bash
sudo apt update
sudo apt install -y git nodejs npm postgresql postgresql-contrib
```

## 2. PostgreSQL setup

```bash
sudo -u postgres psql
```

```sql
CREATE USER okr_user WITH PASSWORD 'change_this_password';
CREATE DATABASE okr_kpi_db OWNER okr_user;
GRANT ALL PRIVILEGES ON DATABASE okr_kpi_db TO okr_user;
\q
```

## 3. Backend setup

```bash
cd /var/www/okr-kpi/backend
cp .env.example .env
npm install
```

Edit `backend/.env`:

```env
NODE_ENV=production
PORT=8000
HOST=0.0.0.0
DATABASE_URL=postgresql://okr_user:change_this_password@127.0.0.1:5432/okr_kpi_db
JWT_SECRET=replace_with_long_random_secret
JWT_EXPIRES_IN=1d
```

Seed schema + demo data:

```bash
npm run seed
```

Start backend:

```bash
npm start
```

## 4. Frontend setup

```bash
cd /var/www/okr-kpi/frontend
cp .env.example .env
npm install
npm run build
```

Edit `frontend/.env`:

```env
VITE_API_BASE_URL=https://your-backend-domain/api
```

Run preview (or serve `dist/` by nginx):

```bash
npm run preview
```

## 5. Demo accounts

- `admin@okr.local / Admin@123`
- `manager.eng@okr.local / Manager@123`
- `manager.sales@okr.local / Manager@123`
- `manager.hr@okr.local / Manager@123`
- `lan@okr.local / Employee@123`
- `nam@okr.local / Employee@123`
- `ha@okr.local / Employee@123`
