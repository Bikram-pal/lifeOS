import api from './api';

export const vaultService = {
  // Document APIs
  async getDocuments(params = {}) {
    const res = await api.get('/documents', { params });
    return res.data;
  },

  async getDocumentById(id) {
    const res = await api.get(`/documents/${id}`);
    return res.data;
  },

  async uploadDocument(formData) {
    const res = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  async deleteDocument(id) {
    const res = await api.delete(`/documents/${id}`);
    return res.data;
  },

  // Note APIs
  async getNotes(params = {}) {
    const res = await api.get('/notes', { params });
    return res.data;
  },

  async getNoteById(id) {
    const res = await api.get(`/notes/${id}`);
    return res.data;
  },

  async createNote(noteData) {
    const res = await api.post('/notes', noteData);
    return res.data;
  },

  async updateNote(id, noteData) {
    const res = await api.put(`/notes/${id}`, noteData);
    return res.data;
  },

  async deleteNote(id) {
    const res = await api.delete(`/notes/${id}`);
    return res.data;
  },
};
