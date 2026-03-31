const { INTENTS } = require('./funnyIntentService');

const ROLES = {
  admin: 'admin',
  manager: 'manager',
  employee: 'employee'
};

const ROLE_ALL = [ROLES.admin, ROLES.manager, ROLES.employee];
const ROLE_LEADERS = [ROLES.admin, ROLES.manager];

function normalizeQuickActions(actions = [], targetRoute) {
  const baseActions = Array.isArray(actions) ? actions : [];

  if (baseActions.length > 0) {
    return baseActions.map((action) => ({
      label: action.label,
      actionType: action.actionType || 'navigate',
      targetRoute: action.targetRoute || targetRoute || '/dashboard'
    }));
  }

  if (!targetRoute) {
    return [];
  }

  return [
    {
      label: 'Open related page',
      actionType: 'navigate',
      targetRoute
    }
  ];
}

function normalizeTags(tags = []) {
  return Array.from(new Set(tags.filter(Boolean)));
}

function qa({
  id,
  text,
  intent,
  category,
  roles,
  targetRoute,
  quickActions = [],
  tags = [],
  priority = 50,
  order = 0
}) {
  return {
    id,
    text,
    intent,
    category,
    roles,
    roleVisibility: roles,
    targetRoute,
    quickActions: normalizeQuickActions(quickActions, targetRoute),
    tags: normalizeTags(tags),
    priority,
    order
  };
}

const QUESTION_BANK = [
  qa({ id: 'q01', text: 'How many active employees are there right now?', intent: INTENTS.count_users, category: 'insights', roles: ROLE_ALL, targetRoute: '/users', quickActions: [{ label: 'Open users', actionType: 'navigate', targetRoute: '/users' }], tags: ['users', 'headcount'], priority: 70, order: 1 }),
  qa({ id: 'q02', text: 'How many users are in the system?', intent: INTENTS.count_users, category: 'insights', roles: ROLE_ALL, targetRoute: '/users', tags: ['users', 'headcount'], priority: 65, order: 2 }),
  qa({ id: 'q03', text: 'What is the current total headcount?', intent: INTENTS.count_users, category: 'insights', roles: ROLE_ALL, targetRoute: '/users', tags: ['users', 'headcount'], priority: 60, order: 3 }),
  qa({ id: 'q04', text: 'How many users are currently activated?', intent: INTENTS.count_users, category: 'insights', roles: ROLE_ALL, targetRoute: '/users', tags: ['users', 'headcount'], priority: 55, order: 4 }),
  qa({ id: 'q05', text: 'How many departments are there right now?', intent: INTENTS.count_departments, category: 'insights', roles: ROLE_ALL, targetRoute: '/departments', tags: ['departments', 'organization'], priority: 55, order: 5 }),
  qa({ id: 'q06', text: 'How many active departments do we have?', intent: INTENTS.count_departments, category: 'insights', roles: ROLE_ALL, targetRoute: '/departments', tags: ['departments', 'organization'], priority: 50, order: 6 }),
  qa({ id: 'q07', text: 'What is the total number of departments?', intent: INTENTS.count_departments, category: 'insights', roles: ROLE_ALL, targetRoute: '/departments', tags: ['departments', 'organization'], priority: 45, order: 7 }),
  qa({ id: 'q08', text: 'Which cycles are currently active?', intent: INTENTS.active_cycles, category: 'navigation', roles: ROLE_ALL, targetRoute: '/cycles', tags: ['cycles'], priority: 65, order: 8 }),
  qa({ id: 'q09', text: 'How many cycles are active now?', intent: INTENTS.active_cycles, category: 'insights', roles: ROLE_ALL, targetRoute: '/cycles', tags: ['cycles'], priority: 60, order: 9 }),
  qa({ id: 'q10', text: 'Show me the list of active cycles.', intent: INTENTS.active_cycles, category: 'navigation', roles: ROLE_ALL, targetRoute: '/cycles', tags: ['cycles'], priority: 58, order: 10 }),
  qa({ id: 'q11', text: 'Which objectives are below 50% progress?', intent: INTENTS.low_progress_objectives, category: 'actions', roles: ROLE_ALL, targetRoute: '/objectives', quickActions: [{ label: 'Review low objectives', actionType: 'navigate', targetRoute: '/objectives' }], tags: ['objectives', 'risk'], priority: 90, order: 11 }),
  qa({ id: 'q12', text: 'List objectives that need urgent attention.', intent: INTENTS.low_progress_objectives, category: 'actions', roles: ROLE_ALL, targetRoute: '/objectives', tags: ['objectives', 'risk'], priority: 88, order: 12 }),
  qa({ id: 'q13', text: 'Which objectives have the lowest progress?', intent: INTENTS.low_progress_objectives, category: 'insights', roles: ROLE_ALL, targetRoute: '/objectives', tags: ['objectives', 'risk'], priority: 84, order: 13 }),
  qa({ id: 'q14', text: 'Which goals are at risk due to low progress?', intent: INTENTS.low_progress_objectives, category: 'actions', roles: ROLE_ALL, targetRoute: '/objectives', tags: ['objectives', 'risk'], priority: 82, order: 14 }),
  qa({ id: 'q15', text: 'What are the bottom objectives by progress?', intent: INTENTS.low_progress_objectives, category: 'insights', roles: ROLE_ALL, targetRoute: '/objectives', tags: ['objectives', 'risk'], priority: 80, order: 15 }),
  qa({ id: 'q16', text: 'Show objectives under the 50% threshold.', intent: INTENTS.low_progress_objectives, category: 'navigation', roles: ROLE_ALL, targetRoute: '/objectives', tags: ['objectives', 'risk'], priority: 78, order: 16 }),
  qa({ id: 'q17', text: 'Which KPIs are at risk?', intent: INTENTS.risky_kpis, category: 'actions', roles: ROLE_ALL, targetRoute: '/kpis', quickActions: [{ label: 'Open risky KPIs', actionType: 'navigate', targetRoute: '/kpis' }], tags: ['kpis', 'risk'], priority: 90, order: 17 }),
  qa({ id: 'q18', text: 'List KPIs with progress below 50%.', intent: INTENTS.risky_kpis, category: 'actions', roles: ROLE_ALL, targetRoute: '/kpis', tags: ['kpis', 'risk'], priority: 88, order: 18 }),
  qa({ id: 'q19', text: 'Which KPIs need immediate attention?', intent: INTENTS.risky_kpis, category: 'actions', roles: ROLE_ALL, targetRoute: '/kpis', tags: ['kpis', 'risk'], priority: 86, order: 19 }),
  qa({ id: 'q20', text: 'What is the current at-risk KPI situation by cycle?', intent: INTENTS.risky_kpis, category: 'insights', roles: ROLE_ALL, targetRoute: '/kpis', tags: ['kpis', 'risk', 'cycles'], priority: 84, order: 20 }),
  qa({ id: 'q21', text: 'Show me KPIs currently marked as at_risk.', intent: INTENTS.risky_kpis, category: 'navigation', roles: ROLE_ALL, targetRoute: '/kpis', tags: ['kpis', 'risk'], priority: 82, order: 21 }),
  qa({ id: 'q22', text: 'Which department has the highest performance?', intent: INTENTS.top_departments, category: 'insights', roles: ROLE_LEADERS, targetRoute: '/departments', tags: ['departments', 'performance'], priority: 70, order: 22 }),
  qa({ id: 'q23', text: 'Which departments are currently on top?', intent: INTENTS.top_departments, category: 'insights', roles: ROLE_LEADERS, targetRoute: '/departments', tags: ['departments', 'performance'], priority: 68, order: 23 }),
  qa({ id: 'q24', text: 'Which department is leading progress right now?', intent: INTENTS.top_departments, category: 'insights', roles: ROLE_LEADERS, targetRoute: '/departments', tags: ['departments', 'performance'], priority: 66, order: 24 }),
  qa({ id: 'q25', text: 'Which employee has the best performance?', intent: INTENTS.top_performers, category: 'insights', roles: ROLE_LEADERS, targetRoute: '/users', tags: ['users', 'performance'], priority: 70, order: 25 }),
  qa({ id: 'q26', text: 'Who are the top performers across objectives and KPIs?', intent: INTENTS.top_performers, category: 'insights', roles: ROLE_LEADERS, targetRoute: '/users', tags: ['users', 'performance'], priority: 68, order: 26 }),
  qa({ id: 'q27', text: 'Who currently has the strongest results?', intent: INTENTS.top_performers, category: 'insights', roles: ROLE_LEADERS, targetRoute: '/users', tags: ['users', 'performance'], priority: 66, order: 27 }),
  qa({ id: 'q28', text: 'Summarize the current dashboard.', intent: INTENTS.dashboard_summary, category: 'insights', roles: ROLE_LEADERS, targetRoute: '/dashboard', quickActions: [{ label: 'Open dashboard', actionType: 'navigate', targetRoute: '/dashboard' }], tags: ['dashboard', 'summary'], priority: 92, order: 28 }),
  qa({ id: 'q29', text: 'Give me an overall system snapshot.', intent: INTENTS.dashboard_summary, category: 'insights', roles: ROLE_LEADERS, targetRoute: '/dashboard', tags: ['dashboard', 'summary'], priority: 90, order: 29 }),
  qa({ id: 'q30', text: 'Provide a quick analysis of the overall OKR/KPI status.', intent: INTENTS.generic_analysis, category: 'insights', roles: ROLE_LEADERS, targetRoute: '/dashboard', tags: ['dashboard', 'analysis'], priority: 85, order: 30 }),
  qa({ id: 'q31', text: 'Explain why these objectives are low progress.', intent: INTENTS.explain_objective_metric, category: 'help', roles: ROLE_ALL, targetRoute: '/objectives', tags: ['objectives', 'help'], priority: 52, order: 31 }),
  qa({ id: 'q32', text: 'Explain why these KPIs are at risk.', intent: INTENTS.explain_kpi_metric, category: 'help', roles: ROLE_ALL, targetRoute: '/kpis', tags: ['kpis', 'help'], priority: 52, order: 32 }),
  qa({ id: 'q33', text: 'Which items are missing recent check-ins?', intent: INTENTS.pending_checkins, category: 'actions', roles: ROLE_ALL, targetRoute: '/checkins', quickActions: [{ label: 'Open check-ins', actionType: 'navigate', targetRoute: '/checkins' }], tags: ['checkins', 'followup'], priority: 88, order: 33 }),
  qa({ id: 'q34', text: 'What is KPI progress?', intent: INTENTS.explain_kpi_progress, category: 'help', roles: ROLE_ALL, targetRoute: '/kpis', tags: ['kpis', 'help'], priority: 50, order: 34 }),
  qa({ id: 'q35', text: 'How is objective progress calculated?', intent: INTENTS.explain_objective_progress, category: 'help', roles: ROLE_ALL, targetRoute: '/objectives', tags: ['objectives', 'help'], priority: 50, order: 35 }),
  qa({ id: 'q36', text: 'What does at risk mean?', intent: INTENTS.explain_at_risk, category: 'help', roles: ROLE_ALL, targetRoute: '/dashboard', tags: ['risk', 'help'], priority: 50, order: 36 }),
  qa({ id: 'q37', text: 'What is a check-in?', intent: INTENTS.explain_checkin, category: 'help', roles: ROLE_ALL, targetRoute: '/checkins', tags: ['checkins', 'help'], priority: 50, order: 37 }),
  qa({ id: 'q38', text: 'What is dashboard summary?', intent: INTENTS.explain_dashboard_summary, category: 'help', roles: ROLE_ALL, targetRoute: '/dashboard', tags: ['dashboard', 'help'], priority: 50, order: 38 })
];

const QUESTION_INDEX = new Map(QUESTION_BANK.map((item) => [item.id, item]));

function summarizeQuestion(question, extra = {}) {
  return {
    id: question.id,
    text: question.text,
    intent: question.intent,
    category: question.category,
    targetRoute: question.targetRoute,
    roleVisibility: question.roleVisibility,
    quickActions: question.quickActions,
    tags: question.tags,
    priority: question.priority,
    order: question.order,
    ...extra
  };
}

function listQuestions() {
  return QUESTION_BANK;
}

function listQuestionsByRole(role) {
  return QUESTION_BANK
    .filter((item) => item.roles.includes(role))
    .sort((a, b) => a.order - b.order);
}

function listCategoriesByRole(role) {
  return Array.from(new Set(listQuestionsByRole(role).map((item) => item.category)));
}

function findQuestionById(questionId) {
  return QUESTION_INDEX.get(questionId) || null;
}

function findFirstQuestionByIntent(intent, role) {
  return listQuestionsByRole(role).find((item) => item.intent === intent) || null;
}

module.exports = {
  listQuestions,
  listQuestionsByRole,
  listCategoriesByRole,
  findQuestionById,
  findFirstQuestionByIntent,
  summarizeQuestion
};
