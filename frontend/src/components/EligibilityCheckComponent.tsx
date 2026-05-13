/**
 * Eligibility Check Component
 * 
 * Calls POST /ml/recommend endpoint to get rule-based scheme recommendations
 * 
 * Features:
 * - Automatic JWT token injection (via axiosClient)
 * - Form for user input (age, income, gender, category)
 * - Loading state while checking eligibility
 * - Error handling with user-friendly messages
 * - Renders recommended schemes with eligibility status
 * - Shows "no schemes found" message when applicable
 */

import { useState } from 'react';
import axiosClient from '../lib/axiosClient';
import { extractErrorMessage } from '../lib/errorHandler';

// ============================================================================
// TYPES
// ============================================================================

interface Scheme {
  id: number;
  name: string;
  eligible: boolean;
  [key: string]: any; // Any other fields from backend
}

interface RecommendationResponse {
  user: Record<string, any>;
  recommended_schemes: Scheme[];
  total_schemes: number;
  total_eligible: number;
}

interface FormData {
  age: number;
  income: number;
  gender: string;
  category: string;
}

interface ComponentState {
  isLoading: boolean;
  error: string | null;
  data: RecommendationResponse | null;
  formSubmitted: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const EligibilityCheckComponent: React.FC = () => {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    age: 30,
    income: 500000,
    gender: 'M',
    category: 'General',
  });

  // API state
  const [state, setState] = useState<ComponentState>({
    isLoading: false,
    error: null,
    data: null,
    formSubmitted: false,
  });

  // ========================================================================
  // HANDLER: Form input change
  // ========================================================================
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'age' || name === 'income' ? parseInt(value, 10) : value,
    }));
  };

  // ========================================================================
  // HANDLER: Check eligibility (submit form)
  // ========================================================================
  const handleCheckEligibility = async (e: React.FormEvent) => {
    e.preventDefault();

    setState({
      isLoading: true,
      error: null,
      data: null,
      formSubmitted: true,
    });

    try {
      console.log('📋 Checking eligibility with:', formData);

      // Call protected endpoint
      // JWT token is automatically added by request interceptor!
      const response = await axiosClient.post<RecommendationResponse>(
        '/ml/recommend',
        formData
      );

      setState({
        isLoading: false,
        error: null,
        data: response.data,
        formSubmitted: true,
      });

      console.log('✅ Eligibility checked:', response.data);
    } catch (error: any) {
      // Use utility function to extract error message from FastAPI or other responses
      const errorMessage = extractErrorMessage(error);

      setState({
        isLoading: false,
        error: errorMessage,
        data: null,
        formSubmitted: true,
      });

      console.error('❌ Error checking eligibility:', error);
    }
  };

  // ========================================================================
  // HANDLER: Clear results
  // ========================================================================
  const handleClearResults = () => {
    setState({
      isLoading: false,
      error: null,
      data: null,
      formSubmitted: false,
    });
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ===== FORM SECTION ===== */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Check Eligibility
            </h2>

            <form onSubmit={handleCheckEligibility} className="space-y-4">
              {/* Age Input */}
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                  Age *
                </label>
                <input
                  id="age"
                  type="number"
                  name="age"
                  min="1"
                  max="150"
                  value={formData.age}
                  onChange={handleInputChange}
                  disabled={state.isLoading}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50 disabled:bg-gray-100"
                  placeholder="Enter your age"
                />
              </div>

              {/* Income Input */}
              <div>
                <label
                  htmlFor="income"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Annual Income (₹) *
                </label>
                <input
                  id="income"
                  type="number"
                  name="income"
                  min="0"
                  value={formData.income}
                  onChange={handleInputChange}
                  disabled={state.isLoading}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50 disabled:bg-gray-100"
                  placeholder="Enter your annual income"
                />
              </div>

              {/* Gender Select */}
              <div>
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Gender *
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={state.isLoading}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50 disabled:bg-gray-100"
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Category Select */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  disabled={state.isLoading}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50 disabled:bg-gray-100"
                >
                  <option value="General">General</option>
                  <option value="SC">SC (Scheduled Caste)</option>
                  <option value="ST">ST (Scheduled Tribe)</option>
                  <option value="OBC">OBC (Other Backward Class)</option>
                  <option value="EWS">EWS (Economically Weaker Section)</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={state.isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
              >
                {state.isLoading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    Checking...
                  </>
                ) : (
                  '✅ Check Eligibility'
                )}
              </button>

              {/* Clear Button (if results exist) */}
              {state.data && (
                <button
                  type="button"
                  onClick={handleClearResults}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition"
                >
                  Clear
                </button>
              )}
            </form>

            {/* Form Help */}
            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-xs font-medium">ℹ️ Info</p>
              <p className="text-blue-700 text-xs mt-1">
                Your JWT token is automatically attached to the request. If your token expires,
                you'll be logged out automatically.
              </p>
            </div>
          </div>
        </div>

        {/* ===== RESULTS SECTION ===== */}
        <div className="lg:col-span-2">
          {/* Loading State */}
          {state.isLoading && (
            <div className="bg-white rounded-lg shadow-lg p-12 flex flex-col items-center justify-center min-h-96">
              <div className="animate-spin h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full mb-4" />
              <p className="text-gray-600 font-semibold">Checking your eligibility...</p>
              <p className="text-gray-500 text-sm mt-2">This may take a few seconds</p>
            </div>
          )}

          {/* Error State */}
          {state.error && !state.isLoading && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">❌</span>
                <div>
                  <h3 className="font-bold text-red-800">Error</h3>
                  <p className="text-red-700 mt-1">{state.error}</p>
                  <button
                    onClick={handleClearResults}
                    className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm font-semibold"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success State - No Schemes Found */}
          {state.data && !state.isLoading && state.data.total_eligible === 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">ℹ️</span>
                <div>
                  <h3 className="font-bold text-yellow-800">No Schemes Available</h3>
                  <p className="text-yellow-700 mt-1">
                    Sorry, there are no schemes matching your current profile. Please try with
                    different parameters.
                  </p>
                  <button
                    onClick={handleClearResults}
                    className="mt-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition text-sm font-semibold"
                  >
                    Modify & Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success State - Schemes Found */}
          {state.data &&
            !state.isLoading &&
            state.data.total_eligible > 0 && (
              <div className="space-y-4">
                {/* Summary Header */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">
                        {state.data.total_eligible}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {state.data.total_eligible === 1
                          ? 'Scheme Eligible'
                          : 'Schemes Eligible'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">
                        {state.data.total_schemes}
                      </p>
                      <p className="text-gray-600 text-sm">Total Checked</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-purple-600">
                        {Math.round((state.data.total_eligible / state.data.total_schemes) * 100)}%
                      </p>
                      <p className="text-gray-600 text-sm">Eligibility Rate</p>
                    </div>
                  </div>
                </div>

                {/* Schemes List */}
                <div className="space-y-3">
                  {state.data.recommended_schemes.map((scheme) => (
                    <div
                      key={scheme.id}
                      className={`rounded-lg p-5 border-2 transition ${
                        scheme.eligible
                          ? 'bg-green-50 border-green-300 hover:shadow-md'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        {/* Scheme Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-800">
                              {scheme.name}
                            </h3>
                            {scheme.eligible && (
                              <span className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                ✅ Eligible
                              </span>
                            )}
                            {!scheme.eligible && (
                              <span className="inline-block bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                ❌ Not Eligible
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mt-1">ID: {scheme.id}</p>
                        </div>

                        {/* Eligibility Badge */}
                        <div
                          className={`text-4xl ${
                            scheme.eligible ? 'opacity-100' : 'opacity-50'
                          }`}
                        >
                          {scheme.eligible ? '✅' : '❌'}
                        </div>
                      </div>

                      {/* Additional Fields (if any) */}
                      {Object.keys(scheme).length > 3 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500">
                            <strong>Details:</strong>{' '}
                            {JSON.stringify(
                              Object.entries(scheme)
                                .filter(
                                  ([key]) =>
                                    !['id', 'name', 'eligible'].includes(key)
                                )
                                .reduce((acc, [key, val]) => {
                                  acc[key] = val;
                                  return acc;
                                }, {} as Record<string, any>),
                              null,
                              2
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleClearResults}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition"
                  >
                    New Search
                  </button>
                  <button
                    onClick={() => {
                      const text = `Eligible Schemes: ${state.data.recommended_schemes
                        .filter((s) => s.eligible)
                        .map((s) => s.name)
                        .join(', ')}`;
                      navigator.clipboard.writeText(text);
                      alert('Results copied to clipboard!');
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
                  >
                    Copy Results
                  </button>
                </div>
              </div>
            )}

          {/* Initial State - No Action Taken */}
          {!state.formSubmitted && (
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 flex flex-col items-center justify-center min-h-96">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-gray-600 font-semibold">No eligibility check performed yet</p>
              <p className="text-gray-500 text-sm mt-2">
                Fill out the form on the left and click "Check Eligibility" to see matching
                schemes
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EligibilityCheckComponent;
