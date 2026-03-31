const EXPLAIN_BY_INTENT = {
  explain_kpi_progress: {
    concept: 'KPI progress',
    answer:
      'KPI progress shows how close the current KPI value is to its target. In simple terms: current performance compared to planned target for the cycle.',
    links: [
      { label: 'KPIs', path: '/kpis' }
    ],
    quickActions: [
      { label: 'Open KPI list', actionType: 'navigate', targetRoute: '/kpis' }
    ]
  },
  explain_objective_progress: {
    concept: 'Objective progress',
    answer:
      'Objective progress is the aggregated progress of its related Key Results. As Key Results are updated by check-ins, objective progress moves accordingly.',
    links: [
      { label: 'Objectives', path: '/objectives' },
      { label: 'Key Results', path: '/key-results' }
    ],
    quickActions: [
      { label: 'Open objectives', actionType: 'navigate', targetRoute: '/objectives' }
    ]
  },
  explain_at_risk: {
    concept: 'At risk',
    answer:
      'At risk means the item is likely to miss its target unless corrective action is taken. Typical signals include low progress, delayed updates, or unresolved blockers.',
    links: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'KPIs', path: '/kpis' },
      { label: 'Objectives', path: '/objectives' }
    ],
    quickActions: [
      { label: 'View risky KPIs', actionType: 'navigate', targetRoute: '/kpis' }
    ]
  },
  explain_checkin: {
    concept: 'Check-in',
    answer:
      'A check-in is a periodic update that records current value, progress, and notes for a Key Result or KPI. It is the main source for tracking execution over time.',
    links: [
      { label: 'Check-ins', path: '/checkins' }
    ],
    quickActions: [
      { label: 'Open check-ins', actionType: 'navigate', targetRoute: '/checkins' }
    ]
  },
  explain_dashboard_summary: {
    concept: 'Dashboard summary',
    answer:
      'Dashboard summary is the high-level snapshot of system performance, including totals, average progress, active cycles, and current risk signals.',
    links: [
      { label: 'Dashboard', path: '/dashboard' }
    ],
    quickActions: [
      { label: 'Open dashboard', actionType: 'navigate', targetRoute: '/dashboard' }
    ]
  },
  explain_objective_metric: {
    concept: 'Objective metric explanation',
    answer:
      'Low objective progress usually means Key Results are not updated frequently enough, current values are behind target, or blockers are unresolved.',
    links: [
      { label: 'Objectives', path: '/objectives' },
      { label: 'Check-ins', path: '/checkins' }
    ],
    quickActions: [
      { label: 'Open objective list', actionType: 'navigate', targetRoute: '/objectives' }
    ]
  },
  explain_kpi_metric: {
    concept: 'KPI metric explanation',
    answer:
      'KPI risk typically indicates a gap between target and current value. Common causes are delayed execution, low update cadence, or dependencies not met.',
    links: [
      { label: 'KPIs', path: '/kpis' },
      { label: 'Check-ins', path: '/checkins' }
    ],
    quickActions: [
      { label: 'Open KPI list', actionType: 'navigate', targetRoute: '/kpis' }
    ]
  }
};

function isExplainIntent(intent) {
  return Boolean(EXPLAIN_BY_INTENT[intent]);
}

function getExplainContent(intent) {
  return EXPLAIN_BY_INTENT[intent] || null;
}

module.exports = {
  isExplainIntent,
  getExplainContent
};

