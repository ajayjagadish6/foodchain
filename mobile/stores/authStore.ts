import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { TOKEN_STORAGE_KEY } from '../constants/config';
import { authService } from '../services/authService';
import type { MeView } from '../types/api';

interface AuthState {
  token: string | null;
  user: MeView | null;
  isLoading: boolean;
  initialize: () => Promise<void>;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isLoading: true,

  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
      if (token) {
        const user = await authService.me();
        set({ token, user, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY).catch(() => {});
      set({ token: null, user: null, isLoading: false });
    }
  },

  login: async (token: string) => {
    await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, token);
    const user = await authService.me();
    set({ token, user });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY).catch(() => {});
    set({ token: null, user: null });
  },

  refreshUser: async () => {
    try {
      const user = await authService.me();
      set({ user });
    } catch {
      await get().logout();
    }
  },
}));
