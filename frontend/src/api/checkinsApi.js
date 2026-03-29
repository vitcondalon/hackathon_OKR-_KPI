import axiosClient from './axiosClient';
import { unwrap } from './helpers';

export const checkinsApi = {
  list: async (params = {}) => unwrap(await axiosClient.get('/checkins', { params })),
  create: async (payload) => unwrap(await axiosClient.post('/checkins', payload))
};
