/**
 * REAL-WORLD INTEGRATION EXAMPLE
 * 
 * This file shows how to integrate the JWT auth system
 * into a complete dashboard with ML recommendations
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useAuthStore } from '../context/authStore';
import { mlAPI, userAPI, MLRecommendResponse } from '../services/endpoints';

interface UserProfile {
  _id: string;
  email: string | undefined;
  name?: string;
}

interface DashboardState {
  age: number;
  income: number;
  gender: string;
  category: string;
}

/**
 * Real-world example dashboard showing:
 * - User profile loading
 * - ML recommendation requests
 * - Error handling
 * - Loading states
 * - Token auto-logout
 */
export const DashboardExample: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { user } = useAuthStore();

  // Form state
  const [formData, setFormData] = useState<DashboardState>({
    age: 30,
    income: 600000,
    gender: 'M',
    category: 'General',
  });

  // Load state
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  // Data state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recommendations, setRecommendations] = useState<MLRecommendResponse | null>(null);

  // Error state
  const [profileError, setProfileError] = useState<string | null>(null);
  const [recommendError, setRecommendError] = useState<string | null>(null);

  // ========================================================================
  // EFFECT: Load user profile on component mount
  // ========================================================================
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setIsLoadingProfile(true);
        setProfileError(null);

        // This request includes the JWT token automatically!
        // If token expired, response interceptor will redirect to /login
        const profile = await userAPI.getProfile();
        setUserProfile(profile as UserProfile);

        // Update income field with user's actual income if available
        if (profile.income) {
          setFormData((prev) => ({
            ...prev,
            income: profile.income,
          }));
        }
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.detail ||
          error.message ||
          'Failed to load profile';

        setProfileError(typeof errorMsg === 'string' ? errorMsg : 'Failed to load profile');
        console.error('Profile load error:', error);

        // If 401, response interceptor already handled it (redirected to /login)
        // This catch is for other errors (404, 500, network errors, etc.)
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadUserProfile();
  }, []);

  // ========================================================================
  // HANDLER: Get ML recommendations
  // ========================================================================
  const handleGetRecommendations = async () => {
    try {
      setIsLoadingRecommendations(true);
      setRecommendError(null);

      console.log('📊 Getting recommendations for:', formData);

      // Call ML recommendation endpoint
      // Token is automatically included!
      const response = await mlAPI.recommend({
        age: formData.age,
        income: formData.income,
        gender: formData.gender,
        category: formData.category,
      });

      setRecommendations(response);
      console.log('✅ Got recommendations:', response);
    } catch (error: any) {
      // If 401 (token expired), response interceptor already redirected
      // This is for other errors
      const errorMsg =
        error.response?.data?.detail ||
        error.message ||
        'Failed to get recommendations';

      setRecommendError(typeof errorMsg === 'string' ? errorMsg : 'Failed to get recommendations');
      console.error('❌ Recommendation error:', error);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  // ========================================================================
  // HANDLER: Logout
  // ========================================================================
  const handleLogout = () => {
    console.log('👋 Logging out...');
    logout(); // Clears token and redirects to /login
  };

  // ========================================================================
  // HANDLER: Form input change
  // ========================================================================
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'age' || name === 'income' ? parseInt(value) : value,
    }));
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">YojnaSathi Dashboard</h1>
              <p className="text-gray-600 mt-1">
                {isLoadingProfile
                  ? 'Loading profile...'
                  : `Welcome, ${user?.email || userProfile?.name || 'User'}`}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded lg transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Profile Error */}
        {profileError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-semibold">⚠️ Profile Error</p>
            <p className="text-red-700 text-sm">{profileError}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Get Recommendations</h2>

            <form className="space-y-4">
              {/* Age */}
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  id="age"
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  disabled={isLoadingRecommendations}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>

              {/* Annual Income */}
              <div>
                <label htmlFor="income" className="block text-sm font-medium text-gray-700 mb-1">
                  Annual Income (₹)
                </label>
                <input
                  id="income"
                  type="number"
                  name="income"
                  value={formData.income}
                  onChange={handleInputChange}
                  disabled={isLoadingRecommendations}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>

              {/* Gender */}
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={isLoadingRecommendations}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  disabled={isLoadingRecommendations}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="General">General</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="OBC">OBC</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleGetRecommendations}
                disabled={isLoadingRecommendations}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoadingRecommendations ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    Loading...
                  </>
                ) : (
                  '🎯 Get Recommendations'
                )}
              </button>
            </form>

            {/* Form Error */}
            {recommendError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                <p className="text-red-800 font-semibold">⚠️ Error</p>
                <p className="text-red-700 text-sm">{recommendError}</p>
              </div>
            )}
          </div>

          {/* Results Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {recommendations ? '✅ Top Recommendations' : '📋 Recommendations'}
            </h2>

            {!recommendations ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500 text-center">
                  Fill the form and click "Get Recommendations" to see matched schemes
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.recommendations && recommendations.recommendations.length > 0 ? (
                  recommendations.recommendations.map((scheme, index) => (
                    <div
                      key={scheme.scheme_id}
                      className="border border-blue-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">
                            {index + 1}. {scheme.scheme_name}
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">ID: {scheme.scheme_id}</p>
                        </div>
                        <div className="ml-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">
                              {Math.round(scheme.match_score)}%
                            </p>
                            <p className="text-gray-600 text-xs">Match Score</p>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all"
                          style={{ width: `${scheme.match_score}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4">
                    <p className="text-gray-600">No schemes match your criteria</p>
                  </div>
                )}

                {/* New Search Button */}
                <button
                  type="button"
                  onClick={() => setRecommendations(null)}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition mt-4"
                >
                  New Search
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <p className="text-blue-800 text-sm">
            <strong>ℹ️ How it works:</strong> Your JWT token is automatically attached to all requests.
            If your token expires (401 error), you'll be logged out automatically.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardExample;
