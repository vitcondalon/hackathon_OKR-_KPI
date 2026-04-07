import axiosClient from './axiosClient';
import { unwrap } from './helpers';

export const okrApi = {
  listCycles: async (params = {}) => unwrap(await axiosClient.get('/cycles', { params })),
  createCycle: async (payload) => unwrap(await axiosClient.post('/cycles', payload)),
  updateCycle: async (id, payload) => unwrap(await axiosClient.put(`/cycles/${id}`, payload)),
  deleteCycle: async (id) => axiosClient.delete(`/cycles/${id}`),

  listObjectives: async (params = {}) => unwrap(await axiosClient.get('/objectives', { params })),
  createObjective: async (payload) => unwrap(await axiosClient.post('/objectives', payload)),
  updateObjective: async (id, payload) => unwrap(await axiosClient.put(`/objectives/${id}`, payload)),
  deleteObjective: async (id) => axiosClient.delete(`/objectives/${id}`),

  listKeyResults: async (params = {}) => unwrap(await axiosClient.get('/key-results', { params })),
  createKeyResult: async (payload) => unwrap(await axiosClient.post('/key-results', payload)),
  updateKeyResult: async (id, payload) => unwrap(await axiosClient.put(`/key-results/${id}`, payload)),
  deleteKeyResult: async (id) => axiosClient.delete(`/key-results/${id}`),

  listCheckins: async (params = {}) => unwrap(await axiosClient.get('/checkins', { params })),
  createCheckin: async (payload) => unwrap(await axiosClient.post('/checkins', payload))
};
