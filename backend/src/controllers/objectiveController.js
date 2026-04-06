const { z } = require('zod');
const { query } = require('../config/db');
const { sendSuccess, sendCreated, sendNoContent } = require('../utils/response');
const { recalculateObjectiveProgress } = require('../services/progressService');
const { mapDateOnlyFields } = require('../utils/dateOnly');
const { assertEnglishBusinessPayload } = require('../utils/englishValidation');

const objectiveStatusSchema = z.enum(['draft', 'on_track', 'at_risk', 'completed', 'cancelled', 'active']);

const objectiveSchema = z.object({
  code: z.string().trim().min(2).max(40).optional(),
  title: z.string().trim().min(3),
  description: z.string().trim().max(5000).nullable().optional(),
  owner_id: z.coerce.number().int().positive().optional(),
  owner_user_id: z.coerce.number().int().positive().optional(),
  department_id: z.coerce.number().int().positive().nullable().optional(),
  cycle_id: z.coerce.number().int().positive(),
  parent_objective_id: z.coerce.number().int().positive().nullable().optional(),
  objective_type: z.enum(['company', 'department', 'individual']).optional(),
  status: objectiveStatusSchema.default('draft'),
  priority: z.coerce.number().int().min(1).max(5).optional(),
  progress: z.coerce.number().min(0).max(100).optional(),
  progress_percent: z.coerce.number().min(0).max(100).optional(),
  start_date: z.string().date().nullable().optional(),
  due_date: z.string().date().nullable().optional()
});

const updateObjectiveSchema = objectiveSchema.partial();

function normalizeStatus(status) {
  if (!status) return status;
  if (status === 'active') return 'on_track';
  return status;
}

async function assertOwner(ownerUserId) {
  const result = await query(
    `SELECT id, department_id
     FROM users
     WHERE id = $1
       AND deleted_at IS NULL
       AND is_active = TRUE`,
    [ownerUserId]
  );

  if (result.rowCount === 0) {
    const error = new Error('Owner not found');
    error.status = 400;
    throw error;
  }

  return result.rows[0];
}

async function assertCycle(cycleId) {
  const result = await query('SELECT id, code FROM okr_cycles WHERE id = $1', [cycleId]);
  if (result.rowCount === 0) {
    const error = new Error('Cycle not found');
    error.status = 400;
    throw error;
  }
  return result.rows[0];
}

async function assertDepartment(departmentId) {
  if (!departmentId) return;

  const result = await query('SELECT id FROM departments WHERE id = $1', [departmentId]);
  if (result.rowCount === 0) {
    const error = new Error('Department not found');
    error.status = 400;
    throw error;
  }
}

async function assertParentObjective(parentObjectiveId, cycleId) {
  if (!parentObjectiveId) return;

  const result = await query('SELECT id, cycle_id FROM objectives WHERE id = $1', [parentObjectiveId]);
  if (result.rowCount === 0) {
    const error = new Error('Parent objective not found');
    error.status = 400;
    throw error;
  }

  if (result.rows[0].cycle_id !== cycleId) {
    const error = new Error('Parent objective must belong to same cycle');
    error.status = 400;
    throw error;
  }
}

function validateDateRange(startDate, dueDate) {
  if (!startDate || !dueDate) {
    return true;
  }
  const start = new Date(startDate);
  const due = new Date(dueDate);
  return !Number.isNaN(start.getTime()) && !Number.isNaN(due.getTime()) && due >= start;
}

async function uniqueObjectiveCode(cycleId, candidateCode, excludeId = null) {
  let code = candidateCode;
  let index = 1;

  while (true) {
    const params = excludeId ? [cycleId, code, excludeId] : [cycleId, code];
    const where = excludeId
      ? 'cycle_id = $1 AND code = $2 AND id <> $3'
      : 'cycle_id = $1 AND code = $2';

    const found = await query(`SELECT id FROM objectives WHERE ${where}`, params);
    if (found.rowCount === 0) {
      return code;
    }

    code = `${candidateCode}-${index}`;
    index += 1;
  }
}

function mapObjectiveRow(row) {
  const normalized = mapDateOnlyFields(row, ['start_date', 'due_date']);
  return {
    id: normalized.id,
    cycle_id: normalized.cycle_id,
    cycle_code: normalized.cycle_code,
    cycle_name: normalized.cycle_name,
    code: normalized.code,
    title: normalized.title,
    description: normalized.description,
    owner_id: normalized.owner_user_id,
    owner_user_id: normalized.owner_user_id,
    owner_name: normalized.owner_name,
    department_id: normalized.department_id,
    department_name: normalized.department_name,
    parent_objective_id: normalized.parent_objective_id,
    objective_type: normalized.objective_type,
    status: normalized.status,
    priority: normalized.priority,
    progress: Number(normalized.progress_percent),
    progress_percent: Number(normalized.progress_percent),
    start_date: normalized.start_date,
    due_date: normalized.due_date,
    created_at: normalized.created_at,
    updated_at: normalized.updated_at
  };
}

async function listObjectives(req, res, next) {
  try {
    const { cycle_id, department_id, owner_id, owner_user_id, status, objective_type } = req.query;
    const conditions = [];
    const values = [];

    if (cycle_id) {
      values.push(Number(cycle_id));
      conditions.push(`o.cycle_id = $${values.length}`);
    }
    if (department_id) {
      values.push(Number(department_id));
      conditions.push(`o.department_id = $${values.length}`);
    }
    const ownerFilter = owner_user_id || owner_id;
    if (ownerFilter) {
      values.push(Number(ownerFilter));
      conditions.push(`o.owner_user_id = $${values.length}`);
    }
    if (status) {
      values.push(normalizeStatus(String(status)));
      conditions.push(`o.status = $${values.length}`);
    }
    if (objective_type) {
      values.push(String(objective_type));
      conditions.push(`o.objective_type = $${values.length}`);
    }

    if (req.user.role === 'employee') {
      values.push(req.user.id);
      conditions.push(`o.owner_user_id = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await query(
      `SELECT
         o.id,
         o.cycle_id,
         c.code AS cycle_code,
         c.name AS cycle_name,
         o.code,
         o.title,
         o.description,
         o.owner_user_id,
         u.full_name AS owner_name,
         o.department_id,
         d.name AS department_name,
         o.parent_objective_id,
         o.objective_type,
         o.status,
         o.priority,
         o.progress_percent,
         o.start_date,
         o.due_date,
         o.created_at,
         o.updated_at
       FROM objectives o
       JOIN users u ON u.id = o.owner_user_id
       JOIN okr_cycles c ON c.id = o.cycle_id
       LEFT JOIN departments d ON d.id = o.department_id
       ${whereClause}
       ORDER BY o.id DESC`,
      values
    );

    return sendSuccess(res, result.rows.map(mapObjectiveRow));
  } catch (error) {
    return next(error);
  }
}

async function getObjectiveById(req, res, next) {
  try {
    const id = Number(req.params.id);

    const result = await query(
      `SELECT
         o.id,
         o.cycle_id,
         c.code AS cycle_code,
         c.name AS cycle_name,
         o.code,
         o.title,
         o.description,
         o.owner_user_id,
         u.full_name AS owner_name,
         o.department_id,
         d.name AS department_name,
         o.parent_objective_id,
         o.objective_type,
         o.status,
         o.priority,
         o.progress_percent,
         o.start_date,
         o.due_date,
         o.created_at,
         o.updated_at
       FROM objectives o
       JOIN users u ON u.id = o.owner_user_id
       JOIN okr_cycles c ON c.id = o.cycle_id
       LEFT JOIN departments d ON d.id = o.department_id
       WHERE o.id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      const error = new Error('Objective not found');
      error.status = 404;
      throw error;
    }

    const objective = result.rows[0];
    if (req.user.role === 'employee' && objective.owner_user_id !== req.user.id) {
      const error = new Error('Forbidden');
      error.status = 403;
      throw error;
    }

    return sendSuccess(res, mapObjectiveRow(objective));
  } catch (error) {
    return next(error);
  }
}

async function createObjective(req, res, next) {
  try {
    const payload = objectiveSchema.parse(req.body);
    assertEnglishBusinessPayload(payload, {
      code: 'Objective code',
      title: 'Objective title',
      description: 'Objective description'
    });

    const ownerUserId = req.user.role === 'employee'
      ? req.user.id
      : payload.owner_user_id || payload.owner_id || req.user.id;
    const owner = await assertOwner(ownerUserId);
    const cycle = await assertCycle(payload.cycle_id);

    const departmentId = req.user.role === 'employee'
      ? owner.department_id
      : Object.prototype.hasOwnProperty.call(payload, 'department_id')
      ? payload.department_id
      : owner.department_id;

    await assertDepartment(departmentId);
    await assertParentObjective(payload.parent_objective_id, payload.cycle_id);

    const objectiveType = payload.objective_type || (departmentId ? 'department' : 'individual');

    if (objectiveType === 'department' && !departmentId) {
      const error = new Error('department_id is required for department objective');
      error.status = 400;
      throw error;
    }

    if (!validateDateRange(payload.start_date, payload.due_date)) {
      const error = new Error('due_date must be on or after start_date');
      error.status = 400;
      throw error;
    }

    const rawCode = payload.code || `${cycle.code}-OBJ`;
    const code = await uniqueObjectiveCode(payload.cycle_id, rawCode.toUpperCase());

    const progressPercent = Object.prototype.hasOwnProperty.call(payload, 'progress_percent')
      ? payload.progress_percent
      : Object.prototype.hasOwnProperty.call(payload, 'progress')
      ? payload.progress
      : 0;

    const created = await query(
      `INSERT INTO objectives (
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
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING id`,
      [
        payload.cycle_id,
        code,
        payload.title,
        payload.description || null,
        ownerUserId,
        departmentId || null,
        payload.parent_objective_id || null,
        objectiveType,
        normalizeStatus(payload.status),
        payload.priority || 3,
        progressPercent,
        payload.start_date || null,
        payload.due_date || null
      ]
    );

    await recalculateObjectiveProgress(created.rows[0].id);

    const createdObjective = await query(
      `SELECT
         o.id,
         o.cycle_id,
         c.code AS cycle_code,
         c.name AS cycle_name,
         o.code,
         o.title,
         o.description,
         o.owner_user_id,
         u.full_name AS owner_name,
         o.department_id,
         d.name AS department_name,
         o.parent_objective_id,
         o.objective_type,
         o.status,
         o.priority,
         o.progress_percent,
         o.start_date,
         o.due_date,
         o.created_at,
         o.updated_at
       FROM objectives o
       JOIN users u ON u.id = o.owner_user_id
       JOIN okr_cycles c ON c.id = o.cycle_id
       LEFT JOIN departments d ON d.id = o.department_id
       WHERE o.id = $1`,
      [created.rows[0].id]
    );

    return sendCreated(res, mapObjectiveRow(createdObjective.rows[0]), 'Objective created');
  } catch (error) {
    return next(error);
  }
}

async function updateObjective(req, res, next) {
  try {
    const id = Number(req.params.id);
    const payload = updateObjectiveSchema.parse(req.body);
    assertEnglishBusinessPayload(payload, {
      code: 'Objective code',
      title: 'Objective title',
      description: 'Objective description'
    });

    const currentResult = await query('SELECT * FROM objectives WHERE id = $1', [id]);
    if (currentResult.rowCount === 0) {
      const error = new Error('Objective not found');
      error.status = 404;
      throw error;
    }

    const current = currentResult.rows[0];
    if (req.user.role === 'employee' && current.owner_user_id !== req.user.id) {
      const error = new Error('Forbidden');
      error.status = 403;
      throw error;
    }

    const requestedOwnerUserId = Object.prototype.hasOwnProperty.call(payload, 'owner_user_id')
      ? payload.owner_user_id
      : Object.prototype.hasOwnProperty.call(payload, 'owner_id')
      ? payload.owner_id
      : current.owner_user_id;
    const ownerUserId = req.user.role === 'employee' ? req.user.id : requestedOwnerUserId;

    const cycleId = Object.prototype.hasOwnProperty.call(payload, 'cycle_id') ? payload.cycle_id : current.cycle_id;

    const owner = await assertOwner(ownerUserId);
    const cycle = await assertCycle(cycleId);

    const departmentId = req.user.role === 'employee'
      ? owner.department_id
      : Object.prototype.hasOwnProperty.call(payload, 'department_id')
      ? payload.department_id
      : current.department_id;

    await assertDepartment(departmentId);

    const parentObjectiveId = Object.prototype.hasOwnProperty.call(payload, 'parent_objective_id')
      ? payload.parent_objective_id
      : current.parent_objective_id;

    if (parentObjectiveId === id) {
      const error = new Error('objective cannot be parent of itself');
      error.status = 400;
      throw error;
    }

    await assertParentObjective(parentObjectiveId, cycleId);

    const objectiveType = payload.objective_type || current.objective_type;
    if (objectiveType === 'department' && !departmentId) {
      const error = new Error('department_id is required for department objective');
      error.status = 400;
      throw error;
    }

    const startDate = Object.prototype.hasOwnProperty.call(payload, 'start_date') ? payload.start_date : current.start_date;
    const dueDate = Object.prototype.hasOwnProperty.call(payload, 'due_date') ? payload.due_date : current.due_date;

    if (!validateDateRange(startDate, dueDate)) {
      const error = new Error('due_date must be on or after start_date');
      error.status = 400;
      throw error;
    }

    const code = payload.code
      ? await uniqueObjectiveCode(cycleId, payload.code.toUpperCase(), id)
      : cycleId === current.cycle_id
      ? current.code
      : await uniqueObjectiveCode(cycleId, current.code, id);

    const progressPercent = Object.prototype.hasOwnProperty.call(payload, 'progress_percent')
      ? payload.progress_percent
      : Object.prototype.hasOwnProperty.call(payload, 'progress')
      ? payload.progress
      : current.progress_percent;

    await query(
      `UPDATE objectives
       SET cycle_id = $1,
           code = $2,
           title = $3,
           description = $4,
           owner_user_id = $5,
           department_id = $6,
           parent_objective_id = $7,
           objective_type = $8,
           status = $9,
           priority = $10,
           progress_percent = $11,
           start_date = $12,
           due_date = $13
       WHERE id = $14`,
      [
        cycleId,
        code,
        payload.title || current.title,
        Object.prototype.hasOwnProperty.call(payload, 'description') ? payload.description : current.description,
        ownerUserId,
        departmentId || null,
        parentObjectiveId || null,
        objectiveType,
        normalizeStatus(payload.status || current.status),
        payload.priority || current.priority,
        progressPercent,
        startDate || null,
        dueDate || null,
        id
      ]
    );

    await recalculateObjectiveProgress(id);

    const refreshed = await query(
      `SELECT
         o.id,
         o.cycle_id,
         c.code AS cycle_code,
         c.name AS cycle_name,
         o.code,
         o.title,
         o.description,
         o.owner_user_id,
         u.full_name AS owner_name,
         o.department_id,
         d.name AS department_name,
         o.parent_objective_id,
         o.objective_type,
         o.status,
         o.priority,
         o.progress_percent,
         o.start_date,
         o.due_date,
         o.created_at,
         o.updated_at
       FROM objectives o
       JOIN users u ON u.id = o.owner_user_id
       JOIN okr_cycles c ON c.id = o.cycle_id
       LEFT JOIN departments d ON d.id = o.department_id
       WHERE o.id = $1`,
      [id]
    );

    return sendSuccess(res, mapObjectiveRow(refreshed.rows[0]), 'Objective updated');
  } catch (error) {
    return next(error);
  }
}

async function deleteObjective(req, res, next) {
  try {
    const id = Number(req.params.id);
    const current = await query('SELECT id, owner_user_id FROM objectives WHERE id = $1', [id]);

    if (current.rowCount === 0) {
      const error = new Error('Objective not found');
      error.status = 404;
      throw error;
    }

    if (req.user.role === 'employee' && current.rows[0].owner_user_id !== req.user.id) {
      const error = new Error('Forbidden');
      error.status = 403;
      throw error;
    }

    await query('DELETE FROM objectives WHERE id = $1', [id]);
    return sendNoContent(res);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listObjectives,
  getObjectiveById,
  createObjective,
  updateObjective,
  deleteObjective
};
