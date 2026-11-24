import api from './api';

export const goalService = {
  async getGoals(params = {}) {
    const res = await api.get('/goals', { params });
    return res.data;
  },

  async getGoalById(id) {
    const res = await api.get(`/goals/${id}`);
    return res.data;
  },

  async createGoal(goalData) {
    const res = await api.post('/goals', goalData);
    return res.data;
  },

  async updateGoal(id, goalData) {
    const res = await api.put(`/goals/${id}`, goalData);
    return res.data;
  },

  async updateGoalProgress(id, currentValue) {
    const res = await api.patch(`/goals/${id}/progress`, { currentValue });
    return res.data;
  },

  async deleteGoal(id) {
    const res = await api.delete(`/goals/${id}`);
    return res.data;
  },
};
