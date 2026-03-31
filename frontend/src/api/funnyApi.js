import axiosClient from './axiosClient';

function arrayOrEmpty(value) {
  return Array.isArray(value) ? value : [];
}

function objectOrEmpty(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function rootOrData(response) {
  return response?.data?.data || response?.data || {};
}

export const funnyApi = {
  chat: async ({ questionId, message, conversationId }) => {
    const response = await axiosClient.post('/funny/chat', {
      ...(questionId ? { questionId } : {}),
      ...(message ? { message } : {}),
      ...(conversationId ? { conversationId } : {})
    });

    return {
      answer: response.data?.answer || '',
      intent: response.data?.intent || '',
      data: objectOrEmpty(response.data?.data),
      sources: arrayOrEmpty(response.data?.sources),
      suggestions: arrayOrEmpty(response.data?.suggestions),
      recommendedQuestions: arrayOrEmpty(response.data?.recommendedQuestions),
      chartHint: response.data?.chartHint || null,
      relatedEntityType: response.data?.relatedEntityType || null,
      relatedEntityIds: arrayOrEmpty(response.data?.relatedEntityIds),
      links: arrayOrEmpty(response.data?.links),
      quickActions: arrayOrEmpty(response.data?.quickActions),
      insights: arrayOrEmpty(response.data?.insights),
      meta: objectOrEmpty(response.data?.meta)
    };
  },

  questions: async () => {
    const response = await axiosClient.get('/funny/questions');
    const payload = rootOrData(response);
    return arrayOrEmpty(payload.items || payload.questions);
  },

  suggestions: async () => {
    const response = await axiosClient.get('/funny/suggestions');
    const payload = rootOrData(response);
    return {
      suggestions: arrayOrEmpty(payload.suggestions),
      recommendedQuestions: arrayOrEmpty(payload.recommendedQuestions),
      quickActions: arrayOrEmpty(payload.quickActions),
      insights: arrayOrEmpty(payload.insights),
      summary: payload.summary || null,
      meta: objectOrEmpty(payload.meta || response.data?.meta)
    };
  },

  summary: async () => {
    const response = await axiosClient.get('/funny/summary');
    const payload = rootOrData(response);
    return {
      summary: payload.summary || null,
      suggestions: arrayOrEmpty(payload.suggestions),
      recommendedQuestions: arrayOrEmpty(payload.recommendedQuestions),
      quickActions: arrayOrEmpty(payload.quickActions),
      insights: arrayOrEmpty(payload.insights),
      meta: objectOrEmpty(payload.meta || response.data?.meta)
    };
  },

  health: async () => {
    const response = await axiosClient.get('/funny/health');
    const payload = rootOrData(response);
    return {
      dbConnected: Boolean(payload.dbConnected ?? payload.database?.connected),
      geminiConfigured: Boolean(payload.geminiConfigured ?? payload.aiConfigured),
      model: payload.model || payload.aiModel || null
    };
  }
};
