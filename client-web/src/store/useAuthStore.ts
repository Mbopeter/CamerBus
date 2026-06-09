import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../api/endpoints';

interface User {
  id: number;
  full_name: string;
  phone: string;
  email?: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

      login: async (phone, password) => {
        set({ isLoading: true });
        try {
          const res = await authService.login({ phone, password });
          const { user, tokens } = res.data.data;
          set({ user, accessToken: tokens.access_token, refreshToken: tokens.refresh_token });
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const res = await authService.register(data);
          const { user, tokens } = res.data.data;
          set({ user, accessToken: tokens.access_token, refreshToken: tokens.refresh_token });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null });
      },
    }),
    {
      name: 'camerbus-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
