/**
 * Safe API Client for YojnaSathi Backend
 * 
 * Features:
 * - Always returns structured responses (never null)
 * - Provides type-safe validators
 * - Comprehensive error handling
 * - Automatic logging for debugging
 */

import axios, { AxiosInstance, AxiosError } from "axios";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/** Response from /ml/recommend endpoint */
export interface MLRecommendResponse {
  success: boolean;
  schemes: Array<{
    id: number;
    name: string;
    eligible: boolean;
    score?: number;
  }>;
  error?: string | null;
  total_schemes?: number;
  total_eligible?: number;
  message?: string;
}

/** Response from /schemes/{id} endpoint */
export interface SchemeDetailResponse {
  success: boolean;
  scheme: Record<string, any> | null;
  error?: string | null;
}

/** Response from GET /schemes endpoint */
export interface AllSchemesResponse {
  success: boolean;
  schemes: Array<Record<string, any>>;
  total_schemes: number;
  error?: string | null;
}

/** User profile for ML recommendation */
export interface UserProfile {
  age: number;
  income: number;
  gender: string;
  category: string;
  state?: string | null;
}

/** Structured error response */
export interface APIError {
  code: string;
  message: string;
  details?: any;
  statusCode?: number;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard: Check if response is a valid MLRecommendResponse
 */
export function isMLRecommendResponse(data: any): data is MLRecommendResponse {
  return (
    data &&
    typeof data === "object" &&
    typeof data.success === "boolean" &&
    Array.isArray(data.schemes)
  );
}

/**
 * Type guard: Check if response is a valid SchemeDetailResponse
 */
export function isSchemeDetailResponse(
  data: any
): data is SchemeDetailResponse {
  return (
    data &&
    typeof data === "object" &&
    typeof data.success === "boolean" &&
    (data.scheme === null || typeof data.scheme === "object")
  );
}

/**
 * Type guard: Check if response is a valid AllSchemesResponse
 */
export function isAllSchemesResponse(data: any): data is AllSchemesResponse {
  return (
    data &&
    typeof data === "object" &&
    typeof data.success === "boolean" &&
    Array.isArray(data.schemes) &&
    typeof data.total_schemes === "number"
  );
}

// ============================================================================
// API CLIENT
// ============================================================================

class SafeAPIClient {
  private axiosInstance: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = "http://localhost:8000/api/v1") {
    this.baseURL = baseURL;
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor for auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for unified error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("[API Error]", error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Extract meaningful error message from various error sources
   */
  private extractErrorMessage(error: any): string {
    // Axios error with response
    if (error.response?.data?.error) {
      return error.response.data.error;
    }

    // Axios validation error (422, 400)
    if (error.response?.data?.detail) {
      if (typeof error.response.data.detail === "string") {
        return error.response.data.detail;
      }
      if (Array.isArray(error.response.data.detail)) {
        const msg = error.response.data.detail
          .map((e: any) => e.msg || JSON.stringify(e))
          .join(", ");
        return msg;
      }
    }

    // Network errors
    if (error.code === "ECONNABORTED") {
      return "Request timeout - server not responding";
    }
    if (error.message === "Network Error") {
      return "Network error - cannot reach server";
    }

    // Generic fallback
    return error.message || "An unexpected error occurred";
  }

  /**
   * POST /ml/recommend - Get scheme recommendations
   *
   * **Always returns a valid response object (never null).**
   *
   * Example:
   * ```typescript
   * const response = await api.recommend({
   *   age: 28,
   *   income: 250000,
   *   gender: "Male",
   *   category: "General",
   *   state: "Maharashtra"
   * });
   *
   * if (!response) {
   *   // Handle null response
   * } else if (!response.success) {
   *   console.error(response.error); // Safe to access
   * } else {
   *   console.log(response.schemes); // Safe to access
   * }
   * ```
   */
  async recommend(
    profile: UserProfile
  ): Promise<MLRecommendResponse | null> {
    try {
      console.log("[API] POST /ml/recommend", profile);

      const response = await this.axiosInstance.post<MLRecommendResponse>(
        "/ml/recommend",
        profile
      );

      const data = response.data;

      // Validate response structure
      if (!isMLRecommendResponse(data)) {
        console.error(
          "[API] Invalid response structure for /ml/recommend:",
          data
        );
        return {
          success: false,
          schemes: [],
          error: "Invalid response structure from server",
        };
      }

      console.log("[API] ✓ Recommendations received:", data);
      return data;
    } catch (error: any) {
      const errorMsg = this.extractErrorMessage(error);
      console.error("[API] ✗ Recommendation failed:", errorMsg);

      // Always return a valid error response (never null)
      return {
        success: false,
        schemes: [],
        error: errorMsg,
        total_schemes: 0,
        total_eligible: 0,
      };
    }
  }

  /**
   * GET /schemes/{schemeId} - Get scheme details
   *
   * **Always returns a valid response object (never null).**
   *
   * Example:
   * ```typescript
   * const response = await api.getSchemeDetail(1);
   *
   * if (!response) {
   *   // Handle null response
   * } else if (!response.success) {
   *   console.error(response.error);
   * } else {
   *   console.log(response.scheme); // Full scheme object
   * }
   * ```
   */
  async getSchemeDetail(schemeId: number): Promise<SchemeDetailResponse | null> {
    try {
      console.log("[API] GET /schemes/{id}", schemeId);

      const response = await this.axiosInstance.get<SchemeDetailResponse>(
        `/schemes/${schemeId}`
      );

      const data = response.data;

      // Validate response structure
      if (!isSchemeDetailResponse(data)) {
        console.error(
          "[API] Invalid response structure for /schemes/{id}:",
          data
        );
        return {
          success: false,
          scheme: null,
          error: "Invalid response structure from server",
        };
      }

      console.log("[API] ✓ Scheme details received:", data);
      return data;
    } catch (error: any) {
      const errorMsg = this.extractErrorMessage(error);
      console.error("[API] ✗ Get scheme detail failed:", errorMsg);

      // Always return a valid error response (never null)
      return {
        success: false,
        scheme: null,
        error: errorMsg,
      };
    }
  }

  /**
   * GET /schemes - Get all schemes
   *
   * **Always returns a valid response object (never null).**
   *
   * Example:
   * ```typescript
   * const response = await api.getAllSchemes();
   *
   * if (!response) {
   *   // Handle null response
   * } else if (!response.success) {
   *   console.error(response.error);
   * } else {
   *   console.log(response.schemes); // All schemes
   * }
   * ```
   */
  async getAllSchemes(): Promise<AllSchemesResponse | null> {
    try {
      console.log("[API] GET /schemes");

      const response = await this.axiosInstance.get<AllSchemesResponse>(
        "/schemes"
      );

      const data = response.data;

      // Validate response structure
      if (!isAllSchemesResponse(data)) {
        console.error("[API] Invalid response structure for /schemes:", data);
        return {
          success: false,
          schemes: [],
          total_schemes: 0,
          error: "Invalid response structure from server",
        };
      }

      console.log("[API] ✓ All schemes received:", data);
      return data;
    } catch (error: any) {
      const errorMsg = this.extractErrorMessage(error);
      console.error("[API] ✗ Get all schemes failed:", errorMsg);

      // Always return a valid error response (never null)
      return {
        success: false,
        schemes: [],
        total_schemes: 0,
        error: errorMsg,
      };
    }
  }

  /**
   * Set authorization token for all requests
   */
  setAuthToken(token: string): void {
    this.axiosInstance.defaults.headers.common["Authorization"] =
      `Bearer ${token}`;
    localStorage.setItem("access_token", token);
  }

  /**
   * Clear authorization token
   */
  clearAuthToken(): void {
    delete this.axiosInstance.defaults.headers.common["Authorization"];
    localStorage.removeItem("access_token");
  }

  /**
   * Get current auth token
   */
  getAuthToken(): string | null {
    return localStorage.getItem("access_token");
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const api = new SafeAPIClient();

// ============================================================================
// HOOKS (for React functional components)
// ============================================================================

/**
 * React Hook: Safe API call wrapper
 *
 * Automatically handles:
 * - Loading state
 * - Success/error states
 * - Null response handling
 * - Type-safe responses
 *
 * Example:
 * ```typescript
 * const { data, loading, error, execute } = useAPI(
 *   () => api.recommend(profile)
 * );
 *
 * useEffect(() => {
 *   if (data?.success) {
 *     console.log(data.schemes);
 *   }
 * }, [data]);
 * ```
 */
import { useState, useCallback } from "react";

export function useAPI<T>(
  apiFn: () => Promise<T | null>
): {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFn();

      if (result === null) {
        setError("Server did not return a response");
        setData(null);
      } else {
        setData(result);
        // Extract error from response if present
        if ("error" in result && result.error) {
          setError(result.error);
        }
      }
    } catch (err: any) {
      const message =
        err.message || "An unexpected error occurred dur ing API call";
      setError(message);
      setData(null);
      console.error("[useAPI] Error:", err);
    } finally {
      setLoading(false);
    }
  }, [apiFn]);

  return { data, loading, error, execute };
}
