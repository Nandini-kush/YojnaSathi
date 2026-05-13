/**
 * Centralized API endpoints and methods
 * Uses the production-grade axiosClient from lib/axiosClient.ts
 * 
 * All requests automatically include Authorization header with JWT token
 * All 401 errors are automatically handled (user logged out)
 */

import axiosClient, { TokenResponse } from '../lib/axiosClient';

// ============================================================================
// TYPES
// ============================================================================

export interface LoginRequest {
  username: string; // Email
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role?: string;
}

export interface Scheme {
  id: string;
  name: string;
  description: string;
  eligibility_criteria?: Record<string, any>;
}

export interface EligibilityCheckRequest {
  age: number;
  income: number; // Monthly income
  gender: string;
}

export interface EligibilityCheckResponse {
  eligible_schemes: Scheme[];
  message?: string;
}

export interface MLRecommendRequest {
  age: number;
  income: number; // Annual income
  gender: string;
  category: string;
}

export interface MLRecommendResponse {
  recommendations: Array<{
    scheme_id: string;
    scheme_name: string;
    match_score: number;
  }>;
}

// ============================================================================
// AUTHENTICATION API
// ============================================================================

export const authAPI = {
  /**
   * Login user with email and password
   * Returns JWT token
   */
  login: (data: LoginRequest): Promise<TokenResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', data.username);
    formData.append('password', data.password);

    return axiosClient
      .post<TokenResponse>('/user/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      .then((res) => res.data);
  },

  /**
   * Register new user
   */
  register: (data: RegisterRequest) => {
    return axiosClient
      .post('/user/auth/register', data)
      .then((res) => res.data);
  },

  /**
   * Logout user (optional backend call)
   */
  logout: () => {
    return axiosClient.post('/user/auth/logout', {});
  },
};

// ============================================================================
// USER API - Protected endpoints
// ============================================================================

export const userAPI = {
  /**
   * Get current user profile
   * Protected: Requires JWT token
   */
  getProfile: (): Promise<UserProfile> => {
    return axiosClient
      .get('/user/profile')
      .then((res) => res.data);
  },

  /**
   * Update user profile
   * Protected: Requires JWT token
   */
  updateProfile: (data: Partial<UserProfile>) => {
    return axiosClient
      .put('/user/profile', data)
      .then((res) => res.data);
  },

  /**
   * Get eligibility check history
   * Protected: Requires JWT token
   */
  getEligibilityHistory: () => {
    return axiosClient
      .get('/user/eligibility-history')
      .then((res) => res.data);
  },

  /**
   * Get schemes user is eligible for
   * Protected: Requires JWT token
   */
  getEligibleSchemes: () => {
    return axiosClient
      .get('/user-schemes/eligible')
      .then((res) => res.data);
  },
};

// ============================================================================
// SCHEMES API
// ============================================================================

export const schemesAPI = {
  /**
   * Get all available schemes
   * Public: No authentication required
   */
  getAll: (): Promise<Scheme[]> => {
    return axiosClient
      .get('/schemes/')
      .then((res) => res.data);
  },

  /**
   * Get scheme by ID
   * Public: No authentication required
   */
  getById: (id: string): Promise<Scheme> => {
    return axiosClient
      .get(`/schemes/${id}`)
      .then((res) => res.data);
  },

  /**
   * Check eligibility for schemes
   * Protected: Requires JWT token
   */
  checkEligibility: (data: EligibilityCheckRequest): Promise<EligibilityCheckResponse> => {
    return axiosClient
      .post('/schemes/check-eligibility', data)
      .then((res) => res.data);
  },
};

// ============================================================================
// ML RECOMMENDATION API - Protected endpoint
// ============================================================================

export const mlAPI = {
  /**
   * Get ML-ranked scheme recommendations based on user profile
   * Protected: Requires JWT token
   * 
   * @param data User profile with optional parameters
   * @returns Top recommended schemes ranked by ML model
   */
  recommend: (data: MLRecommendRequest): Promise<MLRecommendResponse> => {
    return axiosClient
      .post('/ml/recommend', data)
      .then((res) => res.data);
  },
};

// ============================================================================
// ADMIN API - Protected endpoints (admin only)
// ============================================================================

export const adminAPI = {
  /**
   * Admin login
   * Returns JWT token with admin privileges
   */
  login: (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    return axiosClient
      .post<TokenResponse>('/admin/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      .then((res) => res.data);
  },

  /**
   * Create new scheme
   * Protected: Admin only
   */
  createScheme: (data: Partial<Scheme>) => {
    return axiosClient
      .post('/admin/schemes/', data)
      .then((res) => res.data);
  },

  /**
   * Update scheme
   * Protected: Admin only
   */
  updateScheme: (id: string, data: Partial<Scheme>) => {
    return axiosClient
      .put(`/admin/schemes/${id}`, data)
      .then((res) => res.data);
  },

  /**
   * Delete scheme
   * Protected: Admin only
   */
  deleteScheme: (id: string) => {
    return axiosClient
      .delete(`/admin/schemes/${id}`)
      .then((res) => res.data);
  },

  /**
   * Get all schemes (admin view)
   * Protected: Admin only
   */
  getSchemes: () => {
    return axiosClient
      .get('/admin/schemes/')
      .then((res) => res.data);
  },

  /**
   * Get admin statistics
   * Protected: Admin only
   */
  getStats: () => {
    return axiosClient
      .get('/admin/stats')
      .then((res) => res.data);
  },

  /**
   * Get recent users
   * Protected: Admin only
   */
  getRecentUsers: (limit: number = 10) => {
    return axiosClient
      .get('/admin/users', { params: { limit } })
      .then((res) => res.data);
  },

  /**
   * Get recent eligibility checks
   * Protected: Admin only
   */
  getRecentEligibilityChecks: (limit: number = 10) => {
    return axiosClient
      .get('/admin/eligibility-checks', { params: { limit } })
      .then((res) => res.data);
  },
};

export default {
  authAPI,
  userAPI,
  schemesAPI,
  mlAPI,
  adminAPI,
};
