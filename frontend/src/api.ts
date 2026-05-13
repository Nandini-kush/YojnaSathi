/**
 * Centralized API Client (src/api.ts)
 * 
 * Handles all HTTP requests with:
 * - Automatic JWT Bearer token injection
 * - Detailed console logging for debugging
 * - Error handling and 401 redirect
 * - Request/response interceptors
 * - Graceful token missing handling
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Scheme } from '@/types/api';

// Response format for eligible schemes endpoint
export interface EligibleSchemesResponse {
  success: boolean;
  count: number;
  schemes: Scheme[];
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_PREFIX = '/api/v1';
const API_BASE_URL = `${API_BASE}${API_PREFIX}`;

console.log('🚀 API Client initializing...');
console.log(`   Base URL: ${API_BASE}`);
console.log(`   API Prefix: ${API_PREFIX}`);
console.log(`   Full Base URL: ${API_BASE_URL}`);

// ============================================================================
// TOKEN STORAGE - Centralized
// ============================================================================

export const tokenManager = {
  /**
   * Get token from localStorage
   */
  getToken: (): string | null => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        console.log(`📦 Token retrieved from localStorage (length: ${token.length})`);
      } else {
        console.warn('⚠️  No token found in localStorage');
      }
      return token;
    } catch (error) {
      console.error('❌ Error reading token from localStorage:', error);
      return null;
    }
  },

  /**
   * Store token in localStorage
   */
  setToken: (token: string): void => {
    try {
      localStorage.setItem('access_token', token);
      console.log(`✅ Token stored in localStorage (length: ${token.length})`);
    } catch (error) {
      console.error('❌ Error storing token in localStorage:', error);
    }
  },

  /**
   * Remove token from localStorage
   */
  removeToken: (): void => {
    try {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      console.log('🗑️  Token and user data cleared from localStorage');
    } catch (error) {
      console.error('❌ Error clearing token from localStorage:', error);
    }
  },

  /**
   * Check if token exists
   */
  hasToken: (): boolean => {
    const token = tokenManager.getToken();
    return !!token;
  },
};

// ============================================================================
// AXIOS INSTANCE - With Interceptors
// ============================================================================

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
});

console.log(`✅ Axios instance created with baseURL: ${API_BASE_URL}`);

// ============================================================================
// REQUEST INTERCEPTOR - Inject Bearer Token
// ============================================================================

apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`✅ [REQUEST] Authorization header added`);
      console.log(`   Endpoint: ${config.method?.toUpperCase()} ${config.url}`);
      console.log(`   Token prefix: ${token.substring(0, 20)}...`);
    } else {
      console.warn(`⚠️  [REQUEST] No token available for auth endpoint: ${config.url}`);
      console.warn(`   This endpoint may not require authentication`);
    }

    return config;
  },
  (error) => {
    console.error('❌ [REQUEST] Interceptor error:', error);
    return Promise.reject(error);
  }
);

// ============================================================================
// RESPONSE INTERCEPTOR - Handle Errors
// ============================================================================

apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ [RESPONSE] ${response.status} - ${response.config.url}`);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const detail = error.response?.data?.detail || error.message;

    console.error(`❌ [RESPONSE ERROR] Status: ${status}`);
    console.error(`   Endpoint: ${url}`);
    console.error(`   Error: ${detail}`);

    // Handle 401 (Unauthorized - Token expired or invalid)
    if (status === 401) {
      console.warn('🔴 401 Unauthorized - Token is invalid or expired');
      console.warn('   Clearing localStorage and redirecting to login...');

      // Clear token and user data
      tokenManager.removeToken();

      // Redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }

      return Promise.reject(
        new Error('Session expired. Please login again.')
      );
    }

    // Handle 422 (Validation Error)
    if (status === 422) {
      const details = error.response?.data?.detail;
      console.error('🟠 422 Validation Error:', details);
    }

    // Handle 500 (Server Error)
    if (status === 500) {
      console.error('🔴 500 Server Error - Backend application error');
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// API ENDPOINTS - Organized by Feature
// ============================================================================

/**
 * Authentication Endpoints
 */
export const authAPI = {
  /**
   * Login with email and password
   * Expects OAuth2PasswordRequestForm (username + password)
   * Returns: { access_token, token_type }
   */
  login: async (email: string, password: string) => {
    console.log(`🔐 Logging in user: ${email}`);

    try {
      // Backend expects JSON: { email, password }
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      console.log('✅ Login successful');
      const token = response.data.access_token;
      if (token) tokenManager.setToken(token);

      return response.data;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  },

  /**
   * Register new user
   */
  register: async (name: string, email: string, password: string) => {
    console.log(`👤 Registering new user: ${email}`);
    // Backend registration endpoint is /auth/register
    return apiClient.post('/auth/register', {
      name,
      email,
      password,
    });
  },

  /**
   * Logout user (optional backend call)
   */
  logout: async () => {
    console.log('🚪 Logging out user');
    // Backend logout route may not exist; perform local cleanup only
    tokenManager.removeToken();
  },
};

/**
 * User Profile Endpoints (Protected)
 */
export const userAPI = {
  /**
   * Get current user profile
   * Requires: Bearer token
   */
  getProfile: () => {
    console.log('👤 Fetching user profile...');
    return apiClient.get('/user/profile');
  },

  /**
   * Update user profile
   * Requires: Bearer token
   */
  updateProfile: (data: any) => {
    console.log('✏️  Updating user profile...');
    return apiClient.put('/user/profile', data);
  },

  /**
   * Get eligibility check history
   * Requires: Bearer token
   */
  getEligibilityHistory: () => {
    console.log('📋 Fetching eligibility history...');
    return apiClient.get('/user/eligibility-history');
  },
};

/**
 * Scheme Endpoints
 */
export const schemesAPI = {
  /**
   * Get all schemes
   */
  getAll: () => {
    console.log('📋 Fetching all schemes...');
    return apiClient.get('/schemes/');
  },

  /**
   * Get single scheme by ID
   */
  getById: (id: string | number) => {
    console.log(`📄 Fetching scheme ${id}...`);
    return apiClient.get(`/schemes/${id}`);
  },

  /**
   * Get scheme details by ID (for Scheme Detail page)
   * Returns full scheme information from database
   * Requires: None (public endpoint)
   */
  getSchemeDetail: (id: string | number) => {
    console.log(`📄 Fetching scheme details for ID: ${id}...`);
    return apiClient.get(`/schemes/${id}`);
  },

  /**
   * Get eligible schemes for current user
   * Requires: Bearer token
   * 
   * Returns user profile from token, fetches eligible schemes from database
   * No parameters needed - backend extracts user from JWT
   */
  getEligible: async (): Promise<Scheme[]> => {
    console.log('🎯 Fetching eligible schemes for current user...');
    const response = await apiClient.get<EligibleSchemesResponse>('/schemes/eligible');
    console.log('Eligible schemes API response:', response.data);
    return response.data.schemes;
  },

  /**
   * Check eligibility for a specific scheme
   * Requires: Bearer token
   */
  checkEligibility: (data: any) => {
    console.log('✅ Checking scheme eligibility...');
    return apiClient.post('/schemes/check-eligibility', data);
  },
};

/**
 * ML Recommendations Endpoints (Protected)
 * ⭐ Main feature for Dashboard
 */
export const mlAPI = {
  /**
   * Get ML-powered scheme recommendations
   * 
   * Expects:
   * {
   *   "age": 28,
   *   "income": 250000,
   *   "gender": "male",
   *   "category": "general",
   *   "state": "Maharashtra" (optional)
   * }
   * 
   * Requires: Bearer token
   * 
   * Returns: Array of eligible schemes with recommendations
   */
  recommend: async (profileData: {
    age: number;
    income: number;
    gender: string;
    category: string;
    state?: string;
  }) => {
    console.log('🤖 Requesting ML recommendations...');
    console.log('   Payload:', profileData);

    // Verify token exists before calling
    if (!tokenManager.hasToken()) {
      console.error('❌ No auth token available!');
      console.error('   User must be logged in to get recommendations');
      throw new Error('Authentication required. Please login first.');
    }

    console.log('✅ Token verified - proceeding with request');

    return apiClient.post('/ml/recommend', profileData);
  },
};

/**
 * Admin Endpoints (Protected)
 */
export const adminAPI = {
  /**
   * Admin login
   */
  login: async (email: string, password: string) => {
    console.log(`🔐 Admin login: ${email}`);
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    return apiClient.post('/admin/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },

  /**
   * Get all schemes (admin)
   */
  getSchemes: () => {
    console.log('📋 Admin: Fetching all schemes...');
    return apiClient.get('/admin/schemes');
  },

  /**
   * Create new scheme (admin)
   */
  createScheme: (data: any) => {
    console.log('➕ Admin: Creating new scheme...');
    return apiClient.post('/admin/schemes/', data);
  },

  /**
   * Update scheme (admin)
   */
  updateScheme: (id: string | number, data: any) => {
    console.log(`✏️  Admin: Updating scheme ${id}...`);
    return apiClient.put(`/admin/schemes/${id}`, data);
  },

  /**
   * Delete scheme (admin)
   */
  deleteScheme: (id: string | number) => {
    console.log(`🗑️  Admin: Deleting scheme ${id}...`);
    return apiClient.delete(`/admin/schemes/${id}`);
  },
};

// ============================================================================
// DIAGNOSTIC HELPERS - For debugging
// ============================================================================

export const apiDiagnostics = {
  /**
   * Check API connectivity and token status
   */
  checkStatus: () => {
    console.log('\n' + '='.repeat(80));
    console.log('📊 API DIAGNOSTICS');
    console.log('='.repeat(80));

    console.log('🌐 Configuration:');
    console.log(`   Base URL: ${API_BASE_URL}`);
    console.log(`   Timeout: 15000ms`);

    console.log('\n🔐 Authentication:');
    const hasToken = tokenManager.hasToken();
    console.log(`   Token exists: ${hasToken ? '✅ Yes' : '❌ No'}`);

    if (hasToken) {
      const token = tokenManager.getToken();
      console.log(`   Token length: ${token?.length} characters`);
      console.log(`   Token prefix: ${token?.substring(0, 30)}...`);
    }

    console.log('\n💾 LocalStorage:');
    try {
      const stored = localStorage.getItem('access_token');
      console.log(`   access_token stored: ${stored ? '✅ Yes' : '❌ No'}`);

      const user = localStorage.getItem('user');
      console.log(`   user stored: ${user ? '✅ Yes' : '❌ No'}`);
    } catch (e) {
      console.error('   Error reading localStorage:', e);
    }

    console.log('\n' + '='.repeat(80) + '\n');
  },

  /**
   * Test the /ml/recommend endpoint
   */
  testMLEndpoint: async () => {
    console.log('\n' + '='.repeat(80));
    console.log('🧪 TESTING /ml/recommend ENDPOINT');
    console.log('='.repeat(80));

    try {
      const response = await mlAPI.recommend({
        age: 28,
        income: 250000,
        gender: 'male',
        category: 'general',
        state: 'Maharashtra',
      });

      console.log('✅ Request successful!');
      console.log(`   Status: ${response.status}`);
      console.log(`   Recommendations: ${response.data?.recommendations?.length || 0} schemes`);

      return response.data;
    } catch (error: any) {
      console.error('❌ Request failed!');
      console.error(`   Status: ${error.response?.status}`);
      console.error(`   Error: ${error.response?.data?.detail}`);
      throw error;
    } finally {
      console.log('='.repeat(80) + '\n');
    }
  },
};

console.log('✅ API Client fully initialized and ready to use\n');

export default apiClient;
