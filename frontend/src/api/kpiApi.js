import axiosClient from './axiosClient';
import { unwrap } from './helpers';

export const kpiApi = {
  list: async (params = {}) => unwrap(await axiosClient.get('/kpis', { params })),
  create: async (payload) => unwrap(await axiosClient.post('/kpis', payload)),
  update: async (id, payload) => unwrap(await axiosClient.put(`/kpis/${id}`, payload)),
  remove: async (id) => axiosClient.delete(`/kpis/${id}`)
};
