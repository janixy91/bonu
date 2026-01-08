import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService } from '../services/api.service';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        console.log('[AuthStore] Login called');
        const response = await authService.login(email, password);
        console.log('[AuthStore] Login response:', response);
        console.log('[AuthStore] User from response:', response.user);
        console.log('[AuthStore] User role:', response.user?.role);
        set({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
        });
        const state = get();
        console.log('[AuthStore] State after set:', state);
        console.log('[AuthStore] User in state:', state.user);
        console.log('[AuthStore] User role in state:', state.user?.role);
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'bonu-admin-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

