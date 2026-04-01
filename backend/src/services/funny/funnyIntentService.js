const INTENTS = {
  count_users: 'count_users',
  count_departments: 'count_departments',
  active_cycles: 'active_cycles',
  low_progress_objectives: 'low_progress_objectives',
  risky_kpis: 'risky_kpis',
  pending_checkins: 'pending_checkins',
  top_departments: 'top_departments',
  top_performers: 'top_performers',
  dashboard_summary: 'dashboard_summary',
  explain_kpi_progress: 'explain_kpi_progress',
  explain_objective_progress: 'explain_objective_progress',
  explain_at_risk: 'explain_at_risk',
  explain_checkin: 'explain_checkin',
  explain_dashboard_summary: 'explain_dashboard_summary',
  explain_objective_metric: 'explain_objective_metric',
  explain_kpi_metric: 'explain_kpi_metric',
  generic_analysis: 'generic_analysis'
};

const PRIORITY = [
  INTENTS.count_users,
  INTENTS.count_departments,
  INTENTS.active_cycles,
  INTENTS.risky_kpis,
  INTENTS.pending_checkins,
  INTENTS.low_progress_objectives,
  INTENTS.top_departments,
  INTENTS.top_performers,
  INTENTS.explain_kpi_progress,
  INTENTS.explain_objective_progress,
  INTENTS.explain_at_risk,
  INTENTS.explain_checkin,
  INTENTS.explain_dashboard_summary,
  INTENTS.explain_objective_metric,
  INTENTS.explain_kpi_metric,
  INTENTS.dashboard_summary,
  INTENTS.generic_analysis
];

function normalizeInput(message) {
  return (message || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u0111\u0110]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9%\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasAny(text, patterns) {
  return patterns.some((pattern) => text.includes(pattern));
}

function scoreIntent(text) {
  const scores = Object.values(INTENTS).reduce((acc, intent) => {
    acc[intent] = 0;
    return acc;
  }, {});

  const hasCountWord = hasAny(text, ['bao nhieu', 'so luong', 'dem', 'count']);
  const hasTopWord = hasAny(text, ['top', 'tot nhat', 'cao nhat', 'noi bat', 'dan dau']);
  const hasRiskWord = hasAny(text, ['rui ro', 'at risk', 'risk', 'duoi 50', 'thap']);
  const hasSummaryWord = hasAny(text, ['tom tat', 'tong quan', 'tong hop', 'dashboard']);
  const hasAnalysisWord = hasAny(text, ['phan tich', 'nhan dinh', 'giai thich', 'xu huong', 'analysis']);
  const hasExplainWord = hasAny(text, ['explain', 'giai thich', 'tai sao', 'why']);
  const hasPendingWord = hasAny(text, ['pending', 'chua checkin', 'missing checkin', 'not updated', 'chua cap nhat']);

  const hasUserWord = hasAny(text, ['user', 'nhan vien', 'nhan su', 'employee']);
  const hasDeptWord = hasAny(text, ['phong ban', 'department', 'dept']);
  const hasCycleWord = hasAny(text, ['chu ky', 'cycle']);
  const hasObjectiveWord = hasAny(text, ['objective', 'muc tieu']);
  const hasKpiWord = hasAny(text, ['kpi', 'chi so']);

  if (hasCountWord && hasUserWord) scores[INTENTS.count_users] += 5;
  if (hasUserWord && hasAny(text, ['tong user', 'tong nhan vien'])) scores[INTENTS.count_users] += 3;

  if (hasCountWord && hasDeptWord) scores[INTENTS.count_departments] += 5;
  if (hasDeptWord && hasAny(text, ['bao nhieu phong ban', 'tong phong ban'])) scores[INTENTS.count_departments] += 3;

  if (hasCycleWord && hasAny(text, ['active', 'hoat dong', 'dang mo'])) scores[INTENTS.active_cycles] += 5;
  if (hasCycleWord) scores[INTENTS.active_cycles] += 1;

  if (hasObjectiveWord && hasRiskWord) scores[INTENTS.low_progress_objectives] += 5;
  if (hasObjectiveWord && hasAny(text, ['tien do', 'progress'])) scores[INTENTS.low_progress_objectives] += 2;
  if (hasAny(text, ['muc duoi 50', 'duoi 50 tien do'])) scores[INTENTS.low_progress_objectives] += 3;

  if (hasKpiWord && hasRiskWord) scores[INTENTS.risky_kpis] += 5;
  if (hasKpiWord && hasAny(text, ['tinh hinh', 'the nao'])) scores[INTENTS.risky_kpis] += 2;
  if (hasPendingWord) scores[INTENTS.pending_checkins] += 4;

  if (hasTopWord && hasDeptWord) scores[INTENTS.top_departments] += 5;
  if (hasDeptWord && hasAny(text, ['hieu suat', 'performance'])) scores[INTENTS.top_departments] += 2;

  if (hasTopWord && hasUserWord) scores[INTENTS.top_performers] += 5;
  if (hasUserWord && hasAny(text, ['hieu suat', 'nhieu objective'])) scores[INTENTS.top_performers] += 2;

  if (hasSummaryWord && hasAny(text, ['he thong', 'dashboard', 'hien tai', 'hom nay'])) {
    scores[INTENTS.dashboard_summary] += 4;
  }
  if (hasSummaryWord && !hasKpiWord && !hasObjectiveWord && !hasCycleWord) {
    scores[INTENTS.dashboard_summary] += 2;
  }

  if (hasExplainWord && hasObjectiveWord) scores[INTENTS.explain_objective_metric] += 5;
  if (hasExplainWord && hasKpiWord) scores[INTENTS.explain_kpi_metric] += 5;
  if (hasAny(text, ['kpi progress la gi', 'kpi progress', 'what is kpi progress'])) {
    scores[INTENTS.explain_kpi_progress] += 7;
  }
  if (hasAny(text, ['objective progress tinh nhu the nao', 'objective progress', 'how objective progress'])) {
    scores[INTENTS.explain_objective_progress] += 7;
  }
  if (hasAny(text, ['at risk la gi', 'at risk nghia la gi', 'what is at risk'])) {
    scores[INTENTS.explain_at_risk] += 7;
  }
  if (hasAny(text, ['check in la gi', 'checkin la gi', 'what is check in'])) {
    scores[INTENTS.explain_checkin] += 7;
  }
  if (hasAny(text, ['dashboard summary la gi', 'what is dashboard summary'])) {
    scores[INTENTS.explain_dashboard_summary] += 7;
  }

  if (hasAnalysisWord) scores[INTENTS.generic_analysis] += 4;
  if (text.length > 180) scores[INTENTS.generic_analysis] += 2;

  return scores;
}

function pickIntent(scores) {
  let bestIntent = INTENTS.generic_analysis;
  let bestScore = -1;

  for (const intent of PRIORITY) {
    const score = scores[intent] || 0;
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  if (bestScore < 3) {
    return {
      intent: INTENTS.generic_analysis,
      confidence: bestScore,
      reason: 'low_confidence'
    };
  }

  return {
    intent: bestIntent,
    confidence: bestScore,
    reason: 'rule_match'
  };
}

function detectIntentMeta(message) {
  const normalized = normalizeInput(message);

  if (!normalized) {
    return {
      intent: INTENTS.generic_analysis,
      confidence: 0,
      reason: 'empty'
    };
  }

  const scores = scoreIntent(normalized);
  const picked = pickIntent(scores);

  return {
    ...picked,
    normalized,
    scores
  };
}

function detectIntent(message) {
  return detectIntentMeta(message).intent;
}

module.exports = {
  INTENTS,
  detectIntent,
  detectIntentMeta
};
