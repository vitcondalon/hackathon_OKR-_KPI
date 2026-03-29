import axiosClient from './axiosClient';
import { unwrap } from './helpers';

export const keyResultsApi = {
  list: async (params = {}) => unwrap(await axiosClient.get('/key-results', { params })),
  create: async (payload) => unwrap(await axiosClient.post('/key-results', payload)),
  update: async (id, payload) => unwrap(await axiosClient.put(`/key-results/${id}`, payload)),
  remove: async (id) => axiosClient.delete(`/key-results/${id}`)
};
