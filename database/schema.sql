BEGIN;

CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS roles (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS departments (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  manager_user_id BIGINT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  employee_code VARCHAR(30) UNIQUE,
  username CITEXT NOT NULL UNIQUE,
  email CITEXT NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL,
  manager_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (username <> ''),
  CHECK (email <> '')
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_departments_manager_user'
  ) THEN
    ALTER TABLE departments
      ADD CONSTRAINT fk_departments_manager_user
      FOREIGN KEY (manager_user_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS auth_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  user_agent TEXT,
  ip_address INET,
  CHECK (expires_at > issued_at)
);

CREATE TABLE IF NOT EXISTS okr_cycles (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'closed')),
  created_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (start_date <= end_date)
);

CREATE TABLE IF NOT EXISTS objectives (
  id BIGSERIAL PRIMARY KEY,
  cycle_id BIGINT NOT NULL REFERENCES okr_cycles(id) ON DELETE CASCADE,
  code VARCHAR(40) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  owner_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL,
  parent_objective_id BIGINT REFERENCES objectives(id) ON DELETE SET NULL,
  objective_type VARCHAR(20) NOT NULL DEFAULT 'individual' CHECK (objective_type IN ('company', 'department', 'individual')),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'on_track', 'at_risk', 'completed', 'cancelled')),
  priority SMALLINT NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  progress_percent NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  start_date DATE,
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (cycle_id, code),
  CHECK (
    (objective_type = 'department' AND department_id IS NOT NULL)
    OR (objective_type IN ('company', 'individual'))
  ),
  CHECK (start_date IS NULL OR due_date IS NULL OR start_date <= due_date)
);

CREATE TABLE IF NOT EXISTS key_results (
  id BIGSERIAL PRIMARY KEY,
  objective_id BIGINT NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,
  code VARCHAR(40) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  owner_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  measurement_unit VARCHAR(30),
  direction VARCHAR(20) NOT NULL DEFAULT 'increase' CHECK (direction IN ('increase', 'decrease', 'maintain')),
  start_value NUMERIC(14,4) NOT NULL DEFAULT 0,
  target_value NUMERIC(14,4) NOT NULL,
  current_value NUMERIC(14,4) NOT NULL DEFAULT 0,
  progress_percent NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'on_track', 'at_risk', 'completed', 'cancelled')),
  weight NUMERIC(5,2) NOT NULL DEFAULT 1 CHECK (weight > 0 AND weight <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (objective_id, code),
  CHECK (
    (direction = 'maintain' AND target_value = start_value)
    OR (direction IN ('increase', 'decrease') AND target_value <> start_value)
  )
);

CREATE TABLE IF NOT EXISTS key_result_checkins (
  id BIGSERIAL PRIMARY KEY,
  key_result_id BIGINT NOT NULL REFERENCES key_results(id) ON DELETE CASCADE,
  checkin_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  value_before NUMERIC(14,4),
  value_after NUMERIC(14,4) NOT NULL,
  progress_percent NUMERIC(5,2) CHECK (progress_percent >= 0 AND progress_percent <= 100),
  confidence_level SMALLINT CHECK (confidence_level BETWEEN 1 AND 10),
  update_note TEXT NOT NULL,
  blocker_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kpi_metrics (
  id BIGSERIAL PRIMARY KEY,
  cycle_id BIGINT NOT NULL REFERENCES okr_cycles(id) ON DELETE CASCADE,
  code VARCHAR(40) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  scope_type VARCHAR(20) NOT NULL CHECK (scope_type IN ('employee', 'department')),
  owner_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL,
  measurement_unit VARCHAR(30),
  direction VARCHAR(20) NOT NULL DEFAULT 'increase' CHECK (direction IN ('increase', 'decrease', 'maintain')),
  start_value NUMERIC(14,4) NOT NULL DEFAULT 0,
  target_value NUMERIC(14,4) NOT NULL,
  current_value NUMERIC(14,4) NOT NULL DEFAULT 0,
  progress_percent NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  weight NUMERIC(5,2) NOT NULL DEFAULT 1 CHECK (weight > 0 AND weight <= 100),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'on_track', 'at_risk', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (cycle_id, code),
  CHECK (
    (scope_type = 'employee' AND owner_user_id IS NOT NULL AND department_id IS NULL)
    OR (scope_type = 'department' AND department_id IS NOT NULL AND owner_user_id IS NULL)
  ),
  CHECK (
    (direction = 'maintain' AND target_value = start_value)
    OR (direction IN ('increase', 'decrease') AND target_value <> start_value)
  )
);

CREATE TABLE IF NOT EXISTS kpi_checkins (
  id BIGSERIAL PRIMARY KEY,
  kpi_metric_id BIGINT NOT NULL REFERENCES kpi_metrics(id) ON DELETE CASCADE,
  checkin_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  value_before NUMERIC(14,4),
  value_after NUMERIC(14,4) NOT NULL,
  progress_percent NUMERIC(5,2) CHECK (progress_percent >= 0 AND progress_percent <= 100),
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(120) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id BIGINT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(60) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL,
  owner_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  start_date DATE,
  end_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (start_date IS NULL OR end_date IS NULL OR start_date <= end_date)
);

CREATE TABLE IF NOT EXISTS employee_projects (
  id BIGSERIAL PRIMARY KEY,
  employee_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  role_name VARCHAR(120),
  contribution_note TEXT,
  assigned_at DATE,
  released_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (employee_user_id, project_id),
  CHECK (assigned_at IS NULL OR released_at IS NULL OR assigned_at <= released_at)
);

CREATE TABLE IF NOT EXISTS review_periods (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(40) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('monthly', 'quarterly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'closed')),
  created_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (start_date <= end_date)
);

CREATE TABLE IF NOT EXISTS employee_reviews (
  id BIGSERIAL PRIMARY KEY,
  period_id BIGINT NOT NULL REFERENCES review_periods(id) ON DELETE CASCADE,
  employee_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL,
  manager_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'employee_submitted', 'manager_reviewed', 'hr_reviewed', 'approved', 'locked', 'returned')),
  total_weight NUMERIC(6,2) NOT NULL DEFAULT 0 CHECK (total_weight >= 0 AND total_weight <= 7),
  total_score NUMERIC(6,2) NOT NULL DEFAULT 0 CHECK (total_score >= 0 AND total_score <= 100),
  rating_level VARCHAR(30) NOT NULL DEFAULT 'not_rated',
  created_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  locked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (period_id, employee_user_id)
);

CREATE TABLE IF NOT EXISTS employee_review_items (
  id BIGSERIAL PRIMARY KEY,
  review_id BIGINT NOT NULL REFERENCES employee_reviews(id) ON DELETE CASCADE,
  item_order INT NOT NULL DEFAULT 1,
  category VARCHAR(160) NOT NULL,
  project_code VARCHAR(80),
  project_name VARCHAR(255),
  description TEXT,
  weight NUMERIC(5,2) NOT NULL DEFAULT 1 CHECK (weight > 0 AND weight <= 7),
  plan_percent NUMERIC(5,2) CHECK (plan_percent >= 0 AND plan_percent <= 100),
  actual_percent NUMERIC(5,2) CHECK (actual_percent >= 0 AND actual_percent <= 100),
  achievement_score NUMERIC(6,2) CHECK (achievement_score >= 0 AND achievement_score <= 100),
  weighted_score NUMERIC(8,2) CHECK (weighted_score >= 0),
  evidence_note TEXT,
  manager_note TEXT,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  is_locked BOOLEAN NOT NULL DEFAULT FALSE,
  locked_at TIMESTAMPTZ,
  updated_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS review_comments (
  id BIGSERIAL PRIMARY KEY,
  review_id BIGINT NOT NULL REFERENCES employee_reviews(id) ON DELETE CASCADE,
  comment_type VARCHAR(30) NOT NULL CHECK (comment_type IN ('employee_self', 'manager', 'hr', 'final')),
  content TEXT NOT NULL,
  author_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS review_approvals (
  id BIGSERIAL PRIMARY KEY,
  review_id BIGINT NOT NULL REFERENCES employee_reviews(id) ON DELETE CASCADE,
  action_type VARCHAR(30) NOT NULL
    CHECK (action_type IN ('submit', 'return', 'manager_approve', 'hr_approve', 'approve', 'lock', 'unlock')),
  note TEXT,
  actor_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_roles_set_updated_at ON roles;
CREATE TRIGGER trg_roles_set_updated_at
BEFORE UPDATE ON roles
FOR EACH ROW
EXECUTE FUNCTION fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_departments_set_updated_at ON departments;
CREATE TRIGGER trg_departments_set_updated_at
BEFORE UPDATE ON departments
FOR EACH ROW
EXECUTE FUNCTION fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_users_set_updated_at ON users;
CREATE TRIGGER trg_users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_okr_cycles_set_updated_at ON okr_cycles;
CREATE TRIGGER trg_okr_cycles_set_updated_at
BEFORE UPDATE ON okr_cycles
FOR EACH ROW
EXECUTE FUNCTION fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_objectives_set_updated_at ON objectives;
CREATE TRIGGER trg_objectives_set_updated_at
BEFORE UPDATE ON objectives
FOR EACH ROW
EXECUTE FUNCTION fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_key_results_set_updated_at ON key_results;
CREATE TRIGGER trg_key_results_set_updated_at
BEFORE UPDATE ON key_results
FOR EACH ROW
EXECUTE FUNCTION fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_kpi_metrics_set_updated_at ON kpi_metrics;
CREATE TRIGGER trg_kpi_metrics_set_updated_at
BEFORE UPDATE ON kpi_metrics
FOR EACH ROW
EXECUTE FUNCTION fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_projects_set_updated_at ON projects;
CREATE TRIGGER trg_projects_set_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_review_periods_set_updated_at ON review_periods;
CREATE TRIGGER trg_review_periods_set_updated_at
BEFORE UPDATE ON review_periods
FOR EACH ROW
EXECUTE FUNCTION fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_employee_reviews_set_updated_at ON employee_reviews;
CREATE TRIGGER trg_employee_reviews_set_updated_at
BEFORE UPDATE ON employee_reviews
FOR EACH ROW
EXECUTE FUNCTION fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_employee_review_items_set_updated_at ON employee_review_items;
CREATE TRIGGER trg_employee_review_items_set_updated_at
BEFORE UPDATE ON employee_review_items
FOR EACH ROW
EXECUTE FUNCTION fn_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_department_id ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_manager_user_id ON users(manager_user_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at ON auth_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_revoked_at ON auth_sessions(revoked_at);

CREATE INDEX IF NOT EXISTS idx_okr_cycles_status ON okr_cycles(status);
CREATE INDEX IF NOT EXISTS idx_okr_cycles_start_end ON okr_cycles(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_objectives_cycle_id ON objectives(cycle_id);
CREATE INDEX IF NOT EXISTS idx_objectives_owner_user_id ON objectives(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_objectives_department_id ON objectives(department_id);
CREATE INDEX IF NOT EXISTS idx_objectives_status ON objectives(status);
CREATE INDEX IF NOT EXISTS idx_objectives_parent_objective_id ON objectives(parent_objective_id);

CREATE INDEX IF NOT EXISTS idx_key_results_objective_id ON key_results(objective_id);
CREATE INDEX IF NOT EXISTS idx_key_results_owner_user_id ON key_results(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_key_results_status ON key_results(status);

CREATE INDEX IF NOT EXISTS idx_key_result_checkins_key_result_id ON key_result_checkins(key_result_id);
CREATE INDEX IF NOT EXISTS idx_key_result_checkins_checkin_date ON key_result_checkins(checkin_date DESC);

CREATE INDEX IF NOT EXISTS idx_kpi_metrics_cycle_id ON kpi_metrics(cycle_id);
CREATE INDEX IF NOT EXISTS idx_kpi_metrics_owner_user_id ON kpi_metrics(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_kpi_metrics_department_id ON kpi_metrics(department_id);
CREATE INDEX IF NOT EXISTS idx_kpi_metrics_status ON kpi_metrics(status);

CREATE INDEX IF NOT EXISTS idx_kpi_checkins_kpi_metric_id ON kpi_checkins(kpi_metric_id);
CREATE INDEX IF NOT EXISTS idx_kpi_checkins_checkin_date ON kpi_checkins(checkin_date DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_user_id ON audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_department_id ON projects(department_id);
CREATE INDEX IF NOT EXISTS idx_projects_owner_user_id ON projects(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_employee_projects_user_id ON employee_projects(employee_user_id);
CREATE INDEX IF NOT EXISTS idx_employee_projects_project_id ON employee_projects(project_id);
CREATE INDEX IF NOT EXISTS idx_review_periods_status ON review_periods(status);
CREATE INDEX IF NOT EXISTS idx_review_periods_type_dates ON review_periods(period_type, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_employee_reviews_employee_user_id ON employee_reviews(employee_user_id);
CREATE INDEX IF NOT EXISTS idx_employee_reviews_period_id ON employee_reviews(period_id);
CREATE INDEX IF NOT EXISTS idx_employee_reviews_status ON employee_reviews(status);
CREATE INDEX IF NOT EXISTS idx_employee_review_items_review_id ON employee_review_items(review_id);
CREATE INDEX IF NOT EXISTS idx_employee_review_items_locked ON employee_review_items(is_locked);
CREATE INDEX IF NOT EXISTS idx_review_comments_review_id ON review_comments(review_id);
CREATE INDEX IF NOT EXISTS idx_review_comments_type ON review_comments(comment_type);
CREATE INDEX IF NOT EXISTS idx_review_approvals_review_id ON review_approvals(review_id);
CREATE INDEX IF NOT EXISTS idx_review_approvals_action_type ON review_approvals(action_type);

CREATE OR REPLACE VIEW vw_objective_progress AS
SELECT
  o.id AS objective_id,
  o.cycle_id,
  o.code AS objective_code,
  o.title AS objective_title,
  o.status AS objective_status,
  o.owner_user_id,
  o.department_id,
  o.progress_percent AS objective_progress_manual,
  COALESCE(ROUND(AVG(kr.progress_percent), 2), 0) AS objective_progress_from_key_results,
  COUNT(kr.id) AS key_result_count
FROM objectives o
LEFT JOIN key_results kr ON kr.objective_id = o.id
GROUP BY o.id;

CREATE OR REPLACE VIEW vw_cycle_dashboard_stats AS
SELECT
  c.id AS cycle_id,
  c.code AS cycle_code,
  c.name AS cycle_name,
  c.status,
  COUNT(DISTINCT o.id) AS total_objectives,
  COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'completed') AS completed_objectives,
  ROUND(
    CASE WHEN COUNT(DISTINCT o.id) = 0 THEN 0
      ELSE (COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'completed')::NUMERIC * 100.0 / COUNT(DISTINCT o.id))
    END,
    2
  ) AS objective_completion_rate,
  COUNT(DISTINCT kr.id) AS total_key_results,
  COALESCE(ROUND(AVG(kr.progress_percent), 2), 0) AS avg_key_result_progress,
  COUNT(DISTINCT km.id) AS total_kpis,
  COALESCE(ROUND(AVG(km.progress_percent), 2), 0) AS avg_kpi_progress
FROM okr_cycles c
LEFT JOIN objectives o ON o.cycle_id = c.id
LEFT JOIN key_results kr ON kr.objective_id = o.id
LEFT JOIN kpi_metrics km ON km.cycle_id = c.id
GROUP BY c.id;

CREATE OR REPLACE VIEW vw_department_progress AS
SELECT
  d.id AS department_id,
  d.code AS department_code,
  d.name AS department_name,
  COUNT(DISTINCT u.id) FILTER (WHERE u.is_active = TRUE AND u.deleted_at IS NULL) AS active_member_count,
  COUNT(DISTINCT o.id) AS total_objectives,
  COALESCE(ROUND(AVG(o.progress_percent), 2), 0) AS avg_objective_progress,
  COUNT(DISTINCT km.id) AS total_department_kpis,
  COALESCE(ROUND(AVG(km.progress_percent), 2), 0) AS avg_department_kpi_progress
FROM departments d
LEFT JOIN users u ON u.department_id = d.id
LEFT JOIN objectives o ON o.department_id = d.id
LEFT JOIN kpi_metrics km ON km.department_id = d.id AND km.scope_type = 'department'
GROUP BY d.id;

CREATE OR REPLACE VIEW vw_risky_key_results AS
SELECT
  kr.id AS key_result_id,
  kr.code AS key_result_code,
  kr.title AS key_result_title,
  kr.status,
  kr.progress_percent,
  o.id AS objective_id,
  o.code AS objective_code,
  o.title AS objective_title,
  c.id AS cycle_id,
  c.code AS cycle_code,
  c.status AS cycle_status
FROM key_results kr
JOIN objectives o ON o.id = kr.objective_id
JOIN okr_cycles c ON c.id = o.cycle_id
WHERE kr.status IN ('on_track', 'at_risk', 'draft')
  AND kr.progress_percent < 50;

COMMIT;
