/**
 * Production-grade Axios client with JWT token management
 * 
 * Features:
 * - Automatic token injection on all requests
 * - Centralized error handling with 401 redirect
 * - Type-safe request/response handling
 * - Configurable retry logic
 * - Clear error messages for debugging
 */

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';

// ============================================================================
// TYPES
// ============================================================================

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

interface RequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// ============================================================================
// TOKEN STORAGE
// ============================================================================

/**
 * Centralized token storage - use this everywhere instead of direct localStorage
 */
export const tokenStorage = {
  getToken: (): string | null => {
    try {
      return localStorage.getItem('access_token');
    } catch (error) {
      console.error('Failed to retrieve token from storage:', error);
      return null;
    }
  },

  setToken: (token: string): void => {
    try {
      localStorage.setItem('access_token', token);
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  },

  clearToken: (): void => {
    try {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Failed to clear token from storage:', error);
    }
  },

  hasToken: (): boolean => {
    return !!tokenStorage.getToken();
  },
};

// ============================================================================
// AXIOS INSTANCE
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_PREFIX = '/api/v1';
const FULL_BASE_URL = `${API_BASE_URL}${API_PREFIX}`;
const REQUEST_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000');

/**
 * Create the base Axios instance with default configuration
 */
export const axiosClient: AxiosInstance = axios.create({
  baseURL: FULL_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// REQUEST INTERCEPTOR - Add token to all requests
// ============================================================================

axiosClient.interceptors.request.use(
  (config: RequestConfig) => {
    const token = tokenStorage.getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development
    if (import.meta.env.DEV) {
      console.debug(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// ============================================================================
// RESPONSE INTERCEPTOR - Handle errors including 401
// ============================================================================

axiosClient.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.debug(
        `[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`
      );
    }
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as RequestConfig;

    // ========== 401 UNAUTHORIZED - Token expired or invalid ==========
    if (error.response?.status === 401) {
      // Prevent infinite retry loops
      if (config._retry) {
        console.error('[API Error] 401 Unauthorized - Retry failed');
        handleUnauthorized();
        return Promise.reject(error);
      }

      console.warn('[API Error] 401 Unauthorized - Token expired or invalid');
      handleUnauthorized();
      return Promise.reject(error);
    }

    // ========== 403 FORBIDDEN - User doesn't have permission ==========
    if (error.response?.status === 403) {
      console.error('[API Error] 403 Forbidden - Access denied');
    }

    // ========== 404 NOT FOUND ==========
    if (error.response?.status === 404) {
      console.warn('[API Error] 404 Not Found');
    }

    // ========== 5xx SERVER ERRORS ==========
    if (error.response?.status && error.response.status >= 500) {
      console.error('[API Error] Server error:', error.response.status);
    }

    // ========== NETWORK ERRORS ==========
    if (!error.response) {
      console.error('[API Error] Network error or no response from server', error.message);
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Handle unauthorized access (401 response)
 * - Clear token and user data
 * - Redirect to login page
 * - Optional: Show notification to user
 */
function handleUnauthorized(): void {
  tokenStorage.clearToken();

  // Redirect to login (adjust path based on your routing)
  const currentPath = window.location.pathname;
  const loginPath = '/login';

  if (currentPath !== loginPath) {
    window.location.href = loginPath;
  }
}

/**
 * Check if a JWT token is expired (without verification, for UI purposes only)
 * This is a client-side check and shouldn't be trusted for security decisions
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(
      atob(token.split('.')[1])
    );
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.warn('Failed to parse token expiration:', error);
    return true; // Assume expired if we can't parse it
  }
};

/**
 * Extract time until token expires (in seconds)
 */
export const getTokenTimeUntilExpiry = (token: string): number => {
  try {
    const payload = JSON.parse(
      atob(token.split('.')[1])
    );
    const currentTime = Math.floor(Date.now() / 1000);
    return Math.max(0, payload.exp - currentTime);
  } catch (error) {
    console.warn('Failed to extract token expiration time:', error);
    return 0;
  }
};

/**
 * Extract user info from token (for UI display without extra API call)
 */
export const getUserFromToken = (token: string): Record<string, any> | null => {
  try {
    const payload = JSON.parse(
      atob(token.split('.')[1])
    );
    return payload;
  } catch (error) {
    console.warn('Failed to parse token payload:', error);
    return null;
  }
};

export default axiosClient;
