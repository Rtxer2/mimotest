import { create } from 'zustand';
import client from '../api/client';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
}

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
  fetchProfile: () => Promise<void>;
  hasRole: (...roles: string[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('token'),
  user: null,

  login: async (username: string, password: string) => {
    const response = await client.post('/auth/login',
      new URLSearchParams({ username, password }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    const { access_token } = response.data;
    localStorage.setItem('token', access_token);
    set({ token: access_token });
    await get().fetchProfile();
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  },

  isAuthenticated: () => {
    return get().token !== null;
  },

  fetchProfile: async () => {
    try {
      const response = await client.get<UserProfile>('/auth/profile');
      set({ user: response.data });
    } catch {
      get().logout();
    }
  },

  hasRole: (...roles: string[]) => {
    const { user } = get();
    return user !== null && roles.includes(user.role);
  },
}));
