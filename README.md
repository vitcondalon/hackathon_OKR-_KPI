# OKR / KPI HR Management System

Detailed usage guide: `USER_GUIDE.md`

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
      funnyController.js
    services/
      authService.js
      progressService.js
      dashboardService.js
      funny/
        funnyIntentService.js
        funnyQueryService.js
        funnyPromptService.js
        funnyGeminiService.js
        funnyResponseService.js
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
      funnyRoutes.js
    utils/
      jwt.js
      password.js
      response.js
      aiSanitizer.js
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
FUNNY_ENABLED=true
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
GEMINI_TIMEOUT_MS=8000
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
- Funny (protected):
  - `POST /api/funny/chat`
  - `GET /api/funny/suggestions`
  - `GET /api/funny/summary`
  - `GET /api/funny/insights`
  - `GET /api/funny/health`
- Insights:
  - `GET /api/insights/overview`
- Guides:
  - `GET /api/guides/user-guide`
  - `GET /api/guides/user-guide/view`
  - `GET /api/guides/user-guide/download`

## Funny Internal AI Assistant

`Funny` is an internal AI assistant module for OKR/KPI analytics.

- Safe architecture:
  - Intent classification with whitelist (`count_users`, `risky_kpis`, `dashboard_summary`, ...)
  - Fixed backend query functions only (no LLM-generated SQL execution)
  - Optional Gemini summarization for `generic_analysis`
  - Fallback to direct DB-based summary when Gemini is not configured or fails
- Security:
  - Auth required (`/api/funny/*`)
  - Zod validation for chat payload
  - Input sanitization and prompt-injection signal guard
  - Employee role is limited for broader management analytics intents

### Quick Test (Postman/curl)

1. Login and get token:

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin@okr.local","password":"Admin@123"}'
```

2. Ask Funny:

```bash
curl -X POST http://localhost:8000/api/funny/chat \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hien tai co bao nhieu nhan vien?"}'
```

3. Suggestions:

```bash
curl -X GET http://localhost:8000/api/funny/suggestions \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

4. Health:

```bash
curl -X GET http://localhost:8000/api/funny/health \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

If `GEMINI_API_KEY` is empty or Gemini request fails, Funny still answers using direct DB queries for standard statistical intents and uses deterministic fallback summary for generic analysis.

## Notes

- Active runtime is Node/Express + PostgreSQL.
- Legacy backend schema file `backend/src/db/init.sql` is marked deprecated and not used by runtime.
- Frontend production API base URL must use `VITE_API_BASE_URL=/api`.
- Detailed production instructions: `DEPLOY_NOTES.md`.

## Swagger

- UI: http://localhost:8000/api/docs
- OpenAPI JSON: http://localhost:8000/api/docs/openapi.json

