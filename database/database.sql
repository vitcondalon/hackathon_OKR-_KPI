-- Combined schema + seed for OKR/KPI demo

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


-- Seed data

BEGIN;

TRUNCATE TABLE
  audit_logs,
  kpi_checkins,
  kpi_metrics,
  key_result_checkins,
  key_results,
  objectives,
  okr_cycles,
  auth_sessions,
  users,
  departments,
  roles
RESTART IDENTITY CASCADE;

INSERT INTO roles (code, display_name, description)
VALUES
  ('admin', 'Administrator', 'Full-system administration access'),
  ('manager', 'Manager', 'Manage team OKR/KPI and review progress'),
  ('employee', 'Employee', 'Update own objectives, key results, and KPI check-ins');

INSERT INTO departments (code, name, description)
VALUES
  ('ENG', 'Engineering', 'Software engineering and platform delivery'),
  ('SAL', 'Sales', 'Revenue growth, pipeline, and enterprise accounts'),
  ('HR', 'Human Resources', 'People operations, hiring, and engagement');

INSERT INTO users (employee_code, username, email, full_name, password_hash, role_id, department_id, manager_user_id, is_active)
VALUES
  (
    'ADM-001',
    'admin',
    'admin@okr.local',
    'System Admin',
    '$2a$10$kMdZ3/zGH/3Z.8iniKK2Buqzz4FQQvCQQNjWAd80t1datvwcFcsJe',
    (SELECT id FROM roles WHERE code = 'admin'),
    (SELECT id FROM departments WHERE code = 'ENG'),
    NULL,
    TRUE
  ),
  (
    'MGR-ENG-001',
    'manager.eng',
    'manager.eng@okr.local',
    'Nguyen Minh Anh',
    '$2a$10$XumuU9xUyrfe64B65bWb7O4wRsaK0WwEO/8eZI7f7g6k.3TlwNICO',
    (SELECT id FROM roles WHERE code = 'manager'),
    (SELECT id FROM departments WHERE code = 'ENG'),
    (SELECT id FROM users WHERE username = 'admin'),
    TRUE
  ),
  (
    'MGR-SAL-001',
    'manager.sales',
    'manager.sales@okr.local',
    'Tran Quoc Bao',
    '$2a$10$XumuU9xUyrfe64B65bWb7O4wRsaK0WwEO/8eZI7f7g6k.3TlwNICO',
    (SELECT id FROM roles WHERE code = 'manager'),
    (SELECT id FROM departments WHERE code = 'SAL'),
    (SELECT id FROM users WHERE username = 'admin'),
    TRUE
  ),
  (
    'MGR-HR-001',
    'manager.hr',
    'manager.hr@okr.local',
    'Do Thu Hang',
    '$2a$10$XumuU9xUyrfe64B65bWb7O4wRsaK0WwEO/8eZI7f7g6k.3TlwNICO',
    (SELECT id FROM roles WHERE code = 'manager'),
    (SELECT id FROM departments WHERE code = 'HR'),
    (SELECT id FROM users WHERE username = 'admin'),
    TRUE
  ),
  (
    'EMP-ENG-001',
    'lan',
    'lan@okr.local',
    'Le Thi Lan',
    '$2a$10$00HJFUwuTJv24hVu2.8ulehRAadYi/T/vWmL9k9FJYWD4AxHVqK3C',
    (SELECT id FROM roles WHERE code = 'employee'),
    (SELECT id FROM departments WHERE code = 'ENG'),
    (SELECT id FROM users WHERE username = 'manager.eng'),
    TRUE
  ),
  (
    'EMP-SAL-001',
    'nam',
    'nam@okr.local',
    'Pham Hoang Nam',
    '$2a$10$00HJFUwuTJv24hVu2.8ulehRAadYi/T/vWmL9k9FJYWD4AxHVqK3C',
    (SELECT id FROM roles WHERE code = 'employee'),
    (SELECT id FROM departments WHERE code = 'SAL'),
    (SELECT id FROM users WHERE username = 'manager.sales'),
    TRUE
  ),
  (
    'EMP-HR-001',
    'ha',
    'ha@okr.local',
    'Vo Thu Ha',
    '$2a$10$00HJFUwuTJv24hVu2.8ulehRAadYi/T/vWmL9k9FJYWD4AxHVqK3C',
    (SELECT id FROM roles WHERE code = 'employee'),
    (SELECT id FROM departments WHERE code = 'HR'),
    (SELECT id FROM users WHERE username = 'manager.hr'),
    TRUE
  );

UPDATE departments
SET manager_user_id = (SELECT id FROM users WHERE username = 'manager.eng')
WHERE code = 'ENG';

UPDATE departments
SET manager_user_id = (SELECT id FROM users WHERE username = 'manager.sales')
WHERE code = 'SAL';

UPDATE departments
SET manager_user_id = (SELECT id FROM users WHERE username = 'manager.hr')
WHERE code = 'HR';

INSERT INTO okr_cycles (code, name, start_date, end_date, status, created_by_user_id)
VALUES
  ('2026-Q1', 'Q1 2026', DATE '2026-01-01', DATE '2026-03-31', 'closed', (SELECT id FROM users WHERE username = 'admin')),
  ('2026-Q2', 'Q2 2026', DATE '2026-04-01', DATE '2026-06-30', 'active', (SELECT id FROM users WHERE username = 'admin')),
  ('2026-Q3', 'Q3 2026', DATE '2026-07-01', DATE '2026-09-30', 'planning', (SELECT id FROM users WHERE username = 'admin'));

INSERT INTO objectives (
  cycle_id,
  code,
  title,
  description,
  owner_user_id,
  department_id,
  parent_objective_id,
  objective_type,
  status,
  priority,
  progress_percent,
  start_date,
  due_date
)
VALUES
  (
    (SELECT id FROM okr_cycles WHERE code = '2026-Q2'),
    'ENG-ONBOARD',
    'Improve onboarding speed and quality for new hires',
    'Reduce onboarding friction and increase onboarding quality score.',
    (SELECT id FROM users WHERE username = 'manager.eng'),
    (SELECT id FROM departments WHERE code = 'ENG'),
    NULL,
    'department',
    'on_track',
    5,
    0,
    DATE '2026-04-01',
    DATE '2026-06-30'
  ),
  (
    (SELECT id FROM okr_cycles WHERE code = '2026-Q2'),
    'SAL-PIPELINE',
    'Increase enterprise sales pipeline quality',
    'Improve qualified opportunities and conversion readiness.',
    (SELECT id FROM users WHERE username = 'manager.sales'),
    (SELECT id FROM departments WHERE code = 'SAL'),
    NULL,
    'department',
    'on_track',
    5,
    0,
    DATE '2026-04-01',
    DATE '2026-06-30'
  ),
  (
    (SELECT id FROM okr_cycles WHERE code = '2026-Q2'),
    'HR-RETENTION',
    'Strengthen employee engagement and retention',
    'Increase engagement touchpoints and reduce voluntary attrition risk.',
    (SELECT id FROM users WHERE username = 'manager.hr'),
    (SELECT id FROM departments WHERE code = 'HR'),
    NULL,
    'department',
    'on_track',
    4,
    0,
    DATE '2026-04-01',
    DATE '2026-06-30'
  ),
  (
    (SELECT id FROM okr_cycles WHERE code = '2026-Q2'),
    'ENG-LAN-GROWTH',
    'Improve API delivery performance',
    'Personal objective to increase deployment velocity while maintaining reliability.',
    (SELECT id FROM users WHERE username = 'lan'),
    (SELECT id FROM departments WHERE code = 'ENG'),
    (SELECT id FROM objectives WHERE code = 'ENG-ONBOARD' AND cycle_id = (SELECT id FROM okr_cycles WHERE code = '2026-Q2')),
    'individual',
    'on_track',
    3,
    0,
    DATE '2026-04-01',
    DATE '2026-06-30'
  ),
  (
    (SELECT id FROM okr_cycles WHERE code = '2026-Q3'),
    'SAL-EXPANSION',
    'Plan account expansion strategy for Q3',
    'Prepare pipeline and playbook for strategic account growth in next quarter.',
    (SELECT id FROM users WHERE username = 'manager.sales'),
    (SELECT id FROM departments WHERE code = 'SAL'),
    NULL,
    'department',
    'draft',
    4,
    0,
    DATE '2026-07-01',
    DATE '2026-09-30'
  );

INSERT INTO key_results (
  objective_id,
  code,
  title,
  description,
  owner_user_id,
  measurement_unit,
  direction,
  start_value,
  target_value,
  current_value,
  progress_percent,
  status,
  weight
)
VALUES
  (
    (SELECT id FROM objectives WHERE code = 'ENG-ONBOARD' AND cycle_id = (SELECT id FROM okr_cycles WHERE code = '2026-Q2')),
    'KR1',
    'Raise onboarding satisfaction score to 90',
    'Average score from onboarding survey at week 4.',
    (SELECT id FROM users WHERE username = 'lan'),
    'points',
    'increase',
    70,
    90,
    82,
    60.00,
    'on_track',
    50
  ),
  (
    (SELECT id FROM objectives WHERE code = 'ENG-ONBOARD' AND cycle_id = (SELECT id FROM okr_cycles WHERE code = '2026-Q2')),
    'KR2',
    'Cut average onboarding lead time to 8 days',
    'Measured from contract signing to productive first commit.',
    (SELECT id FROM users WHERE username = 'manager.eng'),
    'days',
    'decrease',
    14,
    8,
    10,
    66.67,
    'on_track',
    50
  ),
  (
    (SELECT id FROM objectives WHERE code = 'SAL-PIPELINE' AND cycle_id = (SELECT id FROM okr_cycles WHERE code = '2026-Q2')),
    'KR1',
    'Create 30 qualified enterprise opportunities',
    'Qualified opportunities verified by sales manager.',
    (SELECT id FROM users WHERE username = 'nam'),
    'opportunities',
    'increase',
    0,
    30,
    18,
    60.00,
    'on_track',
    60
  ),
  (
    (SELECT id FROM objectives WHERE code = 'SAL-PIPELINE' AND cycle_id = (SELECT id FROM okr_cycles WHERE code = '2026-Q2')),
    'KR2',
    'Increase proposal-to-close conversion to 28%',
    'Tracks conversion efficiency for qualified pipeline.',
    (SELECT id FROM users WHERE username = 'manager.sales'),
    '%',
    'increase',
    18,
    28,
    20,
    20.00,
    'at_risk',
    40
  ),
  (
    (SELECT id FROM objectives WHERE code = 'HR-RETENTION' AND cycle_id = (SELECT id FROM okr_cycles WHERE code = '2026-Q2')),
    'KR1',
    'Run 12 employee listening sessions',
    'Structured listening sessions with documented action items.',
    (SELECT id FROM users WHERE username = 'ha'),
    'sessions',
    'increase',
    0,
    12,
    7,
    58.33,
    'on_track',
    100
  ),
  (
    (SELECT id FROM objectives WHERE code = 'ENG-LAN-GROWTH' AND cycle_id = (SELECT id FROM okr_cycles WHERE code = '2026-Q2')),
    'KR1',
    'Increase weekly API delivery throughput by 20%',
    'Compare against baseline sprint output.',
    (SELECT id FROM users WHERE username = 'lan'),
    '%',
    'increase',
    100,
    120,
    114,
    70.00,
    'on_track',
    100
  );

INSERT INTO key_result_checkins (
  key_result_id,
  checkin_by_user_id,
  checkin_date,
  value_before,
  value_after,
  progress_percent,
  confidence_level,
  update_note,
  blocker_note
)
VALUES
  (
    (SELECT kr.id FROM key_results kr JOIN objectives o ON o.id = kr.objective_id WHERE o.code = 'ENG-ONBOARD' AND kr.code = 'KR1'),
    (SELECT id FROM users WHERE username = 'lan'),
    DATE '2026-05-05',
    79,
    82,
    60,
    8,
    'Survey response quality improved after mentor assignment update.',
    NULL
  ),
  (
    (SELECT kr.id FROM key_results kr JOIN objectives o ON o.id = kr.objective_id WHERE o.code = 'SAL-PIPELINE' AND kr.code = 'KR2'),
    (SELECT id FROM users WHERE username = 'manager.sales'),
    DATE '2026-05-07',
    19,
    20,
    20,
    5,
    'Conversion improved slightly after proposal template refresh.',
    'Legal review turnaround remains slow for enterprise deals.'
  ),
  (
    (SELECT kr.id FROM key_results kr JOIN objectives o ON o.id = kr.objective_id WHERE o.code = 'HR-RETENTION' AND kr.code = 'KR1'),
    (SELECT id FROM users WHERE username = 'ha'),
    DATE '2026-05-08',
    5,
    7,
    58.33,
    7,
    'Two additional sessions completed with documented follow-up actions.',
    NULL
  );

UPDATE objectives o
SET progress_percent = p.avg_progress
FROM (
  SELECT objective_id, ROUND(AVG(progress_percent), 2) AS avg_progress
  FROM key_results
  GROUP BY objective_id
) p
WHERE p.objective_id = o.id;

INSERT INTO kpi_metrics (
  cycle_id,
  code,
  name,
  description,
  scope_type,
  owner_user_id,
  department_id,
  measurement_unit,
  direction,
  start_value,
  target_value,
  current_value,
  progress_percent,
  weight,
  status
)
VALUES
  (
    (SELECT id FROM okr_cycles WHERE code = '2026-Q2'),
    'KPI-ENG-DELIVERY',
    'On-time engineering task completion',
    'Measures completed engineering tasks delivered before sprint deadline.',
    'department',
    NULL,
    (SELECT id FROM departments WHERE code = 'ENG'),
    '%',
    'increase',
    70,
    92,
    84,
    63.64,
    40,
    'on_track'
  ),
  (
    (SELECT id FROM okr_cycles WHERE code = '2026-Q2'),
    'KPI-SAL-SLA',
    'Sales first-response SLA compliance',
    'Percent of qualified leads responded to within SLA.',
    'employee',
    (SELECT id FROM users WHERE username = 'nam'),
    NULL,
    '%',
    'increase',
    75,
    95,
    89,
    70.00,
    35,
    'on_track'
  ),
  (
    (SELECT id FROM okr_cycles WHERE code = '2026-Q2'),
    'KPI-HR-ENGAGE',
    'Employee engagement pulse score',
    'Monthly pulse score consolidated by HR.',
    'department',
    NULL,
    (SELECT id FROM departments WHERE code = 'HR'),
    'points',
    'increase',
    68,
    85,
    73,
    29.41,
    25,
    'at_risk'
  );

INSERT INTO kpi_checkins (
  kpi_metric_id,
  checkin_by_user_id,
  checkin_date,
  value_before,
  value_after,
  progress_percent,
  note
)
VALUES
  (
    (SELECT id FROM kpi_metrics WHERE code = 'KPI-ENG-DELIVERY' AND cycle_id = (SELECT id FROM okr_cycles WHERE code = '2026-Q2')),
    (SELECT id FROM users WHERE username = 'manager.eng'),
    DATE '2026-05-09',
    81,
    84,
    63.64,
    'Delivery predictability increased after backlog grooming discipline.'
  ),
  (
    (SELECT id FROM kpi_metrics WHERE code = 'KPI-SAL-SLA' AND cycle_id = (SELECT id FROM okr_cycles WHERE code = '2026-Q2')),
    (SELECT id FROM users WHERE username = 'nam'),
    DATE '2026-05-09',
    86,
    89,
    70,
    'SLA performance improved with lead-routing automation.'
  ),
  (
    (SELECT id FROM kpi_metrics WHERE code = 'KPI-HR-ENGAGE' AND cycle_id = (SELECT id FROM okr_cycles WHERE code = '2026-Q2')),
    (SELECT id FROM users WHERE username = 'manager.hr'),
    DATE '2026-05-09',
    71,
    73,
    29.41,
    'Engagement score improved, but still below target.'
  );

INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
VALUES
  (
    (SELECT id FROM users WHERE username = 'admin'),
    'seed.initialize',
    'system',
    NULL,
    '{"source":"seed.sql","note":"Initial hackathon demo data"}'::jsonb
  );

COMMIT;

