import React from 'react';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Footer({ user = null }) {
  const navigate = useNavigate();

  const handleLogin = () => {
    const redirectUrl = window.location.origin + '/dashboard';
    const authUrl = process.env.REACT_APP_AUTH_URL || 'https://auth.emergentagent.com';
    window.location.href = `${authUrl}/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const handleNavigation = (path) => {
    if (user) {
      navigate(path);
      window.scrollTo(0, 0);
    } else {
      handleLogin();
    }
  };

  const navigateToPage = (path) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <footer className="bg-[#0072BC] text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <img
                src="https://customer-assets.emergentagent.com/job_poolcurso/artifacts/1t3erzmd_logo%20ctp%20branco.png"
                alt="CTP ANAPP Logo"
                className="w-[180px] h-auto mb-6"
              />
              <p className="text-blue-100 font-light text-sm mb-6 leading-relaxed">
                A ANAPP é a principal associação do setor de piscinas e spas do Brasil, promovendo a capacitação profissional e o desenvolvimento do mercado desde 1999.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-medium mb-6">Links Rápidos</h4>
              <ul className="space-y-3">
                <li>
                  <button 
                    onClick={() => handleNavigation('/courses')} 
                    className="text-blue-100 hover:text-[#FF6B00] transition font-light text-sm"
                  >
                    Programa CTP
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/sobre-anapp')} 
                    className="text-blue-100 hover:text-[#FF6B00] transition font-light text-sm"
                  >
                    Sobre a ANAPP
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavigation('/courses')} 
                    className="text-blue-100 hover:text-[#FF6B00] transition font-light text-sm"
                  >
                    Cursos e Certificações
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavigation('/dashboard')} 
                    className="text-blue-100 hover:text-[#FF6B00] transition font-light text-sm"
                  >
                    Área do Aluno
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-medium mb-6">Cursos</h4>
              <ul className="space-y-3">
                <li>
                  <button 
                    onClick={() => handleNavigation('/courses')} 
                    className="text-blue-100 hover:text-[#FF6B00] transition font-light text-sm"
                  >
                    CTP Básico
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavigation('/courses')} 
                    className="text-blue-100 hover:text-[#FF6B00] transition font-light text-sm"
                  >
                    CTP Avançado
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavigation('/courses')} 
                    className="text-blue-100 hover:text-[#FF6B00] transition font-light text-sm"
                  >
                    CTP Master
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavigation('/courses')} 
                    className="text-blue-100 hover:text-[#FF6B00] transition font-light text-sm"
                  >
                    Tratamento de Água
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-medium mb-6">Contato</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <MapPin className="mr-3 mt-1 shrink-0 text-blue-100" size={18} />
                  <span className="text-blue-100 font-light text-sm">
                    Av. Queiroz Filho, 1700 Sala 807 D – Villa Lobos Office Park<br/>São Paulo – SP
                  </span>
                </li>
                <li className="flex items-center">
                  <Phone className="mr-3 shrink-0 text-blue-100" size={18} />
                  <a href="tel:+551156877888" className="text-blue-100 hover:text-[#FF6B00] transition font-light text-sm">
                    (11) 5687-7888
                  </a>
                </li>
                <li className="flex items-center">
                  <Mail className="mr-3 shrink-0 text-blue-100" size={18} />
                  <a href="mailto:contato@anapp.org.br" className="text-blue-100 hover:text-[#FF6B00] transition font-light text-sm">
                    contato@anapp.org.br
                  </a>
                </li>
                <li className="flex items-center">
                  <MessageCircle className="mr-3 shrink-0 text-blue-100" size={18} />
                  <a href="https://wa.me/5511990001750" className="text-blue-100 hover:text-[#FF6B00] transition font-light text-sm">
                    (11) 99000-1750
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-blue-100 text-sm font-light mb-4 md:mb-0">
              © 2025 ANAPP - Associação Nacional dos Fabricantes e Construtores de Piscinas e Produtos Afins. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6">
              <button 
                onClick={() => navigate('/')} 
                className="text-blue-100 hover:text-[#FF6B00] text-sm font-light transition"
              >
                Política de Privacidade
              </button>
              <button 
                onClick={() => navigate('/')} 
                className="text-blue-100 hover:text-[#FF6B00] text-sm font-light transition"
              >
                Termos de Uso
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/5511990001750"
        className="fixed bottom-6 right-6 w-16 h-16 flex items-center justify-center bg-green-500 rounded-full shadow-lg z-50 hover:bg-green-600 hover:scale-110 transition-all"
        target="_blank"
        rel="noopener noreferrer"
        data-testid="whatsapp-button"
      >
        <MessageCircle className="text-white" size={28} />
      </a>
    </>
  );
}

export default Footer;