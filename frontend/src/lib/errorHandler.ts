/**
 * Error Handler Utility
 * Extracts human-readable error messages from various error formats
 * Ensures error state is ALWAYS a string
 */



/**
 * Extract error message from FastAPI validation error
 * Handles both single error and array of errors
 */
export function extractErrorMessage(error: any): string {
  // Handle AxiosError
  if (error?.response) {
    const data = error.response.data;

    // Handle FastAPI validation errors (array of error objects)
    if (data?.detail && Array.isArray(data.detail)) {
      const messages = data.detail.map((err: any) => {
        if (typeof err === 'object' && err.msg) {
          const field = err.loc?.[err.loc.length - 1] || 'field';
          return `${field}: ${err.msg}`;
        }
        return String(err);
      });
      return messages.join('; ');
    }

    // Handle FastAPI single error message
    if (data?.detail && typeof data.detail === 'string') {
      return data.detail;
    }

    // Handle generic message field
    if (data?.message && typeof data.message === 'string') {
      return data.message;
    }

    // Handle error field
    if (data?.error && typeof data.error === 'string') {
      return data.error;
    }

    // Handle 401/403 status codes
    if (error.response.status === 401) {
      return 'Session expired. Please login again.';
    }
    if (error.response.status === 403) {
      return 'You do not have permission to perform this action.';
    }
    if (error.response.status === 404) {
      return 'The requested resource was not found.';
    }
    if (error.response.status === 500) {
      return 'Server error. Please try again later.';
    }

    // Fallback to status text
    if (error.response.statusText) {
      return `Error: ${error.response.statusText}`;
    }
  }

  // Handle regular Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle network errors
  if (error?.message) {
    return error.message;
  }

  // Last resort fallback
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Safe error state setter
 * Ensures the value set is always a string or null
 */
export function formatErrorForState(error: any): string | null {
  if (error === null || error === undefined) {
    return null;
  }
  if (typeof error === 'string' && error.length > 0) {
    return error;
  }
  const message = extractErrorMessage(error);
  return message || null;
}

/**
 * Type guard to check if error is rendereable (string)
 */
export function isRenderableError(error: any): error is string {
  return typeof error === 'string';
}
