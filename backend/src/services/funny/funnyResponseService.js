const DEFAULT_SUGGESTIONS = [
  'How many employees are active right now?',
  'Which department has the best progress?',
  'Which KPIs are below 50%?',
  'Summarize today dashboard',
  'Which objectives are currently at risk?'
];

function getSuggestions() {
  return DEFAULT_SUGGESTIONS;
}

function buildLinks(intent, data) {
  const links = [];

  const push = (label, path) => links.push({ label, path });

  switch (intent) {
    case 'count_users':
      push('Users', '/users');
      break;
    case 'count_departments':
      push('Departments', '/departments');
      break;
    case 'active_cycles':
      push('OKR Cycles', '/cycles');
      break;
    case 'low_progress_objectives':
      push('Objectives', '/objectives');
      break;
    case 'risky_kpis':
      push('KPIs', '/kpis');
      break;
    case 'top_departments':
      push('Department Performance', '/departments');
      push('Dashboard', '/dashboard');
      break;
    case 'top_performers':
      push('Top Users', '/users');
      push('Dashboard', '/dashboard');
      break;
    case 'dashboard_summary':
      push('Dashboard Overview', '/dashboard');
      push('Objectives', '/objectives');
      push('KPIs', '/kpis');
      break;
    case 'generic_analysis':
      push('Dashboard Overview', '/dashboard');
      push('Objectives', '/objectives');
      push('KPIs', '/kpis');
      break;
    default:
      push('Dashboard', '/dashboard');
  }

  if (Array.isArray(data?.items) && data.items.length > 0) {
    const ids = data.items
      .map((item) => item.id)
      .filter((id) => id !== undefined && id !== null)
      .slice(0, 5);

    if (ids.length > 0 && intent === 'low_progress_objectives') {
      push('Related Objectives', `/objectives?ids=${ids.join(',')}`);
    }

    if (ids.length > 0 && intent === 'risky_kpis') {
      push('Related KPIs', `/kpis?ids=${ids.join(',')}`);
    }
  }

  return links;
}

function appendLinksToAnswer(answer, links) {
  if (!Array.isArray(links) || links.length === 0) {
    return answer;
  }

  const summary = links.map((link) => `${link.label}: ${link.path}`).join(' | ');
  return `${answer}\nSee also: ${summary}`;
}

function buildDirectAnswer(intent, data) {
  switch (intent) {
    case 'count_users':
      return `The system currently has ${data.active_users ?? data.total_users} active users (total ${data.total_users}).`;
    case 'count_departments':
      return `There are currently ${data.active_departments ?? data.total_departments} active departments (total ${data.total_departments}).`;
    case 'active_cycles':
      return data.total > 0
        ? `There are ${data.total} active cycles: ${data.items.map((item) => item.code).join(', ')}.`
        : 'There are no active cycles at the moment.';
    case 'low_progress_objectives':
      return data.total > 0
        ? `There are ${data.total} objectives below ${data.threshold}% progress that need close tracking.`
        : `No objectives are below ${data.threshold}% progress.`;
    case 'risky_kpis':
      return data.total > 0
        ? `There are ${data.total} KPIs that are at risk or below ${data.threshold}%.`
        : `No KPIs are at risk or below ${data.threshold}%.`;
    case 'top_departments':
      return data.total > 0
        ? `The top department right now is ${data.items[0].department_name}.`
        : 'No department data is available for ranking yet.';
    case 'top_performers':
      return data.total > 0
        ? `The top performer right now is ${data.items[0].full_name}.`
        : 'No performer data is available for ranking yet.';
    case 'dashboard_summary':
      return 'Here is the current dashboard overview, including at-risk KPIs, low-progress objectives, and leading departments.';
    default:
      return 'Funny has completed the request.';
  }
}

function buildChatResponse({
  answer,
  intent,
  data,
  sources,
  suggestions,
  chartHint,
  relatedEntityType,
  relatedEntityIds,
  links,
  meta
}) {
  return {
    answer,
    intent,
    data,
    sources,
    suggestions: suggestions || getSuggestions(),
    chartHint: chartHint || null,
    relatedEntityType: relatedEntityType || null,
    relatedEntityIds: relatedEntityIds || [],
    links: links || [],
    meta
  };
}

module.exports = {
  getSuggestions,
  buildDirectAnswer,
  buildLinks,
  appendLinksToAnswer,
  buildChatResponse
};
