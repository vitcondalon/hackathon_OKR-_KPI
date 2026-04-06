const { z } = require('zod');
const { query } = require('../config/db');
const { sendSuccess, sendCreated, sendNoContent } = require('../utils/response');
const { calculateProgress, recalculateKpiProgress } = require('../services/progressService');
const { assertEnglishBusinessPayload } = require('../utils/englishValidation');

const scopeSchema = z.enum(['employee', 'department']);
const kpiStatusSchema = z.enum(['active', 'on_track', 'at_risk', 'completed', 'cancelled', 'draft']);

const kpiSchema = z.object({
  cycle_id: z.coerce.number().int().positive(),
  code: z.string().trim().min(1).max(40).optional(),
  type: scopeSchema.optional(),
  scope_type: scopeSchema.optional(),
  name: z.string().trim().min(3),
  description: z.string().trim().max(5000).nullable().optional(),
  owner_id: z.coerce.number().int().positive().nullable().optional(),
  owner_user_id: z.coerce.number().int().positive().nullable().optional(),
  department_id: z.coerce.number().int().positive().nullable().optional(),
  unit: z.string().trim().max(30).nullable().optional(),
  measurement_unit: z.string().trim().max(30).nullable().optional(),
  direction: z.enum(['increase', 'decrease', 'maintain']).default('increase'),
  start_value: z.coerce.number().optional(),
  target_value: z.coerce.number(),
  current_value: z.coerce.number().optional(),
  weight: z.coerce.number().positive().max(100).optional(),
  status: kpiStatusSchema.default('active')
});

const updateKpiSchema = kpiSchema.partial();

function normalizeStatus(status) {
  if (status === 'draft') return 'active';
  return status;
}

async function assertCycle(cycleId) {
  const result = await query('SELECT id FROM okr_cycles WHERE id = $1', [cycleId]);
  if (result.rowCount === 0) {
    const error = new Error('Cycle not found');
    error.status = 400;
    throw error;
  }
}

async function assertOwner(ownerUserId) {
  if (!ownerUserId) return;

  const result = await query(
    `SELECT id
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

async function uniqueKpiCode(cycleId, candidateCode, excludeId = null) {
  let code = candidateCode;
  let index = 1;

  while (true) {
    const params = excludeId ? [cycleId, code, excludeId] : [cycleId, code];
    const where = excludeId
      ? 'cycle_id = $1 AND code = $2 AND id <> $3'
      : 'cycle_id = $1 AND code = $2';
    const found = await query(`SELECT id FROM kpi_metrics WHERE ${where}`, params);

    if (found.rowCount === 0) {
      return code;
    }

    code = `${candidateCode}-${index}`;
    index += 1;
  }
}

function resolveScope(payload, current = null) {
  return payload.scope_type || payload.type || current || 'employee';
}

function mapKpiRow(row) {
  return {
    id: row.id,
    cycle_id: row.cycle_id,
    cycle_code: row.cycle_code,
    cycle_name: row.cycle_name,
    code: row.code,
    type: row.scope_type,
    scope_type: row.scope_type,
    name: row.name,
    description: row.description,
    owner_id: row.owner_user_id,
    owner_user_id: row.owner_user_id,
    owner_name: row.owner_name,
    department_id: row.department_id,
    department_name: row.department_name,
    unit: row.measurement_unit,
    measurement_unit: row.measurement_unit,
    direction: row.direction,
    start_value: Number(row.start_value),
    target_value: Number(row.target_value),
    current_value: Number(row.current_value),
    weight: Number(row.weight),
    status: row.status,
    progress: Number(row.progress_percent),
    progress_percent: Number(row.progress_percent),
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

async function listKpis(req, res, next) {
  try {
    const { owner_id, owner_user_id, department_id, cycle_id, status, type, scope_type } = req.query;
    const values = [];
    const conditions = [];

    const ownerFilter = owner_user_id || owner_id;
    if (ownerFilter) {
      values.push(Number(ownerFilter));
      conditions.push(`km.owner_user_id = $${values.length}`);
    }
    if (department_id) {
      values.push(Number(department_id));
      conditions.push(`km.department_id = $${values.length}`);
    }
    if (cycle_id) {
      values.push(Number(cycle_id));
      conditions.push(`km.cycle_id = $${values.length}`);
    }
    if (status) {
      values.push(normalizeStatus(String(status)));
      conditions.push(`km.status = $${values.length}`);
    }
    if (type || scope_type) {
      values.push(String(scope_type || type));
      conditions.push(`km.scope_type = $${values.length}`);
    }

    if (req.user.role === 'employee') {
      values.push(req.user.id);
      conditions.push(`km.owner_user_id = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await query(
      `SELECT
         km.id,
         km.cycle_id,
         c.code AS cycle_code,
         c.name AS cycle_name,
         km.code,
         km.scope_type,
         km.name,
         km.description,
         km.owner_user_id,
         u.full_name AS owner_name,
         km.department_id,
         d.name AS department_name,
         km.measurement_unit,
         km.direction,
         km.start_value,
         km.target_value,
         km.current_value,
         km.weight,
         km.status,
         km.progress_percent,
         km.created_at,
         km.updated_at
       FROM kpi_metrics km
       JOIN okr_cycles c ON c.id = km.cycle_id
       LEFT JOIN users u ON u.id = km.owner_user_id
       LEFT JOIN departments d ON d.id = km.department_id
       ${whereClause}
       ORDER BY km.id DESC`,
      values
    );

    return sendSuccess(res, result.rows.map(mapKpiRow));
  } catch (error) {
    return next(error);
  }
}

async function createKpi(req, res, next) {
  try {
    const payload = kpiSchema.parse(req.body);
    assertEnglishBusinessPayload(payload, {
      code: 'KPI code',
      name: 'KPI name',
      description: 'KPI description',
      measurement_unit: 'Measurement unit',
      unit: 'Measurement unit'
    });

    const scopeType = req.user.role === 'employee' ? 'employee' : resolveScope(payload);
    const ownerUserId = req.user.role === 'employee'
      ? req.user.id
      : payload.owner_user_id ?? payload.owner_id ?? null;
    const departmentId = scopeType === 'employee' ? null : payload.department_id ?? null;

    await assertCycle(payload.cycle_id);

    if (scopeType === 'employee') {
      if (!ownerUserId) {
        const error = new Error('owner_id is required for employee KPI');
        error.status = 400;
        throw error;
      }
      await assertOwner(ownerUserId);
    } else {
      if (!departmentId) {
        const error = new Error('department_id is required for department KPI');
        error.status = 400;
        throw error;
      }
      await assertDepartment(departmentId);
    }

    const startValue = Object.prototype.hasOwnProperty.call(payload, 'start_value') ? payload.start_value : 0;
    const currentValue = Object.prototype.hasOwnProperty.call(payload, 'current_value') ? payload.current_value : startValue;

    const progressPercent = calculateProgress({
      direction: payload.direction,
      startValue,
      targetValue: payload.target_value,
      currentValue
    });

    const code = await uniqueKpiCode(payload.cycle_id, (payload.code || 'KPI').toUpperCase());

    const inserted = await query(
      `INSERT INTO kpi_metrics (
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
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING id`,
      [
        payload.cycle_id,
        code,
        payload.name,
        payload.description || null,
        scopeType,
        scopeType === 'employee' ? ownerUserId : null,
        scopeType === 'department' ? departmentId : null,
        payload.measurement_unit || payload.unit || null,
        payload.direction,
        startValue,
        payload.target_value,
        currentValue,
        progressPercent,
        payload.weight || 1,
        normalizeStatus(payload.status)
      ]
    );

    await recalculateKpiProgress(inserted.rows[0].id);

    const created = await query(
      `SELECT
         km.id,
         km.cycle_id,
         c.code AS cycle_code,
         c.name AS cycle_name,
         km.code,
         km.scope_type,
         km.name,
         km.description,
         km.owner_user_id,
         u.full_name AS owner_name,
         km.department_id,
         d.name AS department_name,
         km.measurement_unit,
         km.direction,
         km.start_value,
         km.target_value,
         km.current_value,
         km.weight,
         km.status,
         km.progress_percent,
         km.created_at,
         km.updated_at
       FROM kpi_metrics km
       JOIN okr_cycles c ON c.id = km.cycle_id
       LEFT JOIN users u ON u.id = km.owner_user_id
       LEFT JOIN departments d ON d.id = km.department_id
       WHERE km.id = $1`,
      [inserted.rows[0].id]
    );

    return sendCreated(res, mapKpiRow(created.rows[0]), 'KPI created');
  } catch (error) {
    return next(error);
  }
}

async function updateKpi(req, res, next) {
  try {
    const id = Number(req.params.id);
    const payload = updateKpiSchema.parse(req.body);
    assertEnglishBusinessPayload(payload, {
      code: 'KPI code',
      name: 'KPI name',
      description: 'KPI description',
      measurement_unit: 'Measurement unit',
      unit: 'Measurement unit'
    });

    const currentResult = await query('SELECT * FROM kpi_metrics WHERE id = $1', [id]);
    if (currentResult.rowCount === 0) {
      const error = new Error('KPI not found');
      error.status = 404;
      throw error;
    }

    const current = currentResult.rows[0];

    if (req.user.role === 'employee' && current.owner_user_id !== req.user.id) {
      const error = new Error('Forbidden');
      error.status = 403;
      throw error;
    }

    const cycleId = Object.prototype.hasOwnProperty.call(payload, 'cycle_id') ? payload.cycle_id : current.cycle_id;
    await assertCycle(cycleId);

    const requestedScopeType = resolveScope(payload, current.scope_type);
    const scopeType = req.user.role === 'employee' ? 'employee' : requestedScopeType;
    const requestedOwnerUserId = Object.prototype.hasOwnProperty.call(payload, 'owner_user_id')
      ? payload.owner_user_id
      : Object.prototype.hasOwnProperty.call(payload, 'owner_id')
      ? payload.owner_id
      : current.owner_user_id;
    const ownerUserId = req.user.role === 'employee' ? req.user.id : requestedOwnerUserId;

    const requestedDepartmentId = Object.prototype.hasOwnProperty.call(payload, 'department_id')
      ? payload.department_id
      : current.department_id;
    const departmentId = scopeType === 'employee' ? null : requestedDepartmentId;

    if (scopeType === 'employee') {
      if (!ownerUserId) {
        const error = new Error('owner_id is required for employee KPI');
        error.status = 400;
        throw error;
      }
      await assertOwner(ownerUserId);
    } else {
      if (!departmentId) {
        const error = new Error('department_id is required for department KPI');
        error.status = 400;
        throw error;
      }
      await assertDepartment(departmentId);
    }

    const direction = payload.direction || current.direction;
    const startValue = Object.prototype.hasOwnProperty.call(payload, 'start_value')
      ? payload.start_value
      : Number(current.start_value);
    const targetValue = Object.prototype.hasOwnProperty.call(payload, 'target_value')
      ? payload.target_value
      : Number(current.target_value);
    const currentValue = Object.prototype.hasOwnProperty.call(payload, 'current_value')
      ? payload.current_value
      : Number(current.current_value);

    const progressPercent = calculateProgress({
      direction,
      startValue,
      targetValue,
      currentValue
    });

    const code = payload.code
      ? await uniqueKpiCode(cycleId, payload.code.toUpperCase(), id)
      : cycleId === current.cycle_id
      ? current.code
      : await uniqueKpiCode(cycleId, current.code, id);

    await query(
      `UPDATE kpi_metrics
       SET cycle_id = $1,
           code = $2,
           name = $3,
           description = $4,
           scope_type = $5,
           owner_user_id = $6,
           department_id = $7,
           measurement_unit = $8,
           direction = $9,
           start_value = $10,
           target_value = $11,
           current_value = $12,
           progress_percent = $13,
           weight = $14,
           status = $15
       WHERE id = $16`,
      [
        cycleId,
        code,
        payload.name || current.name,
        Object.prototype.hasOwnProperty.call(payload, 'description') ? payload.description : current.description,
        scopeType,
        scopeType === 'employee' ? ownerUserId : null,
        scopeType === 'department' ? departmentId : null,
        Object.prototype.hasOwnProperty.call(payload, 'measurement_unit')
          ? payload.measurement_unit
          : Object.prototype.hasOwnProperty.call(payload, 'unit')
          ? payload.unit
          : current.measurement_unit,
        direction,
        startValue,
        targetValue,
        currentValue,
        progressPercent,
        Object.prototype.hasOwnProperty.call(payload, 'weight') ? payload.weight : Number(current.weight),
        normalizeStatus(payload.status || current.status),
        id
      ]
    );

    await recalculateKpiProgress(id);

    const refreshed = await query(
      `SELECT
         km.id,
         km.cycle_id,
         c.code AS cycle_code,
         c.name AS cycle_name,
         km.code,
         km.scope_type,
         km.name,
         km.description,
         km.owner_user_id,
         u.full_name AS owner_name,
         km.department_id,
         d.name AS department_name,
         km.measurement_unit,
         km.direction,
         km.start_value,
         km.target_value,
         km.current_value,
         km.weight,
         km.status,
         km.progress_percent,
         km.created_at,
         km.updated_at
       FROM kpi_metrics km
       JOIN okr_cycles c ON c.id = km.cycle_id
       LEFT JOIN users u ON u.id = km.owner_user_id
       LEFT JOIN departments d ON d.id = km.department_id
       WHERE km.id = $1`,
      [id]
    );

    return sendSuccess(res, mapKpiRow(refreshed.rows[0]), 'KPI updated');
  } catch (error) {
    return next(error);
  }
}

async function deleteKpi(req, res, next) {
  try {
    const id = Number(req.params.id);

    const current = await query('SELECT id, owner_user_id FROM kpi_metrics WHERE id = $1', [id]);
    if (current.rowCount === 0) {
      const error = new Error('KPI not found');
      error.status = 404;
      throw error;
    }

    if (req.user.role === 'employee' && current.rows[0].owner_user_id !== req.user.id) {
      const error = new Error('Forbidden');
      error.status = 403;
      throw error;
    }

    await query('DELETE FROM kpi_metrics WHERE id = $1', [id]);
    return sendNoContent(res);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listKpis,
  createKpi,
  updateKpi,
  deleteKpi
};
