import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Menu, X, Phone, Mail, MapPin, ChevronDown, BookOpen, Calculator, ClipboardCheck, User, Settings, LogOut, Shield, BarChart3, DollarSign, Download, Search, Home, GraduationCap, Info, Users, TrendingUp, Sliders, Award, TicketPercent, FileSpreadsheet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ROUTE_PATHS } from '@/lib/index';
import { StreakIndicator } from '@/components/StreakIndicator';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GlobalSearch } from '@/components/GlobalSearch';
import { isAdministrativeRole } from '@/lib/roles';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chaptersMenuOpen, setChaptersMenuOpen] = useState(false);
  const [mobileChaptersOpen, setMobileChaptersOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const closeMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navigateToPage = (path: string) => {
    // Scroll ANTES de navegar
    window.scrollTo({ top: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    navigate(path);
    setMobileMenuOpen(false);
    
    // Garantir scroll após navegação
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 50);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 200);
  };

  const handleMouseEnterChapters = () => {
    if (closeMenuTimeoutRef.current) {
      clearTimeout(closeMenuTimeoutRef.current);
    }
    setChaptersMenuOpen(true);
  };

  const handleMouseLeaveChapters = () => {
    // Delay de 300ms antes de fechar (tempo suficiente para mover o mouse)
    closeMenuTimeoutRef.current = setTimeout(() => {
      setChaptersMenuOpen(false);
    }, 300);
  };

  useEffect(() => {
    checkAuth();
    return () => {
      if (closeMenuTimeoutRef.current) {
        clearTimeout(closeMenuTimeoutRef.current);
      }
    };
  }, [location]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
    if (user) {
      setUserEmail(user.email || '');
      // Check if admin
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (roleError) {
        console.error('Erro ao verificar permissões administrativas:', roleError);
      }
      setIsAdmin(isAdministrativeRole(roleData?.role));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUserMenuOpen(false);
    navigateToPage(ROUTE_PATHS.HOME);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#0072BC] shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={() => navigateToPage(ROUTE_PATHS.HOME)}
              className="flex min-h-11 min-w-11 cursor-pointer items-center"
              aria-label="Ir para a página inicial"
            >
              <img 
                src="/images/logo-ctp-branco.png"
                alt="CTP ANAPP" 
                className="h-12 w-auto"
              />
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center space-x-8">
            <button 
              onClick={() => navigateToPage(ROUTE_PATHS.HOME)} 
              className="text-white hover:text-[#FF6B00] font-light text-sm transition-colors"
            >
              Início
            </button>
            <button 
              onClick={() => navigateToPage(ROUTE_PATHS.COURSES)} 
              className="text-white hover:text-[#FF6B00] font-light text-sm transition-colors"
            >
              Cursos e Certificações
            </button>
            
            <button
              onClick={() => navigateToPage(ROUTE_PATHS.ABOUT)}
              className="text-white hover:text-[#FF6B00] font-light text-sm transition-colors"
            >
              Sobre a ANAPP
            </button>

            {/* Blog ANAPP */}
            <a
              href="https://anapp.org.br/blog"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-[#FF6B00] font-light text-sm transition-colors"
            >
              Blog ANAPP
            </a>
            
            {/* Dropdown Área do Aluno com Capítulos */}
            <div className="relative"
              onMouseEnter={handleMouseEnterChapters}
              onMouseLeave={handleMouseLeaveChapters}
            >
              <button 
                className="text-white hover:text-[#FF6B00] font-light text-sm transition-colors flex items-center gap-1"
              >
                <BookOpen size={16} />
                Área do Aluno
                <ChevronDown size={16} className={`transition-transform ${chaptersMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {chaptersMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <div className="max-h-96 overflow-y-auto">
                    {/* Painel Geral CTP */}
                    <button
                      onClick={() => {
                        navigateToPage(ROUTE_PATHS.DASHBOARD);
                        setChaptersMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-[#0072BC] hover:text-white transition-colors text-sm border-b border-gray-200 bg-blue-50 font-semibold"
                    >
                      📊 Painel Geral CTP
                    </button>
                    
                    {/* Introdução (Boas-Vindas) */}
                    <button
                      onClick={() => {
                        navigateToPage(`/dashboard/chapter/0`);
                        setChaptersMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-[#FF6B00] hover:text-white transition-colors text-sm border-b border-gray-200 bg-gray-50 font-semibold"
                    >
                      🎓 Introdução (Boas-Vindas)
                    </button>
                    
                    {/* Capítulos 1-12 (Módulo Técnico) */}
                    {[
                      { num: 1, title: 'O Despertar do Guardião da Água' },
                      { num: 2, title: 'Guardião da Saúde Pública' },
                      { num: 3, title: 'Desinfecção e Tecnologias' },
                      { num: 4, title: 'Equilíbrio Químico da Água' },
                      { num: 5, title: 'Análise e Testes de Água' },
                      { num: 6, title: 'Segurança em Piscinas' },
                      { num: 7, title: 'Equipamentos e Diagnóstico' },
                      { num: 8, title: 'Registros de Operação' },
                      { num: 9, title: 'Gestão de Ativos' },
                      { num: 10, title: 'Normas e Segurança' },
                      { num: 11, title: 'Sistemas de Circulação' },
                      { num: 12, title: 'Aquecimento de Piscinas' },
                    ].map((chapter) => (
                      <button
                        key={chapter.num}
                        onClick={() => {
                          navigateToPage(`/dashboard/chapter/${chapter.num}`);
                          setChaptersMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-[#0072BC] hover:text-white transition-colors text-sm"
                      >
                        <span className="font-medium">Cap. {chapter.num}:</span> {chapter.title}
                      </button>
                    ))}
                    
                    {/* Separador Módulo Empreendedor */}
                    <div className="px-4 py-3 bg-gradient-to-r from-[#FF6B00] to-[#e55d00] text-white font-bold text-xs uppercase tracking-wide border-y border-orange-300">
                      Módulo Empreendedor
                    </div>
                    
                    {/* Capítulos 13-14 (Módulo Empreendedor) */}
                    {[
                      { num: 13, title: 'Atendimento e Relacionamento' },
                      { num: 14, title: 'Marketing Digital' },
                    ].map((chapter) => (
                      <button
                        key={chapter.num}
                        onClick={() => {
                          navigateToPage(`/dashboard/chapter/${chapter.num}`);
                          setChaptersMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-[#FF6B00] hover:text-white transition-colors text-sm bg-orange-50"
                      >
                        <span className="font-medium text-[#FF6B00]">Cap. {chapter.num}:</span> {chapter.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Button
              onClick={() => navigateToPage(ROUTE_PATHS.SIGNUP)}
              className="bg-[#FF6B00] text-white hover:bg-[#e55d00] rounded-full shadow-lg hover:shadow-xl active:scale-95"
            >
              Inscreva-se
            </Button>
            <button 
              onClick={() => navigateToPage(ROUTE_PATHS.CHECKLIST)} 
              className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B00] to-[#e55d00] shadow-lg transition-all hover:from-[#e55d00] hover:to-[#cc4f00] hover:shadow-xl active:scale-95"
              title="Checklist do Piscineiro"
            >
              <ClipboardCheck className="w-5 h-5 text-white" />
            </button>
            <button 
              onClick={() => navigateToPage(ROUTE_PATHS.CALCULATOR)} 
              className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#00A3E0] to-[#0072BC] shadow-lg transition-all hover:from-[#0072BC] hover:to-[#005a9e] hover:shadow-xl active:scale-95"
              title="AcquaCalc CTP ANAPP"
            >
              <Calculator className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => navigateToPage(ROUTE_PATHS.POP)}
              className="h-11 w-11 overflow-hidden rounded-full border-2 border-white/80 bg-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
              title="POP para Operador de Piscinas"
              aria-label="Abrir POP para Operador de Piscinas"
            >
              <img src="/images/pop-mask.jpg" alt="" className="h-full w-full object-cover" />
            </button>
            
            {/* Search Button */}
            {isAuthenticated && (
              <button
                onClick={() => setSearchOpen(true)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 transition-all hover:bg-white/30"
                title="Buscar"
              >
                <Search className="w-5 h-5 text-white" />
              </button>
            )}
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Streak Indicator */}
            {isAuthenticated && <StreakIndicator />}
            
            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 transition-all hover:bg-white/30"
                  title="Meu Perfil"
                >
                  <User className="w-5 h-5 text-white" />
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm text-gray-600">Conectado como</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{userEmail}</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        navigateToPage('/profile');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors text-sm flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Meu Perfil
                    </button>
                    
                    <button
                      onClick={() => {
                        navigateToPage(ROUTE_PATHS.CERTIFICATE);
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors text-sm flex items-center gap-2"
                    >
                      <Award className="w-4 h-4" />
                      Meu Certificado
                    </button>
                    
                    {isAdmin && (
                      <>
                        <div className="border-t border-gray-200 my-2"></div>
                        <div className="px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50">
                          <p className="text-xs font-bold text-purple-700 uppercase tracking-wide flex items-center gap-2">
                            <Shield className="w-3 h-3" />
                            Painel Administrativo
                          </p>
                        </div>
                        
                        <button
                          onClick={() => {
                            navigateToPage(ROUTE_PATHS.ADMIN);
                            setUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all text-sm flex items-center gap-3 text-gray-700 hover:text-purple-700 group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center transition-colors">
                            <BarChart3 className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-semibold">Dashboard</div>
                            <div className="text-xs text-gray-500">Visão geral</div>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => {
                            navigateToPage('/admin/users');
                            setUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all text-sm flex items-center gap-3 text-gray-700 hover:text-purple-700 group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                            <Users className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold">Usuários</div>
                            <div className="text-xs text-gray-500">Gerenciar alunos</div>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => {
                            navigateToPage('/admin/analytics');
                            setUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all text-sm flex items-center gap-3 text-gray-700 hover:text-purple-700 group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-green-100 group-hover:bg-green-200 flex items-center justify-center transition-colors">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <div className="font-semibold">Analytics</div>
                            <div className="text-xs text-gray-500">Métricas e relatórios</div>
                          </div>
                        </button>

                        <button
                          onClick={() => {
                            navigateToPage(ROUTE_PATHS.ADMIN_COUPONS);
                            setUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all text-sm flex items-center gap-3 text-gray-700 hover:text-purple-700 group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-cyan-100 group-hover:bg-cyan-200 flex items-center justify-center transition-colors">
                            <TicketPercent className="w-4 h-4 text-cyan-700" />
                          </div>
                          <div>
                            <div className="font-semibold">Cupons</div>
                            <div className="text-xs text-gray-500">Campanhas e utilização</div>
                          </div>
                        </button>

                        <button
                          onClick={() => {
                            navigateToPage(ROUTE_PATHS.ADMIN_REPORTS);
                            setUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all text-sm flex items-center gap-3 text-gray-700 hover:text-purple-700 group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center transition-colors">
                            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                          </div>
                          <div>
                            <div className="font-semibold">Relatórios</div>
                            <div className="text-xs text-gray-500">Alunos e pagamentos</div>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => {
                            navigateToPage('/admin/settings');
                            setUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all text-sm flex items-center gap-3 text-gray-700 hover:text-purple-700 group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-orange-100 group-hover:bg-orange-200 flex items-center justify-center transition-colors">
                            <Sliders className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <div className="font-semibold">Configurações</div>
                            <div className="text-xs text-gray-500">Ajustes da plataforma</div>
                          </div>
                        </button>
                      </>
                    )}
                    
                    <div className="border-t border-gray-200 my-2"></div>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors text-sm flex items-center gap-2 text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => navigateToPage(ROUTE_PATHS.LOGIN)}
                  className="bg-white text-[#0072BC] hover:bg-gray-100"
                >
                  Entrar
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-md text-white xl:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile Menu - Reorganizado com Hierarquia */}
        {mobileMenuOpen && (
          <div id="mobile-navigation" className="xl:hidden bg-[#005a9e] border-t border-white/20 [&_a]:min-h-11 [&_button]:min-h-11">
            <div className="px-4 py-4 space-y-3">
              
              {/* PRIORIDADE 1: Botões de Ação Principais */}
              <div className="space-y-2 pb-3 border-b border-white/20">
                <Button
                  onClick={() => navigateToPage(ROUTE_PATHS.SIGNUP)}
                  className="w-full bg-[#FF6B00] text-white hover:bg-[#e55d00] font-bold py-3 text-base"
                >
                  🎓 Inscreva-se Agora
                </Button>
                
                <Button
                  onClick={() => navigateToPage(ROUTE_PATHS.LOGIN)}
                  className="w-full bg-white text-[#0072BC] hover:bg-gray-100 font-semibold py-3 text-base"
                >
                  🔐 Entrar (Login)
                </Button>
              </div>

              {/* PRIORIDADE 2: Ferramentas Exclusivas */}
              <div className="space-y-2 pb-3 border-b border-white/20">
                <div className="text-xs font-bold text-[#FF6B00] uppercase tracking-wide mb-2">
                  🛠️ Ferramentas Exclusivas
                </div>
                
                <button 
                  onClick={() => navigateToPage(ROUTE_PATHS.CALCULATOR)} 
                  className="block w-full text-left py-3 bg-[#00A3E0] text-white hover:bg-[#0072BC] font-semibold rounded-lg flex items-center gap-3 px-4"
                >
                  <Calculator className="w-5 h-5" />
                  <span>AcquaCalc CTP</span>
                </button>
                
                <button 
                  onClick={() => navigateToPage(ROUTE_PATHS.CHECKLIST)} 
                  className="block w-full text-left py-3 bg-[#FF6B00] text-white hover:bg-[#e55d00] font-semibold rounded-lg flex items-center gap-3 px-4"
                >
                  <ClipboardCheck className="w-5 h-5" />
                  <span>Checklist do Piscineiro</span>
                </button>

                <button
                  onClick={() => navigateToPage(ROUTE_PATHS.POP)}
                  className="block w-full text-left py-3 bg-white text-[#0072BC] hover:bg-blue-50 font-semibold rounded-lg flex items-center gap-3 px-4"
                  title="POP para Operador de Piscinas"
                  aria-label="Abrir POP para Operador de Piscinas"
                >
                  <img src="/images/pop-mask.jpg" alt="" className="h-6 w-6 rounded-full object-cover" />
                  <span>POP para Operador de Piscinas</span>
                </button>
              </div>

              {/* PRIORIDADE 3: Navegação Principal */}
              <div className="space-y-2 pb-3 border-b border-white/20">
                <div className="text-xs font-bold text-white/70 uppercase tracking-wide mb-2">
                  📱 Menu Principal
                </div>
                
                <button 
                  onClick={() => navigateToPage(ROUTE_PATHS.HOME)} 
                  className="flex items-center gap-3 w-full text-left py-2 text-white hover:text-[#FF6B00] font-medium"
                >
                  <Home size={18} />
                  <span>Início</span>
                </button>
                
                <button 
                  onClick={() => navigateToPage(ROUTE_PATHS.COURSES)} 
                  className="flex items-center gap-3 w-full text-left py-2 text-white hover:text-[#FF6B00] font-medium"
                >
                  <GraduationCap size={18} />
                  <span>Cursos e Certificações</span>
                </button>
                
                <button
                  onClick={() => navigateToPage(ROUTE_PATHS.ABOUT)}
                  className="flex items-center gap-3 w-full text-left py-2 text-white hover:text-[#FF6B00] font-medium"
                >
                  <Info size={18} />
                  <span>Sobre a ANAPP</span>
                </button>

                <a
                  href="https://anapp.org.br/blog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full text-left py-2 text-white hover:text-[#FF6B00] font-medium"
                >
                  <Info size={18} />
                  <span>Blog ANAPP</span>
                </a>
              </div>

              {/* PRIORIDADE 4: Área do Aluno (Dropdown) */}
              <div>
                <button 
                  onClick={() => setMobileChaptersOpen(!mobileChaptersOpen)}
                  className="flex items-center justify-between w-full py-3 text-white hover:text-[#FF6B00] font-bold bg-white/10 rounded-lg px-4"
                >
                  <span className="flex items-center gap-3">
                    <BookOpen size={18} />
                    Área do Aluno (Capítulos)
                  </span>
                  <ChevronDown size={18} className={`transition-transform ${mobileChaptersOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {mobileChaptersOpen && (
                  <div className="pl-4 mt-2 space-y-2 max-h-64 overflow-y-auto bg-white/5 rounded-lg p-3">
                    {/* Painel Geral CTP */}
                    <button
                      onClick={() => navigateToPage(ROUTE_PATHS.DASHBOARD)}
                      className="block w-full text-left py-2 text-blue-100 hover:text-[#FF6B00] text-sm font-semibold border-b border-white/20 pb-2 mb-2"
                    >
                      📊 Painel Geral CTP
                    </button>
                    
                    {/* Introdução */}
                    <button
                      onClick={() => navigateToPage(`/dashboard/chapter/0`)}
                      className="block w-full text-left py-2 text-blue-100 hover:text-[#FF6B00] text-sm font-semibold border-b border-white/20 pb-2 mb-2"
                    >
                      👋 Introdução (Boas-Vindas)
                    </button>
                    
                    {/* Módulo Técnico */}
                    <div className="text-xs font-bold text-[#00A3E0] uppercase tracking-wide mb-2 mt-3">
                      🔧 Módulo Técnico
                    </div>
                    {[
                      { num: 1, title: 'Sistema Internacional e Cálculos' },
                      { num: 2, title: 'Água Contaminada e Doenças' },
                      { num: 3, title: 'Desinfecção e Produtos Químicos' },
                      { num: 4, title: 'Equilíbrio Químico da Água' },
                      { num: 5, title: 'Testes Químicos' },
                      { num: 6, title: 'Segurança das Instalações' },
                      { num: 7, title: 'Solução de Problemas' },
                      { num: 8, title: 'Relatórios e Registros' },
                      { num: 9, title: 'Sistemas de Manutenção' },
                      { num: 10, title: 'Norma ABNT NBR 10.339' },
                      { num: 11, title: 'Circulação de Água' },
                      { num: 12, title: 'Aquecimento de Piscinas' },
                    ].map((chapter) => (
                      <button
                        key={chapter.num}
                        onClick={() => navigateToPage(`/dashboard/chapter/${chapter.num}`)}
                        className="block w-full text-left py-1.5 text-blue-100 hover:text-[#FF6B00] text-sm"
                      >
                        Cap. {chapter.num}: {chapter.title}
                      </button>
                    ))}
                    
                    {/* Módulo Empreendedor */}
                    <div className="py-2 mt-3 mb-1 text-[#FF6B00] font-bold text-xs uppercase tracking-wide border-t border-white/20">
                      💼 Módulo Empreendedor
                    </div>
                    {[
                      { num: 13, title: 'Atendimento e Relacionamento' },
                      { num: 14, title: 'Marketing Digital' },
                    ].map((chapter) => (
                      <button
                        key={chapter.num}
                        onClick={() => navigateToPage(`/dashboard/chapter/${chapter.num}`)}
                        className="block w-full text-left py-1.5 text-[#FF6B00] hover:text-white text-sm font-medium"
                      >
                        Cap. {chapter.num}: {chapter.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>


            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#0072BC] text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Logo e Descrição */}
            <div>
              <img 
                src="/images/logo-ctp-branco.png"
                alt="CTP ANAPP" 
                className="h-12 w-auto mb-6"
              />
              <p className="text-blue-100 font-light text-sm mb-6 leading-relaxed">
                A ANAPP é a principal associação do setor de piscinas e spas do Brasil, promovendo a capacitação profissional e o desenvolvimento do mercado desde 1999.
              </p>
            </div>

            {/* Links Rápidos */}
            <div>
              <h4 className="text-lg font-medium mb-6">Links Rápidos</h4>
              <ul className="space-y-3">
                <li>
                  <button 
                    onClick={() => navigateToPage(ROUTE_PATHS.HOME)} 
                    className="text-blue-100 hover:text-[#FF6B00] transition font-light text-sm"
                  >
                    Programa CTP
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigateToPage(ROUTE_PATHS.ABOUT)} 
                    className="text-blue-100 hover:text-[#FF6B00] transition font-light text-sm"
                  >
                    Sobre a ANAPP
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigateToPage(ROUTE_PATHS.COURSES)} 
                    className="text-blue-100 hover:text-[#FF6B00] transition font-light text-sm"
                  >
                    Cursos e Certificações
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigateToPage(ROUTE_PATHS.CHECKLIST)} 
                    className="text-blue-100 hover:text-[#FF6B00] transition font-semibold text-sm flex items-center gap-2"
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    Checklist do Piscineiro
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigateToPage(ROUTE_PATHS.CALCULATOR)} 
                    className="text-blue-100 hover:text-[#00A3E0] transition font-semibold text-sm flex items-center gap-2"
                  >
                    <Calculator className="w-4 h-4" />
                    AcquaCalc CTP ANAPP
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateToPage(ROUTE_PATHS.POP)}
                    className="text-blue-100 hover:text-white transition font-semibold text-sm flex items-center gap-2"
                    title="POP para Operador de Piscinas"
                    aria-label="Abrir POP para Operador de Piscinas"
                  >
                    <img src="/images/pop-mask.jpg" alt="" className="h-4 w-4 rounded-full object-cover" />
                    POP para Operador de Piscinas
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateToPage(ROUTE_PATHS.DASHBOARD)}
                    className="text-blue-100 hover:text-[#FF6B00] transition font-light text-sm"
                  >
                    Área do Aluno
                  </button>
                </li>
                <li>
                  <a
                    href="https://anapp.org.br/blog"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-100 hover:text-[#FF6B00] transition font-light text-sm"
                  >
                    Blog ANAPP
                  </a>
                </li>
              </ul>
            </div>

            {/* Contato */}
            <div>
              <h4 className="text-lg font-medium mb-6">Contato</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-blue-100 flex-shrink-0 mt-0.5" />
                  <div>
                    <a href="tel:+551156877888" className="text-blue-100 hover:text-[#FF6B00] transition font-light text-sm">
                      (11) 5687-7888
                    </a>
                  </div>
                </li>
                {/* WhatsApp no footer */}
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <div>
                    <a
                      href="https://wa.me/5511990001750?text=Ol%C3%A1%2C%20tenho%20interesse%20no%20Curso%20T%C3%A9cnico%20de%20Piscinas%20CTP%20ANAPP!"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-300 hover:text-green-100 transition font-medium text-sm"
                    >
                      (11) 99000-1750 — WhatsApp
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-100 flex-shrink-0 mt-0.5" />
                  <div>
                    <a href="mailto:contato@anapp.org.br" className="text-blue-100 hover:text-[#FF6B00] transition font-light text-sm">
                      contato@anapp.org.br
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-100 flex-shrink-0 mt-0.5" />
                  <div className="text-blue-100 font-light text-sm">
                    São Paulo, SP - Brasil
                  </div>
                </li>
              </ul>
            </div>

            {/* Horário */}
            <div>
              <h4 className="text-lg font-medium mb-6">Horário de Atendimento</h4>
              <p className="text-blue-100 font-light text-sm leading-relaxed">
                Segunda a Sexta<br />
                Das 9h às 18h
              </p>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-blue-100 font-light text-sm text-center md:text-left">
                © 2026 ANAPP — Associação Nacional das Empresas e Profissionais de Piscinas. Todos os direitos reservados.
              </p>
              <div className="flex items-center gap-6">
                <Link
                  to="/privacy-policy"
                  className="text-blue-200 hover:text-white font-light text-sm transition-colors"
                >
                  Política de Privacidade
                </Link>
                <span className="text-white/30">|</span>
                <Link
                  to="/terms-of-use"
                  className="text-blue-200 hover:text-white font-light text-sm transition-colors"
                >
                  Termos de Uso
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Global Search Dialog */}
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />

      {/* ── Botão WhatsApp fixo ── */}
      <a
        href="https://wa.me/5511990001750?text=Ol%C3%A1%2C%20tenho%20interesse%20no%20Curso%20T%C3%A9cnico%20de%20Piscinas%20CTP%20ANAPP!"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar pelo WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5b] text-white font-semibold text-sm px-4 py-3 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 group"
        style={{ boxShadow: '0 4px 24px rgba(37,211,102,0.5)' }}
      >
        <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
          Falar no WhatsApp
        </span>
      </a>
    </div>
  );
}
