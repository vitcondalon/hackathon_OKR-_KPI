# OKR/KPI Database Architecture Notes

## 1) Why this redesign is stronger

- Standardized naming: all tables/columns use clear snake_case and plural table names (`okr_cycles`, `key_result_checkins`, `kpi_metrics`), removing ambiguity like `objective` vs `objectives` and typo-prone fields like `key_reult_id`.
- Clean RBAC foundation: `roles` table with FK in `users` replaces loose string-role usage and allows safe role expansion later.
- Authentication-ready model: `auth_sessions` supports refresh-token/session tracking (expiry, revoke, IP, user-agent) for real demo login/logout handling.
- Enforced data quality with constraints:
  - cycle date validity (`start_date <= end_date`)
  - allowed status/state values via `CHECK`
  - progress/value bounds (`0..100` where needed)
  - KPI scope correctness (`employee` requires `owner_user_id`, `department` requires `department_id`)
  - measurement direction consistency (`maintain` requires `target_value = start_value`)
- Better relationship clarity:
  - department manager (`departments.manager_user_id -> users.id`)
  - user reporting line (`users.manager_user_id -> users.id`)
  - objective hierarchy (`objectives.parent_objective_id`)
- Consistent auditing and lifecycle support:
  - `audit_logs` table for action tracking
  - `deleted_at` in `users` for soft delete
  - auto-maintained `updated_at` using trigger function `fn_set_updated_at`
- Dashboard-ready SQL views included in schema:
  - `vw_objective_progress`
  - `vw_cycle_dashboard_stats`
  - `vw_department_progress`
  - `vw_risky_key_results`
- Performance readiness: indexes added across common filter/join paths (cycle, status, owner, department, check-in dates, logs).

## 2) Core entity mapping to project scope

- Authentication/users: `users`, `roles`, `auth_sessions`
- Departments: `departments`
- OKR cycles: `okr_cycles`
- Objectives: `objectives`
- Key Results: `key_results`
- KPI metrics: `kpi_metrics`
- Check-ins/progress updates: `key_result_checkins`, `kpi_checkins`
- Dashboard statistics: views listed above
- Role-based access: role FK model (`users.role_id -> roles.id`)

## 3) Seed data strategy

Seed includes:
- 3 roles (`admin`, `manager`, `employee`)
- 3 departments (`ENG`, `SAL`, `HR`) with managers
- 7 users (admin + managers + employees)
- 3 OKR cycles (`2026-Q1`, `2026-Q2`, `2026-Q3`)
- realistic objectives/key results/check-ins
- KPI metrics and KPI check-ins
- initial audit log record

Default demo login passwords (bcrypt-hashed in seed):
- `admin@okr.local` / `Admin@123`
- manager accounts (`manager.eng@okr.local`, `manager.sales@okr.local`, `manager.hr@okr.local`) / `Manager@123`
- employee accounts (`lan@okr.local`, `nam@okr.local`, `ha@okr.local`) / `Employee@123`

## 4) Files and usage

- `database/schema.sql`: full DDL, constraints, triggers, indexes, views
- `database/seed.sql`: deterministic demo seed for hackathon

Suggested run order:
1. apply `schema.sql`
2. apply `seed.sql`

## 5) Intentional scope boundaries

- No feature expansion outside OKR/KPI management.
- No permission matrix table yet (kept practical for hackathon); RBAC is role-based and backend can map role -> allowed actions.
- No heavy historical snapshot tables; progress history is handled through check-in tables.
