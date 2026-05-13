/**
 * Login Page Example Component
 * 
 * Demonstrates:
 * - Using useAuth hook for login
 * - Error handling for 401 and other failures
 * - Loading states
 * - Form validation
 * - Redirecting after successful login
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, logout, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    username: '', // This is email for your backend
    password: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Validate form before submission
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.username.trim()) {
      errors.username = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.username)) {
      errors.username = 'Invalid email format';
    }

    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      await login({
        username: formData.username,
        password: formData.password,
      });

      // Login successful - redirect to dashboard
      console.log('Redirecting to dashboard...');
      navigate('/dashboard');
    } catch (err) {
      // Error is already handled by useAuth hook
      // Just display the error message
      console.error('Login failed:', err);
    }
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          YojnaSathi
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Login to access scheme recommendations
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Error Alert - Specific to 401 Unauthorized */}
          {error && error.status === 401 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-semibold">🔐 Invalid Credentials</p>
              <p className="text-red-700 text-sm mt-1">
                Your email or password is incorrect. Please try again.
              </p>
            </div>
          )}

          {/* Error Alert - Generic */}
          {error && error.status !== 401 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-orange-800 font-semibold">⚠️ Login Error</p>
              <p className="text-orange-700 text-sm mt-1">{error.message}</p>
              {error.details && (
                <pre className="text-orange-600 text-xs mt-2 overflow-auto">
                  {JSON.stringify(error.details, null, 2)}
                </pre>
              )}
            </div>
          )}

          {/* Email Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="username"
              type="email"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="your@email.com"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                validationErrors.username
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 bg-gray-50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {validationErrors.username && (
              <p className="text-red-600 text-sm mt-1">{validationErrors.username}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="••••••••"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                validationErrors.password
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 bg-gray-50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {validationErrors.password && (
              <p className="text-red-600 text-sm mt-1">{validationErrors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>

          {/* Forgot Password Link */}
          <div className="text-center">
            <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
              Forgot password?
            </a>
          </div>

          {/* Register Link */}
          <div className="text-center border-t pt-4">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <a href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                Register here
              </a>
            </p>
          </div>
        </form>

        {/* Debug Info (Development Only) */}
        {import.meta.env.DEV && (
          <div className="mt-6 p-3 bg-gray-100 rounded text-xs text-gray-600 space-y-1">
            <p>
              <strong>Dev Credentials:</strong>
            </p>
            <p>Email: user@example.com</p>
            <p>Password: password123</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
