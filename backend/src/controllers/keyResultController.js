const { z } = require('zod');
const { query } = require('../config/db');
const { sendSuccess, sendCreated, sendNoContent } = require('../utils/response');
const { calculateProgress, recalculateObjectiveProgress, recalculateKeyResultProgress } = require('../services/progressService');
const { assertEnglishBusinessPayload } = require('../utils/englishValidation');

const keyResultStatusSchema = z.enum(['draft', 'on_track', 'at_risk', 'completed', 'cancelled', 'active']);

const keyResultSchema = z.object({
  objective_id: z.coerce.number().int().positive(),
  code: z.string().trim().min(1).max(40).optional(),
  title: z.string().trim().min(3),
  description: z.string().trim().max(5000).nullable().optional(),
  owner_id: z.coerce.number().int().positive().nullable().optional(),
  owner_user_id: z.coerce.number().int().positive().nullable().optional(),
  measurement_unit: z.string().trim().max(30).nullable().optional(),
  unit: z.string().trim().max(30).nullable().optional(),
  direction: z.enum(['increase', 'decrease', 'maintain']).default('increase'),
  start_value: z.coerce.number().optional(),
  target_value: z.coerce.number(),
  current_value: z.coerce.number().optional(),
  status: keyResultStatusSchema.default('draft'),
  weight: z.coerce.number().positive().max(100).optional()
});

const updateKeyResultSchema = keyResultSchema.partial();

function normalizeStatus(status) {
  if (!status) return status;
  if (status === 'active') return 'on_track';
  return status;
}

async function assertObjective(objectiveId) {
  const result = await query('SELECT id, owner_user_id FROM objectives WHERE id = $1', [objectiveId]);
  if (result.rowCount === 0) {
    const error = new Error('Objective not found');
    error.status = 400;
    throw error;
  }
  return result.rows[0];
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

async function uniqueKeyResultCode(objectiveId, candidateCode, excludeId = null) {
  let code = candidateCode;
  let index = 1;

  while (true) {
    const params = excludeId ? [objectiveId, code, excludeId] : [objectiveId, code];
    const where = excludeId
      ? 'objective_id = $1 AND code = $2 AND id <> $3'
      : 'objective_id = $1 AND code = $2';

    const found = await query(`SELECT id FROM key_results WHERE ${where}`, params);
    if (found.rowCount === 0) {
      return code;
    }

    code = `${candidateCode}-${index}`;
    index += 1;
  }
}

function mapKeyResultRow(row) {
  return {
    id: row.id,
    objective_id: row.objective_id,
    objective_code: row.objective_code,
    objective_title: row.objective_title,
    code: row.code,
    title: row.title,
    description: row.description,
    owner_id: row.owner_user_id,
    owner_user_id: row.owner_user_id,
    owner_name: row.owner_name,
    direction: row.direction,
    start_value: Number(row.start_value),
    target_value: Number(row.target_value),
    current_value: Number(row.current_value),
    unit: row.measurement_unit,
    measurement_unit: row.measurement_unit,
    progress: Number(row.progress_percent),
    progress_percent: Number(row.progress_percent),
    status: row.status,
    weight: Number(row.weight),
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

async function listKeyResults(req, res, next) {
  try {
    const { objective_id, status, owner_id, owner_user_id } = req.query;
    const values = [];
    const conditions = [];

    if (objective_id) {
      values.push(Number(objective_id));
      conditions.push(`kr.objective_id = $${values.length}`);
    }

    if (status) {
      values.push(normalizeStatus(String(status)));
      conditions.push(`kr.status = $${values.length}`);
    }

    const ownerFilter = owner_user_id || owner_id;
    if (ownerFilter) {
      values.push(Number(ownerFilter));
      conditions.push(`kr.owner_user_id = $${values.length}`);
    }

    if (req.user.role === 'employee') {
      values.push(req.user.id);
      conditions.push(`COALESCE(kr.owner_user_id, o.owner_user_id) = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await query(
      `SELECT
         kr.id,
         kr.objective_id,
         o.code AS objective_code,
         o.title AS objective_title,
         kr.code,
         kr.title,
         kr.description,
         kr.owner_user_id,
         u.full_name AS owner_name,
         kr.direction,
         kr.start_value,
         kr.target_value,
         kr.current_value,
         kr.measurement_unit,
         kr.progress_percent,
         kr.status,
         kr.weight,
         kr.created_at,
         kr.updated_at
       FROM key_results kr
       JOIN objectives o ON o.id = kr.objective_id
       LEFT JOIN users u ON u.id = kr.owner_user_id
       ${whereClause}
       ORDER BY kr.id DESC`,
      values
    );

    return sendSuccess(res, result.rows.map(mapKeyResultRow));
  } catch (error) {
    return next(error);
  }
}

async function createKeyResult(req, res, next) {
  try {
    const payload = keyResultSchema.parse(req.body);
    assertEnglishBusinessPayload(payload, {
      code: 'Key result code',
      title: 'Key result title',
      description: 'Key result description',
      measurement_unit: 'Measurement unit',
      unit: 'Measurement unit'
    });

    const objective = await assertObjective(payload.objective_id);
    if (req.user.role === 'employee' && objective.owner_user_id !== req.user.id) {
      const error = new Error('Forbidden');
      error.status = 403;
      throw error;
    }

    const ownerUserId = payload.owner_user_id ?? payload.owner_id ?? objective.owner_user_id;
    await assertOwner(ownerUserId);

    const startValue = Object.prototype.hasOwnProperty.call(payload, 'start_value') ? payload.start_value : 0;
    const currentValue = Object.prototype.hasOwnProperty.call(payload, 'current_value') ? payload.current_value : startValue;

    const progressPercent = calculateProgress({
      direction: payload.direction,
      startValue,
      targetValue: payload.target_value,
      currentValue
    });

    const code = await uniqueKeyResultCode(
      payload.objective_id,
      (payload.code || 'KR').toUpperCase()
    );

    const created = await query(
      `INSERT INTO key_results (
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
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING id`,
      [
        payload.objective_id,
        code,
        payload.title,
        payload.description || null,
        ownerUserId || null,
        payload.measurement_unit || payload.unit || null,
        payload.direction,
        startValue,
        payload.target_value,
        currentValue,
        progressPercent,
        normalizeStatus(payload.status),
        payload.weight || 1
      ]
    );

    await recalculateKeyResultProgress(created.rows[0].id);

    const inserted = await query(
      `SELECT
         kr.id,
         kr.objective_id,
         o.code AS objective_code,
         o.title AS objective_title,
         kr.code,
         kr.title,
         kr.description,
         kr.owner_user_id,
         u.full_name AS owner_name,
         kr.direction,
         kr.start_value,
         kr.target_value,
         kr.current_value,
         kr.measurement_unit,
         kr.progress_percent,
         kr.status,
         kr.weight,
         kr.created_at,
         kr.updated_at
       FROM key_results kr
       JOIN objectives o ON o.id = kr.objective_id
       LEFT JOIN users u ON u.id = kr.owner_user_id
       WHERE kr.id = $1`,
      [created.rows[0].id]
    );

    return sendCreated(res, mapKeyResultRow(inserted.rows[0]), 'Key result created');
  } catch (error) {
    return next(error);
  }
}

async function updateKeyResult(req, res, next) {
  try {
    const id = Number(req.params.id);
    const payload = updateKeyResultSchema.parse(req.body);
    assertEnglishBusinessPayload(payload, {
      code: 'Key result code',
      title: 'Key result title',
      description: 'Key result description',
      measurement_unit: 'Measurement unit',
      unit: 'Measurement unit'
    });

    const currentResult = await query('SELECT * FROM key_results WHERE id = $1', [id]);
    if (currentResult.rowCount === 0) {
      const error = new Error('Key result not found');
      error.status = 404;
      throw error;
    }

    const current = currentResult.rows[0];

    const objectiveId = Object.prototype.hasOwnProperty.call(payload, 'objective_id')
      ? payload.objective_id
      : current.objective_id;

    const objective = await assertObjective(objectiveId);
    if (req.user.role === 'employee' && objective.owner_user_id !== req.user.id) {
      const error = new Error('Forbidden');
      error.status = 403;
      throw error;
    }

    const ownerUserId = Object.prototype.hasOwnProperty.call(payload, 'owner_user_id')
      ? payload.owner_user_id
      : Object.prototype.hasOwnProperty.call(payload, 'owner_id')
      ? payload.owner_id
      : current.owner_user_id;

    await assertOwner(ownerUserId);

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
      ? await uniqueKeyResultCode(objectiveId, payload.code.toUpperCase(), id)
      : objectiveId === current.objective_id
      ? current.code
      : await uniqueKeyResultCode(objectiveId, current.code, id);

    await query(
      `UPDATE key_results
       SET objective_id = $1,
           code = $2,
           title = $3,
           description = $4,
           owner_user_id = $5,
           measurement_unit = $6,
           direction = $7,
           start_value = $8,
           target_value = $9,
           current_value = $10,
           progress_percent = $11,
           status = $12,
           weight = $13
       WHERE id = $14`,
      [
        objectiveId,
        code,
        payload.title || current.title,
        Object.prototype.hasOwnProperty.call(payload, 'description') ? payload.description : current.description,
        ownerUserId || null,
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
        normalizeStatus(payload.status || current.status),
        Object.prototype.hasOwnProperty.call(payload, 'weight') ? payload.weight : Number(current.weight),
        id
      ]
    );

    await recalculateKeyResultProgress(id);
    if (objectiveId !== current.objective_id) {
      await recalculateObjectiveProgress(current.objective_id);
      await recalculateObjectiveProgress(objectiveId);
    }

    const refreshed = await query(
      `SELECT
         kr.id,
         kr.objective_id,
         o.code AS objective_code,
         o.title AS objective_title,
         kr.code,
         kr.title,
         kr.description,
         kr.owner_user_id,
         u.full_name AS owner_name,
         kr.direction,
         kr.start_value,
         kr.target_value,
         kr.current_value,
         kr.measurement_unit,
         kr.progress_percent,
         kr.status,
         kr.weight,
         kr.created_at,
         kr.updated_at
       FROM key_results kr
       JOIN objectives o ON o.id = kr.objective_id
       LEFT JOIN users u ON u.id = kr.owner_user_id
       WHERE kr.id = $1`,
      [id]
    );

    return sendSuccess(res, mapKeyResultRow(refreshed.rows[0]), 'Key result updated');
  } catch (error) {
    return next(error);
  }
}

async function deleteKeyResult(req, res, next) {
  try {
    const id = Number(req.params.id);

    const currentResult = await query(
      `SELECT kr.id, kr.objective_id, o.owner_user_id
       FROM key_results kr
       JOIN objectives o ON o.id = kr.objective_id
       WHERE kr.id = $1`,
      [id]
    );

    if (currentResult.rowCount === 0) {
      const error = new Error('Key result not found');
      error.status = 404;
      throw error;
    }

    const current = currentResult.rows[0];
    if (req.user.role === 'employee' && current.owner_user_id !== req.user.id) {
      const error = new Error('Forbidden');
      error.status = 403;
      throw error;
    }

    await query('DELETE FROM key_results WHERE id = $1', [id]);
    await recalculateObjectiveProgress(current.objective_id);

    return sendNoContent(res);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listKeyResults,
  createKeyResult,
  updateKeyResult,
  deleteKeyResult
};
