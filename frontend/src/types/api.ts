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

export interface User {
  id: number | string;
  name: string;
  email: string;
  is_admin?: boolean;
  role?: string;
  created_at?: string;
  updated_at?: string;
  age?: number;
  income?: number;
  gender?: string;
  caste?: string;
  state?: string;
}

export interface UpdateUserProfileRequest {
  name: string;
  age: number;
  income: number;
  gender: string;
  caste: string;
  state: string;
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

// ==================== ML RECOMMEND RESPONSE (NEW) ====================
/**
 * Individual scheme recommendation - matches backend SchemeRecommendation
 */
export interface SchemeRecommendation {
  id: number;
  name: string;
  eligible: boolean;
  score?: number | null;
}

/**
 * ML /recommend endpoint response
 * ALWAYS returns valid JSON with this structure - never null
 */
export interface MLRecommendResponse {
  success: boolean;
  schemes: SchemeRecommendation[];
  total_schemes?: number;
  total_eligible?: number;
  message?: string;
}

/**
 * Type guard to safely validate response structure
 */
export function isValidMLRecommendResponse(
  data: unknown
): data is MLRecommendResponse {
  if (!data || typeof data !== "object") {
    console.warn("[Type Guard] Response is not an object:", data);
    return false;
  }

  const response = data as Record<string, unknown>;

  if (typeof response.success !== "boolean") {
    console.warn(
      "[Type Guard] Missing or invalid 'success' field:",
      response.success
    );
    return false;
  }

  if (!Array.isArray(response.schemes)) {
    console.warn(
      "[Type Guard] Missing or invalid 'schemes' field (not array):",
      response.schemes
    );
    return false;
  }

  return true;
}

/**
 * Safely extract schemes from response, handling all edge cases
 */
export function extractSchemes(response: unknown): SchemeRecommendation[] {
  if (!response || typeof response !== "object") {
    console.warn("[Extract Schemes] Response is not an object");
    return [];
  }

  const data = response as Record<string, unknown>;

  if (!Array.isArray(data.schemes)) {
    console.warn("[Extract Schemes] schemes is not an array:", data.schemes);
    return [];
  }

  return data.schemes as SchemeRecommendation[];
}

/**
 * Safely check if recommendation was successful
 */
export function wasRecommendationSuccessful(response: unknown): boolean {
  if (!response || typeof response !== "object") {
    console.warn("[Success Check] Response is not an object");
    return false;
  }

  const data = response as Record<string, unknown>;

  if (typeof data.success !== "boolean") {
    console.warn("[Success Check] success is not boolean:", data.success);
    return false;
  }

  return data.success === true;
}

// ==================== SCHEME DETAIL RESPONSE ====================
/**
 * Scheme detail response from GET /schemes/:id
 */
export interface SchemeDetailResponse {
  success: boolean;
  scheme: SchemeData | null;
  error?: string | null;
}

export interface SchemeData {
  [key: string]: any; // Dynamic schema - backend returns all columns
  id?: number;
  scheme_name?: string;
  min_age?: number;
  max_age?: number;
  max_income?: number;
  category?: string;
  state?: string;
  gender?: string;
  caste?: string;
  benefits?: string;
  description?: string;
  ministry?: string;
  official_link?: string;
  is_active?: boolean;
}

/**
 * Type guard for scheme detail response
 */
export function isValidSchemeDetailResponse(
  data: unknown
): data is SchemeDetailResponse {
  if (!data || typeof data !== "object") {
    console.warn("[Type Guard Scheme] Response is not an object:", data);
    return false;
  }

  const response = data as Record<string, unknown>;

  if (typeof response.success !== "boolean") {
    console.warn("[Type Guard Scheme] Missing or invalid 'success' field");
    return false;
  }

  // scheme can be null on error, but object on success
  if (response.success && (!response.scheme || typeof response.scheme !== "object")) {
    console.warn("[Type Guard Scheme] Missing scheme data when success=true");
    return false;
  }

  return true;
}

/**
 * Safely extract scheme data
 */
export function extractSchemeData(response: unknown): SchemeData | null {
  if (!response || typeof response !== "object") {
    console.warn("[Extract Scheme] Response is not an object");
    return null;
  }

  const data = response as Record<string, unknown>;

  if (!data.scheme) {
    console.warn("[Extract Scheme] scheme field is missing or null");
    return null;
  }

  if (typeof data.scheme !== "object") {
    console.warn("[Extract Scheme] scheme is not an object:", data.scheme);
    return null;
  }

  return (data.scheme as SchemeData) || null;
}

/**
 * Get error message from scheme detail response
 */
export function getSchemeError(response: unknown): string | null {
  if (!response || typeof response !== "object") {
    return "Unknown error";
  }

  const data = response as Record<string, unknown>;

  if (typeof data.error === "string" && data.error) {
    return data.error;
  }

  return null;
}