const { z } = require('zod');
const { query } = require('../config/db');
const { sendSuccess, sendCreated, sendNoContent } = require('../utils/response');
const { mapDateOnlyFields, mapDateOnlyFieldsInList } = require('../utils/dateOnly');
const { assertEnglishBusinessPayload } = require('../utils/englishValidation');

const cycleSchema = z.object({
  code: z.string().trim().min(3).max(30).optional(),
  name: z.string().trim().min(2).max(255),
  start_date: z.string().min(1),
  end_date: z.string().min(1),
  status: z.enum(['planning', 'active', 'closed']).default('planning')
});

const updateCycleSchema = cycleSchema.partial();

function buildCycleCode(startDate) {
  const date = new Date(startDate);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const quarter = Math.floor((month - 1) / 3) + 1;
  return `${year}-Q${quarter}`;
}

function validateDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end >= start;
}

function normalizeDateInput(value) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

async function uniqueCycleCode(candidateCode, excludeId = null) {
  let code = candidateCode;
  let index = 1;

  while (true) {
    const params = excludeId ? [code, excludeId] : [code];
    const where = excludeId ? 'code = $1 AND id <> $2' : 'code = $1';
    const found = await query(`SELECT id FROM okr_cycles WHERE ${where}`, params);
    if (found.rowCount === 0) {
      return code;
    }

    code = `${candidateCode}-${index}`;
    index += 1;
  }
}

async function listCycles(req, res, next) {
  try {
    const result = await query(
      `SELECT
         c.id,
         c.code,
         c.name,
         c.start_date,
         c.end_date,
         c.status,
         c.created_by_user_id,
         u.full_name AS created_by_name,
         c.created_at,
         c.updated_at
       FROM okr_cycles c
       LEFT JOIN users u ON u.id = c.created_by_user_id
       ORDER BY c.start_date DESC, c.id DESC`
    );

    return sendSuccess(res, mapDateOnlyFieldsInList(result.rows, ['start_date', 'end_date']));
  } catch (error) {
    return next(error);
  }
}

async function createCycle(req, res, next) {
  try {
    const payload = cycleSchema.parse(req.body);
    assertEnglishBusinessPayload(payload, {
      code: 'Cycle code',
      name: 'Cycle name'
    });
    const startDate = normalizeDateInput(payload.start_date);
    const endDate = normalizeDateInput(payload.end_date);

    if (!startDate || !endDate || !validateDateRange(startDate, endDate)) {
      const error = new Error('end_date must be on or after start_date');
      error.status = 400;
      throw error;
    }

    const rawCode = payload.code || buildCycleCode(startDate);
    const cycleCode = await uniqueCycleCode(rawCode.toUpperCase());

    const result = await query(
      `INSERT INTO okr_cycles (code, name, start_date, end_date, status, created_by_user_id)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [cycleCode, payload.name, startDate, endDate, payload.status, req.user.id]
    );

    return sendCreated(res, mapDateOnlyFields(result.rows[0], ['start_date', 'end_date']), 'Cycle created');
  } catch (error) {
    return next(error);
  }
}

async function updateCycle(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      const error = new Error('Invalid cycle id');
      error.status = 400;
      throw error;
    }

    const payload = updateCycleSchema.parse(req.body);
    assertEnglishBusinessPayload(payload, {
      code: 'Cycle code',
      name: 'Cycle name'
    });

    const currentResult = await query('SELECT * FROM okr_cycles WHERE id = $1', [id]);
    if (currentResult.rowCount === 0) {
      const error = new Error('Cycle not found');
      error.status = 404;
      throw error;
    }

    const current = currentResult.rows[0];
    const startDate = Object.prototype.hasOwnProperty.call(payload, 'start_date')
      ? normalizeDateInput(payload.start_date)
      : normalizeDateInput(current.start_date);
    const endDate = Object.prototype.hasOwnProperty.call(payload, 'end_date')
      ? normalizeDateInput(payload.end_date)
      : normalizeDateInput(current.end_date);

    if (!startDate || !endDate || !validateDateRange(startDate, endDate)) {
      const error = new Error('end_date must be on or after start_date');
      error.status = 400;
      throw error;
    }

    const nextCode = payload.code
      ? await uniqueCycleCode(payload.code.toUpperCase(), id)
      : current.code;

    const result = await query(
      `UPDATE okr_cycles
       SET code = $1,
           name = $2,
           start_date = $3,
           end_date = $4,
           status = $5
       WHERE id = $6
       RETURNING *`,
      [nextCode, payload.name || current.name, startDate, endDate, payload.status || current.status, id]
    );

    return sendSuccess(res, mapDateOnlyFields(result.rows[0], ['start_date', 'end_date']), 'Cycle updated');
  } catch (error) {
    return next(error);
  }
}

async function deleteCycle(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      const error = new Error('Invalid cycle id');
      error.status = 400;
      throw error;
    }

    const current = await query('SELECT id FROM okr_cycles WHERE id = $1', [id]);
    if (current.rowCount === 0) {
      const error = new Error('Cycle not found');
      error.status = 404;
      throw error;
    }

    const [objectiveCount, kpiCount] = await Promise.all([
      query('SELECT COUNT(*)::int AS total FROM objectives WHERE cycle_id = $1', [id]),
      query('SELECT COUNT(*)::int AS total FROM kpi_metrics WHERE cycle_id = $1', [id])
    ]);

    const linkedObjectives = Number(objectiveCount.rows[0]?.total || 0);
    const linkedKpis = Number(kpiCount.rows[0]?.total || 0);

    if (linkedObjectives > 0 || linkedKpis > 0) {
      const error = new Error('Cannot delete cycle with linked objectives or KPI metrics');
      error.status = 400;
      throw error;
    }

    await query('DELETE FROM okr_cycles WHERE id = $1', [id]);
    return sendNoContent(res);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listCycles,
  createCycle,
  updateCycle,
  deleteCycle
};
