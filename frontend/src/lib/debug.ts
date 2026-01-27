/**
 * API Debugging & Testing Helper
 * Logs all API requests and responses for debugging
 * 
 * Usage: Import in App.tsx to enable logging
 */

import api from '@/lib/api';

const isDevelopment = import.meta.env.DEV;

/**
 * Configure API logging for development
 */
export function setupApiLogging() {
  if (!isDevelopment) return;

  // Log all requests
  api.interceptors.request.use((config) => {
    console.log(
      `%c📤 API REQUEST`,
      'color: #1e40af; font-weight: bold;',
      {
        method: config.method?.toUpperCase(),
        url: config.url,
        headers: config.headers,
        data: config.data,
        timestamp: new Date().toISOString(),
      }
    );
    return config;
  });

  // Log all responses
  api.interceptors.response.use(
    (response) => {
      console.log(
        `%c✅ API RESPONSE`,
        'color: #059669; font-weight: bold;',
        {
          status: response.status,
          statusText: response.statusText,
          url: response.config.url,
          data: response.data,
          timestamp: new Date().toISOString(),
        }
      );
      return response;
    },
    (error) => {
      console.log(
        `%c❌ API ERROR`,
        'color: #dc2626; font-weight: bold;',
        {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          message: error.message,
          data: error.response?.data,
          timestamp: new Date().toISOString(),
        }
      );
      return Promise.reject(error);
    }
  );
}

/**
 * Log authentication state
 */
export function logAuthState(token: string | null, user: any) {
  if (!isDevelopment) return;

  console.log(
    `%c🔐 AUTH STATE`,
    'color: #9333ea; font-weight: bold;',
    {
      token: token ? `${token.substring(0, 20)}...` : null,
      user,
      timestamp: new Date().toISOString(),
    }
  );
}

/**
 * Log navigation
 */
export function logNavigation(path: string) {
  if (!isDevelopment) return;

  console.log(
    `%c🛣️ NAVIGATION`,
    'color: #0891b2; font-weight: bold;',
    {
      path,
      timestamp: new Date().toISOString(),
    }
  );
}

/**
 * Display localStorage contents
 */
export function logStorageState() {
  if (!isDevelopment) return;

  const token = localStorage.getItem('access_token');
  const user = localStorage.getItem('user');

  console.log(
    `%c💾 STORAGE STATE`,
    'color: #f59e0b; font-weight: bold;',
    {
      'access_token': token ? `${token.substring(0, 20)}...` : null,
      user: user ? JSON.parse(user) : null,
      timestamp: new Date().toISOString(),
    }
  );
}
