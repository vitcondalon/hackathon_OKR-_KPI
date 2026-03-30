import axiosClient from './axiosClient';

export const funnyApi = {
  chat: async ({ questionId, message, conversationId }) => {
    const response = await axiosClient.post('/funny/chat', {
      questionId,
      ...(message ? { message } : {}),
      ...(conversationId ? { conversationId } : {})
    });
    return response.data;
  },
  questions: async () => {
    const response = await axiosClient.get('/funny/questions');
    return response.data?.items || [];
  },
  suggestions: async () => {
    const response = await axiosClient.get('/funny/suggestions');
    return response.data?.suggestions || [];
  },
  health: async () => {
    const response = await axiosClient.get('/funny/health');
    return response.data;
  }
};
