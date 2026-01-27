/**
 * API Client Utilities
 * Helper functions for consistent error handling and response processing
 */

import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';

/**
 * Extract user-friendly error message from API error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    // Handle specific HTTP status codes
    switch (error.response?.status) {
      case 400:
        return (error.response?.data as ApiError)?.detail || 
               'Invalid request. Please check your input.';
      case 401:
        return 'Your session has expired. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 422:
        return (error.response?.data as ApiError)?.detail || 
               'Invalid data. Please check your input.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return (error.response?.data as ApiError)?.detail || 
               error.message || 
               'An error occurred. Please try again.';
    }
  }

  if (error instanceof Error) {
    if (error.message.includes('Network Error')) {
      return 'Network error. Please check your connection.';
    }
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Check if response is successful
 */
export function isSuccessResponse(status: number): boolean {
  return status >= 200 && status < 300;
}

/**
 * Safely parse JSON from localStorage
 */
export function safeParseJSON<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Format API endpoint URL (handle trailing slashes)
 */
export function formatEndpoint(endpoint: string): string {
  return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
}

/**
 * Create proper Authorization header
 */
export function getAuthHeader(token: string | null): Record<string, string> {
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
}
