import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Star, Phone, Mail, MapPin, MessageCircle, DollarSign, Shield, Store, Award, Video, FileText, ChevronDown, ChevronUp, Users, Laptop, Wrench } from 'lucide-react';

function Homepage() {
  const [openFaq, setOpenFaq] = useState(null);

  const handleLogin = () => {
    const redirectUrl = window.location.origin + '/dashboard';
    const authUrl = process.env.REACT_APP_AUTH_URL || 'https://auth.emergentagent.com';
    window.location.href = `${authUrl}/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "Quanto tempo tenho para concluir o curso?",
      answer: "Você tem acesso ao curso por 12 meses a partir da data de inscrição. Esse prazo é mais que suficiente para concluir todos os módulos, mesmo estudando poucas horas por semana."
    },
    {
      question: "Preciso ter conhecimento prévio sobre piscinas?",
      answer: "Não é necessário conhecimento prévio. O curso começa do básico e avança gradualmente. Temos alunos que nunca trabalharam com piscinas antes e hoje são profissionais de sucesso no mercado."
    },
    {
      question: "O certificado é reconhecido pelo mercado?",
      answer: "Sim! A ANAPP é a principal associação do setor de piscinas no Brasil. Nosso certificado é reconhecido pelas principais empresas, lojas de produtos e condomínios em todo o país."
    },
    {
      question: "Posso assistir as aulas pelo celular?",
      answer: "Com certeza! Nossa plataforma é 100% responsiva e otimizada para dispositivos móveis. Você pode estudar pelo celular, tablet ou computador, de acordo com sua preferência."
    },
    {
      question: "Como funciona o pagamento?",
      answer: "Aceitamos cartão de crédito em até 12x, boleto bancário e PIX. Oferecemos também condições especiais para grupos de 3 ou mais pessoas da mesma empresa."
    }
  ];

  const testimonials = [
    {
      name: "Roberto Oliveira",
      location: "São Paulo, SP",
      text: "Antes do CTP, eu cobrava R$ 150 por piscina. Hoje cobro R$ 350 e tenho mais clientes do que consigo atender. O curso me ensinou a trabalhar direito e dar valor ao meu serviço.",
      rating: 5
    },
    {
      name: "Carlos Eduardo Santos",
      location: "Fortaleza, CE",
      text: "A plataforma de estudos é muito fácil de usar. Consegui fazer todo o curso pelo celular nos intervalos do trabalho. Os vídeos são curtos e diretos ao ponto.",
      rating: 5
    },
    {
      name: "Fernanda Almeida",
      location: "Florianópolis, SC",
      text: "Abri minha própria empresa de manutenção de piscinas depois do curso. O módulo de gestão de negócios foi fundamental para eu entender como precificar meus serviços.",
      rating: 4.5
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="https://static.readdy.ai/image/0649c8a07031c7fbee62019c841ca404/5f2b6cd5aec951c80b56d6d04b505077.jfif" 
              alt="CTP ANAPP Logo" 
              className="w-[150px] h-auto"
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
            <a 
              href="https://www.anapp.org.br/revistas" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-[#0072BC] font-medium transition-colors"
            >
              Revistas
            </a>
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
              <a 
                href="https://www.anapp.org.br/revistas" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full text-left py-2 text-gray-700 hover:text-[#0072BC] font-medium"
              >
                Revistas
              </a>
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

      {/* Benefits Section */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0072BC] mb-4">
              Transforme Sua Carreira com o CTP
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Curso online completo que vai mudar sua vida profissional. Estude quando e onde quiser!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-gray-50 p-8 rounded-lg shadow-sm hover:shadow-md transition">
              <div className="w-16 h-16 flex items-center justify-center bg-blue-100 rounded-full mb-6">
                <DollarSign className="text-[#0072BC]" size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#0072BC] mb-3">Aumente sua renda</h3>
              <p className="text-gray-600">
                Nossos alunos relatam aumento de 50% a 200% na renda após a certificação. Atenda clientes premium e cobre mais pelo seu trabalho.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg shadow-sm hover:shadow-md transition">
              <div className="w-16 h-16 flex items-center justify-center bg-blue-100 rounded-full mb-6">
                <Shield className="text-[#0072BC]" size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#0072BC] mb-3">Credibilidade profissional</h3>
              <p className="text-gray-600">
                Certificado reconhecido pela ANAPP abre portas para condomínios, clubes e clientes especiais que exigem profissionais qualificados.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg shadow-sm hover:shadow-md transition">
              <div className="w-16 h-16 flex items-center justify-center bg-blue-100 rounded-full mb-6">
                <Store className="text-[#0072BC]" size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#0072BC] mb-3">Seja dono do seu negócio</h3>
              <p className="text-gray-600">
                Aprenda a montar e gerenciar sua empresa. Curso completo com módulos de precificação, gestão e marketing digital.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-full mb-4">
                <Laptop className="text-[#0072BC]" size={24} />
              </div>
              <h4 className="text-lg font-semibold text-[#0072BC] mb-2">100% Online</h4>
              <p className="text-gray-600">Estude no seu ritmo, pelo celular ou computador, 24h por dia</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-full mb-4">
                <Wrench className="text-[#0072BC]" size={24} />
              </div>
              <h4 className="text-lg font-semibold text-[#0072BC] mb-2">Aulas práticas</h4>
              <p className="text-gray-600">Aprenda fazendo com exemplos reais do dia a dia</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-full mb-4">
                <MessageCircle className="text-[#0072BC]" size={24} />
              </div>
              <h4 className="text-lg font-semibold text-[#0072BC] mb-2">Suporte direto</h4>
              <p className="text-gray-600">Tire dúvidas pelo WhatsApp com professores especialistas</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-full mb-4">
                <Users className="text-[#0072BC]" size={24} />
              </div>
              <h4 className="text-lg font-semibold text-[#0072BC] mb-2">Comunidade VIP</h4>
              <p className="text-gray-600">Networking com profissionais de todo o Brasil</p>
            </div>
          </div>

          <div className="bg-[#0072BC] rounded-2xl p-8 md:p-12 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
              Realize seu sonho de ser um profissional certificado
            </h3>
            <p className="text-xl text-blue-100 mb-8">
              Comece agora mesmo e garante seu futuro na profissão que mais cresce no Brasil
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={handleLogin}
                className="inline-flex items-center justify-center bg-white text-[#0072BC] py-4 px-8 rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-lg active:scale-95"
              >
                <Video className="mr-2" size={20} />
                Ver apresentação do curso
              </button>
              <button
                onClick={handleLogin}
                className="inline-flex items-center justify-center bg-[#FF6B00] text-white py-4 px-8 rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-lg active:scale-95"
              >
                Quero me inscrever agora
                <ChevronDown className="ml-2" size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Course Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0072BC] mb-4">
              Nossos Cursos e Certificações
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              A melhor formação técnica para profissionais de piscinas
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-64 overflow-hidden">
                <img
                  src="https://readdy.ai/api/search-image?query=Professional%20swimming%20pool%20technician%20working%2C%20modern%20pool%20environment%2C%20high-end%20equipment%2C%20water%20testing%2C%20professional%20certification%20training%20scene%2C%20clean%20and%20professional%20setting&width=800&height=500&seq=6&orientation=landscape"
                  alt="Curso Técnico de Piscinas"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2">
                    <span className="bg-blue-100 text-[#0072BC] text-sm font-medium py-1 px-3 rounded-full">
                      Certificação Oficial
                    </span>
                    <span className="bg-orange-100 text-[#FF6B00] text-sm font-medium py-1 px-3 rounded-full">
                      2025
                    </span>
                  </div>
                  <span className="text-gray-600 text-sm">Curso Completo</span>
                </div>
                <h3 className="text-2xl font-bold text-[#0072BC] mb-4">
                  Curso Técnico de Piscinas
                </h3>
                <div className="space-y-3 mb-6">
                  {[
                    "Aulas práticas e fáceis de entender, com exemplos do dia a dia do piscineiro",
                    "Aprenda a resolver problemas comuns e evite erros que custam dinheiro",
                    "Grupo exclusivo no WhatsApp com professores e colegas para tirar dúvidas",
                    "Material de apoio com passo a passo das manutenções mais importantes",
                    "Certificado digital reconhecido em todo Brasil",
                    "Certificação reconhecida pela ANAPP - Associação Nacional dos Fabricantes de Piscinas",
                    "Aulas práticas e teóricas com os melhores especialistas do mercado",
                    "Suporte técnico especializado e material didático completo"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start">
                      <div className="text-[#FF6B00] mr-3 mt-1">✓</div>
                      <p className="text-gray-600">{item}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-gray-200">
                  <div className="mb-4 sm:mb-0">
                    <p className="text-gray-500 text-sm mb-1">Investimento a partir de</p>
                    <p className="text-[#FF6B00] font-bold text-2xl">R$ 299,00*</p>
                    <p className="text-gray-500 text-xs">*Valor mensal no plano anual</p>
                  </div>
                  <button
                    onClick={handleLogin}
                    className="bg-[#FF6B00] text-white py-3 px-8 rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-sm active:scale-95"
                  >
                    Saiba Mais
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0072BC] mb-4">
              Histórias de sucesso
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Veja como o CTP mudou a vida desses piscineiros
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-lg shadow-sm">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-full">
                    <Users className="text-[#0072BC]" size={24} />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.location}</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{testimonial.text}</p>
                <div className="flex text-[#FF6B00]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < Math.floor(testimonial.rating) ? "#FF6B00" : "none"} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#0072BC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Quer ganhar mais como piscineiro?
              </h2>
              <p className="text-blue-100 text-lg">
                Comece agora mesmo! Temos condições especiais e pagamento facilitado em até 12x no cartão.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleLogin}
                className="bg-white text-[#0072BC] py-3 px-8 rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-sm active:scale-95"
              >
                Conhecer Planos
              </button>
              <button
                onClick={handleLogin}
                className="bg-[#FF6B00] text-white py-3 px-8 rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-sm active:scale-95"
              >
                Inscreva-se Agora
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0072BC] mb-4">
              Uma plataforma completa para seu aprendizado
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Tudo o que você precisa para estudar do seu jeito, no seu tempo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://readdy.ai/api/search-image?query=Modern%20e-learning%20platform%20interface%20on%20tablet%20and%20smartphone%2C%20showing%20swimming%20pool%20maintenance%20course%20with%20video%20player%2C%20progress%20bar%2C%20and%20interactive%20elements%2C%20clean%20design%2C%20blue%20accents%2C%20user-friendly%20interface&width=800&height=600&seq=5&orientation=landscape"
                alt="Plataforma CTP"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
            <div className="space-y-6">
              {[
                { icon: Video, title: "Vídeo-aulas de alta qualidade", description: "Conteúdo gravado por especialistas do setor, com demonstrações práticas e explicações detalhadas." },
                { icon: FileText, title: "Material complementar", description: "PDFs, planilhas e guias práticos para download e consulta rápida durante seu trabalho." },
                { icon: MessageCircle, title: "Suporte via WhatsApp", description: "Tire suas dúvidas diretamente com os instrutores através do nosso canal exclusivo de WhatsApp." },
                { icon: Award, title: "Certificação digital", description: "Receba seu certificado digital ao concluir o curso e compartilhe nas redes sociais." }
              ].map((feature, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-full shrink-0">
                    <feature.icon className="text-[#0072BC]" size={24} />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-[#0072BC] mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0072BC] mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Tire suas dúvidas sobre o Curso Técnico em Piscinas
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left p-6 focus:outline-none flex justify-between items-center hover:bg-gray-50 transition"
                >
                  <h3 className="text-lg font-semibold text-[#0072BC] pr-8">{faq.question}</h3>
                  {openFaq === index ? <ChevronUp className="text-[#0072BC] shrink-0" /> : <ChevronDown className="text-[#0072BC] shrink-0" />}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Ainda tem dúvidas? Fale com nossa equipe</p>
            <a
              href="https://wa.me/5511990001750"
              className="inline-flex items-center text-[#0072BC] font-medium hover:underline"
            >
              <MessageCircle className="mr-2" size={20} />
              Conversar pelo WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-[#0072BC]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Receba dicas e novidades sobre o mundo das piscinas
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Inscreva-se em nossa newsletter e fique por dentro das tendências do setor
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              placeholder="Seu melhor e-mail"
              className="flex-1 py-3 px-4 rounded-lg border-none focus:ring-2 focus:ring-[#FF6B00] focus:outline-none"
            />
            <button
              type="submit"
              className="bg-[#FF6B00] text-white py-3 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-sm active:scale-95"
            >
              Inscrever-se
            </button>
          </form>
          <p className="text-blue-100 text-sm mt-4">
            Prometemos não enviar spam. Você pode cancelar a inscrição a qualquer momento.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#000080] text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <img
                src="https://static.readdy.ai/image/0649c8a07031c7fbee62019c841ca404/b521aded93caf59851a4a2ccab3f546b.png"
                alt="CTP ANAPP Logo"
                className="w-[150px] h-auto mb-6"
              />
              <p className="text-gray-400 mb-6">
                A ANAPP é a principal associação do setor de piscinas e spas do Brasil, promovendo a capacitação profissional e o desenvolvimento do mercado desde 1999.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6">Links Rápidos</h4>
              <ul className="space-y-3">
                <li><button onClick={handleLogin} className="text-gray-400 hover:text-white transition">Programa CTP</button></li>
                <li><button onClick={handleLogin} className="text-gray-400 hover:text-white transition">Sobre a ANAPP</button></li>
                <li><button onClick={handleLogin} className="text-gray-400 hover:text-white transition">Cursos e Certificações</button></li>
                <li><button onClick={handleLogin} className="text-gray-400 hover:text-white transition">Área do Aluno</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6">Cursos</h4>
              <ul className="space-y-3">
                <li><button onClick={handleLogin} className="text-gray-400 hover:text-white transition">CTP Básico</button></li>
                <li><button onClick={handleLogin} className="text-gray-400 hover:text-white transition">CTP Avançado</button></li>
                <li><button onClick={handleLogin} className="text-gray-400 hover:text-white transition">CTP Master</button></li>
                <li><button onClick={handleLogin} className="text-gray-400 hover:text-white transition">Tratamento de Água</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6">Contato</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <MapPin className="mr-3 mt-1 shrink-0" size={18} />
                  <span className="text-gray-400">Av. Queiroz Filho, 1700 Sala 807 D – Villa Lobos Office Park<br/>São Paulo – SP</span>
                </li>
                <li className="flex items-center">
                  <Phone className="mr-3 shrink-0" size={18} />
                  <span className="text-gray-400">(11) 5687-7888</span>
                </li>
                <li className="flex items-center">
                  <Mail className="mr-3 shrink-0" size={18} />
                  <span className="text-gray-400">contato@anapp.org.br</span>
                </li>
                <li className="flex items-center">
                  <MessageCircle className="mr-3 shrink-0" size={18} />
                  <span className="text-gray-400">(11) 99000-1750</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-900 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 ANAPP - Associação Nacional dos Fabricantes e Construtores de Piscinas e Produtos Afins. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6">
              <button onClick={handleLogin} className="text-gray-400 hover:text-white text-sm transition">Política de Privacidade</button>
              <button onClick={handleLogin} className="text-gray-400 hover:text-white text-sm transition">Termos de Uso</button>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/5511990001750"
        className="fixed bottom-6 right-6 w-16 h-16 flex items-center justify-center bg-green-500 rounded-full shadow-lg z-50 hover:bg-green-600 transition"
        target="_blank"
        rel="noopener noreferrer"
      >
        <MessageCircle className="text-white" size={28} />
      </a>
    </div>
  );
}

export default Homepage;
