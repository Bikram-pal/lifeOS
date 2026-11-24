import api from './api';

export const aiService = {
  async getConversations() {
    const res = await api.get('/ai/conversations');
    return res.data;
  },

  async getConversationMessages(id) {
    const res = await api.get(`/ai/conversations/${id}/messages`);
    return res.data;
  },

  async createConversation(data = {}) {
    const res = await api.post('/ai/conversations', data);
    return res.data;
  },

  async deleteConversation(id) {
    const res = await api.delete(`/ai/conversations/${id}`);
    return res.data;
  },

  async chat(chatData) {
    const res = await api.post('/ai/chat', chatData);
    return res.data;
  },

  async extractTasks(extractData) {
    const res = await api.post('/ai/extract-tasks', extractData);
    return res.data;
  },

  async approveTask(taskData) {
    const res = await api.post('/ai/approve-task', taskData);
    return res.data;
  },
};
