const funnyQueryService = require('./funnyQueryService');
const funnyQuestionBankService = require('./funnyQuestionBankService');
const insightService = require('../insightService');

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function dedupeBy(items, keyBuilder) {
  const seen = new Set();
  const result = [];

  for (const item of items || []) {
    const key = keyBuilder(item);
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(item);
  }

  return result;
}

function buildQuestionCandidate(question, reason, priority) {
  return funnyQuestionBankService.summarizeQuestion(question, {
    reason,
    priority
  });
}

function buildRoleCandidatePlan(user, riskSnapshot) {
  const lowObjectives = toNumber(riskSnapshot.low_progress_objectives?.total);
  const riskyKpis = toNumber(riskSnapshot.risky_kpis?.total);
  const pendingCheckins = toNumber(riskSnapshot.pending_checkins?.total);

  if (user.role === 'employee') {
    return [
      { intent: 'pending_checkins', when: pendingCheckins > 0, priority: 100, reason: `You have ${pendingCheckins} item(s) missing recent check-ins.` },
      { intent: 'low_progress_objectives', when: lowObjectives > 0, priority: 90, reason: `${lowObjectives} objective(s) are below 50% progress.` },
      { intent: 'risky_kpis', when: riskyKpis > 0, priority: 85, reason: `${riskyKpis} KPI(s) need attention.` },
      { intent: 'active_cycles', when: true, priority: 50, reason: 'See what active cycle you are executing in right now.' },
      { intent: 'explain_checkin', when: pendingCheckins > 0, priority: 40, reason: 'Clarify what check-ins mean before updating progress.' }
    ];
  }

  if (user.role === 'manager') {
    return [
      { intent: 'pending_checkins', when: pendingCheckins > 0, priority: 100, reason: `Your team has ${pendingCheckins} overdue check-in item(s).` },
      { intent: 'low_progress_objectives', when: lowObjectives > 0, priority: 95, reason: `${lowObjectives} team objective(s) are off track.` },
      { intent: 'risky_kpis', when: riskyKpis > 0, priority: 90, reason: `${riskyKpis} team KPI(s) are at risk.` },
      { intent: 'dashboard_summary', when: true, priority: 70, reason: 'Get a quick manager snapshot before following up.' },
      { intent: 'top_performers', when: true, priority: 55, reason: 'Identify strong contributors and coach the rest of the team.' },
      { intent: 'generic_analysis', when: true, priority: 45, reason: 'Ask for a broader narrative across team risks and momentum.' }
    ];
  }

  return [
    { intent: 'dashboard_summary', when: true, priority: 100, reason: 'Start from the full system snapshot.' },
    { intent: 'risky_kpis', when: riskyKpis > 0, priority: 95, reason: `${riskyKpis} KPI(s) are flagged as at risk system-wide.` },
    { intent: 'low_progress_objectives', when: lowObjectives > 0, priority: 90, reason: `${lowObjectives} objective(s) need leadership attention.` },
    { intent: 'top_departments', when: true, priority: 70, reason: 'Compare which departments are leading and which need support.' },
    { intent: 'top_performers', when: true, priority: 60, reason: 'Spot strong performers for recognition or replication.' },
    { intent: 'generic_analysis', when: true, priority: 50, reason: 'Generate a broader executive-style summary for the demo.' }
  ];
}

async function getContextSuggestions(user) {
  const [summary, riskSnapshot, insightOverview] = await Promise.all([
    funnyQueryService.getFunnySummary(user),
    funnyQueryService.getRiskSnapshot(user),
    insightService.getInsightOverview(user, { limit: 5 })
  ]);

  const visibleQuestions = funnyQuestionBankService.listQuestionsByRole(user.role);
  const byIntent = new Map(visibleQuestions.map((question) => [question.intent, question]));
  const plan = buildRoleCandidatePlan(user, riskSnapshot);

  const recommendedQuestions = dedupeBy(
    plan
      .filter((item) => item.when)
      .map((item) => {
        const question = byIntent.get(item.intent);
        if (!question) {
          return null;
        }
        return buildQuestionCandidate(question, item.reason, item.priority);
      })
      .filter(Boolean)
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 6),
    (item) => item.id
  );

  const fallbackQuestions = visibleQuestions
    .slice(0, 6)
    .map((question, index) =>
      buildQuestionCandidate(question, 'Suggested from the role-visible Funny question bank.', 10 - index)
    );

  const finalQuestions = recommendedQuestions.length > 0 ? recommendedQuestions : fallbackQuestions;

  const quickActions = dedupeBy(
    finalQuestions.flatMap((question) =>
      (question.quickActions || []).map((action) => ({
        ...action,
        sourceQuestionId: question.id
      }))
    ),
    (action) => `${action.actionType}:${action.targetRoute}:${action.label}`
  ).slice(0, 8);

  return {
    recommendedQuestions: finalQuestions,
    quickActions,
    suggestions: finalQuestions.map((item) => item.text),
    insights: insightOverview.insights,
    insightFeed: insightOverview.feed,
    summary: summary.data,
    meta: {
      role: user.role,
      generatedAt: new Date().toISOString(),
      riskSnapshot: {
        lowProgressObjectives: toNumber(riskSnapshot.low_progress_objectives?.total),
        riskyKpis: toNumber(riskSnapshot.risky_kpis?.total),
        pendingCheckins: toNumber(riskSnapshot.pending_checkins?.total)
      }
    }
  };
}

module.exports = {
  getContextSuggestions
};
