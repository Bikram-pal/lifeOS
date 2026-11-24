import api from './api';

export const analyticsService = {
  async getReports() {
    const res = await api.get('/analytics');
    return res.data;
  },
};
