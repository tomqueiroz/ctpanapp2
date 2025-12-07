import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, TrendingUp, LogOut, User, Menu, X } from 'lucide-react';

function LoggedInHeader({ user = { name: 'Aluno' } }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    // TODO: Implementar logout quando tiver autenticação
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button onClick={() => navigate('/dashboard')} className="flex items-center">
              <img 
                src="https://static.readdy.ai/image/0649c8a07031c7fbee62019c841ca404/5f2b6cd5aec951c80b56d6d04b505077.jfif" 
                alt="CTP ANAPP Logo" 
                className="h-10 w-auto"
              />
              <div className="ml-3 hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900">Curso Técnico em Piscinas</h1>
                <p className="text-xs text-gray-500">Formação Profissional ANAPP</p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-700 hover:text-[#0072BC] font-medium transition-colors"
            >
              <Home size={18} className="mr-1" />
              Meus Cursos
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-700 hover:text-[#0072BC] font-medium transition-colors"
            >
              <TrendingUp size={18} className="mr-1" />
              Meu Progresso
            </button>
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center text-sm">
              <div className="w-9 h-9 bg-gradient-to-br from-[#0072BC] to-[#005a9e] rounded-full flex items-center justify-center text-white font-semibold mr-2">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <span className="text-gray-700 font-medium">{user?.name || 'Aluno'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-600 hover:text-red-600 font-medium transition-colors"
            >
              <LogOut size={18} className="mr-1" />
              Sair
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-3 space-y-3">
            <button
              onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}
              className="flex items-center w-full text-left py-2 text-gray-700 hover:text-[#0072BC] font-medium"
            >
              <Home size={18} className="mr-2" />
              Meus Cursos
            </button>
            <button
              onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}
              className="flex items-center w-full text-left py-2 text-gray-700 hover:text-[#0072BC] font-medium"
            >
              <TrendingUp size={18} className="mr-2" />
              Meu Progresso
            </button>
            <div className="border-t border-gray-200 pt-3">
              <div className="flex items-center mb-3">
                <div className="w-9 h-9 bg-gradient-to-br from-[#0072BC] to-[#005a9e] rounded-full flex items-center justify-center text-white font-semibold mr-2">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <span className="text-gray-700 font-medium">{user?.name || 'Aluno'}</span>
              </div>
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="flex items-center w-full text-left py-2 text-red-600 hover:text-red-700 font-medium"
              >
                <LogOut size={18} className="mr-2" />
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default LoggedInHeader;