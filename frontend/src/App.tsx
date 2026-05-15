import './styles/index.css';
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@context/authStore';

// Pages
import Home from '@pages/public/Home';
import Login from '@pages/auth/Login';
import RegisterPage from '@pages/auth/Register';
import Dashboard from '@pages/dashboard/Dashboard';
import AdminDashboard from '@pages/admin/AdminDashboard';
import EligibilityCheck from '@pages/dashboard/EligibilityCheck';
import History from '@pages/dashboard/History';
import Recommendations from '@pages/dashboard/Recommendations';
import SchemeDetail from '@pages/schemes/SchemeDetail';
import Profile from '@pages/profile/Profile';
import NotFoundPage from '@pages/public/NotFoundPage';

// Components
import ProtectedRoute from '@components/ProtectedRoute';

const App: React.FC = () => {
  const { loadFromStorage, token } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/register" element={token ? <Navigate to="/dashboard" /> : <RegisterPage />} />
            
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/eligibility-check"
              element={
                <ProtectedRoute>
                  <EligibilityCheck />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recommendations"
              element={
                <ProtectedRoute>
                  <Recommendations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/scheme/:id"
              element={
                <ProtectedRoute>
                  <SchemeDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
