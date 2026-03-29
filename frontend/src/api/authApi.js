import axiosClient from './axiosClient';
import { unwrap } from './helpers';

export const authApi = {
  async login(payload) {
    const response = await axiosClient.post('/auth/login', payload);
    return unwrap(response);
  },
  async me() {
    const response = await axiosClient.get('/auth/me');
    return unwrap(response);
  }
};
