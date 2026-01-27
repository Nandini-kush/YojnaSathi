import { create } from 'zustand';

export interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export interface AuthActions {
  setUser: (user: any) => void;
  setToken: (token: string) => void;
  logout: () => void;
  loadFromStorage: () => void;
  setAdmin: (isAdmin: boolean) => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
    localStorage.setItem('user', JSON.stringify(user));
  },

  setToken: (token) => {
    set({ token });
    localStorage.setItem('access_token', token);
  },

  setAdmin: (isAdmin) => {
    set({ isAdmin });
  },

  logout: () => {
    set({ user: null, token: null, isAuthenticated: false, isAdmin: false });
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  loadFromStorage: () => {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');

    if (token && user) {
      try {
        set({
          token,
          user: JSON.parse(user),
          isAuthenticated: true,
        });
      } catch (error) {
        console.error('Failed to parse user from storage:', error);
      }
    }
  },
}));
