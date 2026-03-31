const { query } = require('../config/db');

async function getSummaryMetrics() {
  const result = await query(
    `SELECT
       (SELECT COUNT(*)::int FROM users WHERE deleted_at IS NULL) AS total_users,
       (SELECT COUNT(*)::int FROM departments WHERE is_active = TRUE) AS total_departments,
       (SELECT COUNT(*)::int FROM okr_cycles WHERE status = 'active') AS active_cycles,
       (SELECT COUNT(*)::int FROM objectives) AS total_objectives,
       (SELECT COUNT(*)::int FROM key_results) AS total_key_results,
       (SELECT COUNT(*)::int FROM kpi_metrics) AS total_kpis,
       (SELECT COALESCE(ROUND(AVG(progress_percent), 2), 0) FROM objectives) AS objective_avg_progress,
       (SELECT COALESCE(ROUND(AVG(progress_percent), 2), 0) FROM key_results) AS key_result_avg_progress,
       (SELECT COALESCE(ROUND(AVG(progress_percent), 2), 0) FROM kpi_metrics) AS kpi_avg_progress,
       (SELECT COUNT(*)::int FROM key_results WHERE status = 'at_risk') AS at_risk_key_results,
       (SELECT COUNT(*)::int FROM kpi_metrics WHERE status = 'at_risk') AS at_risk_kpis`
  );

  return result.rows[0];
}

async function getProgressCollections() {
  const [objectiveStatus, keyResultStatus, kpiStatus, cycleStats] = await Promise.all([
    query('SELECT status, COUNT(*)::int AS count FROM objectives GROUP BY status ORDER BY status'),
    query('SELECT status, COUNT(*)::int AS count FROM key_results GROUP BY status ORDER BY status'),
    query('SELECT status, COUNT(*)::int AS count FROM kpi_metrics GROUP BY status ORDER BY status'),
    query(
      `SELECT
         cycle_id,
         cycle_code,
         cycle_name,
         status,
         total_objectives,
         completed_objectives,
         objective_completion_rate,
         total_key_results,
         avg_key_result_progress,
         total_kpis,
         avg_kpi_progress
       FROM vw_cycle_dashboard_stats
       ORDER BY cycle_code DESC`
    )
  ]);

  return {
    objective_status: objectiveStatus.rows,
    key_result_status: keyResultStatus.rows,
    kpi_status: kpiStatus.rows,
    cycle_stats: cycleStats.rows
  };
}

async function getRiskCollections() {
  const [riskyKeyResults, riskyKpis] = await Promise.all([
    query(
      `SELECT
         key_result_id,
         key_result_code,
         key_result_title,
         objective_id,
         objective_code,
         objective_title,
         cycle_id,
         cycle_code,
         cycle_status,
         progress_percent,
         status,
         'key_result'::text AS item_type
       FROM vw_risky_key_results
       ORDER BY progress_percent ASC
       LIMIT 10`
    ),
    query(
      `SELECT
         km.id AS kpi_metric_id,
         km.code AS kpi_code,
         km.name AS kpi_name,
         km.progress_percent,
         km.status,
         km.scope_type,
         c.id AS cycle_id,
         c.code AS cycle_code,
         c.status AS cycle_status,
         'kpi'::text AS item_type
       FROM kpi_metrics km
       JOIN okr_cycles c ON c.id = km.cycle_id
       WHERE km.status IN ('at_risk', 'on_track', 'active')
         AND km.progress_percent < 50
       ORDER BY km.progress_percent ASC
       LIMIT 10`
    )
  ]);

  return {
    key_results: riskyKeyResults.rows,
    kpis: riskyKpis.rows
  };
}

async function getLeaderboardCollections() {
  const [users, departments] = await Promise.all([
    query(
      `SELECT
         u.id,
         u.full_name,
         r.code AS role,
         COALESCE(ROUND(AVG(o.progress_percent), 2), 0) AS objective_avg_progress,
         COALESCE(ROUND(AVG(km.progress_percent), 2), 0) AS kpi_avg_progress,
         COUNT(DISTINCT o.id)::int AS objective_count,
         COUNT(DISTINCT km.id)::int AS kpi_count
       FROM users u
       JOIN roles r ON r.id = u.role_id
       LEFT JOIN objectives o ON o.owner_user_id = u.id
       LEFT JOIN kpi_metrics km ON km.owner_user_id = u.id
       WHERE u.deleted_at IS NULL
         AND u.is_active = TRUE
       GROUP BY u.id, r.code
       ORDER BY (COALESCE(AVG(o.progress_percent), 0) + COALESCE(AVG(km.progress_percent), 0)) DESC,
                COUNT(DISTINCT o.id) DESC,
                COUNT(DISTINCT km.id) DESC
       LIMIT 10`
    ),
    query(
      `SELECT
         department_id,
         department_code,
         department_name,
         active_member_count,
         total_objectives,
         avg_objective_progress,
         total_department_kpis,
         avg_department_kpi_progress
       FROM vw_department_progress
       ORDER BY (avg_objective_progress + avg_department_kpi_progress) DESC,
                total_objectives DESC
       LIMIT 10`
    )
  ]);

  return {
    users: users.rows,
    departments: departments.rows
  };
}

async function getChartCollections() {
  const [objectiveByCycle, kpiDistribution, departmentPerformance, checkinTrend] = await Promise.all([
    query(
      `SELECT
         cycle_code AS label,
         total_objectives,
         total_key_results,
         total_kpis,
         objective_completion_rate,
         avg_key_result_progress,
         avg_kpi_progress
       FROM vw_cycle_dashboard_stats
       ORDER BY cycle_code`
    ),
    query(
      `SELECT
         scope_type,
         status,
         COUNT(*)::int AS count
       FROM kpi_metrics
       GROUP BY scope_type, status
       ORDER BY scope_type, status`
    ),
    query(
      `SELECT
         department_code AS label,
         avg_objective_progress,
         avg_department_kpi_progress,
         active_member_count
       FROM vw_department_progress
       ORDER BY department_code`
    ),
    query(
      `WITH all_checkins AS (
         SELECT date_trunc('week', checkin_date)::date AS week, 1 AS kr_count, 0 AS kpi_count
         FROM key_result_checkins
         UNION ALL
         SELECT date_trunc('week', checkin_date)::date AS week, 0 AS kr_count, 1 AS kpi_count
         FROM kpi_checkins
       )
       SELECT
         week,
         SUM(kr_count)::int AS key_result_checkins,
         SUM(kpi_count)::int AS kpi_checkins
       FROM all_checkins
       GROUP BY week
       ORDER BY week`
    )
  ]);

  return {
    objective_by_cycle: objectiveByCycle.rows,
    kpi_distribution: kpiDistribution.rows,
    department_performance: departmentPerformance.rows,
    checkin_trend: checkinTrend.rows
  };
}

async function getSummary() {
  return getSummaryMetrics();
}

async function getProgressOverview() {
  return getProgressCollections();
}

async function getRisks() {
  return getRiskCollections();
}

async function getTopPerformers() {
  return getLeaderboardCollections();
}

async function getCharts() {
  return getChartCollections();
}

module.exports = {
  getSummary,
  getProgressOverview,
  getRisks,
  getTopPerformers,
  getCharts,
  getSummaryMetrics,
  getProgressCollections,
  getRiskCollections,
  getLeaderboardCollections,
  getChartCollections
};
