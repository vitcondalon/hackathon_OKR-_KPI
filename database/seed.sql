BEGIN;

TRUNCATE TABLE
  funny_logs,
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
