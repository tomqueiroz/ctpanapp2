import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Header({ user = null }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleNavigation = (path) => {
    if (user) {
      navigate(path);
    } else {
      handleLogin();
    }
  };

  return (
    <header className="bg-[#0072BC] shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <button onClick={() => navigate('/')} className="cursor-pointer">
            <img 
              src="https://customer-assets.emergentagent.com/job_poolcurso/artifacts/1t3erzmd_logo%20ctp%20branco.png" 
              alt="CTP ANAPP Logo" 
              className="h-12 w-auto"
            />
          </button>
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          <button 
            onClick={() => navigate('/conheca-ctp')} 
            className="text-white hover:text-[#FF6B00] font-light text-sm transition-colors"
          >
            Conheça o CTP
          </button>
          <button 
            onClick={() => navigate('/sobre-anapp')} 
            className="text-white hover:text-[#FF6B00] font-light text-sm transition-colors"
          >
            Sobre a ANAPP
          </button>
          <button 
            onClick={() => navigate('/cursos')} 
            className="text-white hover:text-[#FF6B00] font-light text-sm transition-colors"
          >
            Cursos e Certificações
          </button>
          <a 
            href="https://www.anapp.org.br/revistas" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-[#FF6B00] font-light text-sm transition-colors"
          >
            Revistas
          </a>
          <button 
            onClick={() => user ? navigate('/dashboard') : handleLogin()} 
            className="text-white hover:text-[#FF6B00] font-light text-sm transition-colors"
          >
            Área do Aluno
          </button>
          <button
            onClick={handleLogin}
            className="bg-[#FF6B00] text-white py-2.5 px-6 rounded-full font-medium text-sm hover:bg-[#e55d00] transition-all shadow-lg hover:shadow-xl active:scale-95"
            data-testid="header-login-button"
          >
            Inscreva-se
          </button>
        </nav>
        <button 
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#005a9e] border-t border-white/20">
          <div className="px-4 py-3 space-y-3">
            <button 
              onClick={() => { navigate('/conheca-ctp'); setMobileMenuOpen(false); }} 
              className="block w-full text-left py-2 text-white hover:text-[#FF6B00] font-light"
            >
              Conheça o CTP
            </button>
            <button 
              onClick={() => { navigate('/sobre-anapp'); setMobileMenuOpen(false); }} 
              className="block w-full text-left py-2 text-white hover:text-[#FF6B00] font-light"
            >
              Sobre a ANAPP
            </button>
            <button 
              onClick={() => { navigate('/cursos'); setMobileMenuOpen(false); }} 
              className="block w-full text-left py-2 text-white hover:text-[#FF6B00] font-light"
            >
              Cursos e Certificações
            </button>
            <a 
              href="https://www.anapp.org.br/revistas" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full text-left py-2 text-white hover:text-[#FF6B00] font-light"
              onClick={() => setMobileMenuOpen(false)}
            >
              Revistas
            </a>
            <button 
              onClick={() => { user ? navigate('/dashboard') : handleLogin(); setMobileMenuOpen(false); }} 
              className="block w-full text-left py-2 text-white hover:text-[#FF6B00] font-light"
            >
              Área do Aluno
            </button>
            <button
              onClick={() => { handleLogin(); setMobileMenuOpen(false); }}
              className="w-full bg-[#FF6B00] text-white py-3 px-6 rounded-full font-medium hover:bg-[#e55d00] transition-all mt-2"
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