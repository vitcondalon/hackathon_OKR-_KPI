# OKR / KPI HR Management System

Backend-first rebuild using:
- Node.js + Express.js (JavaScript)
- PostgreSQL
- JWT auth + RBAC
- Zod validation
- bcryptjs + pg + dotenv + cors + helmet + morgan

## Repository Structure

```text
backend/
  src/
    config/
      env.js
      db.js
    middlewares/
      authMiddleware.js
      roleMiddleware.js
      errorMiddleware.js
      validate.js
    controllers/
      authController.js
      userController.js
      departmentController.js
      cycleController.js
      objectiveController.js
      keyResultController.js
      checkinController.js
      kpiController.js
      dashboardController.js
    services/
      authService.js
      progressService.js
      dashboardService.js
    routes/
      authRoutes.js
      userRoutes.js
      departmentRoutes.js
      cycleRoutes.js
      objectiveRoutes.js
      keyResultRoutes.js
      checkinRoutes.js
      kpiRoutes.js
      dashboardRoutes.js
    utils/
      jwt.js
      password.js
      response.js
    app.js
    server.js
  scripts/
    seed.js
  .env
  .env.example

database/
  schema.sql
  seed.sql
  database.sql
  notes.md
```

## Database Source of Truth

Primary DB files:
- `database/schema.sql`: full schema, constraints, trigger, indexes, views
- `database/seed.sql`: deterministic demo data
- `database/database.sql`: combined schema + seed snapshot

`docker-compose.yml` mounts:
- `database/schema.sql` -> `01-schema.sql`
- `database/seed.sql` -> `02-seed.sql`

## Backend Env

Use only these variables in `backend/.env`:

```env
NODE_ENV=development
PORT=8000
HOST=0.0.0.0
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/okr_kpi_db
JWT_SECRET=change_me_to_a_long_random_secret
JWT_EXPIRES_IN=1d
```

## Run PostgreSQL (Docker)

1. Copy docker env template:

```bash
cp .env.docker.example .env
```

2. Start database:

```bash
docker compose up -d postgres
```

3. Check status:

```bash
docker compose ps
```

4. Re-init schema + seed (if needed):

```bash
docker compose down -v
docker compose up -d postgres
```

## Run Backend

```bash
cd backend
npm install
npm run dev
```

Production:

```bash
npm start
```

Health:
- `GET /health`

API prefix:
- `http://localhost:8000/api`

## Seed Script

If DB already running, you can reseed from backend:

```bash
cd backend
npm run seed
```

This script executes directly:
- `../database/schema.sql`
- `../database/seed.sql`

## Demo Accounts

- `admin@okr.local / Admin@123`
- `manager.eng@okr.local / Manager@123`
- `manager.sales@okr.local / Manager@123`
- `manager.hr@okr.local / Manager@123`
- `lan@okr.local / Employee@123`
- `nam@okr.local / Employee@123`
- `ha@okr.local / Employee@123`

## API Coverage

- Auth: `/api/auth/login`, `/api/auth/me`
- Users: CRUD `/api/users`
- Departments: CRUD `/api/departments`
- Cycles: list/create/update `/api/cycles`
- Objectives: CRUD `/api/objectives`
- Key Results: CRUD `/api/key-results`
- Check-ins: list/create `/api/checkins` (KR + KPI check-ins)
- KPIs: CRUD `/api/kpis`
- Dashboard:
  - `/api/dashboard/summary`
  - `/api/dashboard/progress`
  - `/api/dashboard/risks`
  - `/api/dashboard/top-performers`
  - `/api/dashboard/charts`

## Notes

- Active runtime is Node/Express + PostgreSQL.
- Legacy backend schema file `backend/src/db/init.sql` is marked deprecated and not used by runtime.
- Frontend remains optional at this stage; backend APIs are prioritized.

## Swagger

- UI: http://localhost:8000/api/docs`r
- OpenAPI JSON: http://localhost:8000/api/docs/openapi.json`r

