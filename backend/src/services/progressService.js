const { query } = require('../config/db');

function clampProgress(value) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return 0;
  if (parsed < 0) return 0;
  if (parsed > 100) return 100;
  return Math.round(parsed * 100) / 100;
}

function calculateProgress({ direction = 'increase', startValue = 0, targetValue = 0, currentValue = 0 }) {
  const start = Number(startValue);
  const target = Number(targetValue);
  const current = Number(currentValue);

  if (direction === 'maintain') {
    const baseline = Math.abs(target) || 1;
    const delta = Math.abs(current - target);
    const score = 100 - (delta / baseline) * 100;
    return clampProgress(score);
  }

  if (direction === 'decrease') {
    const denominator = start - target;
    if (denominator === 0) {
      return clampProgress(current <= target ? 100 : 0);
    }
    return clampProgress(((start - current) / denominator) * 100);
  }

  const denominator = target - start;
  if (denominator === 0) {
    return clampProgress(current >= target ? 100 : 0);
  }

  return clampProgress(((current - start) / denominator) * 100);
}

function deriveStatus(progressPercent, fallbackStatus) {
  if (fallbackStatus === 'draft' || fallbackStatus === 'cancelled') {
    return fallbackStatus;
  }
  if (progressPercent >= 100) {
    return 'completed';
  }
  if (progressPercent < 40) {
    return 'at_risk';
  }
  return 'on_track';
}

async function recalculateObjectiveProgress(objectiveId) {
  const result = await query(
    `SELECT COALESCE(AVG(progress_percent), 0) AS avg_progress
     FROM key_results
     WHERE objective_id = $1`,
    [objectiveId]
  );

  const row = result.rows[0];
  const progressPercent = clampProgress(row.avg_progress);

  await query(
    `UPDATE objectives
     SET progress_percent = $1::numeric,
         status = CASE
           WHEN status IN ('draft', 'cancelled') THEN status
           WHEN $1::numeric >= 100::numeric THEN 'completed'
           WHEN $1::numeric < 40::numeric THEN 'at_risk'
           ELSE 'on_track'
         END
     WHERE id = $2`,
    [progressPercent, objectiveId]
  );

  return progressPercent;
}

async function recalculateKeyResultProgress(keyResultId) {
  const result = await query(
    `SELECT id, objective_id, direction, start_value, target_value, current_value, status
     FROM key_results
     WHERE id = $1`,
    [keyResultId]
  );

  const keyResult = result.rows[0];
  if (!keyResult) {
    return null;
  }

  const progressPercent = calculateProgress({
    direction: keyResult.direction,
    startValue: keyResult.start_value,
    targetValue: keyResult.target_value,
    currentValue: keyResult.current_value
  });

  await query(
    `UPDATE key_results
     SET progress_percent = $1::numeric,
         status = $2
     WHERE id = $3`,
    [progressPercent, deriveStatus(progressPercent, keyResult.status), keyResult.id]
  );

  await recalculateObjectiveProgress(keyResult.objective_id);

  return progressPercent;
}

async function recalculateKpiProgress(kpiMetricId) {
  const result = await query(
    `SELECT id, direction, start_value, target_value, current_value, status
     FROM kpi_metrics
     WHERE id = $1`,
    [kpiMetricId]
  );

  const metric = result.rows[0];
  if (!metric) {
    return null;
  }

  const progressPercent = calculateProgress({
    direction: metric.direction,
    startValue: metric.start_value,
    targetValue: metric.target_value,
    currentValue: metric.current_value
  });

  await query(
    `UPDATE kpi_metrics
     SET progress_percent = $1::numeric,
         status = $2
     WHERE id = $3`,
    [progressPercent, deriveStatus(progressPercent, metric.status), metric.id]
  );

  return progressPercent;
}

module.exports = {
  clampProgress,
  calculateProgress,
  recalculateObjectiveProgress,
  recalculateKeyResultProgress,
  recalculateKpiProgress
};
