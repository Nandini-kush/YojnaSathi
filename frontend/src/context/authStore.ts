import { create } from 'zustand';
import { tokenStorage } from '../lib/axiosClient';

export interface User {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  [key: string]: any;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthActions {
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
  loadFromStorage: () => void;
  setLoading: (isLoading: boolean) => void;
}

export type AuthStore = AuthState & AuthActions;

/**
 * Production-grade authentication store using Zustand
 * 
 * Usage:
 * const { user, isAuthenticated, setToken, logout } = useAuthStore();
 */
export const useAuthStore = create<AuthStore>((set) => ({
  // State
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  // Actions
  setUser: (user: User) => {
    set({ user, isAuthenticated: !!user });
    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Failed to persist user to storage:', error);
    }
  },

  setToken: (token: string) => {
    set({ token, isAuthenticated: !!token });
    tokenStorage.setToken(token);
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    tokenStorage.clearToken();
  },

  /**
   * Load authentication state from localStorage on app startup
   * Call this in your root App component
   */
  loadFromStorage: () => {
    try {
      const token = tokenStorage.getToken();
      const userJson = localStorage.getItem('user');

      if (token && userJson) {
        const user = JSON.parse(userJson);
        set({
          token,
          user,
          isAuthenticated: true,
        });
      } else {
        // Clear any stale data
        tokenStorage.clearToken();
      }
    } catch (error) {
      console.error('Failed to load auth state from storage:', error);
      // Clear stale data on parse errors
      tokenStorage.clearToken();
    }
  },
}));
