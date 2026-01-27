import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@context/authStore';
import { Menu, LogOut, Home } from 'lucide-react';
import logo from '@/assets/yojnasathi_logo.png';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition" onClick={() => navigate('/')}>
            <img src={logo} alt="YojnaSathi Logo" className="h-10 md:h-12 w-auto object-contain" />
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {isAuthenticated && (
              <>
                <button onClick={() => navigate('/schemes')} className="text-gray-700 hover:text-primary">
                  Schemes
                </button>
                <button onClick={() => navigate('/eligibility')} className="text-gray-700 hover:text-primary">
                  Check Eligibility
                </button>
                <button onClick={() => navigate('/profile')} className="text-gray-700 hover:text-primary">
                  Profile
                </button>
              </>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-700">{user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => navigate('/login')} className="px-4 py-2 text-primary border border-primary rounded hover:bg-primary hover:text-white transition">
                  Login
                </button>
                <button onClick={() => navigate('/register')} className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-600">
                  Register
                </button>
              </div>
            )}
          </nav>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="mt-4 space-y-2 md:hidden">
            {isAuthenticated && (
              <>
                <button onClick={() => navigate('/schemes')} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                  Schemes
                </button>
                <button onClick={() => navigate('/eligibility')} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                  Check Eligibility
                </button>
                <button onClick={() => navigate('/profile')} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                  Profile
                </button>
              </>
            )}
            {isAuthenticated ? (
              <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50">
                Logout
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                  Login
                </button>
                <button onClick={() => navigate('/register')} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                  Register
                </button>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
