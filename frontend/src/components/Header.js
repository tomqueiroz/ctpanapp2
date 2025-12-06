import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Header({ user = null }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    const redirectUrl = window.location.origin + '/dashboard';
    const authUrl = process.env.REACT_APP_AUTH_URL || 'https://auth.emergentagent.com';
    window.location.href = `${authUrl}/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const handleNavigation = (path) => {
    if (user) {
      navigate(path);
    } else {
      handleLogin();
    }
  };

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <button onClick={() => navigate('/')} className="cursor-pointer">
            <img 
              src="https://static.readdy.ai/image/0649c8a07031c7fbee62019c841ca404/5f2b6cd5aec951c80b56d6d04b505077.jfif" 
              alt="CTP ANAPP Logo" 
              className="w-[150px] h-auto"
            />
          </button>
        </div>
        <nav className="hidden md:flex items-center space-x-6">
          <button 
            onClick={() => navigate('/sobre-ctp')} 
            className="text-gray-700 hover:text-[#0072BC] font-medium transition-colors"
          >
            Conheça o CTP
          </button>
          <button 
            onClick={() => navigate('/sobre-anapp')} 
            className="text-gray-700 hover:text-[#0072BC] font-medium transition-colors"
          >
            Sobre a ANAPP
          </button>
          <button 
            onClick={() => navigate('/cursos')} 
            className="text-gray-700 hover:text-[#0072BC] font-medium transition-colors"
          >
            Cursos e Certificações
          </button>
          <a 
            href="https://www.anapp.org.br/revistas" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-700 hover:text-[#0072BC] font-medium transition-colors"
          >
            Revistas
          </a>
          <button 
            onClick={() => user ? navigate('/dashboard') : handleLogin()} 
            className="text-gray-700 hover:text-[#0072BC] font-medium transition-colors"
          >
            Área do Aluno
          </button>
          <button
            onClick={handleLogin}
            className="bg-[#FF6B00] text-white py-2 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-sm active:scale-95"
            data-testid="header-login-button"
          >
            Inscreva-se
          </button>
        </nav>
        <button 
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-3 space-y-3">
            <button 
              onClick={() => { handleNavigation('/courses'); setMobileMenuOpen(false); }} 
              className="block w-full text-left py-2 text-gray-700 hover:text-[#0072BC] font-medium"
            >
              Conheça o CTP
            </button>
            <button 
              onClick={() => { navigate('/#sobre'); setMobileMenuOpen(false); }} 
              className="block w-full text-left py-2 text-gray-700 hover:text-[#0072BC] font-medium"
            >
              Sobre a ANAPP
            </button>
            <button 
              onClick={() => { handleNavigation('/courses'); setMobileMenuOpen(false); }} 
              className="block w-full text-left py-2 text-gray-700 hover:text-[#0072BC] font-medium"
            >
              Cursos e Certificações
            </button>
            <a 
              href="https://www.anapp.org.br/revistas" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full text-left py-2 text-gray-700 hover:text-[#0072BC] font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Revistas
            </a>
            <button 
              onClick={() => { user ? navigate('/dashboard') : handleLogin(); setMobileMenuOpen(false); }} 
              className="block w-full text-left py-2 text-gray-700 hover:text-[#0072BC] font-medium"
            >
              Área do Aluno
            </button>
            <button
              onClick={() => { handleLogin(); setMobileMenuOpen(false); }}
              className="w-full bg-[#FF6B00] text-white py-3 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition-all"
            >
              Inscreva-se
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;