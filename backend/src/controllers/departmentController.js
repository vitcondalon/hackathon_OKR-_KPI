const { z } = require('zod');
const { query } = require('../config/db');
const { sendSuccess, sendCreated, sendNoContent } = require('../utils/response');

const departmentSchema = z.object({
  code: z.string().trim().min(2).max(30).optional(),
  name: z.string().trim().min(2).max(255),
  description: z.string().trim().max(5000).nullable().optional(),
  manager_id: z.coerce.number().int().positive().nullable().optional(),
  manager_user_id: z.coerce.number().int().positive().nullable().optional(),
  is_active: z.boolean().optional()
});

const updateDepartmentSchema = departmentSchema.partial();

function buildDepartmentCode(name) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4)
    .map((word) => word[0].toUpperCase())
    .join('');

  return initials || `DEP${Date.now().toString().slice(-4)}`;
}

async function assertManager(managerUserId) {
  if (!managerUserId) {
    return;
  }

  const managerResult = await query(
    `SELECT u.id
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.id = $1
       AND u.deleted_at IS NULL
       AND r.code IN ('admin', 'manager')`,
    [managerUserId]
  );

  if (managerResult.rowCount === 0) {
    const error = new Error('Manager user not found or role is invalid');
    error.status = 400;
    throw error;
  }
}

async function uniqueDepartmentCode(candidateCode, excludeId = null) {
  let code = candidateCode;
  let index = 1;

  while (true) {
    const params = excludeId ? [code, excludeId] : [code];
    const where = excludeId ? 'code = $1 AND id <> $2' : 'code = $1';
    const found = await query(`SELECT id FROM departments WHERE ${where}`, params);
    if (found.rowCount === 0) {
      return code;
    }

    code = `${candidateCode}-${index}`;
    index += 1;
  }
}

function mapDepartment(row) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    manager_id: row.manager_user_id,
    manager_user_id: row.manager_user_id,
    manager_name: row.manager_name,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

async function listDepartments(req, res, next) {
  try {
    const result = await query(
      `SELECT
         d.id,
         d.code,
         d.name,
         d.description,
         d.manager_user_id,
         d.is_active,
         d.created_at,
         d.updated_at,
         u.full_name AS manager_name
       FROM departments d
       LEFT JOIN users u ON u.id = d.manager_user_id AND u.deleted_at IS NULL
       ORDER BY d.id ASC`
    );

    return sendSuccess(res, result.rows.map(mapDepartment));
  } catch (error) {
    return next(error);
  }
}

async function createDepartment(req, res, next) {
  try {
    const payload = departmentSchema.parse(req.body);
    const managerUserId = payload.manager_user_id ?? payload.manager_id ?? null;

    await assertManager(managerUserId);

    const duplicatedName = await query('SELECT id FROM departments WHERE LOWER(name) = LOWER($1)', [payload.name]);
    if (duplicatedName.rowCount > 0) {
      const error = new Error('Department name already exists');
      error.status = 400;
      throw error;
    }

    const rawCode = (payload.code || buildDepartmentCode(payload.name)).toUpperCase();
    const finalCode = await uniqueDepartmentCode(rawCode);

    const created = await query(
      `INSERT INTO departments (code, name, description, manager_user_id, is_active)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id`,
      [
        finalCode,
        payload.name,
        payload.description || null,
        managerUserId,
        payload.is_active !== false
      ]
    );

    const department = await query(
      `SELECT
         d.id,
         d.code,
         d.name,
         d.description,
         d.manager_user_id,
         d.is_active,
         d.created_at,
         d.updated_at,
         u.full_name AS manager_name
       FROM departments d
       LEFT JOIN users u ON u.id = d.manager_user_id
       WHERE d.id = $1`,
      [created.rows[0].id]
    );

    return sendCreated(res, mapDepartment(department.rows[0]), 'Department created');
  } catch (error) {
    return next(error);
  }
}

async function updateDepartment(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      const error = new Error('Invalid department id');
      error.status = 400;
      throw error;
    }

    const payload = updateDepartmentSchema.parse(req.body);

    const currentResult = await query('SELECT * FROM departments WHERE id = $1', [id]);
    if (currentResult.rowCount === 0) {
      const error = new Error('Department not found');
      error.status = 404;
      throw error;
    }

    const current = currentResult.rows[0];
    const managerUserId = Object.prototype.hasOwnProperty.call(payload, 'manager_user_id')
      ? payload.manager_user_id
      : Object.prototype.hasOwnProperty.call(payload, 'manager_id')
      ? payload.manager_id
      : current.manager_user_id;

    await assertManager(managerUserId);

    const nextName = payload.name || current.name;
    const duplicateName = await query(
      'SELECT id FROM departments WHERE LOWER(name) = LOWER($1) AND id <> $2',
      [nextName, id]
    );
    if (duplicateName.rowCount > 0) {
      const error = new Error('Department name already exists');
      error.status = 400;
      throw error;
    }

    const nextCode = payload.code
      ? await uniqueDepartmentCode(payload.code.toUpperCase(), id)
      : current.code;

    await query(
      `UPDATE departments
       SET code = $1,
           name = $2,
           description = $3,
           manager_user_id = $4,
           is_active = $5
       WHERE id = $6`,
      [
        nextCode,
        nextName,
        Object.prototype.hasOwnProperty.call(payload, 'description') ? payload.description : current.description,
        managerUserId || null,
        Object.prototype.hasOwnProperty.call(payload, 'is_active') ? payload.is_active : current.is_active,
        id
      ]
    );

    const refreshed = await query(
      `SELECT
         d.id,
         d.code,
         d.name,
         d.description,
         d.manager_user_id,
         d.is_active,
         d.created_at,
         d.updated_at,
         u.full_name AS manager_name
       FROM departments d
       LEFT JOIN users u ON u.id = d.manager_user_id
       WHERE d.id = $1`,
      [id]
    );

    return sendSuccess(res, mapDepartment(refreshed.rows[0]), 'Department updated');
  } catch (error) {
    return next(error);
  }
}

async function deleteDepartment(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      const error = new Error('Invalid department id');
      error.status = 400;
      throw error;
    }

    const [users, objectives, kpis] = await Promise.all([
      query('SELECT COUNT(*)::int AS count FROM users WHERE department_id = $1 AND deleted_at IS NULL', [id]),
      query('SELECT COUNT(*)::int AS count FROM objectives WHERE department_id = $1', [id]),
      query('SELECT COUNT(*)::int AS count FROM kpi_metrics WHERE department_id = $1', [id])
    ]);

    if (users.rows[0].count > 0 || objectives.rows[0].count > 0 || kpis.rows[0].count > 0) {
      const error = new Error('Cannot delete department with linked users/objectives/kpis');
      error.status = 400;
      throw error;
    }

    const result = await query('DELETE FROM departments WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      const error = new Error('Department not found');
      error.status = 404;
      throw error;
    }

    return sendNoContent(res);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
