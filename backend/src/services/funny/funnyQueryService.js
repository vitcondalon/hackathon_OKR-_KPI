const { query } = require('../../config/db');
const { INTENTS } = require('./funnyIntentService');

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function getUserCount() {
  const result = await query(
    `SELECT
       COUNT(*)::int AS total_users,
       COUNT(*) FILTER (WHERE is_active = TRUE AND deleted_at IS NULL)::int AS active_users
     FROM users
     WHERE deleted_at IS NULL`
  );

  return {
    data: result.rows[0],
    sources: ['users'],
    chartHint: 'stat_card'
  };
}

async function getDepartmentCount() {
  const result = await query(
    `SELECT
       COUNT(*)::int AS total_departments,
       COUNT(*) FILTER (WHERE is_active = TRUE)::int AS active_departments
     FROM departments`
  );

  return {
    data: result.rows[0],
    sources: ['departments'],
    chartHint: 'stat_card'
  };
}

async function getActiveCycles() {
  const result = await query(
    `SELECT id, code, name, start_date, end_date, status
     FROM okr_cycles
     WHERE status = 'active'
     ORDER BY start_date DESC`
  );

  return {
    data: {
      total: result.rowCount,
      items: result.rows
    },
    sources: ['okr_cycles'],
    relatedEntityType: 'cycle',
    relatedEntityIds: result.rows.map((row) => row.id)
  };
}

async function getLowProgressObjectives(user) {
  const params = [50];
  let accessWhere = '';

  if (user.role === 'employee') {
    params.push(user.id);
    accessWhere = ` AND o.owner_user_id = $${params.length}`;
  }

  const result = await query(
    `SELECT
       o.id,
       o.code,
       o.title,
       o.progress_percent,
       o.status,
       c.id AS cycle_id,
       c.code AS cycle_code,
       d.id AS department_id,
       d.name AS department_name,
       u.id AS owner_user_id,
       u.full_name AS owner_name
     FROM objectives o
     JOIN okr_cycles c ON c.id = o.cycle_id
     LEFT JOIN departments d ON d.id = o.department_id
     JOIN users u ON u.id = o.owner_user_id
     WHERE o.progress_percent < $1
       AND o.status NOT IN ('completed', 'cancelled')
       ${accessWhere}
     ORDER BY o.progress_percent ASC, o.updated_at DESC
     LIMIT 15`,
    params
  );

  return {
    data: {
      threshold: 50,
      total: result.rowCount,
      items: result.rows
    },
    sources: ['objectives', 'okr_cycles', 'users', 'departments'],
    relatedEntityType: 'objective',
    relatedEntityIds: result.rows.map((row) => row.id),
    chartHint: 'table'
  };
}

async function getRiskyKpis(user) {
  const params = [50];
  let accessWhere = '';

  if (user.role === 'employee') {
    params.push(user.id);
    accessWhere = ` AND km.owner_user_id = $${params.length}`;
  }

  const result = await query(
    `SELECT
       km.id,
       km.code,
       km.name,
       km.progress_percent,
       km.status,
       km.scope_type,
       km.department_id,
       d.name AS department_name,
       km.owner_user_id,
       u.full_name AS owner_name,
       c.id AS cycle_id,
       c.code AS cycle_code
     FROM kpi_metrics km
     JOIN okr_cycles c ON c.id = km.cycle_id
     LEFT JOIN departments d ON d.id = km.department_id
     LEFT JOIN users u ON u.id = km.owner_user_id
     WHERE (km.status = 'at_risk' OR km.progress_percent < $1)
       AND km.status <> 'cancelled'
       ${accessWhere}
     ORDER BY km.progress_percent ASC, km.updated_at DESC
     LIMIT 15`,
    params
  );

  return {
    data: {
      threshold: 50,
      total: result.rowCount,
      items: result.rows
    },
    sources: ['kpi_metrics', 'okr_cycles', 'users', 'departments'],
    relatedEntityType: 'kpi',
    relatedEntityIds: result.rows.map((row) => row.id),
    chartHint: 'table'
  };
}

async function getPendingCheckins(user) {
  const params = [14];
  let ownerFilter = '';

  if (user.role === 'employee') {
    params.push(user.id);
    ownerFilter = ` AND owner_user_id = $${params.length}`;
  }

  const objectiveRows = await query(
    `SELECT
       kr.id,
       kr.code,
       kr.title,
       kr.progress_percent,
       kr.owner_user_id,
       u.full_name AS owner_name,
       COALESCE(MAX(krc.checkin_date), DATE '1970-01-01') AS last_checkin_date,
       CURRENT_DATE - COALESCE(MAX(krc.checkin_date), DATE '1970-01-01') AS stale_days
     FROM key_results kr
     JOIN users u ON u.id = kr.owner_user_id
     LEFT JOIN key_result_checkins krc ON krc.key_result_id = kr.id
     WHERE kr.status NOT IN ('completed', 'cancelled')
       ${ownerFilter}
     GROUP BY kr.id, kr.code, kr.title, kr.progress_percent, kr.owner_user_id, u.full_name
     HAVING CURRENT_DATE - COALESCE(MAX(krc.checkin_date), DATE '1970-01-01') >= $1
     ORDER BY stale_days DESC
     LIMIT 10`,
    params
  );

  const kpiRows = await query(
    `SELECT
       km.id,
       km.code,
       km.name,
       km.progress_percent,
       km.owner_user_id,
       u.full_name AS owner_name,
       COALESCE(MAX(kc.checkin_date), DATE '1970-01-01') AS last_checkin_date,
       CURRENT_DATE - COALESCE(MAX(kc.checkin_date), DATE '1970-01-01') AS stale_days
     FROM kpi_metrics km
     LEFT JOIN users u ON u.id = km.owner_user_id
     LEFT JOIN kpi_checkins kc ON kc.kpi_metric_id = km.id
     WHERE km.status NOT IN ('completed', 'cancelled')
       AND km.owner_user_id IS NOT NULL
       ${ownerFilter}
     GROUP BY km.id, km.code, km.name, km.progress_percent, km.owner_user_id, u.full_name
     HAVING CURRENT_DATE - COALESCE(MAX(kc.checkin_date), DATE '1970-01-01') >= $1
     ORDER BY stale_days DESC
     LIMIT 10`,
    params
  );

  return {
    data: {
      threshold_days: 14,
      total: objectiveRows.rowCount + kpiRows.rowCount,
      key_results: objectiveRows.rows,
      kpis: kpiRows.rows
    },
    sources: ['key_results', 'key_result_checkins', 'kpi_metrics', 'kpi_checkins', 'users'],
    relatedEntityType: 'checkin',
    relatedEntityIds: [
      ...objectiveRows.rows.map((row) => row.id),
      ...kpiRows.rows.map((row) => row.id)
    ],
    chartHint: 'table'
  };
}

async function getTopDepartments() {
  const result = await query(
    `SELECT
       department_id,
       department_code,
       department_name,
       active_member_count,
       total_objectives,
       avg_objective_progress,
       total_department_kpis,
       avg_department_kpi_progress,
       ROUND((avg_objective_progress + avg_department_kpi_progress) / 2.0, 2) AS performance_score
     FROM vw_department_progress
     ORDER BY performance_score DESC, total_objectives DESC
     LIMIT 10`
  );

  return {
    data: {
      total: result.rowCount,
      items: result.rows
    },
    sources: ['vw_department_progress'],
    relatedEntityType: 'department',
    relatedEntityIds: result.rows.map((row) => row.department_id),
    chartHint: 'bar'
  };
}

async function getTopPerformers() {
  const result = await query(
    `WITH objective_stats AS (
       SELECT
         owner_user_id AS user_id,
         COUNT(*)::int AS objective_count,
         COALESCE(ROUND(AVG(progress_percent), 2), 0) AS objective_avg_progress
       FROM objectives
       GROUP BY owner_user_id
     ),
     kpi_stats AS (
       SELECT
         owner_user_id AS user_id,
         COUNT(*)::int AS kpi_count,
         COALESCE(ROUND(AVG(progress_percent), 2), 0) AS kpi_avg_progress
       FROM kpi_metrics
       WHERE owner_user_id IS NOT NULL
       GROUP BY owner_user_id
     )
     SELECT
       u.id,
       u.full_name,
       r.code AS role,
       COALESCE(os.objective_count, 0)::int AS objective_count,
       COALESCE(ks.kpi_count, 0)::int AS kpi_count,
       COALESCE(os.objective_avg_progress, 0) AS objective_avg_progress,
       COALESCE(ks.kpi_avg_progress, 0) AS kpi_avg_progress,
       COALESCE(ROUND((COALESCE(os.objective_avg_progress, 0) + COALESCE(ks.kpi_avg_progress, 0)) / 2.0, 2), 0) AS performance_score
     FROM users u
     JOIN roles r ON r.id = u.role_id
     LEFT JOIN objective_stats os ON os.user_id = u.id
     LEFT JOIN kpi_stats ks ON ks.user_id = u.id
     WHERE u.deleted_at IS NULL
       AND u.is_active = TRUE
     ORDER BY performance_score DESC, objective_count DESC, kpi_count DESC
     LIMIT 10`
  );

  return {
    data: {
      total: result.rowCount,
      items: result.rows
    },
    sources: ['users', 'roles', 'objectives', 'kpi_metrics'],
    relatedEntityType: 'user',
    relatedEntityIds: result.rows.map((row) => row.id),
    chartHint: 'leaderboard'
  };
}

async function getDashboardSummary() {
  const [summaryResult, lowObjectives, riskyKpis, topDepartments] = await Promise.all([
    query(
      `SELECT
         (SELECT COUNT(*)::int FROM users WHERE deleted_at IS NULL) AS total_users,
         (SELECT COUNT(*)::int FROM departments WHERE is_active = TRUE) AS total_departments,
         (SELECT COUNT(*)::int FROM okr_cycles WHERE status = 'active') AS active_cycles,
         (SELECT COUNT(*)::int FROM objectives) AS total_objectives,
         (SELECT COUNT(*)::int FROM key_results) AS total_key_results,
         (SELECT COUNT(*)::int FROM kpi_metrics) AS total_kpis,
         (SELECT COALESCE(ROUND(AVG(progress_percent), 2), 0) FROM objectives) AS objective_avg_progress,
         (SELECT COALESCE(ROUND(AVG(progress_percent), 2), 0) FROM key_results) AS key_result_avg_progress,
         (SELECT COALESCE(ROUND(AVG(progress_percent), 2), 0) FROM kpi_metrics) AS kpi_avg_progress`
    ),
    query(
      `SELECT id, code, title, progress_percent, status
       FROM objectives
       WHERE progress_percent < 50
         AND status NOT IN ('completed', 'cancelled')
       ORDER BY progress_percent ASC
       LIMIT 5`
    ),
    query(
      `SELECT id, code, name, progress_percent, status
       FROM kpi_metrics
       WHERE (status = 'at_risk' OR progress_percent < 50)
         AND status <> 'cancelled'
       ORDER BY progress_percent ASC
       LIMIT 5`
    ),
    query(
      `SELECT
         department_id,
         department_code,
         department_name,
         avg_objective_progress,
         avg_department_kpi_progress
       FROM vw_department_progress
       ORDER BY (avg_objective_progress + avg_department_kpi_progress) DESC
       LIMIT 5`
    )
  ]);

  return {
    data: {
      summary: summaryResult.rows[0],
      low_progress_objectives: lowObjectives.rows,
      risky_kpis: riskyKpis.rows,
      top_departments: topDepartments.rows
    },
    sources: ['users', 'departments', 'okr_cycles', 'objectives', 'key_results', 'kpi_metrics', 'vw_department_progress'],
    chartHint: 'dashboard_bundle',
    relatedEntityType: 'dashboard',
    relatedEntityIds: []
  };
}

async function getContextForGenericAnalysis(user) {
  const [dashboard, activeCycles, topPerformers] = await Promise.all([
    getDashboardSummary(),
    getActiveCycles(),
    user.role === 'employee' ? Promise.resolve({ data: { total: 0, items: [] } }) : getTopPerformers()
  ]);

  return {
    dashboard: dashboard.data,
    active_cycles: activeCycles.data,
    top_performers: topPerformers.data
  };
}

async function getRiskSnapshot(user) {
  const [lowObjectives, riskyKpis, pendingCheckins] = await Promise.all([
    getLowProgressObjectives(user),
    getRiskyKpis(user),
    getPendingCheckins(user)
  ]);

  return {
    low_progress_objectives: lowObjectives.data,
    risky_kpis: riskyKpis.data,
    pending_checkins: pendingCheckins.data
  };
}

async function getFunnySummary(user) {
  const [dashboard, activeCycles, riskSnapshot] = await Promise.all([
    getDashboardSummary(),
    getActiveCycles(),
    getRiskSnapshot(user)
  ]);

  return {
    data: {
      generated_at: new Date().toISOString(),
      role: user.role,
      active_cycles: activeCycles.data,
      dashboard: dashboard.data.summary,
      risk_snapshot: {
        low_objectives: riskSnapshot.low_progress_objectives.total || 0,
        risky_kpis: riskSnapshot.risky_kpis.total || 0,
        pending_checkins: riskSnapshot.pending_checkins.total || 0
      },
      highlights: {
        top_low_objective: riskSnapshot.low_progress_objectives.items?.[0] || null,
        top_risky_kpi: riskSnapshot.risky_kpis.items?.[0] || null
      }
    },
    sources: ['dashboard_summary', 'active_cycles', 'risk_snapshot'],
    chartHint: 'summary_cards',
    relatedEntityType: 'dashboard',
    relatedEntityIds: []
  };
}

function buildFallbackGenericAnalysis(context) {
  const summary = context.dashboard.summary || {};
  const topDept = context.dashboard.top_departments?.[0];
  const lowObjectives = context.dashboard.low_progress_objectives || [];
  const riskyKpis = context.dashboard.risky_kpis || [];

  const sentenceParts = [
    `The system currently has ${toNumber(summary.total_users)} users and ${toNumber(summary.total_departments)} departments.`
  ];

  sentenceParts.push(`There are ${toNumber(summary.active_cycles)} active cycles.`);

  if (topDept) {
    sentenceParts.push(`The current leading department is ${topDept.department_name}.`);
  }

  if (lowObjectives.length > 0) {
    sentenceParts.push(`There are ${lowObjectives.length} objectives below 50% in the high-priority watchlist.`);
  }

  if (riskyKpis.length > 0) {
    sentenceParts.push(`There are ${riskyKpis.length} KPIs at risk or below the 50% threshold.`);
  }

  return sentenceParts.join(' ');
}

async function executeIntent(intent, user) {
  switch (intent) {
    case INTENTS.count_users:
      return getUserCount();
    case INTENTS.count_departments:
      return getDepartmentCount();
    case INTENTS.active_cycles:
      return getActiveCycles();
    case INTENTS.low_progress_objectives:
      return getLowProgressObjectives(user);
    case INTENTS.risky_kpis:
      return getRiskyKpis(user);
    case INTENTS.top_departments:
      return getTopDepartments();
    case INTENTS.top_performers:
      return getTopPerformers();
    case INTENTS.dashboard_summary:
      return getDashboardSummary();
    case INTENTS.pending_checkins:
      return getPendingCheckins(user);
    case INTENTS.explain_objective_metric:
      return getLowProgressObjectives(user);
    case INTENTS.explain_kpi_metric:
      return getRiskyKpis(user);
    default:
      return {
        data: {},
        sources: []
      };
  }
}

module.exports = {
  executeIntent,
  getContextForGenericAnalysis,
  buildFallbackGenericAnalysis,
  getUserCount,
  getDepartmentCount,
  getActiveCycles,
  getLowProgressObjectives,
  getRiskyKpis,
  getPendingCheckins,
  getTopDepartments,
  getTopPerformers,
  getDashboardSummary,
  getRiskSnapshot,
  getFunnySummary
};
