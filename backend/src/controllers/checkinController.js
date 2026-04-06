const { z } = require('zod');
const { query } = require('../config/db');
const { sendSuccess, sendCreated } = require('../utils/response');
const { calculateProgress, recalculateKeyResultProgress, recalculateKpiProgress } = require('../services/progressService');
const { mapDateOnlyFields, mapDateOnlyFieldsInList } = require('../utils/dateOnly');
const { assertEnglishBusinessPayload } = require('../utils/englishValidation');

const nullablePositiveInt = z.preprocess((value) => {
  if (value === null || value === undefined || value === '') return undefined;
  return value;
}, z.coerce.number().int().positive().optional());

const checkinSchema = z
  .object({
    key_result_id: nullablePositiveInt,
    kpi_metric_id: nullablePositiveInt,
    checkin_date: z.string().date().optional(),
    value: z.coerce.number().optional(),
    value_after: z.coerce.number().optional(),
    progress: z.coerce.number().min(0).max(100).optional(),
    progress_percent: z.coerce.number().min(0).max(100).optional(),
    confidence_level: z.coerce.number().int().min(1).max(10).optional(),
    note: z.string().trim().max(5000).optional(),
    update_note: z.string().trim().max(5000).optional(),
    blocker_note: z.string().trim().max(5000).nullable().optional()
  })
  .refine((value) => Boolean(value.key_result_id || value.kpi_metric_id), {
    message: 'key_result_id or kpi_metric_id is required',
    path: ['key_result_id']
  })
  .refine((value) => !(value.key_result_id && value.kpi_metric_id), {
    message: 'Only one of key_result_id or kpi_metric_id is allowed',
    path: ['kpi_metric_id']
  });

async function listCheckins(req, res, next) {
  try {
    const { key_result_id, kpi_metric_id } = req.query;
    const checkins = [];

    if (!kpi_metric_id) {
      const values = [];
      const conditions = [];

      if (key_result_id) {
        values.push(Number(key_result_id));
        conditions.push(`krc.key_result_id = $${values.length}`);
      }

      if (req.user.role === 'employee') {
        values.push(req.user.id);
        conditions.push(`COALESCE(kr.owner_user_id, o.owner_user_id) = $${values.length}`);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const keyResultCheckins = await query(
        `SELECT
           krc.id,
           'key_result'::text AS checkin_type,
           krc.key_result_id,
           NULL::bigint AS kpi_metric_id,
           krc.checkin_date,
           krc.value_before,
           krc.value_after,
           krc.progress_percent,
           krc.confidence_level,
           krc.update_note AS note,
           krc.blocker_note,
           krc.checkin_by_user_id AS user_id,
           u.full_name AS user_name,
           kr.title AS key_result_title,
           NULL::text AS kpi_name,
           krc.created_at
         FROM key_result_checkins krc
         JOIN key_results kr ON kr.id = krc.key_result_id
         JOIN objectives o ON o.id = kr.objective_id
         LEFT JOIN users u ON u.id = krc.checkin_by_user_id
         ${whereClause}
         ORDER BY krc.created_at DESC`,
        values
      );

      checkins.push(...keyResultCheckins.rows);
    }

    if (!key_result_id) {
      const values = [];
      const conditions = [];

      if (kpi_metric_id) {
        values.push(Number(kpi_metric_id));
        conditions.push(`kc.kpi_metric_id = $${values.length}`);
      }

      if (req.user.role === 'employee') {
        values.push(req.user.id);
        conditions.push(`km.owner_user_id = $${values.length}`);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const kpiCheckins = await query(
        `SELECT
           kc.id,
           'kpi'::text AS checkin_type,
           NULL::bigint AS key_result_id,
           kc.kpi_metric_id,
           kc.checkin_date,
           kc.value_before,
           kc.value_after,
           kc.progress_percent,
           NULL::smallint AS confidence_level,
           kc.note,
           NULL::text AS blocker_note,
           kc.checkin_by_user_id AS user_id,
           u.full_name AS user_name,
           NULL::text AS key_result_title,
           km.name AS kpi_name,
           kc.created_at
         FROM kpi_checkins kc
         JOIN kpi_metrics km ON km.id = kc.kpi_metric_id
         LEFT JOIN users u ON u.id = kc.checkin_by_user_id
         ${whereClause}
         ORDER BY kc.created_at DESC`,
        values
      );

      checkins.push(...kpiCheckins.rows);
    }

    checkins.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return sendSuccess(res, mapDateOnlyFieldsInList(checkins, ['checkin_date']));
  } catch (error) {
    return next(error);
  }
}

async function createCheckin(req, res, next) {
  try {
    const payload = checkinSchema.parse(req.body);
    assertEnglishBusinessPayload(payload, {
      note: 'Check-in note',
      update_note: 'Update note',
      blocker_note: 'Blocker note'
    });

    if (payload.key_result_id) {
      const keyResultResult = await query(
        `SELECT
           kr.id,
           kr.objective_id,
           kr.owner_user_id,
           kr.direction,
           kr.start_value,
           kr.target_value,
           kr.current_value,
           o.owner_user_id AS objective_owner_user_id
         FROM key_results kr
         JOIN objectives o ON o.id = kr.objective_id
         WHERE kr.id = $1`,
        [payload.key_result_id]
      );

      if (keyResultResult.rowCount === 0) {
        const error = new Error('Key result not found');
        error.status = 400;
        throw error;
      }

      const keyResult = keyResultResult.rows[0];
      const ownerId = keyResult.owner_user_id || keyResult.objective_owner_user_id;

      if (req.user.role === 'employee' && ownerId !== req.user.id) {
        const error = new Error('Forbidden');
        error.status = 403;
        throw error;
      }

      const valueBefore = Number(keyResult.current_value);
      const valueAfter = Object.prototype.hasOwnProperty.call(payload, 'value_after')
        ? payload.value_after
        : Object.prototype.hasOwnProperty.call(payload, 'value')
        ? payload.value
        : valueBefore;

      const calculatedProgress = calculateProgress({
        direction: keyResult.direction,
        startValue: keyResult.start_value,
        targetValue: keyResult.target_value,
        currentValue: valueAfter
      });

      const progressPercent = Object.prototype.hasOwnProperty.call(payload, 'progress_percent')
        ? payload.progress_percent
        : Object.prototype.hasOwnProperty.call(payload, 'progress')
        ? payload.progress
        : calculatedProgress;

      const note = payload.update_note || payload.note;
      if (!note) {
        const error = new Error('note or update_note is required');
        error.status = 400;
        throw error;
      }

      const inserted = await query(
        `INSERT INTO key_result_checkins (
           key_result_id,
           checkin_by_user_id,
           checkin_date,
           value_before,
           value_after,
           progress_percent,
           confidence_level,
           update_note,
           blocker_note
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         RETURNING *`,
        [
          payload.key_result_id,
          req.user.id,
          payload.checkin_date || new Date().toISOString().slice(0, 10),
          valueBefore,
          valueAfter,
          progressPercent,
          payload.confidence_level || null,
          note,
          payload.blocker_note || null
        ]
      );

      await query(
        `UPDATE key_results
         SET current_value = $1
         WHERE id = $2`,
        [valueAfter, payload.key_result_id]
      );

      await recalculateKeyResultProgress(payload.key_result_id);

      return sendCreated(
        res,
        {
          ...mapDateOnlyFields(inserted.rows[0], ['checkin_date']),
          checkin_type: 'key_result',
          note,
          value: Number(inserted.rows[0].value_after),
          progress: Number(inserted.rows[0].progress_percent)
        },
        'Check-in created'
      );
    }

    const metricResult = await query(
      `SELECT id, owner_user_id, direction, start_value, target_value, current_value
       FROM kpi_metrics
       WHERE id = $1`,
      [payload.kpi_metric_id]
    );

    if (metricResult.rowCount === 0) {
      const error = new Error('KPI metric not found');
      error.status = 400;
      throw error;
    }

    const metric = metricResult.rows[0];

    if (req.user.role === 'employee' && metric.owner_user_id !== req.user.id) {
      const error = new Error('Forbidden');
      error.status = 403;
      throw error;
    }

    const valueBefore = Number(metric.current_value);
    const valueAfter = Object.prototype.hasOwnProperty.call(payload, 'value_after')
      ? payload.value_after
      : Object.prototype.hasOwnProperty.call(payload, 'value')
      ? payload.value
      : valueBefore;

    const calculatedProgress = calculateProgress({
      direction: metric.direction,
      startValue: metric.start_value,
      targetValue: metric.target_value,
      currentValue: valueAfter
    });

    const progressPercent = Object.prototype.hasOwnProperty.call(payload, 'progress_percent')
      ? payload.progress_percent
      : Object.prototype.hasOwnProperty.call(payload, 'progress')
      ? payload.progress
      : calculatedProgress;

    const note = payload.note || payload.update_note;
    if (!note) {
      const error = new Error('note or update_note is required');
      error.status = 400;
      throw error;
    }

    const inserted = await query(
      `INSERT INTO kpi_checkins (
         kpi_metric_id,
         checkin_by_user_id,
         checkin_date,
         value_before,
         value_after,
         progress_percent,
         note
       ) VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        payload.kpi_metric_id,
        req.user.id,
        payload.checkin_date || new Date().toISOString().slice(0, 10),
        valueBefore,
        valueAfter,
        progressPercent,
        note
      ]
    );

    await query('UPDATE kpi_metrics SET current_value = $1 WHERE id = $2', [valueAfter, payload.kpi_metric_id]);
    await recalculateKpiProgress(payload.kpi_metric_id);

    return sendCreated(
      res,
      {
        ...mapDateOnlyFields(inserted.rows[0], ['checkin_date']),
        checkin_type: 'kpi',
        value: Number(inserted.rows[0].value_after),
        progress: Number(inserted.rows[0].progress_percent)
      },
      'Check-in created'
    );
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listCheckins,
  createCheckin
};
