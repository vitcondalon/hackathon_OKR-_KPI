const { query } = require('../config/db');
const logger = require('../utils/logger');

async function ensureWorkspaceSchema() {
  await query(`
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

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM roles WHERE code = 'hr') THEN
        INSERT INTO roles (code, display_name, description)
        VALUES ('hr', 'Human Resources', 'Human resources review and approval access');
      END IF;
    END $$;

    CREATE OR REPLACE FUNCTION fn_set_updated_at()
    RETURNS TRIGGER AS $inner$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $inner$ LANGUAGE plpgsql;

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

    CREATE INDEX IF NOT EXISTS idx_projects_department_id ON projects(department_id);
    CREATE INDEX IF NOT EXISTS idx_projects_owner_user_id ON projects(owner_user_id);
    CREATE INDEX IF NOT EXISTS idx_employee_projects_user_id ON employee_projects(employee_user_id);
    CREATE INDEX IF NOT EXISTS idx_employee_projects_project_id ON employee_projects(project_id);
    CREATE INDEX IF NOT EXISTS idx_review_periods_status ON review_periods(status);
    CREATE INDEX IF NOT EXISTS idx_employee_reviews_employee_user_id ON employee_reviews(employee_user_id);
    CREATE INDEX IF NOT EXISTS idx_employee_reviews_period_id ON employee_reviews(period_id);
    CREATE INDEX IF NOT EXISTS idx_employee_reviews_status ON employee_reviews(status);
    CREATE INDEX IF NOT EXISTS idx_employee_review_items_review_id ON employee_review_items(review_id);
    CREATE INDEX IF NOT EXISTS idx_review_comments_review_id ON review_comments(review_id);
    CREATE INDEX IF NOT EXISTS idx_review_approvals_review_id ON review_approvals(review_id);
  `);
}

async function initModels() {
  try {
    await ensureWorkspaceSchema();
  } catch (error) {
    logger.error('Failed to initialize database models', {
      message: error?.message,
      code: error?.code
    });
    throw error;
  }
}

module.exports = {
  initModels
};
