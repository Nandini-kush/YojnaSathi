/**
 * Custom hook for user authentication (login, logout, register)
 * 
 * Usage:
 * const { login, logout, isLoading, error } = useAuth();
 */

import { useState } from 'react';
import axiosClient, { TokenResponse, tokenStorage } from '../lib/axiosClient';
import { useAuthStore } from '../context/authStore';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthError {
  message: string;
  status?: number;
  details?: any;
}

export interface UseAuthReturn {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: AuthError | null;
  clearError: () => void;
}

/**
 * useAuth hook - Handles all authentication operations
 */
export const useAuth = (): UseAuthReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  // Get store actions
  const { setToken, setUser, logout: storeLogout, setLoading } = useAuthStore();

  // Clear error
  const clearError = () => setError(null);

  /**
   * Login user with email and password
   * 
   * @param credentials - { username (email), password }
   * @throws AuthError if login fails
   */
  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    setLoading(true);
    clearError();

    try {
      // Call backend login endpoint (JSON body expected by FastAPI)
      const payload = { email: credentials.username, password: credentials.password };
      const response = await axiosClient.post<TokenResponse>('/auth/login', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const { access_token, token_type } = response.data;

      if (!access_token) {
        throw new Error('No access token received from server');
      }

      // Store token in both state and localStorage
      setToken(access_token);

      // Extract user info from token (optional - for display)
      // In a real app, you might fetch full user profile from /user/profile endpoint
      const userPayload = {
        email: credentials.username,
        // You can decode more info from JWT if needed
      };
      setUser(userPayload);

      console.log('✅ Login successful');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        'Login failed';

      const authError: AuthError = {
        message: typeof errorMessage === 'string' ? errorMessage : 'Login failed',
        status: err.response?.status,
        details: err.response?.data,
      };

      setError(authError);
      console.error('❌ Login failed:', authError.message);

      throw authError;
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  /**
   * Logout user
   * - Clears authentication state
   * - Removes token from storage
   * - Note: Optional backend logout endpoint can be called here if available
   */
  const logout = (): void => {
    try {
      // Optional: Call backend logout endpoint
      // await axiosClient.post('/user/auth/logout');
    } catch (err) {
      console.warn('Backend logout failed (non-critical):', err);
    } finally {
      storeLogout();
      clearError();
      console.log('✅ Logout successful');
    }
  };

  return {
    login,
    logout,
    isLoading,
    error,
    clearError,
  };
};

export default useAuth;
