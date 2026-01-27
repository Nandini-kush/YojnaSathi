import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired - clear storage and redirect
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  logout: () => api.post('/auth/logout', {}),
};

// Schemes endpoints
export const schemesAPI = {
  getAll: () => api.get('/schemes/'),
  
  getById: (id: string) => api.get(`/schemes/${id}`),
  
  createScheme: (data: any) => 
    api.post('/admin/schemes/', data),
  
  updateScheme: (id: string, data: any) => 
    api.put(`/admin/schemes/${id}`, data),
  
  deleteScheme: (id: string) => 
    api.delete(`/admin/schemes/${id}`),
};

// User endpoints
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  
  getEligibilityHistory: () => api.get('/user/eligibility-history'),
  
  getEligibleSchemes: () => api.get('/user-schemes/eligible'),
  
  updateProfile: (data: any) => api.put('/user/profile', data),
};

// Eligibility endpoints - Checks eligibility and saves to history
export const eligibilityAPI = {
  // POST /schemes/check-eligibility - Protected endpoint that saves to history
  // Expects: { age, income (monthly), gender, is_student }
  check: (data: any) => api.post('/schemes/check-eligibility', data),
  
  getHistory: () => api.get('/user/eligibility-history'),
};

// ML Recommendation endpoints
export const mlAPI = {
  // POST /ml/recommend - Get ML-ranked scheme recommendations
  // Expects: { age, income (annual), gender, category }
  recommend: (data: any) => api.post('/ml/recommend', data),
};

// Admin endpoints
export const adminAPI = {
  createScheme: (data: any) => api.post('/admin/schemes/', data),
  
  updateScheme: (id: string, data: any) => api.put(`/admin/schemes/${id}`, data),
  
  deleteScheme: (id: string) => api.delete(`/admin/schemes/${id}`),
  
  getSchemes: () => api.get('/schemes/'),

  getStats: () => api.get('/admin/stats'),

  getRecentUsers: (limit: number = 10) => api.get('/admin/users', { params: { limit } }),

  getRecentEligibilityChecks: (limit: number = 10) => api.get('/admin/eligibility-checks', { params: { limit } }),

  getAllSchemes: () => api.get('/admin/schemes'),

  loginAdmin: (email: string, password: string) =>
    api.post('/admin/auth/login', { username: email, password }),
};

export default api;
