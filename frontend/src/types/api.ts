/**
 * API Response and Data Type Definitions
 * Ensures type safety across the entire application
 */

// ==================== AUTH TYPES ====================
export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// ==================== USER TYPES ====================
export interface User {
  id: number | string;
  name: string;
  email: string;
  is_admin?: boolean;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

// ==================== SCHEME TYPES ====================
export interface Scheme {
  id: number | string;
  name: string;
  category: string;
  benefit: string;
  eligibility?: string;
  status?: "active" | "inactive" | "draft";
  applicants?: number;
  created_at?: string;
  updated_at?: string;
  description?: string;
}

export interface CreateSchemeRequest {
  name: string;
  category: string;
  benefit: string;
  eligibility: string;
  status?: "active" | "inactive" | "draft";
}

// ==================== ELIGIBILITY TYPES ====================
export interface EligibilityCheckRequest {
  age: number;
  gender: string;
  state: string;
  district: string;
  annual_income?: string;
  employment_type?: string;
  category?: string;
  is_student?: boolean;
  is_farmer?: boolean;
  has_ration_card?: boolean;
  education_level?: string;
  occupation?: string;
}

export interface EligibilityCheckResponse {
  id?: number | string;
  eligible_schemes: Scheme[];
  total_eligible: number;
  total_checked?: number;
  matched_schemes?: Scheme[];
  status?: "completed" | "pending" | "failed";
  created_at?: string;
}

export interface EligibilityHistory {
  id: number | string;
  date: string;
  time: string;
  total_schemes: number;
  eligible: number;
  not_eligible: number;
  eligible_schemes: string[];
  status: "completed" | "pending" | "failed";
  created_at?: string;
}

// ==================== API ERROR TYPES ====================
export interface ApiError {
  detail?: string;
  message?: string;
  error?: string;
}

// ==================== ML RECOMMENDATION TYPES ====================
export interface MLRecommendationRequest {
  age: number;
  income: number;
  gender: string;
  category: string;
  location_type?: string;
  education?: string;
  occupation?: string;
}

export interface RecommendationResult {
  scheme_id: number;
  scheme_name: string;
  probability: number;
  eligible: boolean;
  explanation?: string;
}

export interface MLRecommendationResponse {
  user: MLRecommendationRequest;
  recommended_schemes: RecommendationResult[];
  total_schemes: number;
  total_eligible: number;
}

export interface EligibilityCheckDetail {
  scheme_id: number;
  scheme_name: string;
  eligible: boolean;
  probability: number;
  top_contributing_features?: Array<{
    feature: string;
    importance: number;
  }>;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormState {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}
// ==================== ERROR HANDLING TYPES ====================
export interface ApiError {
  detail?: string;
  message?: string;
  errors?: string[];
  status?: number;
}

export type AppError = Error & { response?: { data?: ApiError } };

// Type guard for checking if error has response property
export const isAxiosError = (error: unknown): error is { response?: { data?: ApiError } } => {
  return typeof error === 'object' && error !== null && 'response' in error;
};

// Helper to extract error message from various error types
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    if (isAxiosError(error)) {
      return error.response?.data?.detail || 
             error.response?.data?.message || 
             error.message || 
             'An error occurred';
    }
    return error.message;
  }
  return 'An unexpected error occurred';
};