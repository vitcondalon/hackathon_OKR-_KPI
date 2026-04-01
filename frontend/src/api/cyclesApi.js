import axiosClient from './axiosClient';
import { unwrap } from './helpers';

export const cyclesApi = {
  list: async () => unwrap(await axiosClient.get('/cycles')),
  create: async (payload) => unwrap(await axiosClient.post('/cycles', payload)),
  update: async (id, payload) => unwrap(await axiosClient.put(`/cycles/${id}`, payload)),
  remove: async (id) => unwrap(await axiosClient.delete(`/cycles/${id}`))
};
