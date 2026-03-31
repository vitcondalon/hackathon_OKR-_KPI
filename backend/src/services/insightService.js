const funnyQueryService = require('./funny/funnyQueryService');

const SEVERITY_SCORE = {
  critical: 3,
  warning: 2,
  info: 1
};

function safeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function byPriority(a, b) {
  const sa = SEVERITY_SCORE[a.severity] || 0;
  const sb = SEVERITY_SCORE[b.severity] || 0;
  if (sa !== sb) return sb - sa;
  return safeNumber(b.value) - safeNumber(a.value);
}

function toInsightCards(feed) {
  return feed.map((item) => ({
    id: item.id,
    type: item.type,
    label: item.title,
    value: item.value,
    severity: item.severity,
    targetRoute: item.targetRoute
  }));
}

async function getInsightOverview(user, { limit = 5 } = {}) {
  const [lowObjectives, riskyKpis, pendingCheckins, activeCycles, topPerformers, topDepartments] = await Promise.all([
    funnyQueryService.getLowProgressObjectives(user),
    funnyQueryService.getRiskyKpis(user),
    funnyQueryService.getPendingCheckins(user),
    funnyQueryService.getActiveCycles(),
    user.role === 'employee' ? Promise.resolve({ data: { total: 0, items: [] } }) : funnyQueryService.getTopPerformers(),
    user.role === 'employee' ? Promise.resolve({ data: { total: 0, items: [] } }) : funnyQueryService.getTopDepartments()
  ]);

  const lowTotal = safeNumber(lowObjectives.data?.total);
  const riskyTotal = safeNumber(riskyKpis.data?.total);
  const pendingTotal = safeNumber(pendingCheckins.data?.total);
  const activeCycleTotal = safeNumber(activeCycles.data?.total);

  const feed = [];

  if (riskyTotal > 0) {
    feed.push({
      id: 'risky-kpis',
      type: 'risk',
      severity: riskyTotal >= 3 ? 'critical' : 'warning',
      title: 'Risky KPI alert',
      message: `${riskyTotal} KPI items are at risk or below threshold.`,
      value: riskyTotal,
      metric: 'risky_kpis',
      targetRoute: '/kpis',
      relatedEntityType: 'kpi',
      relatedEntityIds: riskyKpis.data?.items?.map((item) => item.id).slice(0, 10) || []
    });
  }

  if (lowTotal > 0) {
    feed.push({
      id: 'low-objectives',
      type: 'risk',
      severity: lowTotal >= 4 ? 'critical' : 'warning',
      title: 'Low objective progress',
      message: `${lowTotal} objectives are below ${lowObjectives.data?.threshold || 50}% progress.`,
      value: lowTotal,
      metric: 'low_progress_objectives',
      targetRoute: '/objectives',
      relatedEntityType: 'objective',
      relatedEntityIds: lowObjectives.data?.items?.map((item) => item.id).slice(0, 10) || []
    });
  }

  if (pendingTotal > 0) {
    feed.push({
      id: 'pending-checkins',
      type: 'followup',
      severity: pendingTotal >= 5 ? 'warning' : 'info',
      title: 'Pending check-ins',
      message: `${pendingTotal} KR/KPI items are missing updates in the recent period.`,
      value: pendingTotal,
      metric: 'pending_checkins',
      targetRoute: '/checkins',
      relatedEntityType: 'checkin',
      relatedEntityIds: pendingCheckins.relatedEntityIds || []
    });
  }

  feed.push({
    id: 'active-cycles',
    type: 'cycle',
    severity: activeCycleTotal > 0 ? 'info' : 'warning',
    title: 'Cycle status',
    message:
      activeCycleTotal > 0
        ? `${activeCycleTotal} active cycle(s) are currently running.`
        : 'No active cycles found. Consider activating a cycle.',
    value: activeCycleTotal,
    metric: 'active_cycles',
    targetRoute: '/cycles',
    relatedEntityType: 'cycle',
    relatedEntityIds: activeCycles.data?.items?.map((item) => item.id).slice(0, 10) || []
  });

  if ((topPerformers.data?.items || []).length > 0) {
    const topUser = topPerformers.data.items[0];
    feed.push({
      id: 'top-performer',
      type: 'performance',
      severity: 'info',
      title: 'Top performer',
      message: `${topUser.full_name} is leading with score ${safeNumber(topUser.performance_score).toFixed(2)}.`,
      value: safeNumber(topUser.performance_score),
      metric: 'top_performer_score',
      targetRoute: '/users',
      relatedEntityType: 'user',
      relatedEntityIds: [topUser.id]
    });
  }

  if ((topDepartments.data?.items || []).length > 0) {
    const topDept = topDepartments.data.items[0];
    feed.push({
      id: 'top-department',
      type: 'performance',
      severity: 'info',
      title: 'Top department',
      message: `${topDept.department_name} is currently leading department performance.`,
      value: safeNumber(topDept.performance_score || topDept.avg_objective_progress),
      metric: 'top_department_score',
      targetRoute: '/departments',
      relatedEntityType: 'department',
      relatedEntityIds: [topDept.department_id]
    });
  }

  const topFeed = feed.sort(byPriority).slice(0, Math.max(3, Math.min(5, limit)));

  return {
    generatedAt: new Date().toISOString(),
    role: user.role,
    metrics: {
      lowProgressObjectives: lowTotal,
      riskyKpis: riskyTotal,
      pendingCheckins: pendingTotal,
      activeCycles: activeCycleTotal
    },
    feed: topFeed,
    insights: toInsightCards(topFeed)
  };
}

module.exports = {
  getInsightOverview
};

