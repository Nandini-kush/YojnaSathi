import apiClient from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  user_id: number;
  email: string;
  name: string;
  role?: string;
}

// Authentication endpoints
export const authService = {
  register: (data: RegisterRequest) =>
    apiClient.post<UserResponse>('/auth/register', data),

  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/auth/login', data),

  adminLogin: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/admin/login', data),
};

// User profile endpoints
export const userService = {
  getMe: () =>
    apiClient.get<UserResponse>('/users/me'),

  getProfile: () =>
    apiClient.get<UserResponse>('/users/profile'),
};

// Schemes endpoints
export interface Scheme {
  id: number;
  name: string;
  description?: string;
  eligibility_criteria?: string;
  benefits?: string;
}

export const schemesService = {
  getAllSchemes: () =>
    apiClient.get<Scheme[]>('/schemes'),

  getSchemeById: (id: number) =>
    apiClient.get<Scheme>(`/schemes/${id}`),

  getEligibleSchemes: () =>
    apiClient.get<Scheme[]>('/user-schemes/eligible'),
};

// Eligibility check endpoints
export interface EligibilityRequest {
  age: number;
  income: number;
  state?: string;
  caste?: string;
  occupation?: string;
  gender?: string;
  category?: string;
}

export interface EligibilityResponse {
  scheme_id: number;
  scheme_name: string;
  eligible: boolean;
  reason?: string;
}

export const eligibilityService = {
  checkEligibility: (data: EligibilityRequest) =>
    apiClient.post<EligibilityResponse[]>('/eligibility', data),

  getEligibilityHistory: () =>
    apiClient.get<EligibilityResponse[]>('/eligibility-history'),

  getEligibilityHistoryDetail: (id: number) =>
    apiClient.get<EligibilityResponse>(`/eligibility-history/${id}`),
};

// ML Recommendation types
export interface RecommendationRequest {
  age: number;
  income: number;
  gender: string;
  category: string;
}

export interface RecommendationResult {
  scheme_id: number;
  scheme_name: string;
  probability: number;
  eligible: boolean;
}

export interface RecommendationResponse {
  recommended_schemes: RecommendationResult[];
  total_schemes: number;
  total_eligible: number;
}

// ML Recommendation endpoints
export const recommendationService = {
  getRecommendations: (data: RecommendationRequest) =>
    apiClient.post<RecommendationResponse>('/ml/recommend', data),

  predictSchemes: (data: RecommendationRequest) =>
    apiClient.post<RecommendationResponse>('/ml/predict-schemes', data),
};

export {};

