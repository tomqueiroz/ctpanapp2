import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, TrendingUp, LogOut, User, Menu, X, BookOpen, ChevronDown } from 'lucide-react';

function LoggedInHeader({ user = { name: 'Aluno' } }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modulesDropdownOpen, setModulesDropdownOpen] = useState(false);

  const modules = [
    { id: 1, titulo: 'Módulo 1 - Cálculos' },
    { id: 2, titulo: 'Módulo 2 - Volume e Capacidade' },
    { id: 3, titulo: 'Módulo 3 - Desinfecção e Produtos Químicos' },
    { id: 4, titulo: 'Módulo 4 - Equilíbrio Químico da Água' },
    { id: 5, titulo: 'Módulo 5 - Dosagem e Aplicação' },
    { id: 6, titulo: 'Módulo 6 - Filtração e Circulação' },
    { id: 7, titulo: 'Módulo 7 - Manutenção' },
    { id: 8, titulo: 'Módulo 8 - Segurança e Normas' },
    { id: 9, titulo: 'Módulo 9 - Problemas e Soluções' },
    { id: 10, titulo: 'Módulo 10 - Atendimento ao Cliente' },
    { id: 11, titulo: 'Módulo 11 - Sustentabilidade' },
    { id: 12, titulo: 'Módulo 12 - Certificação Final' }
  ];

  const handleLogout = () => {
    // TODO: Implementar logout quando tiver autenticação
    navigate('/login');
  };

  return (
    <header className="bg-[#0072BC] shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button onClick={() => navigate('/dashboard')} className="flex items-center">
              <img 
                src="https://customer-assets.emergentagent.com/job_poolcurso/artifacts/1t3erzmd_logo%20ctp%20branco.png" 
                alt="CTP ANAPP Logo" 
                className="h-10 w-auto"
              />
              <div className="ml-3 hidden sm:block">
                <h1 className="text-base font-light text-white">Curso Técnico em Piscinas</h1>
                <p className="text-xs font-light text-blue-100">Formação Profissional ANAPP</p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-white hover:text-[#FF6B00] font-light text-sm transition-colors"
            >
              <Home size={18} className="mr-1" />
              Meus Cursos
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-white hover:text-[#FF6B00] font-light text-sm transition-colors"
            >
              <TrendingUp size={18} className="mr-1" />
              Meu Progresso
            </button>
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center text-sm">
              <div className="w-9 h-9 bg-[#FF6B00] rounded-full flex items-center justify-center text-white font-medium mr-2">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <span className="text-white font-light">{user?.name || 'Aluno'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center text-white hover:text-[#FF6B00] font-light transition-colors"
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
        <div className="md:hidden bg-[#005a9e] border-t border-white/20">
          <div className="px-4 py-3 space-y-3">
            <button
              onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}
              className="flex items-center w-full text-left py-2 text-white hover:text-[#FF6B00] font-light"
            >
              <Home size={18} className="mr-2" />
              Meus Cursos
            </button>
            <button
              onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}
              className="flex items-center w-full text-left py-2 text-white hover:text-[#FF6B00] font-light"
            >
              <TrendingUp size={18} className="mr-2" />
              Meu Progresso
            </button>
            <div className="border-t border-white/20 pt-3">
              <div className="flex items-center mb-3">
                <div className="w-9 h-9 bg-[#FF6B00] rounded-full flex items-center justify-center text-white font-medium mr-2">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <span className="text-white font-light">{user?.name || 'Aluno'}</span>
              </div>
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="flex items-center w-full text-left py-2 text-white hover:text-[#FF6B00] font-light"
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