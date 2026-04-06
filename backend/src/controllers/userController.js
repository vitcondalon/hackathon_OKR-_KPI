const { z } = require('zod');
const { query } = require('../config/db');
const { hashPassword } = require('../utils/password');
const { sendSuccess, sendCreated, sendNoContent } = require('../utils/response');

const roleEnum = z.enum(['admin', 'hr', 'manager', 'employee']);

const createUserSchema = z.object({
  employee_code: z.string().trim().min(2).max(30).optional(),
  full_name: z.string().trim().min(2),
  username: z.string().trim().min(3).max(100).optional(),
  email: z.string().trim().email().optional(),
  password: z.string().min(6),
  role: roleEnum.default('employee'),
  department_id: z.coerce.number().int().positive().nullable().optional(),
  manager_user_id: z.coerce.number().int().positive().nullable().optional(),
  is_active: z.boolean().optional()
});

const updateUserSchema = createUserSchema
  .partial()
  .extend({
    password: z.string().min(6).optional()
  });

function mapUser(row) {
  return {
    id: row.id,
    employee_code: row.employee_code,
    full_name: row.full_name,
    username: row.username,
    email: row.email,
    role: row.role,
    role_name: row.role_name,
    department_id: row.department_id,
    department_name: row.department_name,
    manager_user_id: row.manager_user_id,
    manager_name: row.manager_name,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function normalizeEmployeeCode(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9-_]/g, '')
    .toUpperCase();
}

function buildUsernameFromEmployeeCode(employeeCode) {
  return String(employeeCode || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-');
}

function buildEmailFromEmployeeCode(employeeCode) {
  return `${buildUsernameFromEmployeeCode(employeeCode)}@company`;
}

async function getRoleIdByCode(roleCode) {
  const result = await query('SELECT id FROM roles WHERE code = $1', [roleCode]);
  if (result.rowCount === 0) {
    const error = new Error(`Role not found: ${roleCode}`);
    error.status = 400;
    throw error;
  }
  return result.rows[0].id;
}

async function assertDepartment(departmentId) {
  if (!departmentId) {
    return;
  }
  const dep = await query('SELECT id FROM departments WHERE id = $1 AND is_active = TRUE', [departmentId]);
  if (dep.rowCount === 0) {
    const error = new Error('Department not found');
    error.status = 400;
    throw error;
  }
}

async function assertManager(managerUserId) {
  if (!managerUserId) {
    return;
  }
  const manager = await query(
    `SELECT u.id
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.id = $1 AND u.deleted_at IS NULL AND r.code IN ('admin', 'hr', 'manager')`,
    [managerUserId]
  );

  if (manager.rowCount === 0) {
    const error = new Error('Manager user not found or role is invalid');
    error.status = 400;
    throw error;
  }
}

async function listUsers(req, res, next) {
  try {
    const result = await query(
      `SELECT
         u.id,
         u.employee_code,
         u.full_name,
         u.username,
         u.email,
         r.code AS role,
         r.display_name AS role_name,
         u.department_id,
         d.name AS department_name,
         u.manager_user_id,
         m.full_name AS manager_name,
         u.is_active,
         u.created_at,
         u.updated_at
       FROM users u
       JOIN roles r ON r.id = u.role_id
       LEFT JOIN departments d ON d.id = u.department_id
       LEFT JOIN users m ON m.id = u.manager_user_id
       WHERE u.deleted_at IS NULL
       ORDER BY u.id ASC`
    );

    return sendSuccess(res, result.rows.map(mapUser));
  } catch (error) {
    return next(error);
  }
}

async function createUser(req, res, next) {
  try {
    const payload = createUserSchema.parse(req.body);
    const employeeCode = normalizeEmployeeCode(payload.employee_code || `${payload.role.toUpperCase().slice(0, 3)}-${Date.now()}`);
    const username = payload.username || buildUsernameFromEmployeeCode(employeeCode);
    const email = payload.email || buildEmailFromEmployeeCode(employeeCode);

    const duplicate = await query(
      `SELECT id FROM users
       WHERE deleted_at IS NULL
         AND (username = $1 OR email = $2)`,
      [username, email]
    );

    if (duplicate.rowCount > 0) {
      const error = new Error('Email or username already exists');
      error.status = 400;
      throw error;
    }

    await assertDepartment(payload.department_id);
    await assertManager(payload.manager_user_id);

    const roleId = await getRoleIdByCode(payload.role);
    const passwordHash = await hashPassword(payload.password);

    const created = await query(
      `INSERT INTO users (
         employee_code,
         full_name,
         username,
         email,
         password_hash,
         role_id,
         department_id,
         manager_user_id,
         is_active
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id`,
      [
        employeeCode,
        payload.full_name,
        username,
        email,
        passwordHash,
        roleId,
        payload.department_id || null,
        payload.manager_user_id || null,
        payload.is_active !== false
      ]
    );

    const user = await query(
      `SELECT
         u.id,
         u.employee_code,
         u.full_name,
         u.username,
         u.email,
         r.code AS role,
         r.display_name AS role_name,
         u.department_id,
         d.name AS department_name,
         u.manager_user_id,
         m.full_name AS manager_name,
         u.is_active,
         u.created_at,
         u.updated_at
       FROM users u
       JOIN roles r ON r.id = u.role_id
       LEFT JOIN departments d ON d.id = u.department_id
       LEFT JOIN users m ON m.id = u.manager_user_id
       WHERE u.id = $1`,
      [created.rows[0].id]
    );

    return sendCreated(res, mapUser(user.rows[0]), 'User created');
  } catch (error) {
    return next(error);
  }
}

async function getUserById(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      const error = new Error('Invalid user id');
      error.status = 400;
      throw error;
    }

    if (req.user.role === 'employee' && req.user.id !== id) {
      const error = new Error('Forbidden');
      error.status = 403;
      throw error;
    }

    const result = await query(
      `SELECT
         u.id,
         u.employee_code,
         u.full_name,
         u.username,
         u.email,
         r.code AS role,
         r.display_name AS role_name,
         u.department_id,
         d.name AS department_name,
         u.manager_user_id,
         m.full_name AS manager_name,
         u.is_active,
         u.created_at,
         u.updated_at
       FROM users u
       JOIN roles r ON r.id = u.role_id
       LEFT JOIN departments d ON d.id = u.department_id
       LEFT JOIN users m ON m.id = u.manager_user_id
       WHERE u.id = $1
         AND u.deleted_at IS NULL`,
      [id]
    );

    if (result.rowCount === 0) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    return sendSuccess(res, mapUser(result.rows[0]));
  } catch (error) {
    return next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      const error = new Error('Invalid user id');
      error.status = 400;
      throw error;
    }

    const payload = updateUserSchema.parse(req.body);

    const currentResult = await query(
      `SELECT
         u.id,
         u.employee_code,
         u.full_name,
         u.username,
         u.email,
         r.code AS role,
         u.role_id,
         u.password_hash,
         u.department_id,
         u.manager_user_id,
         u.is_active
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.id = $1
         AND u.deleted_at IS NULL`,
      [id]
    );

    if (currentResult.rowCount === 0) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    const current = currentResult.rows[0];

    const nextEmail = payload.email || current.email;
    const nextUsername = payload.username || current.username;

    const duplicate = await query(
      `SELECT id
       FROM users
       WHERE id <> $1
         AND deleted_at IS NULL
         AND (username = $2 OR email = $3)`,
      [id, nextUsername, nextEmail]
    );

    if (duplicate.rowCount > 0) {
      const error = new Error('Email or username already exists');
      error.status = 400;
      throw error;
    }

    const roleCode = payload.role || current.role;
    const roleId = roleCode === current.role ? current.role_id : await getRoleIdByCode(roleCode);

    const departmentId = Object.prototype.hasOwnProperty.call(payload, 'department_id')
      ? payload.department_id
      : current.department_id;

    const managerUserId = Object.prototype.hasOwnProperty.call(payload, 'manager_user_id')
      ? payload.manager_user_id
      : current.manager_user_id;

    await assertDepartment(departmentId);
    await assertManager(managerUserId);

    const passwordHash = payload.password ? await hashPassword(payload.password) : current.password_hash;

    await query(
      `UPDATE users
       SET employee_code = $1,
           full_name = $2,
           username = $3,
           email = $4,
           password_hash = $5,
           role_id = $6,
           department_id = $7,
           manager_user_id = $8,
           is_active = $9
       WHERE id = $10`,
      [
        payload.employee_code || current.employee_code,
        payload.full_name || current.full_name,
        nextUsername,
        nextEmail,
        passwordHash,
        roleId,
        departmentId || null,
        managerUserId || null,
        Object.prototype.hasOwnProperty.call(payload, 'is_active') ? payload.is_active : current.is_active,
        id
      ]
    );

    const refreshed = await query(
      `SELECT
         u.id,
         u.employee_code,
         u.full_name,
         u.username,
         u.email,
         r.code AS role,
         r.display_name AS role_name,
         u.department_id,
         d.name AS department_name,
         u.manager_user_id,
         m.full_name AS manager_name,
         u.is_active,
         u.created_at,
         u.updated_at
       FROM users u
       JOIN roles r ON r.id = u.role_id
       LEFT JOIN departments d ON d.id = u.department_id
       LEFT JOIN users m ON m.id = u.manager_user_id
       WHERE u.id = $1`,
      [id]
    );

    return sendSuccess(res, mapUser(refreshed.rows[0]), 'User updated');
  } catch (error) {
    return next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      const error = new Error('Invalid user id');
      error.status = 400;
      throw error;
    }

    if (id === req.user.id) {
      const error = new Error('You cannot delete yourself');
      error.status = 400;
      throw error;
    }

    const result = await query(
      `UPDATE users
       SET is_active = FALSE,
           deleted_at = NOW()
       WHERE id = $1
         AND deleted_at IS NULL
       RETURNING id`,
      [id]
    );

    if (result.rowCount === 0) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    return sendNoContent(res);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser
};
