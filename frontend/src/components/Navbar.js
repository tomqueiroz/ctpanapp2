import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, BookOpen, Library, LogOut, LayoutDashboard, User } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Navbar({ user = null }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-white border-b border-[#E2E8F0] sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-3">
            <img 
              src="https://customer-assets.emergentagent.com/job_piscinaprof/artifacts/3qf7sb2y_logo%20ctp%20fdo%20transp.png" 
              alt="CTP Logo" 
              className="h-10 w-auto"
            />
            <span className="text-xl font-bold text-[#0072BC]">CTP Learning</span>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-2 text-gray-700 hover:text-[#0072BC] transition-colors"
              data-testid="nav-dashboard-link"
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>
            <Link 
              to="/courses" 
              className="flex items-center space-x-2 text-gray-700 hover:text-[#0072BC] transition-colors"
              data-testid="nav-courses-link"
            >
              <BookOpen size={18} />
              <span>Cursos</span>
            </Link>
            <Link 
              to="/magazines" 
              className="flex items-center space-x-2 text-gray-700 hover:text-[#0072BC] transition-colors"
              data-testid="nav-magazines-link"
            >
              <Library size={18} />
              <span>Revistas</span>
            </Link>
            {user?.role === 'admin' && (
              <Link 
                to="/admin" 
                className="flex items-center space-x-2 text-gray-700 hover:text-[#0072BC] transition-colors"
                data-testid="nav-admin-link"
              >
                <LayoutDashboard size={18} />
                <span>Admin</span>
              </Link>
            )}
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {user?.picture ? (
                <img 
                  src={user?.picture} 
                  alt={user?.name || 'User'} 
                  className="w-8 h-8 rounded-full border-2 border-[#0072BC]"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#0072BC] flex items-center justify-center text-white">
                  <User size={18} />
                </div>
              )}
              <span className="hidden sm:block text-sm font-medium text-gray-700">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#0072BC] transition-colors"
              data-testid="logout-button"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;