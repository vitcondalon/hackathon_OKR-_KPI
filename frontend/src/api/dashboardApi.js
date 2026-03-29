import axiosClient from './axiosClient';
import { unwrap } from './helpers';

export const dashboardApi = {
  summary: async () => unwrap(await axiosClient.get('/dashboard/summary')),
  progress: async () => unwrap(await axiosClient.get('/dashboard/progress')),
  risks: async () => unwrap(await axiosClient.get('/dashboard/risks')),
  topPerformers: async () => unwrap(await axiosClient.get('/dashboard/top-performers')),
  charts: async () => unwrap(await axiosClient.get('/dashboard/charts'))
};
