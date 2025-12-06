import React from 'react';
import { ArrowRight, BookOpen, Award, Users, Video, FileText, CheckCircle2 } from 'lucide-react';

function Homepage() {
  const handleLogin = () => {
    const redirectUrl = window.location.origin + '/dashboard';
    const authUrl = process.env.REACT_APP_AUTH_URL || 'https://auth.emergentagent.com';
    window.location.href = `${authUrl}/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img 
              src="https://customer-assets.emergentagent.com/job_piscinaprof/artifacts/3qf7sb2y_logo%20ctp%20fdo%20transp.png" 
              alt="CTP Logo" 
              className="h-12 w-auto"
            />
            <span className="text-2xl font-bold text-[#0072BC]">CTP Learning</span>
          </div>
          <button
            onClick={handleLogin}
            className="px-6 py-2.5 bg-[#0072BC] text-white font-medium rounded-lg hover:bg-[#005a9e] transition-all shadow-sm active:scale-95"
            data-testid="login-button"
          >
            Entrar
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0072BC] to-[#004a7c] text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1759753919650-ce5adaec8dd7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMHN3aW1taW5nJTIwcG9vbCUyMGx1eHVyeXxlbnwwfHx8fDE3NjUwNDc4MDR8MA&ixlib=rb-4.1.0&q=85)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium">Certificação Profissional CTP</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Curso Técnico de Piscinas
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Torne-se um profissional certificado em manutenção e tratamento de piscinas com a ANAPP
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleLogin}
                className="flex items-center justify-center space-x-2 px-8 py-4 bg-[#FF7B00] text-white font-semibold rounded-lg hover:bg-[#e66f00] transition-all shadow-lg active:scale-95"
                data-testid="hero-cta-button"
              >
                <span>Começar Agora</span>
                <ArrowRight size={20} />
              </button>
              <button
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white text-[#0072BC] font-semibold rounded-lg hover:bg-gray-50 transition-all shadow-lg active:scale-95"
              >
                Saiba Mais
              </button>
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