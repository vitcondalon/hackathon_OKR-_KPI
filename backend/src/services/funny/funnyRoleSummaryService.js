const { query } = require('../../config/db');
const funnyQueryService = require('./funnyQueryService');
const funnyGeminiService = require('./funnyGeminiService');
const funnyPromptService = require('./funnyPromptService');

function toNum(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function topN(items, n = 5) {
  return (items || []).slice(0, n);
}

async function getEmployeeData(user) {
  const [objectiveAgg, objectiveItems, kpiAgg, kpiItems, pendingCheckins, activeCycles] = await Promise.all([
    query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE progress_percent < 50 AND status NOT IN ('completed', 'cancelled'))::int AS low_count,
         COALESCE(ROUND(AVG(progress_percent), 2), 0) AS avg_progress
       FROM objectives
       WHERE owner_user_id = $1`,
      [user.id]
    ),
    query(
      `SELECT id, code, title, progress_percent, status
       FROM objectives
       WHERE owner_user_id = $1
       ORDER BY progress_percent ASC, updated_at DESC
       LIMIT 5`,
      [user.id]
    ),
    query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE (status = 'at_risk' OR progress_percent < 50) AND status <> 'cancelled')::int AS risky_count,
         COALESCE(ROUND(AVG(progress_percent), 2), 0) AS avg_progress
       FROM kpi_metrics
       WHERE owner_user_id = $1`,
      [user.id]
    ),
    query(
      `SELECT id, code, name, progress_percent, status
       FROM kpi_metrics
       WHERE owner_user_id = $1
       ORDER BY progress_percent ASC, updated_at DESC
       LIMIT 5`,
      [user.id]
    ),
    funnyQueryService.getPendingCheckins(user),
    funnyQueryService.getActiveCycles()
  ]);

  const myObjectives = objectiveAgg.rows[0] || { total: 0, low_count: 0, avg_progress: 0 };
  const myKpis = kpiAgg.rows[0] || { total: 0, risky_count: 0, avg_progress: 0 };
  const pending = pendingCheckins.data || { total: 0 };

  const priorities = [];
  if (toNum(pending.total) > 0) priorities.push('Complete missing check-ins first to keep progress data fresh.');
  if (toNum(myObjectives.low_count) > 0) priorities.push('Review low-progress objectives and update action plan.');
  if (toNum(myKpis.risky_count) > 0) priorities.push('Focus on at-risk KPI items and unblock execution quickly.');
  if (priorities.length === 0) priorities.push('Keep weekly check-in rhythm and maintain current delivery pace.');

  return {
    role: 'employee',
    active_cycles: activeCycles.data,
    risk_snapshot: {
      low_objectives: toNum(myObjectives.low_count),
      risky_kpis: toNum(myKpis.risky_count),
      pending_checkins: toNum(pending.total)
    },
    role_summary: {
      my_objectives: {
        total: toNum(myObjectives.total),
        avg_progress: toNum(myObjectives.avg_progress),
        low_count: toNum(myObjectives.low_count),
        items: objectiveItems.rows
      },
      my_kpis: {
        total: toNum(myKpis.total),
        avg_progress: toNum(myKpis.avg_progress),
        risky_count: toNum(myKpis.risky_count),
        items: kpiItems.rows
      },
      pending_checkins: pending,
      priorities
    }
  };
}

async function getManagerData(user) {
  const [teamUsersResult, managedDepartmentsResult] = await Promise.all([
    query(
      `SELECT id, full_name, department_id
       FROM users
       WHERE manager_user_id = $1
         AND is_active = TRUE
         AND deleted_at IS NULL`,
      [user.id]
    ),
    query(
      `SELECT id, name
       FROM departments
       WHERE manager_user_id = $1`,
      [user.id]
    )
  ]);

  const teamUserIds = teamUsersResult.rows.map((r) => r.id);
  const managedDeptIds = managedDepartmentsResult.rows.map((r) => r.id);
  const activeCycles = await funnyQueryService.getActiveCycles();

  if (teamUserIds.length === 0 && managedDeptIds.length === 0) {
    return {
      role: 'manager',
      active_cycles: activeCycles.data,
      risk_snapshot: {
        low_objectives: 0,
        risky_kpis: 0,
        pending_checkins: 0
      },
      role_summary: {
        team_size: 0,
        team_risks: [],
        low_progress_objectives: { total: 0, items: [] },
        risky_kpis: { total: 0, items: [] },
        pending_checkins: { total: 0, key_results: [], kpis: [] }
      }
    };
  }

  const [teamLowObjectives, teamRiskyKpis, teamPendingCheckins] = await Promise.all([
    query(
      `SELECT
         o.id, o.code, o.title, o.progress_percent, o.status,
         u.full_name AS owner_name,
         d.name AS department_name
       FROM objectives o
       JOIN users u ON u.id = o.owner_user_id
       LEFT JOIN departments d ON d.id = o.department_id
       WHERE o.owner_user_id = ANY($1::bigint[])
         AND o.progress_percent < 50
         AND o.status NOT IN ('completed', 'cancelled')
       ORDER BY o.progress_percent ASC, o.updated_at DESC
       LIMIT 10`,
      [teamUserIds]
    ),
    query(
      `SELECT
         km.id, km.code, km.name, km.progress_percent, km.status,
         COALESCE(u.full_name, d.name) AS owner_name,
         d.name AS department_name
       FROM kpi_metrics km
       LEFT JOIN users u ON u.id = km.owner_user_id
       LEFT JOIN departments d ON d.id = km.department_id
       WHERE (
           (km.owner_user_id = ANY($1::bigint[]))
           OR (km.department_id = ANY($2::bigint[]))
         )
         AND (km.status = 'at_risk' OR km.progress_percent < 50)
         AND km.status <> 'cancelled'
       ORDER BY km.progress_percent ASC, km.updated_at DESC
       LIMIT 10`,
      [teamUserIds, managedDeptIds]
    ),
    query(
      `WITH kr_pending AS (
         SELECT
           kr.id,
           kr.title AS name,
           u.full_name AS owner_name,
           CURRENT_DATE - COALESCE(MAX(krc.checkin_date), DATE '1970-01-01') AS stale_days,
           'key_result'::text AS item_type
         FROM key_results kr
         JOIN users u ON u.id = kr.owner_user_id
         LEFT JOIN key_result_checkins krc ON krc.key_result_id = kr.id
         WHERE kr.owner_user_id = ANY($1::bigint[])
           AND kr.status NOT IN ('completed', 'cancelled')
         GROUP BY kr.id, kr.title, u.full_name
         HAVING CURRENT_DATE - COALESCE(MAX(krc.checkin_date), DATE '1970-01-01') >= 14
       ),
       kpi_pending AS (
         SELECT
           km.id,
           km.name,
           COALESCE(u.full_name, d.name) AS owner_name,
           CURRENT_DATE - COALESCE(MAX(kc.checkin_date), DATE '1970-01-01') AS stale_days,
           'kpi'::text AS item_type
         FROM kpi_metrics km
         LEFT JOIN users u ON u.id = km.owner_user_id
         LEFT JOIN departments d ON d.id = km.department_id
         LEFT JOIN kpi_checkins kc ON kc.kpi_metric_id = km.id
         WHERE (
             (km.owner_user_id = ANY($1::bigint[]))
             OR (km.department_id = ANY($2::bigint[]))
           )
           AND km.status NOT IN ('completed', 'cancelled')
         GROUP BY km.id, km.name, COALESCE(u.full_name, d.name)
         HAVING CURRENT_DATE - COALESCE(MAX(kc.checkin_date), DATE '1970-01-01') >= 14
       )
       SELECT * FROM kr_pending
       UNION ALL
       SELECT * FROM kpi_pending
       ORDER BY stale_days DESC
       LIMIT 12`,
      [teamUserIds, managedDeptIds]
    )
  ]);

  const teamRisks = [
    {
      metric: 'low_progress_objectives',
      value: teamLowObjectives.rowCount,
      severity: teamLowObjectives.rowCount >= 4 ? 'critical' : teamLowObjectives.rowCount > 0 ? 'warning' : 'info'
    },
    {
      metric: 'risky_kpis',
      value: teamRiskyKpis.rowCount,
      severity: teamRiskyKpis.rowCount >= 3 ? 'critical' : teamRiskyKpis.rowCount > 0 ? 'warning' : 'info'
    },
    {
      metric: 'pending_checkins',
      value: teamPendingCheckins.rowCount,
      severity: teamPendingCheckins.rowCount >= 5 ? 'warning' : teamPendingCheckins.rowCount > 0 ? 'info' : 'info'
    }
  ];

  return {
    role: 'manager',
    active_cycles: activeCycles.data,
    risk_snapshot: {
      low_objectives: teamLowObjectives.rowCount,
      risky_kpis: teamRiskyKpis.rowCount,
      pending_checkins: teamPendingCheckins.rowCount
    },
    role_summary: {
      team_size: teamUserIds.length,
      team_risks: teamRisks,
      low_progress_objectives: {
        total: teamLowObjectives.rowCount,
        items: teamLowObjectives.rows
      },
      risky_kpis: {
        total: teamRiskyKpis.rowCount,
        items: teamRiskyKpis.rows
      },
      pending_checkins: {
        total: teamPendingCheckins.rowCount,
        items: teamPendingCheckins.rows
      }
    }
  };
}

async function getAdminData() {
  const [dashboard, topDepartments, topPerformers, activeCycles] = await Promise.all([
    funnyQueryService.getDashboardSummary(),
    funnyQueryService.getTopDepartments(),
    funnyQueryService.getTopPerformers(),
    funnyQueryService.getActiveCycles()
  ]);

  const attentionDepartmentsResult = await query(
    `SELECT
       department_id,
       department_name,
       ROUND((avg_objective_progress + avg_department_kpi_progress) / 2.0, 2) AS performance_score
     FROM vw_department_progress
     ORDER BY performance_score ASC, total_objectives DESC
     LIMIT 3`
  );

  const riskyCount = (dashboard.data?.risky_kpis || []).length;
  const lowCount = (dashboard.data?.low_progress_objectives || []).length;

  return {
    role: 'admin',
    active_cycles: activeCycles.data,
    dashboard: dashboard.data.summary,
    risk_snapshot: {
      low_objectives: lowCount,
      risky_kpis: riskyCount,
      pending_checkins: 0
    },
    role_summary: {
      system_overview: dashboard.data.summary,
      top_departments: topN(topDepartments.data.items, 5),
      attention_departments: attentionDepartmentsResult.rows,
      top_performers: topN(topPerformers.data.items, 5)
    }
  };
}

function buildFallbackNarrative(payload) {
  if (payload.role === 'employee') {
    return `You currently have ${payload.role_summary.my_objectives.total} objectives and ${payload.role_summary.my_kpis.total} KPIs. Focus first on pending check-ins (${payload.role_summary.pending_checkins.total}) and low-progress items.`;
  }
  if (payload.role === 'manager') {
    return `Your team has ${payload.role_summary.team_size} active members. Current risks: ${payload.role_summary.low_progress_objectives.total} low objectives, ${payload.role_summary.risky_kpis.total} risky KPIs, and ${payload.role_summary.pending_checkins.total} pending check-ins.`;
  }
  return `System overview: ${payload.dashboard?.total_users || 0} users, ${payload.dashboard?.total_departments || 0} departments, and ${payload.active_cycles?.total || 0} active cycles. Review attention departments and top performers to steer priorities.`;
}

async function buildNarrative(payload, user) {
  if (!funnyGeminiService.isConfigured()) {
    return {
      narrative: buildFallbackNarrative(payload),
      usedAI: false,
      model: null,
      fallback: true
    };
  }

  try {
    const prompt = funnyPromptService.buildRoleSummaryPrompt({
      user,
      summary: payload
    });
    const narrative = await funnyGeminiService.generateAnswer(prompt);
    return {
      narrative,
      usedAI: true,
      model: funnyGeminiService.getModelName(),
      fallback: false
    };
  } catch (error) {
    return {
      narrative: buildFallbackNarrative(payload),
      usedAI: false,
      model: null,
      fallback: true
    };
  }
}

async function getRoleSummary(user) {
  let summaryPayload;
  if (user.role === 'employee') {
    summaryPayload = await getEmployeeData(user);
  } else if (user.role === 'manager') {
    summaryPayload = await getManagerData(user);
  } else {
    summaryPayload = await getAdminData(user);
  }

  const generatedAt = new Date().toISOString();
  const narrativeMeta = await buildNarrative(summaryPayload, user);

  return {
    generated_at: generatedAt,
    role: user.role,
    active_cycles: summaryPayload.active_cycles,
    dashboard: summaryPayload.dashboard || null,
    risk_snapshot: summaryPayload.risk_snapshot,
    role_summary: summaryPayload.role_summary,
    narrative: narrativeMeta.narrative,
    narrative_meta: {
      usedAI: narrativeMeta.usedAI,
      model: narrativeMeta.model,
      fallback: narrativeMeta.fallback
    }
  };
}

module.exports = {
  getRoleSummary
};

