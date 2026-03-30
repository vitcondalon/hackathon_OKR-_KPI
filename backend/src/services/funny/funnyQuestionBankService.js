const { INTENTS } = require('./funnyIntentService');

const QUESTION_BANK = [
  { id: 'q01', intent: INTENTS.count_users, text: 'How many active employees are there right now?' },
  { id: 'q02', intent: INTENTS.count_users, text: 'How many users are in the system?' },
  { id: 'q03', intent: INTENTS.count_users, text: 'What is the current total headcount?' },
  { id: 'q04', intent: INTENTS.count_users, text: 'How many users are currently activated?' },

  { id: 'q05', intent: INTENTS.count_departments, text: 'How many departments are there right now?' },
  { id: 'q06', intent: INTENTS.count_departments, text: 'How many active departments do we have?' },
  { id: 'q07', intent: INTENTS.count_departments, text: 'What is the total number of departments?' },

  { id: 'q08', intent: INTENTS.active_cycles, text: 'Which cycles are currently active?' },
  { id: 'q09', intent: INTENTS.active_cycles, text: 'How many cycles are active now?' },
  { id: 'q10', intent: INTENTS.active_cycles, text: 'Show me the list of active cycles.' },

  { id: 'q11', intent: INTENTS.low_progress_objectives, text: 'Which objectives are below 50% progress?' },
  { id: 'q12', intent: INTENTS.low_progress_objectives, text: 'List objectives that need urgent attention.' },
  { id: 'q13', intent: INTENTS.low_progress_objectives, text: 'Which objectives have the lowest progress?' },
  { id: 'q14', intent: INTENTS.low_progress_objectives, text: 'Which goals are at risk due to low progress?' },
  { id: 'q15', intent: INTENTS.low_progress_objectives, text: 'What are the bottom objectives by progress?' },
  { id: 'q16', intent: INTENTS.low_progress_objectives, text: 'Show objectives under the 50% threshold.' },

  { id: 'q17', intent: INTENTS.risky_kpis, text: 'Which KPIs are at risk?' },
  { id: 'q18', intent: INTENTS.risky_kpis, text: 'List KPIs with progress below 50%.' },
  { id: 'q19', intent: INTENTS.risky_kpis, text: 'Which KPIs need immediate attention?' },
  { id: 'q20', intent: INTENTS.risky_kpis, text: 'What is the current at-risk KPI situation by cycle?' },
  { id: 'q21', intent: INTENTS.risky_kpis, text: 'Show me KPIs currently marked as at_risk.' },

  { id: 'q22', intent: INTENTS.top_departments, text: 'Which department has the highest performance?' },
  { id: 'q23', intent: INTENTS.top_departments, text: 'Which departments are currently on top?' },
  { id: 'q24', intent: INTENTS.top_departments, text: 'Which department is leading progress right now?' },

  { id: 'q25', intent: INTENTS.top_performers, text: 'Which employee has the best performance?' },
  { id: 'q26', intent: INTENTS.top_performers, text: 'Who are the top performers across objectives and KPIs?' },
  { id: 'q27', intent: INTENTS.top_performers, text: 'Who currently has the strongest results?' },

  { id: 'q28', intent: INTENTS.dashboard_summary, text: 'Summarize the current dashboard.' },
  { id: 'q29', intent: INTENTS.dashboard_summary, text: 'Give me an overall system snapshot.' },

  { id: 'q30', intent: INTENTS.generic_analysis, text: 'Provide a quick analysis of the overall OKR/KPI status.' }
];

const QUESTION_INDEX = new Map(QUESTION_BANK.map((item) => [item.id, item]));

function listQuestions() {
  return QUESTION_BANK;
}

function findQuestionById(questionId) {
  return QUESTION_INDEX.get(questionId) || null;
}

module.exports = {
  listQuestions,
  findQuestionById
};
