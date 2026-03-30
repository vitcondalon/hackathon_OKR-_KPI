const { z } = require('zod');
const { query } = require('../config/db');
const env = require('../config/env');
const { sanitizeMessage } = require('../utils/aiSanitizer');
const { INTENTS } = require('../services/funny/funnyIntentService');
const funnyQueryService = require('../services/funny/funnyQueryService');
const funnyPromptService = require('../services/funny/funnyPromptService');
const funnyGeminiService = require('../services/funny/funnyGeminiService');
const funnyResponseService = require('../services/funny/funnyResponseService');
const funnyQuestionBankService = require('../services/funny/funnyQuestionBankService');

const chatSchema = z.object({
  questionId: z.string().trim().min(1).max(32),
  message: z.string().trim().min(1).max(500).optional(),
  conversationId: z.string().trim().min(1).max(100).optional()
});

const employeeBlockedIntents = new Set([
  INTENTS.top_departments,
  INTENTS.top_performers,
  INTENTS.dashboard_summary,
  INTENTS.generic_analysis
]);

function assertFunnyEnabled() {
  if (!env.funnyEnabled) {
    const error = new Error('Funny module is disabled');
    error.status = 503;
    throw error;
  }
}

function ensureRoleAccess(intent, user) {
  if (user.role === 'employee' && employeeBlockedIntents.has(intent)) {
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

async function chat(req, res, next) {
  try {
    assertFunnyEnabled();

    const payload = chatSchema.parse(req.body);
    const selectedQuestion = funnyQuestionBankService.findQuestionById(payload.questionId);
    if (!selectedQuestion) {
      const error = new Error('Invalid questionId. Only predefined questions are allowed.');
      error.status = 400;
      throw error;
    }

    const sanitized = sanitizeMessage(selectedQuestion.text);
    const intent = selectedQuestion.intent;

    ensureRoleAccess(intent, req.user);

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

    if (intent === INTENTS.generic_analysis) {
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

    const links = funnyResponseService.buildLinks(intent, result.data);
    answer = funnyResponseService.appendLinksToAnswer(answer, links);

    await writeFunnyLog({
      userId: req.user.id,
      conversationId: payload.conversationId,
      message: selectedQuestion.text,
      intent,
      answer,
      usedAI,
      model
    });

    return res.json(
      funnyResponseService.buildChatResponse({
        answer,
        intent,
        data: result.data,
        sources: result.sources,
        chartHint: result.chartHint,
        relatedEntityType: result.relatedEntityType,
        relatedEntityIds: result.relatedEntityIds,
        links,
        suggestions: funnyQuestionBankService.listQuestions().slice(0, 5).map((item) => item.text),
        meta: {
          usedAI,
          model,
          fallback,
          promptInjectionGuard: sanitized.flags.hasPromptInjectionSignal
        }
      })
    );
  } catch (error) {
    return next(error);
  }
}

async function suggestions(req, res, next) {
  try {
    assertFunnyEnabled();
    const questions = funnyQuestionBankService.listQuestions();

    return res.json({
      suggestions: questions.slice(0, 5).map((item) => item.text)
    });
  } catch (error) {
    return next(error);
  }
}

async function questions(req, res, next) {
  try {
    assertFunnyEnabled();
    const allQuestions = funnyQuestionBankService.listQuestions();
    const visibleQuestions = allQuestions.filter((item) => {
      if (req.user.role !== 'employee') return true;
      return !employeeBlockedIntents.has(item.intent);
    });

    return res.json({
      total: visibleQuestions.length,
      items: visibleQuestions
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
  health
};
