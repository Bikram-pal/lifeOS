import api from './api';

export const dashboardService = {
  async getSummary() {
    const res = await api.get('/dashboard');
    return res.data;
  },
};
