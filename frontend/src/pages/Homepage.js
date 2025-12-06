import React, { useState } from 'react';
import { ArrowRight, BookOpen, Award, Users, Video, FileText, CheckCircle2, Menu, X, Star, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

function Homepage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleLogin = () => {
    const redirectUrl = window.location.origin + '/dashboard';
    const authUrl = process.env.REACT_APP_AUTH_URL || 'https://auth.emergentagent.com';
    window.location.href = `${authUrl}/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="https://static.readdy.ai/image/0649c8a07031c7fbee62019c841ca404/5f2b6cd5aec951c80b56d6d04b505077.jfif" 
              alt="CTP ANAPP Logo" 
              className="h-12 w-auto"
            />
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <button onClick={handleLogin} className="text-gray-700 hover:text-[#0072BC] font-medium transition-colors">
              Conheça o CTP
            </button>
            <button onClick={handleLogin} className="text-gray-700 hover:text-[#0072BC] font-medium transition-colors">
              Sobre a ANAPP
            </button>
            <button onClick={handleLogin} className="text-gray-700 hover:text-[#0072BC] font-medium transition-colors">
              Cursos e Certificações
            </button>
            <button onClick={handleLogin} className="text-gray-700 hover:text-[#0072BC] font-medium transition-colors">
              Área do Aluno
            </button>
            <button
              onClick={handleLogin}
              className="bg-[#FF6B00] text-white py-2 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-sm active:scale-95"
              data-testid="login-button"
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
              <button onClick={handleLogin} className="block w-full text-left py-2 text-gray-700 hover:text-[#0072BC] font-medium">
                Conheça o CTP
              </button>
              <button onClick={handleLogin} className="block w-full text-left py-2 text-gray-700 hover:text-[#0072BC] font-medium">
                Sobre a ANAPP
              </button>
              <button onClick={handleLogin} className="block w-full text-left py-2 text-gray-700 hover:text-[#0072BC] font-medium">
                Cursos e Certificações
              </button>
              <button onClick={handleLogin} className="block w-full text-left py-2 text-gray-700 hover:text-[#0072BC] font-medium">
                Área do Aluno
              </button>
              <button
                onClick={handleLogin}
                className="w-full bg-[#FF6B00] text-white py-3 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition-all"
              >
                Inscreva-se
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-20 relative min-h-[600px] flex items-center" style={{
        backgroundImage: 'url(https://readdy.ai/api/search-image?query=Beautiful%20swimming%20pool%20with%20crystal%20clear%20blue%20water%2C%20sun%20reflection%2C%20modern%20design%2C%20clean%20edges%2C%20professional%20maintenance%2C%20bright%20sunny%20day%2C%20no%20people%2C%20high%20quality%20professional%20photography%2C%20perfect%20for%20swimming%20pool%20maintenance%20course&width=1920&height=1080&seq=1&orientation=landscape)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-[#0072BC] mb-6">
              Dê o próximo passo na sua carreira de piscineiro
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Com o certificado CTP da ANAPP, você aumenta sua renda, conquista clientes mais exigentes e se destaca no mercado. Junte-se aos mais de 5.000 profissionais que já mudaram de vida!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleLogin}
                className="bg-[#0072BC] text-white py-3 px-8 rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-sm active:scale-95"
              >
                Conheça o Curso
              </button>
              <button
                onClick={handleLogin}
                className="bg-[#FF6B00] text-white py-3 px-8 rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-sm active:scale-95"
                data-testid="hero-cta-button"
              >
                Inscreva-se Agora
              </button>
            </div>
            <div className="mt-8 flex items-center">
              <div className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-md">
                <Users className="text-[#0072BC]" size={24} />
              </div>
              <p className="ml-4 text-gray-700">
                <span className="font-bold text-[#0072BC]">+5.000</span> profissionais já certificados em todo o Brasil
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-[#0072BC] font-semibold text-sm uppercase tracking-wide">Por que escolher o CTP?</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Aprenda com os melhores</h2>
            <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">Plataforma completa de ensino com conteúdo atualizado e certificação reconhecida pelo mercado</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-[#0072BC]/10 rounded-lg flex items-center justify-center mb-6">
                <Video className="text-[#0072BC]" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Vídeo-Aulas</h3>
              <p className="text-gray-600">Aprenda com vídeos de alta qualidade produzidos por especialistas do setor de piscinas</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-[#0072BC]/10 rounded-lg flex items-center justify-center mb-6">
                <FileText className="text-[#0072BC]" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Material Didático</h3>
              <p className="text-gray-600">Acesse PDFs, apostilas e materiais complementares para aprofundar seus conhecimentos</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-[#0072BC]/10 rounded-lg flex items-center justify-center mb-6">
                <CheckCircle2 className="text-[#0072BC]" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Avaliações</h3>
              <p className="text-gray-600">Teste seus conhecimentos com quizzes interativos ao final de cada módulo</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-[#FF7B00]/10 rounded-lg flex items-center justify-center mb-6">
                <Award className="text-[#FF7B00]" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Certificação</h3>
              <p className="text-gray-600">Receba certificado reconhecido pela ANAPP ao concluir os cursos com sucesso</p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-[#FF7B00]/10 rounded-lg flex items-center justify-center mb-6">
                <Users className="text-[#FF7B00]" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Comunidade</h3>
              <p className="text-gray-600">Conecte-se com outros profissionais e instrutores especializados em piscinas</p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-[#FF7B00]/10 rounded-lg flex items-center justify-center mb-6">
                <BookOpen className="text-[#FF7B00]" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Revistas Digitais</h3>
              <p className="text-gray-600">Acesso exclusivo à biblioteca de revistas ANAPP com conteúdo técnico atualizado</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#0072BC] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para se tornar um profissional certificado?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Junte-se a centenas de profissionais que já conquistaram a certificação CTP
          </p>
          <button
            onClick={handleLogin}
            className="px-8 py-4 bg-[#FF7B00] text-white font-semibold rounded-lg hover:bg-[#e66f00] transition-all shadow-lg active:scale-95"
            data-testid="cta-button"
          >
            Criar Conta Gratuita
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="https://customer-assets.emergentagent.com/job_piscinaprof/artifacts/rf4jf95j_logo%20ctp%20branco.png" 
                  alt="CTP Logo" 
                  className="h-10 w-auto"
                />
              </div>
              <p className="text-sm">
                Plataforma oficial de ensino do Curso Técnico de Piscinas da ANAPP
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Links Úteis</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://www.anapp.org.br" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Site ANAPP</a></li>
                <li><a href="https://www.anapp.org.br/revistas" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Revistas ANAPP</a></li>
                <li><a href="https://www.anapp.org.br/associe-se" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Associe-se</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-sm">
                <li>Tel: (11) 5687-7888</li>
                <li>WhatsApp: (11) 99000-1750</li>
                <li>Email: contato@anapp.org.br</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>© 2025 ANAPP - Associação Nacional das Empresas e Profissionais de Piscinas</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Homepage;