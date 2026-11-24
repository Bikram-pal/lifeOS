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

  /**
   * Create an edge in the DB.
   * @param {object} edgePayload - { tempId, source, target, label }
   * tempId is a local React Flow id used to swap the edge id once the
   * server returns the real DB edgeId.
   */
  async createEdge({ tempId, source, target, label }) {
    // Send the tempId as a hint so the server can echo it back or use its own
    const res = await api.post('/graph/edges', { source, target, label });
    return res.data; // res.data.data.edgeId is the canonical DB edgeId
  },

  async deleteEdge(edgeId) {
    const encoded = encodeURIComponent(edgeId);
    const res = await api.delete(`/graph/edges/${encoded}`);
    return res.data;
  },
};
