import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Star, Users, Award, TrendingUp, CheckCircle2, ChevronRight, Video, FileText, Laptop, DollarSign, Shield, Clock, Target, Rocket, MessageCircle, BookOpen } from 'lucide-react';

function Homepage() {
  const [scrollY, setScrollY] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const benefits = [
    {
      icon: DollarSign,
      title: 'Aumente sua renda',
      description: 'Nossos alunos relatam aumento de 50% a 200% na renda após a certificação. Atenda clientes premium e cobre mais pelo seu trabalho.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Shield,
      title: 'Credibilidade profissional',
      description: 'Certificado reconhecido pela ANAPP abre portas para condomínios, clubes e clientes especiais que exigem profissionais qualificados.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Rocket,
      title: 'Seja dono do seu negócio',
      description: 'Aprenda a montar e gerenciar sua empresa. Curso completo com módulos de precificação, gestão e marketing digital.',
      color: 'from-[#FF6B00] to-[#e55d00]'
    }
  ];

  const features = [
    { icon: Laptop, title: '100% Online', description: 'Estude no seu ritmo, pelo celular ou computador, 24h por dia' },
    { icon: Target, title: 'Aulas práticas', description: 'Aprenda fazendo com exemplos reais do dia a dia' },
    { icon: MessageCircle, title: 'Suporte direto', description: 'Tire dúvidas pelo WhatsApp com professores especialistas' },
    { icon: Users, title: 'Comunidade VIP', description: 'Networking com profissionais de todo o Brasil' }
  ];

  const platformFeatures = [
    {
      icon: Video,
      title: 'Vídeo-aulas de alta qualidade',
      description: 'Conteúdo gravado por especialistas do setor, com demonstrações práticas e explicações detalhadas.'
    },
    {
      icon: FileText,
      title: 'Material complementar',
      description: 'PDFs, planilhas e guias práticos para download e consulta rápida durante seu trabalho.'
    },
    {
      icon: MessageCircle,
      title: 'Suporte via WhatsApp',
      description: 'Tire suas dúvidas diretamente com os instrutores através do nosso canal exclusivo de WhatsApp.'
    },
    {
      icon: Award,
      title: 'Certificação digital',
      description: 'Receba seu certificado digital ao concluir o curso e compartilhe nas redes sociais.'
    }
  ];

  const testimonials = [
    {
      name: 'Roberto Oliveira',
      location: 'São Paulo, SP',
      text: 'Antes do CTP, cobrava R$ 150 por piscina. Hoje cobro R$ 350 e tenho mais clientes do que consigo atender. O curso me ensinou a trabalhar direito e dar valor ao meu serviço.',
      image: 'https://readdy.ai/api/search-image?query=Professional%20male%20pool%20technician%20portrait%2C%20smiling%2C%20uniform&width=100&height=100&seq=1'
    },
    {
      name: 'Carlos Eduardo Santos',
      location: 'Fortaleza, CE',
      text: 'A plataforma de estudos é muito fácil de usar. Consegui fazer todo o curso pelo celular nos intervalos do trabalho. Os vídeos são curtos e diretos ao ponto.',
      image: 'https://readdy.ai/api/search-image?query=Professional%20male%20technician%20portrait%2C%20friendly&width=100&height=100&seq=2'
    },
    {
      name: 'Fernanda Almeida',
      location: 'Florianópolis, SC',
      text: 'Abri minha própria empresa de manutenção de piscinas depois do curso. O módulo de gestão de negócios foi fundamental para eu entender como precificar meus serviços.',
      image: 'https://readdy.ai/api/search-image?query=Professional%20female%20business%20owner%20portrait%2C%20confident&width=100&height=100&seq=3'
    }
  ];

  const faqs = [
    {
      question: 'Quanto tempo tenho para concluir o curso?',
      answer: 'Você tem acesso ao curso por 12 meses a partir da data de inscrição. Esse prazo é mais que suficiente para concluir todos os módulos, mesmo estudando poucas horas por semana.'
    },
    {
      question: 'Preciso ter conhecimento prévio sobre piscinas?',
      answer: 'Não é necessário conhecimento prévio. O curso começa do básico e avança gradualmente. Temos alunos que nunca trabalharam com piscinas antes e hoje são profissionais de sucesso no mercado.'
    },
    {
      question: 'O certificado é reconhecido pelo mercado?',
      answer: 'Sim! A ANAPP é a principal associação do setor de piscinas no Brasil. Nosso certificado é reconhecido pelas principais empresas, lojas de produtos e condomínios em todo o país.'
    },
    {
      question: 'Posso assistir as aulas pelo celular?',
      answer: 'Com certeza! Nossa plataforma é 100% responsiva e otimizada para dispositivos móveis. Você pode estudar pelo celular, tablet ou computador, de acordo com sua preferência.'
    },
    {
      question: 'Como funciona o pagamento?',
      answer: 'Aceitamos cartão de crédito em até 12x, boleto bancário e PIX. Oferecemos também condições especiais para grupos de 3 ou mais pessoas da mesma empresa.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header user={null} />

      {/* Hero Section with Parallax */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-white">
        {/* Background Image with Gradient Fade - Desktop */}
        <div className="hidden lg:block absolute inset-0 z-0">
          <div 
            className="absolute right-0 top-0 bottom-0 w-1/2"
            style={{
              backgroundImage: 'url(https://customer-assets.emergentagent.com/job_poolcurso/artifacts/pyzkl4dd_f6c1a415-6ee1-48c2-a323-f2a1bca78dd8.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: `translateY(${scrollY * 0.5}px)`
            }}
          />
          {/* Gradient Fade from Image to White */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white to-transparent"></div>
        </div>

        {/* Background Image for Mobile - Top */}
        <div className="lg:hidden absolute top-0 left-0 right-0 h-64">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: 'url(https://customer-assets.emergentagent.com/job_poolcurso/artifacts/pyzkl4dd_f6c1a415-6ee1-48c2-a323-f2a1bca78dd8.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          {/* Gradient Fade from Image to White - Mobile */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40 mt-48 lg:mt-0">
          <div className="lg:w-1/2 lg:pr-12">
            <div className="inline-block bg-[#FF6B00] text-white px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-lg">
              Certificação Profissional ANAPP
            </div>
            <h1 className="text-5xl md:text-6xl font-light text-[#1f2937] mb-6 leading-tight">
              Dê o próximo passo na sua 
              <span className="block text-[#0072BC] font-medium">carreira de piscineiro</span>
            </h1>
            <p className="text-xl text-gray-600 font-light mb-8 leading-relaxed">
              Com o certificado CTP da ANAPP, você aumenta sua renda, conquista clientes mais exigentes e se destaca no mercado. Junte-se aos mais de 5.000 profissionais que já mudaram de vida!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={() => navigate('/conheca-ctp')}
                className="bg-[#0072BC] text-white py-4 px-8 rounded-full font-medium hover:bg-[#005a9e] transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                Conheça o Curso
              </button>
              <button
                onClick={() => navigate('/login')}
                className="bg-[#FF6B00] text-white py-4 px-8 rounded-full font-medium hover:bg-[#e55d00] transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                Inscreva-se Agora
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-white bg-gradient-to-br from-[#0072BC] to-[#005a9e] shadow-lg"></div>
                ))}
              </div>
              <div>
                <p className="text-sm font-light text-gray-600">
                  <span className="font-semibold text-[#0072BC]">+5.000</span> profissionais já certificados
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - Gray Background */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-[#1f2937] mb-4">
              Transforme Sua Carreira com o <span className="text-[#0072BC] font-medium">CTP</span>
            </h2>
            <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
              Curso online completo que vai mudar sua vida profissional. Estude quando e onde quiser!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div 
                  key={index}
                  className="group bg-white rounded-2xl p-8 border-l-4 border-[#0072BC] hover:shadow-xl transition-all hover:-translate-y-2"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${benefit.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="text-white" size={32} />
                  </div>
                  <h3 className="text-xl font-medium text-[#1f2937] mb-3">{benefit.title}</h3>
                  <p className="text-gray-600 font-light leading-relaxed">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section - White */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#0072BC] to-[#005a9e] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-base font-medium text-[#1f2937] mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 font-light">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Video Section - Blue */}
      <section className="bg-gradient-to-br from-[#0072BC] to-[#005a9e] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-light text-white mb-4">
            Realize seu sonho de ser um profissional certificado
          </h2>
          <p className="text-lg text-blue-100 font-light mb-8">
            Comece agora mesmo e garante seu futuro na profissão que mais cresce no Brasil
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/conheca-ctp')}
              className="bg-white text-[#0072BC] py-4 px-8 rounded-full font-medium hover:bg-blue-50 transition-all shadow-lg"
            >
              Ver apresentação do curso
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-[#FF6B00] text-white py-4 px-8 rounded-full font-medium hover:bg-[#e55d00] transition-all shadow-lg"
            >
              Quero me inscrever agora
            </button>
          </div>
        </div>
      </section>

      {/* Course Card Section - Gray */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-[#1f2937] mb-4">
              Nossos <span className="text-[#0072BC] font-medium">Cursos e Certificações</span>
            </h2>
            <p className="text-lg text-gray-600 font-light">
              A melhor formação técnica para profissionais de piscinas
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative h-64 lg:h-auto bg-gradient-to-br from-[#0072BC] to-[#005a9e] p-8 flex items-center justify-center">
                <img
                  src={`${process.env.REACT_APP_BACKEND_URL}/api/proxy-image?url=${encodeURIComponent('https://customer-assets.emergentagent.com/job_aqua-skills-2/artifacts/i7j10xxc_logo ctp branco.png')}`}
                  alt="Logo CTP"
                  className="w-full h-auto object-contain max-w-md"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/800x600/0072BC/FFFFFF?text=CTP';
                  }}
                />
                <div className="absolute top-4 left-4 bg-[#FF6B00] text-white px-4 py-2 rounded-full text-sm font-medium">
                  Certificação Oficial 2025
                </div>
              </div>
              <div className="p-8">
                <div className="inline-block bg-blue-50 text-[#0072BC] px-3 py-1 rounded-full text-xs font-medium mb-4">
                  Curso Completo
                </div>
                <h3 className="text-2xl font-medium text-[#1f2937] mb-4">Curso Técnico de Piscinas</h3>
                <ul className="space-y-3 mb-6">
                  {[
                    'Aulas práticas e fáceis de entender, com exemplos do dia a dia',
                    'Aprenda a resolver problemas comuns e evite erros que custam dinheiro',
                    'Grupo exclusivo no WhatsApp com professores e colegas',
                    'Material de apoio com passo a passo das manutenções',
                    'Certificado digital reconhecido em todo Brasil'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="text-green-500 mr-2 flex-shrink-0 mt-0.5" size={20} />
                      <span className="text-sm text-gray-600 font-light">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mb-6">
                  <p className="text-sm text-gray-500 font-light mb-2">Investimento a partir de</p>
                  <p className="text-3xl font-light text-[#0072BC]">R$ 299,00<span className="text-lg text-gray-500">*</span></p>
                  <p className="text-xs text-gray-500 font-light">*Valor mensal no plano anual</p>
                </div>
                <button
                  onClick={() => navigate('/conheca-ctp')}
                  className="w-full bg-[#0072BC] text-white py-3 px-6 rounded-full font-medium hover:bg-[#005a9e] transition-all shadow-lg"
                >
                  Saiba Mais
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Light Blue Background */}
      <section className="bg-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-[#1f2937] mb-4">
              Histórias de <span className="text-[#0072BC] font-medium">Sucesso</span>
            </h2>
            <p className="text-lg text-gray-600 font-light">
              Veja como o CTP mudou a vida desses piscineiros
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all border-t-4 border-[#FF6B00]"
              >
                <div className="flex items-center mb-6">
                  <img 
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100/0072BC/FFFFFF?text=' + testimonial.name.charAt(0);
                    }}
                  />
                  <div>
                    <h4 className="font-medium text-[#1f2937]">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500 font-light">{testimonial.location}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="text-[#FF6B00] fill-current" size={16} />
                  ))}
                </div>
                <p className="text-gray-600 font-light leading-relaxed">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Blue */}
      <section className="bg-gradient-to-r from-[#0072BC] to-[#005a9e] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-light text-white mb-6">
            Quer ganhar mais como piscineiro?
          </h2>
          <p className="text-lg text-blue-100 font-light mb-8">
            Comece agora mesmo! Temos condições especiais e pagamento facilitado em até 12x no cartão.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/cursos')}
              className="bg-white text-[#0072BC] py-4 px-8 rounded-full font-medium hover:bg-blue-50 transition-all shadow-lg"
            >
              Conhecer Planos
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-[#FF6B00] text-white py-4 px-8 rounded-full font-medium hover:bg-[#e55d00] transition-all shadow-lg"
            >
              Inscreva-se Agora
            </button>
          </div>
        </div>
      </section>

      {/* Platform Features - White */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-[#1f2937] mb-4">
              Uma plataforma completa para seu <span className="text-[#0072BC] font-medium">aprendizado</span>
            </h2>
            <p className="text-lg text-gray-600 font-light">
              Tudo o que você precisa para estudar do seu jeito, no seu tempo
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative">
                <img
                  src="https://customer-assets.emergentagent.com/job_poolcurso/artifacts/2wicsnmf_Vinheta%20Cap%201.png"
                  alt="Aula CTP - Capítulo 1"
                  className="w-full rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -right-6 bg-gradient-to-br from-[#0072BC] to-[#005a9e] text-white p-6 rounded-2xl shadow-xl hidden lg:block">
                  <p className="text-sm font-light mb-1">Capítulo em destaque</p>
                  <p className="text-2xl font-medium">Módulo 1</p>
                </div>
              </div>
            </div>
            <div className="space-y-8 order-1 lg:order-2">
              {platformFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-start group">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#0072BC] to-[#005a9e] rounded-2xl flex items-center justify-center mr-5 flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                      <Icon className="text-white" size={26} />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-[#1f2937] mb-2 group-hover:text-[#0072BC] transition-colors">{feature.title}</h3>
                      <p className="text-base text-gray-600 font-light leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Certificate Section - Light Blue */}
      <section className="bg-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-[#FF6B00] text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                Certificação Reconhecida
              </div>
              <h2 className="text-4xl font-light text-[#1f2937] mb-6">
                Certificado <span className="text-[#0072BC] font-medium">Oficial ANAPP</span>
              </h2>
              <p className="text-lg text-gray-600 font-light mb-8 leading-relaxed">
                Ao concluir o Curso Técnico em Piscinas, você receberá o certificado oficial da ANAPP, reconhecido em todo o Brasil como o padrão de excelência na área de tratamento e manutenção de piscinas.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  {
                    icon: Award,
                    text: 'Certificado digital e impresso com validade nacional'
                  },
                  {
                    icon: CheckCircle2,
                    text: 'Reconhecido por condomínios, clubes e empresas'
                  },
                  {
                    icon: TrendingUp,
                    text: 'Diferencial competitivo no mercado de trabalho'
                  },
                  {
                    icon: Users,
                    text: 'Faça parte da rede de +5.000 profissionais certificados'
                  }
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="flex items-start">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#0072BC] to-[#005a9e] rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                        <Icon className="text-white" size={20} />
                      </div>
                      <p className="text-base text-gray-700 font-light pt-2">{item.text}</p>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => navigate('/conheca-ctp')}
                className="bg-[#0072BC] text-white py-4 px-8 rounded-full font-medium hover:bg-[#005a9e] transition-all shadow-lg"
              >
                Quero Meu Certificado
              </button>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl p-6 shadow-2xl">
                <img
                  src={`${process.env.REACT_APP_BACKEND_URL}/api/proxy-image?url=${encodeURIComponent('https://customer-assets.emergentagent.com/job_poolcurso/artifacts/pzde6eel_CERTIFICADO CTP ANAPP V10.png')}`}
                  alt="Certificado CTP ANAPP"
                  className="w-full rounded-xl"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/800x600/0072BC/FFFFFF?text=Certificado+CTP+ANAPP';
                  }}
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-gradient-to-br from-[#FF6B00] to-[#e55d00] text-white p-6 rounded-2xl shadow-xl hidden lg:block">
                <p className="text-sm font-light mb-1">Validade</p>
                <p className="text-2xl font-medium">Nacional</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Gray */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-[#1f2937] mb-4">
              Perguntas <span className="text-[#0072BC] font-medium">Frequentes</span>
            </h2>
            <p className="text-lg text-gray-600 font-light">
              Tire suas dúvidas sobre o Curso Técnico em Piscinas
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-[#0072BC] transition-all"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left p-6 flex items-center justify-between"
                >
                  <h3 className="text-lg font-medium text-[#1f2937] pr-4">{faq.question}</h3>
                  <ChevronRight 
                    className={`text-[#0072BC] transition-transform flex-shrink-0 ${openFaq === index ? 'rotate-90' : ''}`}
                    size={24}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 font-light leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 font-light mb-4">Ainda tem dúvidas? Fale com nossa equipe</p>
            <a
              href="https://wa.me/5511990001750"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 text-white py-3 px-8 rounded-full font-medium hover:bg-green-600 transition-all shadow-lg"
            >
              <MessageCircle size={20} />
              Conversar pelo WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Newsletter Section - Blue */}
      <section className="bg-gradient-to-br from-[#0072BC] to-[#005a9e] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BookOpen className="text-[#FF6B00] mx-auto mb-6" size={64} />
          <h2 className="text-4xl font-light text-white mb-4">
            Receba dicas e novidades sobre o mundo das piscinas
          </h2>
          <p className="text-lg text-blue-100 font-light mb-8">
            Inscreva-se em nossa newsletter e fique por dentro das tendências do setor
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Seu melhor e-mail"
              className="flex-1 px-6 py-3 rounded-full text-gray-900 font-light focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
            />
            <button className="bg-[#FF6B00] text-white py-3 px-8 rounded-full font-medium hover:bg-[#e55d00] transition-all shadow-lg whitespace-nowrap">
              Inscrever-se
            </button>
          </div>
          <p className="text-sm text-blue-100 font-light mt-4">
            Prometemos não enviar spam. Você pode cancelar a inscrição a qualquer momento.
          </p>
        </div>
      </section>

      <Footer user={null} />
    </div>
  );
}

export default Homepage;
