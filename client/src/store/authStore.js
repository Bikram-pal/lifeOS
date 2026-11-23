import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('lifeos_user') || 'null'),
  token: localStorage.getItem('lifeos_token') || null,
  isAuthenticated: !!localStorage.getItem('lifeos_token'),
  isLoading: false,

  setAuth: (user, token) => {
    if (token) localStorage.setItem('lifeos_token', token);
    if (user) localStorage.setItem('lifeos_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  setUser: (user) => {
    if (user) localStorage.setItem('lifeos_user', JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    localStorage.removeItem('lifeos_token');
    localStorage.removeItem('lifeos_user');
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));
