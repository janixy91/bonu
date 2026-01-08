import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService } from '../services/api.service';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  setOnboardingComplete: () => void;
  refreshAccessToken: () => Promise<void>;
  updateProfile: (name: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      _hasHydrated: false,
      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },

      login: async (email: string, password: string) => {
        const response = await authService.login(email, password);
        console.log('[AuthStore] Login response:', {
          hasUser: !!response.user,
          hasAccessToken: !!response.accessToken,
          hasRefreshToken: !!response.refreshToken,
          tokenPreview: response.accessToken ? response.accessToken.substring(0, 20) + '...' : 'none'
        });
        set({
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          isAuthenticated: true,
        });
        // Verify it was saved
        const stateAfterSet = get();
        console.log('[AuthStore] State after set:', {
          isAuthenticated: stateAfterSet.isAuthenticated,
          hasAccessToken: !!stateAfterSet.accessToken,
          hasUser: !!stateAfterSet.user
        });
      },

      register: async (email: string, password: string, name: string) => {
        const response = await authService.register(email, password, name);
        set({
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          isAuthenticated: true,
        });
      },

      logout: () => {
        console.log('[AuthStore] Logging out, clearing state...');
        // Clear all auth state
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        // Force clear localStorage to ensure clean state
        // Zustand persist will handle this, but we do it explicitly to be sure
        try {
          localStorage.removeItem('bonu-auth-storage');
          console.log('[AuthStore] localStorage cleared');
        } catch (e) {
          console.warn('[AuthStore] Error clearing localStorage:', e);
        }
      },

      setOnboardingComplete: () => {
        set({ hasCompletedOnboarding: true });
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        const response = await authService.refresh(refreshToken);
        set({ accessToken: response.accessToken });
      },

      updateProfile: async (name: string) => {
        const response = await authService.updateProfile(name);
        set({
          user: response.user,
        });
      },
    }),
    {
      name: 'bonu-auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

