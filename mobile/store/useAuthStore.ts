import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

interface User {
  id: number;
  full_name: string;
  phone: string;
  email?: string;
  language: 'en' | 'fr';
  avatar_url?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login:  (phone: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (phone, password) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/login', { phone, password });
      const { user, tokens } = res.data.data;
      await AsyncStorage.multiSet([
        ['@camerbus_user',          JSON.stringify(user)],
        ['@camerbus_access_token',  tokens.access_token],
        ['@camerbus_refresh_token', tokens.refresh_token],
      ]);
      set({ user, accessToken: tokens.access_token, refreshToken: tokens.refresh_token, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/register', data);
      const { user, tokens } = res.data.data;
      await AsyncStorage.multiSet([
        ['@camerbus_user',          JSON.stringify(user)],
        ['@camerbus_access_token',  tokens.access_token],
        ['@camerbus_refresh_token', tokens.refresh_token],
      ]);
      set({ user, accessToken: tokens.access_token, refreshToken: tokens.refresh_token, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['@camerbus_user','@camerbus_access_token','@camerbus_refresh_token']);
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },

  loadFromStorage: async () => {
    try {
      const [[, userStr],[, accessToken],[, refreshToken]] = await AsyncStorage.multiGet([
        '@camerbus_user','@camerbus_access_token','@camerbus_refresh_token',
      ]);
      if (userStr && accessToken) {
        set({ user: JSON.parse(userStr), accessToken, refreshToken, isAuthenticated: true });
      }
    } catch {}
  },

  updateUser: (data) => set((s) => ({ user: s.user ? { ...s.user, ...data } : null })),
}));
