import axiosClient from './axiosClient';
import { unwrap } from './helpers';

export const usersApi = {
  list: async () => unwrap(await axiosClient.get('/users')),
  create: async (payload) => unwrap(await axiosClient.post('/users', payload)),
  getById: async (id) => unwrap(await axiosClient.get(`/users/${id}`)),
  update: async (id, payload) => unwrap(await axiosClient.put(`/users/${id}`, payload)),
  remove: async (id) => axiosClient.delete(`/users/${id}`)
};
