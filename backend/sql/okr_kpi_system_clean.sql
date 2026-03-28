CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) CHECK (role IN ('admin', 'manager', 'employee')),
    department_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_department
        FOREIGN KEY (department_id)
        REFERENCES departments (id)
        ON DELETE SET NULL
);

CREATE TABLE cycles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE objectives (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    user_id INT,
    cycle_id INT,
    progress NUMERIC(5, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (cycle_id) REFERENCES cycles (id) ON DELETE CASCADE
);

CREATE TABLE key_results (
    id SERIAL PRIMARY KEY,
    objective_id INT,
    title TEXT NOT NULL,
    target_value NUMERIC,
    current_value NUMERIC DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (objective_id) REFERENCES objectives (id) ON DELETE CASCADE
);

CREATE TABLE checkins (
    id SERIAL PRIMARY KEY,
    key_result_id INT,
    value NUMERIC,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (key_result_id) REFERENCES key_results (id) ON DELETE CASCADE
);

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT,
    action VARCHAR(255),
    entity VARCHAR(100),
    entity_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_users_department_id ON users (department_id);
CREATE INDEX idx_objectives_user_id ON objectives (user_id);
CREATE INDEX idx_objectives_cycle_id ON objectives (cycle_id);
CREATE INDEX idx_key_results_objective_id ON key_results (objective_id);
CREATE INDEX idx_checkins_key_result_id ON checkins (key_result_id);

-- Progress by user
SELECT
    u.id,
    u.full_name,
    ROUND(AVG(o.progress), 2) AS avg_progress
FROM users u
LEFT JOIN objectives o ON u.id = o.user_id
GROUP BY u.id, u.full_name;

-- Progress by department
SELECT
    d.id,
    d.name,
    ROUND(AVG(o.progress), 2) AS department_progress
FROM departments d
LEFT JOIN users u ON d.id = u.department_id
LEFT JOIN objectives o ON u.id = o.user_id
GROUP BY d.id, d.name;

-- KPI completion rate
SELECT
    COUNT(*) FILTER (WHERE current_value >= target_value) * 100.0 / COUNT(*) AS completion_rate
FROM key_results;

-- Risk overview (key results below 50%)
SELECT
    kr.id,
    kr.title,
    kr.current_value,
    kr.target_value,
    (kr.current_value / NULLIF(kr.target_value, 0)) * 100 AS progress_percent
FROM key_results kr
WHERE (kr.current_value / NULLIF(kr.target_value, 0)) < 0.5;

-- Top performers
SELECT
    u.full_name,
    ROUND(AVG(o.progress), 2) AS score
FROM users u
JOIN objectives o ON u.id = o.user_id
GROUP BY u.full_name
ORDER BY score DESC
LIMIT 5;
