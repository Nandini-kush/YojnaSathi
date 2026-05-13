/**
 * React Component Example: Safe API Usage Pattern
 *
 * This file demonstrates best practices for:
 * - Calling ML recommendation endpoint safely
 * - Handling null/error responses
 * - Type-safe data binding
 * - User-friendly error messages
 */

import React, { useState, useEffect } from "react";
import {
  api,
  useAPI,
  UserProfile,
  MLRecommendResponse,
  SchemeDetailResponse,
  isMLRecommendResponse,
} from "@/lib/api-safe";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";

// ============================================================================
// EXAMPLE 1: Simple Safe API Call Pattern
// ============================================================================

export function SimpleRecommendationExample() {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    age: 28,
    income: 250000,
    gender: "Male",
    category: "General",
    state: "Maharashtra",
  });

  const [recommendations, setRecommendations] = useState<
    MLRecommendResponse | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGetRecommendations = async () => {
    // ✓ IMPORTANT: Always set loading and clear previous errors
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // ✓ Call API - ALWAYS returns a valid response (never null)
      const response = await api.recommend(userProfile);

      // ✓ Handle null response (should not happen, but defensive programming)
      if (!response) {
        setErrorMessage("Server did not return a response");
        setRecommendations(null);
        return;
      }

      // ✓ Check if response structure is valid
      if (!isMLRecommendResponse(response)) {
        setErrorMessage("Invalid response format from server");
        setRecommendations(null);
        return;
      }

      // ✓ Check success flag
      if (!response.success) {
        setErrorMessage(response.error || "Failed to get recommendations");
        setRecommendations(response);
        return;
      }

      // ✓ Success! Store the response
      setRecommendations(response);
      setErrorMessage(null);
    } catch (error: any) {
      // ✓ Always catch errors and set error message
      const message =
        error?.message || "An unexpected error occurred";
      setErrorMessage(message);
      setRecommendations(null);
      console.error("Error:", error);
    } finally {
      // ✓ ALWAYS clear loading state
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Get Recommendations</h2>

      {/* Display error if any */}
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 flex gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800">Error</h3>
            <p className="text-red-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 flex gap-2">
          <Loader className="w-5 h-5 text-blue-500 animate-spin" />
          <p className="text-blue-700">Loading recommendations...</p>
        </div>
      )}

      {/* Success message */}
      {recommendations?.success && !isLoading && (
        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 flex gap-2">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-800">Success</h3>
            <p className="text-green-700">
              Found {recommendations.total_eligible} matching schemes
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {recommendations?.schemes && recommendations.schemes.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
          <ul className="space-y-2">
            {recommendations.schemes.map((scheme) => (
              <li
                key={scheme.id}
                className="p-3 bg-gray-50 rounded border border-gray-200"
              >
                <div className="font-medium">{scheme.name}</div>
                <div className="text-sm text-gray-600">
                  Score: {scheme.score || "N/A"}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleGetRecommendations}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? "Loading..." : "Get Recommendations"}
      </button>
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: Using useAPI Hook (Cleaner Pattern)
// ============================================================================

export function HookBasedRecommendationExample() {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    age: 30,
    income: 350000,
    gender: "Female",
    category: "OBC",
    state: "Delhi",
  });

  // ✓ useAPI hook handles loading, error, and data states automatically
  const { data, loading, error, execute } = useAPI(() =>
    api.recommend(userProfile)
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Hook-Based Recommendations</h2>

      {/* Error state */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500">
          <p className="text-red-700">Error: {error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500">
          <p className="text-blue-700">Loading...</p>
        </div>
      )}

      {/* Success state - Safe access with type narrowing */}
      {!loading && data?.success && (
        <div>
          <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500">
            <p className="text-green-700">
              ✓ Found {data.total_eligible} schemes
            </p>
          </div>

          {/* Safe to access data.schemes because success=true */}
          {data.schemes.length > 0 ? (
            <ul className="space-y-2">
              {data.schemes.map((scheme) => (
                <li key={scheme.id} className="p-3 bg-gray-50 rounded">
                  {scheme.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No schemes match your criteria</p>
          )}
        </div>
      )}

      {/* Failure state - safe to access error */}
      {!loading && !data?.success && data?.error && (
        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500">
          <p className="text-yellow-700">{data.error}</p>
        </div>
      )}

      <button
        onClick={execute}
        disabled={loading}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Loading..." : "Get Recommendations"}
      </button>
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Scheme Detail with Safe Rendering
// ============================================================================

export function SchemeDetailExample({ schemeId = 1 }: { schemeId?: number }) {
  const [scheme, setScheme] = useState<SchemeDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchScheme = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // ✓ API NEVER returns null - always a valid response object
      const response = await api.getSchemeDetail(schemeId);

      // Guard against null (defensive)
      if (!response) {
        setError("No response from server");
        setScheme(null);
        return;
      }

      // ✓ Safe to check success flag
      if (!response.success) {
        setError(response.error || "Failed to fetch scheme");
        setScheme(response);
        return;
      }

      // ✓ Safe to access scheme object (it's either null or an object)
      setScheme(response);
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setScheme(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Scheme Details</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500">
          <p className="text-blue-700">Loading...</p>
        </div>
      )}

      {/* ✓ Safely render scheme data when available and successful */}
      {!isLoading && scheme?.success && scheme.scheme && (
        <div className="bg-gray-50 p-4 rounded">
          {/* ✓ Dynamically render all fields without hardcoding */}
          {Object.entries(scheme.scheme).map(([key, value]) => (
            <div key={key} className="mb-2">
              <span className="font-semibold">{key}:</span>
              <span className="ml-2">
                {value !== null ? String(value) : "N/A"}
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleFetchScheme}
        disabled={isLoading}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? "Loading..." : "Fetch Scheme"}
      </button>
    </div>
  );
}

// ============================================================================
// KEY PRINCIPLES DEMONSTRATED
// ============================================================================

/**
 * ✓ ALWAYS CHECK RESPONSE IS NOT NULL
 *   // Good
 *   if (!response) { handle null }
 *
 * ✓ VALIDATE RESPONSE STRUCTURE
 *   if (!isMLRecommendResponse(response)) { handle invalid }
 *
 * ✓ CHECK SUCCESS FLAG BEFORE ACCESSING DATA
 *   if (!response.success) { handle error }
 *
 * ✓ USE TYPE GUARDS FOR TYPE NARROWING
 *   When success=true, it's safe to access data fields
 *
 * ✓ USE HOOKS FOR STATE MANAGEMENT
 *   useAPI handles loading/error/data automatically
 *
 * ✓ ALWAYS CLEAR PREVIOUS STATE
 *   Before new request, clear previous error/data
 *
 * ✓ ALWAYS CATCH EXCEPTIONS
 *   Even with safe APIs, network errors can occur
 *
 * ✓ PROVIDE USER FEEDBACK
 *   Show loading, error, and success states to user
 */
