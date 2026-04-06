const { query } = require('../config/db');
const { comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');

function mapUser(row) {
  return {
    id: row.id,
    employee_code: row.employee_code,
    username: row.username,
    email: row.email,
    full_name: row.full_name,
    role: row.role,
    role_name: row.role_name,
    department_id: row.department_id,
    department_name: row.department_name,
    manager_user_id: row.manager_user_id,
    is_active: row.is_active,
    last_login_at: row.last_login_at,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

async function getUserByIdentifier(identifier) {
  const normalized = String(identifier || '').trim().toLowerCase();

  const result = await query(
    `SELECT
       u.id,
       u.employee_code,
       u.username,
       u.email,
       u.full_name,
       u.password_hash,
       u.department_id,
       u.manager_user_id,
       u.is_active,
       u.last_login_at,
       u.created_at,
       u.updated_at,
       r.code AS role,
       r.display_name AS role_name,
       d.name AS department_name
     FROM users u
     JOIN roles r ON r.id = u.role_id
     LEFT JOIN departments d ON d.id = u.department_id
     WHERE u.deleted_at IS NULL
       AND (
         LOWER(u.email) = $1
         OR LOWER(u.username) = $1
         OR LOWER(u.employee_code) = $1
         OR LOWER(CONCAT(u.employee_code, '@company')) = $1
       )
     LIMIT 1`,
    [normalized]
  );

  return result.rows[0] || null;
}

async function login({ identifier, password }) {
  const user = await getUserByIdentifier(identifier);

  if (!user || !user.is_active) {
    const error = new Error('Thông tin đăng nhập không hợp lệ');
    error.status = 401;
    throw error;
  }

  const matched = await comparePassword(password, user.password_hash);
  if (!matched) {
    const error = new Error('Thông tin đăng nhập không hợp lệ');
    error.status = 401;
    throw error;
  }

  await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

  const accessToken = signToken({ userId: user.id, role: user.role });

  return {
    access_token: accessToken,
    token_type: 'bearer',
    user: {
      ...mapUser(user),
      last_login_at: new Date().toISOString()
    }
  };
}

async function getCurrentUser(userId) {
  const result = await query(
    `SELECT
       u.id,
       u.employee_code,
       u.username,
       u.email,
       u.full_name,
       u.department_id,
       u.manager_user_id,
       u.is_active,
       u.last_login_at,
       u.created_at,
       u.updated_at,
       r.code AS role,
       r.display_name AS role_name,
       d.name AS department_name
     FROM users u
     JOIN roles r ON r.id = u.role_id
     LEFT JOIN departments d ON d.id = u.department_id
     WHERE u.id = $1
       AND u.deleted_at IS NULL`,
    [userId]
  );

  if (result.rowCount === 0) {
    const error = new Error('Xác thực thất bại');
    error.status = 401;
    throw error;
  }

  return mapUser(result.rows[0]);
}

module.exports = {
  login,
  getCurrentUser
};
