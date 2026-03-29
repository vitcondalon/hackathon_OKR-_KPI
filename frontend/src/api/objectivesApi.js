import axiosClient from './axiosClient';
import { unwrap } from './helpers';

export const objectivesApi = {
  list: async (params = {}) => unwrap(await axiosClient.get('/objectives', { params })),
  create: async (payload) => unwrap(await axiosClient.post('/objectives', payload)),
  getById: async (id) => unwrap(await axiosClient.get(`/objectives/${id}`)),
  update: async (id, payload) => unwrap(await axiosClient.put(`/objectives/${id}`, payload)),
  remove: async (id) => axiosClient.delete(`/objectives/${id}`)
};
