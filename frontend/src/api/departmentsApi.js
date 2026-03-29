import axiosClient from './axiosClient';
import { unwrap } from './helpers';

export const departmentsApi = {
  list: async () => unwrap(await axiosClient.get('/departments')),
  create: async (payload) => unwrap(await axiosClient.post('/departments', payload)),
  update: async (id, payload) => unwrap(await axiosClient.put(`/departments/${id}`, payload)),
  remove: async (id) => axiosClient.delete(`/departments/${id}`)
};
