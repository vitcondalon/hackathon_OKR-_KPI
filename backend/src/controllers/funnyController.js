const { z } = require('zod');
const { query } = require('../config/db');
const env = require('../config/env');
const { sanitizeMessage } = require('../utils/aiSanitizer');
const { INTENTS, detectIntentMeta } = require('../services/funny/funnyIntentService');
const funnyQueryService = require('../services/funny/funnyQueryService');
const funnyPromptService = require('../services/funny/funnyPromptService');
const funnyGeminiService = require('../services/funny/funnyGeminiService');
const funnyResponseService = require('../services/funny/funnyResponseService');
const funnyQuestionBankService = require('../services/funny/funnyQuestionBankService');
const funnyContextSuggestionService = require('../services/funny/funnyContextSuggestionService');
const funnyExplainService = require('../services/funny/funnyExplainService');
const funnyRoleSummaryService = require('../services/funny/funnyRoleSummaryService');
const insightService = require('../services/insightService');

const chatSchema = z
  .object({
    questionId: z.string().trim().min(1).max(32).optional(),
    message: z.string().trim().min(1).max(500).optional(),
    conversationId: z.string().trim().min(1).max(100).optional()
  })
  .refine((v) => Boolean(v.questionId || v.message), {
    message: 'questionId or message is required',
    path: ['questionId']
  });

function assertFunnyEnabled() {
  if (!env.funnyEnabled) {
    const error = new Error('Funny module is disabled');
    error.status = 503;
    throw error;
  }
}

function ensureRoleAccess(question, user) {
  if (!question.roles.includes(user.role)) {
    const error = new Error('Forbidden for this query type');
    error.status = 403;
    throw error;
  }
}

async function writeFunnyLog({ userId, conversationId, message, intent, answer, usedAI, model }) {
  try {
    await query(
      `INSERT INTO funny_logs (
         user_id,
         conversation_id,
         message,
         detected_intent,
         answer_short,
         used_ai,
         model_name
       ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId,
        conversationId || null,
        message,
        intent,
        answer ? answer.slice(0, 300) : null,
        Boolean(usedAI),
        model || null
      ]
    );
  } catch (error) {
    console.error('Failed to write funny log:', error.message);
  }
}

function resolveQuestionFromPayload(payload, user) {
  const visibleQuestions = funnyQuestionBankService.listQuestionsByRole(user.role);

  if (payload.questionId) {
    const question = funnyQuestionBankService.findQuestionById(payload.questionId);
    if (!question) return null;
    return question;
  }

  const detected = detectIntentMeta(payload.message || '');
  const byIntent = funnyQuestionBankService.findFirstQuestionByIntent(detected.intent, user.role);

  return byIntent || visibleQuestions[0] || null;
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

function buildInsights(intent, data) {
  switch (intent) {
    case INTENTS.risky_kpis:
      return [{ type: 'risk', label: 'Risky KPIs', value: data.total || 0 }];
    case INTENTS.low_progress_objectives:
      return [{ type: 'risk', label: 'Low-progress objectives', value: data.total || 0 }];
    case INTENTS.pending_checkins:
      return [{ type: 'followup', label: 'Pending check-ins', value: data.total || 0 }];
    default:
      return [];
  }
}

async function chat(req, res, next) {
  try {
    assertFunnyEnabled();

    const payload = chatSchema.parse(req.body);
    const selectedQuestion = resolveQuestionFromPayload(payload, req.user);

    if (!selectedQuestion) {
      const error = new Error('No available question for this role');
      error.status = 400;
      throw error;
    }

    ensureRoleAccess(selectedQuestion, req.user);

    const rawMessage = payload.message || selectedQuestion.text;
    const sanitized = sanitizeMessage(rawMessage);
    const intent = selectedQuestion.intent;

    let usedAI = false;
    let fallback = false;
    let model = null;
    let answer = '';
    let result = {
      data: {},
      sources: [],
      chartHint: null,
      relatedEntityType: null,
      relatedEntityIds: []
    };

    if (funnyExplainService.isExplainIntent(intent)) {
      const explain = funnyExplainService.getExplainContent(intent);
      result = {
        data: {
          concept: explain.concept
        },
        sources: ['funny_explain_knowledge'],
        chartHint: 'concept_card',
        relatedEntityType: 'knowledge',
        relatedEntityIds: []
      };
      answer = explain.answer;
    } else if (intent === INTENTS.generic_analysis) {
      const context = await funnyQueryService.getContextForGenericAnalysis(req.user);
      result = {
        data: context,
        sources: ['dashboard_summary', 'active_cycles', 'top_performers'],
        chartHint: 'dashboard_bundle',
        relatedEntityType: 'dashboard',
        relatedEntityIds: []
      };

      const shouldUseAI = funnyGeminiService.isConfigured() && !sanitized.flags.hasPromptInjectionSignal;

      if (shouldUseAI) {
        try {
          answer = await funnyGeminiService.generateAnswer(
            funnyPromptService.buildPrompt({
              message: sanitized.cleanedMessage,
              intent,
              context,
              user: req.user
            })
          );
          usedAI = true;
          model = funnyGeminiService.getModelName();
        } catch (error) {
          fallback = true;
          answer = funnyQueryService.buildFallbackGenericAnalysis(context);
        }
      } else {
        fallback = true;
        answer = funnyQueryService.buildFallbackGenericAnalysis(context);
      }
    } else {
      result = await funnyQueryService.executeIntent(intent, req.user);
      answer = funnyResponseService.buildDirectAnswer(intent, result.data);
    }

    const links = funnyExplainService.isExplainIntent(intent)
      ? funnyExplainService.getExplainContent(intent).links
      : funnyResponseService.buildLinks(intent, result.data);
    const contextSuggestions = await funnyContextSuggestionService.getContextSuggestions(req.user);
    const quickActions = dedupeBy([
      ...(funnyExplainService.isExplainIntent(intent)
        ? (funnyExplainService.getExplainContent(intent).quickActions || [])
        : (selectedQuestion.quickActions || [])),
      ...contextSuggestions.quickActions
    ], (action) => `${action.actionType}:${action.targetRoute}:${action.label}`).slice(0, 8);
    const insights = dedupeBy([
      ...buildInsights(intent, result.data),
      ...contextSuggestions.insights
    ], (item) => `${item.type}:${item.label}:${item.value}`);

    answer = funnyResponseService.appendLinksToAnswer(answer, links);

    await writeFunnyLog({
      userId: req.user.id,
      conversationId: payload.conversationId,
      message: rawMessage,
      intent,
      answer,
      usedAI,
      model
    });

    return res.json(
      {
        success: true,
        message: 'OK',
        errors: null,
        ...funnyResponseService.buildChatResponse({
        answer,
        intent,
        data: result.data,
        sources: result.sources,
        chartHint: result.chartHint,
        relatedEntityType: result.relatedEntityType,
        relatedEntityIds: result.relatedEntityIds,
        links,
        quickActions,
        suggestions: contextSuggestions.suggestions,
        recommendedQuestions: contextSuggestions.recommendedQuestions,
        insights,
        meta: {
          usedAI,
          model,
          fallback,
          promptInjectionGuard: sanitized.flags.hasPromptInjectionSignal,
          category: selectedQuestion.category,
          questionId: selectedQuestion.id,
          role: req.user.role
        }
        })
      }
    );
  } catch (error) {
    return next(error);
  }
}

async function suggestions(req, res, next) {
  try {
    assertFunnyEnabled();
    const context = await funnyContextSuggestionService.getContextSuggestions(req.user);

    return res.json({
      success: true,
      message: 'OK',
      errors: null,
      suggestions: context.suggestions,
      recommendedQuestions: context.recommendedQuestions,
      quickActions: context.quickActions,
      insights: context.insights,
      summary: context.summary,
      meta: context.meta
    });
  } catch (error) {
    return next(error);
  }
}

async function questions(req, res, next) {
  try {
    assertFunnyEnabled();
    const visibleQuestions = funnyQuestionBankService.listQuestionsByRole(req.user.role);

    return res.json({
      success: true,
      message: 'OK',
      errors: null,
      total: visibleQuestions.length,
      categories: funnyQuestionBankService.listCategoriesByRole(req.user.role),
      items: visibleQuestions
    });
  } catch (error) {
    return next(error);
  }
}

async function summary(req, res, next) {
  try {
    assertFunnyEnabled();
    const [summaryData, context] = await Promise.all([
      funnyRoleSummaryService.getRoleSummary(req.user),
      funnyContextSuggestionService.getContextSuggestions(req.user)
    ]);

    return res.json({
      success: true,
      message: 'OK',
      errors: null,
      summary: summaryData,
      insights: context.insights,
      suggestions: context.suggestions,
      recommendedQuestions: context.recommendedQuestions,
      quickActions: context.quickActions,
      meta: {
        role: req.user.role,
        generatedAt: summaryData.generated_at,
        usedAI: summaryData.narrative_meta?.usedAI || false,
        model: summaryData.narrative_meta?.model || null,
        fallback: summaryData.narrative_meta?.fallback ?? true,
        suggestionContext: context.meta
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function insights(req, res, next) {
  try {
    assertFunnyEnabled();
    const payload = await insightService.getInsightOverview(req.user, { limit: 5 });
    return res.json({
      success: true,
      message: 'OK',
      errors: null,
      ...payload
    });
  } catch (error) {
    return next(error);
  }
}

async function health(req, res, next) {
  try {
    assertFunnyEnabled();

    let dbConnected = false;

    try {
      await query('SELECT 1');
      dbConnected = true;
    } catch (error) {
      dbConnected = false;
    }

    return res.json({
      success: true,
      message: 'OK',
      errors: null,
      dbConnected,
      geminiConfigured: funnyGeminiService.isConfigured(),
      model: funnyGeminiService.getModelName() || null,
      funnyEnabled: env.funnyEnabled
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  chat,
  suggestions,
  questions,
  summary,
  insights,
  health
};
