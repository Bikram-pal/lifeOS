import api from './api';

export const graphService = {
  async getGraphData() {
    const res = await api.get('/graph');
    return res.data;
  },

  async saveGraphLayout(nodes) {
    const res = await api.post('/graph/layout', { nodes });
    return res.data;
  },

  async createEdge(edgeData) {
    const res = await api.post('/graph/edges', edgeData);
    return res.data;
  },

  async deleteEdge(edgeId) {
    const res = await api.delete(`/graph/edges/${edgeId}`);
    return res.data;
  },
};
