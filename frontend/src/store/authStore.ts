import { create } from 'zustand';
import client from '../api/client';

interface AuthState {
  token: string | null;
  user: any | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('token'),
  user: null,

  login: async (username: string, password: string) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await client.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const { access_token } = response.data;
    localStorage.setItem('token', access_token);
    set({ token: access_token });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  },

  isAuthenticated: () => {
    return get().token !== null;
  },
}));
