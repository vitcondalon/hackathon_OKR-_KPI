import axiosClient from './axiosClient';
import { unwrap } from './helpers';

export const workspaceApi = {
  bootstrap: async (params = {}) => unwrap(await axiosClient.get('/workspace/bootstrap', { params })),
  createPeriod: async (payload) => unwrap(await axiosClient.post('/workspace/periods', payload)),
  createReview: async (payload) => unwrap(await axiosClient.post('/workspace/reviews', payload)),
  addItem: async (reviewId, payload) => unwrap(await axiosClient.post(`/workspace/reviews/${reviewId}/items`, payload)),
  removeItem: async (reviewId, itemId) => unwrap(await axiosClient.delete(`/workspace/reviews/${reviewId}/items/${itemId}`)),
  updateItem: async (reviewId, itemId, payload) => unwrap(await axiosClient.put(`/workspace/reviews/${reviewId}/items/${itemId}`, payload)),
  addComment: async (reviewId, payload) => unwrap(await axiosClient.post(`/workspace/reviews/${reviewId}/comments`, payload)),
  applyAction: async (reviewId, payload) => unwrap(await axiosClient.post(`/workspace/reviews/${reviewId}/actions`, payload))
};
