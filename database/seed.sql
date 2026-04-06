BEGIN;

TRUNCATE TABLE
  review_approvals,
  review_comments,
  employee_review_items,
  employee_reviews,
  review_periods,
  employee_projects,
  projects,
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
  ('hr', 'Human Resources', 'Human resources review and approval access'),
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
    'adm-001@company',
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
    'mgr-eng-001@company',
    'Nguyen Minh Anh',
    '$2a$10$XumuU9xUyrfe64B65bWb7O4wRsaK0WwEO/8eZI7f7g6k.3TlwNICO',
    (SELECT id FROM roles WHERE code = 'manager'),
    (SELECT id FROM departments WHERE code = 'ENG'),
    NULL,
    TRUE
  ),
  (
    'MGR-SAL-001',
    'manager.sales',
    'mgr-sal-001@company',
    'Tran Quoc Bao',
    '$2a$10$XumuU9xUyrfe64B65bWb7O4wRsaK0WwEO/8eZI7f7g6k.3TlwNICO',
    (SELECT id FROM roles WHERE code = 'manager'),
    (SELECT id FROM departments WHERE code = 'SAL'),
    NULL,
    TRUE
  ),
  (
    'MGR-HR-001',
    'manager.hr',
    'mgr-hr-001@company',
    'Do Thu Hang',
    '$2a$10$XumuU9xUyrfe64B65bWb7O4wRsaK0WwEO/8eZI7f7g6k.3TlwNICO',
    (SELECT id FROM roles WHERE code = 'manager'),
    (SELECT id FROM departments WHERE code = 'HR'),
    NULL,
    TRUE
  ),
  (
    'HR-001',
    'hr.lead',
    'hr-001@company',
    'Human Resources Lead',
    '$2a$10$XumuU9xUyrfe64B65bWb7O4wRsaK0WwEO/8eZI7f7g6k.3TlwNICO',
    (SELECT id FROM roles WHERE code = 'hr'),
    (SELECT id FROM departments WHERE code = 'HR'),
    NULL,
    TRUE
  ),
  (
    'EMP-ENG-001',
    'lan',
    'emp-eng-001@company',
    'Le Thi Lan',
    '$2a$10$00HJFUwuTJv24hVu2.8ulehRAadYi/T/vWmL9k9FJYWD4AxHVqK3C',
    (SELECT id FROM roles WHERE code = 'employee'),
    (SELECT id FROM departments WHERE code = 'ENG'),
    NULL,
    TRUE
  ),
  (
    'EMP-SAL-001',
    'nam',
    'emp-sal-001@company',
    'Pham Hoang Nam',
    '$2a$10$00HJFUwuTJv24hVu2.8ulehRAadYi/T/vWmL9k9FJYWD4AxHVqK3C',
    (SELECT id FROM roles WHERE code = 'employee'),
    (SELECT id FROM departments WHERE code = 'SAL'),
    NULL,
    TRUE
  ),
  (
    'EMP-HR-001',
    'ha',
    'emp-hr-001@company',
    'Vo Thu Ha',
    '$2a$10$00HJFUwuTJv24hVu2.8ulehRAadYi/T/vWmL9k9FJYWD4AxHVqK3C',
    (SELECT id FROM roles WHERE code = 'employee'),
    (SELECT id FROM departments WHERE code = 'HR'),
    NULL,
    TRUE
  );

UPDATE users
SET manager_user_id = (SELECT id FROM users WHERE username = 'admin')
WHERE username IN ('manager.eng', 'manager.sales', 'manager.hr', 'hr.lead');

UPDATE users
SET manager_user_id = (SELECT id FROM users WHERE username = 'manager.eng')
WHERE username = 'lan';

UPDATE users
SET manager_user_id = (SELECT id FROM users WHERE username = 'manager.sales')
WHERE username = 'nam';

UPDATE users
SET manager_user_id = (SELECT id FROM users WHERE username = 'manager.hr')
WHERE username = 'ha';

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

INSERT INTO review_periods (code, name, period_type, start_date, end_date, status, created_by_user_id)
VALUES
  (
    '2026-M03',
    'Month 03 / 2026',
    'monthly',
    DATE '2026-03-01',
    DATE '2026-03-31',
    'closed',
    (SELECT id FROM users WHERE username = 'admin')
  ),
  (
    '2026-Q2',
    'Quarter 2 / 2026',
    'quarterly',
    DATE '2026-04-01',
    DATE '2026-06-30',
    'active',
    (SELECT id FROM users WHERE username = 'admin')
  ),
  (
    '2026-Y',
    'Year 2026',
    'yearly',
    DATE '2026-01-01',
    DATE '2026-12-31',
    'planning',
    (SELECT id FROM users WHERE username = 'admin')
  );

INSERT INTO projects (code, name, description, department_id, owner_user_id, start_date, end_date, status)
VALUES
  (
    'PRJ-API-01',
    'API Performance Upgrade',
    'Upgrade core APIs to improve release quality and response time.',
    (SELECT id FROM departments WHERE code = 'ENG'),
    (SELECT id FROM users WHERE username = 'manager.eng'),
    DATE '2026-01-10',
    DATE '2026-07-20',
    'active'
  ),
  (
    'PRJ-SALES-01',
    'Enterprise Pipeline Expansion',
    'Expand strategic pipeline and improve win rate quality.',
    (SELECT id FROM departments WHERE code = 'SAL'),
    (SELECT id FROM users WHERE username = 'manager.sales'),
    DATE '2026-02-01',
    DATE '2026-08-30',
    'active'
  ),
  (
    'PRJ-HR-01',
    'Retention Touchpoint Program',
    'Run retention and engagement touchpoint initiative.',
    (SELECT id FROM departments WHERE code = 'HR'),
    (SELECT id FROM users WHERE username = 'hr.lead'),
    DATE '2026-01-15',
    DATE '2026-10-31',
    'active'
  );

INSERT INTO employee_projects (employee_user_id, project_id, role_name, contribution_note, assigned_at)
VALUES
  (
    (SELECT id FROM users WHERE username = 'lan'),
    (SELECT id FROM projects WHERE code = 'PRJ-API-01'),
    'Backend Engineer',
    'Implemented API optimization and deployment automation improvements.',
    DATE '2026-01-15'
  ),
  (
    (SELECT id FROM users WHERE username = 'nam'),
    (SELECT id FROM projects WHERE code = 'PRJ-SALES-01'),
    'Account Executive',
    'Handled strategic outbound and opportunity qualification.',
    DATE '2026-02-10'
  ),
  (
    (SELECT id FROM users WHERE username = 'ha'),
    (SELECT id FROM projects WHERE code = 'PRJ-HR-01'),
    'HR Specialist',
    'Coordinated engagement sessions and retention follow-up.',
    DATE '2026-02-05'
  );

INSERT INTO employee_reviews (
  period_id,
  employee_user_id,
  department_id,
  manager_user_id,
  status,
  total_weight,
  total_score,
  rating_level,
  created_by_user_id
)
VALUES
  (
    (SELECT id FROM review_periods WHERE code = '2026-Q2'),
    (SELECT id FROM users WHERE username = 'lan'),
    (SELECT id FROM departments WHERE code = 'ENG'),
    (SELECT id FROM users WHERE username = 'manager.eng'),
    'employee_submitted',
    7.00,
    83.57,
    'tot',
    (SELECT id FROM users WHERE username = 'manager.eng')
  ),
  (
    (SELECT id FROM review_periods WHERE code = '2026-Q2'),
    (SELECT id FROM users WHERE username = 'nam'),
    (SELECT id FROM departments WHERE code = 'SAL'),
    (SELECT id FROM users WHERE username = 'manager.sales'),
    'manager_reviewed',
    7.00,
    78.21,
    'dat',
    (SELECT id FROM users WHERE username = 'manager.sales')
  ),
  (
    (SELECT id FROM review_periods WHERE code = '2026-Q2'),
    (SELECT id FROM users WHERE username = 'ha'),
    (SELECT id FROM departments WHERE code = 'HR'),
    (SELECT id FROM users WHERE username = 'manager.hr'),
    'approved',
    7.00,
    87.14,
    'tot',
    (SELECT id FROM users WHERE username = 'hr.lead')
  );

INSERT INTO employee_review_items (
  review_id,
  item_order,
  category,
  project_code,
  project_name,
  description,
  weight,
  plan_percent,
  actual_percent,
  achievement_score,
  weighted_score,
  evidence_note,
  manager_note,
  is_required,
  is_locked,
  updated_by_user_id
)
VALUES
  (
    (SELECT id FROM employee_reviews WHERE employee_user_id = (SELECT id FROM users WHERE username = 'lan') AND period_id = (SELECT id FROM review_periods WHERE code = '2026-Q2')),
    1,
    'Project KPI',
    'PRJ-API-01',
    'API Performance Upgrade',
    'Delivered the API upgrade target and stabilized the deployment flow.',
    3.00,
    100.00,
    86.00,
    86.00,
    258.00,
    'Benchmark report and release checklist were updated.',
    'Progress is good. Keep reducing production issues.',
    TRUE,
    FALSE,
    (SELECT id FROM users WHERE username = 'lan')
  ),
  (
    (SELECT id FROM employee_reviews WHERE employee_user_id = (SELECT id FROM users WHERE username = 'lan') AND period_id = (SELECT id FROM review_periods WHERE code = '2026-Q2')),
    2,
    'Discipline and Collaboration',
    NULL,
    NULL,
    'Maintained on-time updates and coordinated well with QA.',
    2.00,
    100.00,
    80.00,
    80.00,
    160.00,
    'All check-ins were submitted on schedule.',
    'Should be more proactive when cross-team blockers appear.',
    TRUE,
    FALSE,
    (SELECT id FROM users WHERE username = 'manager.eng')
  ),
  (
    (SELECT id FROM employee_reviews WHERE employee_user_id = (SELECT id FROM users WHERE username = 'lan') AND period_id = (SELECT id FROM review_periods WHERE code = '2026-Q2')),
    3,
    'Improvement Initiative',
    NULL,
    NULL,
    'Proposed improvements to the code review process.',
    2.00,
    100.00,
    83.00,
    83.00,
    166.00,
    'The new review checklist has been applied.',
    'The impact is clear. Continue rolling it out to the wider team.',
    TRUE,
    TRUE,
    (SELECT id FROM users WHERE username = 'manager.eng')
  );

INSERT INTO review_comments (review_id, comment_type, content, author_user_id)
VALUES
  (
    (SELECT id FROM employee_reviews WHERE employee_user_id = (SELECT id FROM users WHERE username = 'lan') AND period_id = (SELECT id FROM review_periods WHERE code = '2026-Q2')),
    'employee_self',
    'Most goals were completed. Cross-team blocker handling speed still needs improvement.',
    (SELECT id FROM users WHERE username = 'lan')
  ),
  (
    (SELECT id FROM employee_reviews WHERE employee_user_id = (SELECT id FROM users WHERE username = 'lan') AND period_id = (SELECT id FROM review_periods WHERE code = '2026-Q2')),
    'manager',
    'The employee showed steady progress and reached a Good rating this cycle.',
    (SELECT id FROM users WHERE username = 'manager.eng')
  ),
  (
    (SELECT id FROM employee_reviews WHERE employee_user_id = (SELECT id FROM users WHERE username = 'ha') AND period_id = (SELECT id FROM review_periods WHERE code = '2026-Q2')),
    'hr',
    'The review record is complete and ready for final approval.',
    (SELECT id FROM users WHERE username = 'hr.lead')
  );

INSERT INTO review_approvals (review_id, action_type, note, actor_user_id)
VALUES
  (
    (SELECT id FROM employee_reviews WHERE employee_user_id = (SELECT id FROM users WHERE username = 'lan') AND period_id = (SELECT id FROM review_periods WHERE code = '2026-Q2')),
    'submit',
    'Employee submitted the review for approval.',
    (SELECT id FROM users WHERE username = 'lan')
  ),
  (
    (SELECT id FROM employee_reviews WHERE employee_user_id = (SELECT id FROM users WHERE username = 'nam') AND period_id = (SELECT id FROM review_periods WHERE code = '2026-Q2')),
    'manager_approve',
    'Manager reviewed and approved the department-level evaluation.',
    (SELECT id FROM users WHERE username = 'manager.sales')
  ),
  (
    (SELECT id FROM employee_reviews WHERE employee_user_id = (SELECT id FROM users WHERE username = 'ha') AND period_id = (SELECT id FROM review_periods WHERE code = '2026-Q2')),
    'approve',
    'HR approved the review cycle result.',
    (SELECT id FROM users WHERE username = 'hr.lead')
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
