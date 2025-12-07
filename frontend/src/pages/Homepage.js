import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Star, Users, Award, TrendingUp, CheckCircle2, ChevronRight, Video, FileText, Laptop, DollarSign, Shield, Clock } from 'lucide-react';

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
      description: 'Nossos alunos relatam aumento de 50% a 200% na renda após a certificação',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Shield,
      title: 'Credibilidade profissional',
      description: 'Certificado reconhecido pela ANAPP abre portas para clientes e empresas',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: TrendingUp,
      title: 'Destaque no mercado',
      description: 'Profissionais certificados são os mais procurados e melhor remunerados',
      color: 'from-[#FF6B00] to-[#e55d00]'
    }
  ];

  const features = [
    { icon: Video, title: 'Videoaulas HD', description: 'Conteúdo visual de alta qualidade' },
    { icon: FileText, title: 'Material Completo', description: 'Apostilas e PDFs para download' },
    { icon: Laptop, title: 'Estude Anywhere', description: '100% online e mobile-friendly' },
    { icon: Award, title: 'Certificado ANAPP', description: 'Reconhecido em todo Brasil' }
  ];

  const testimonials = [
    {
      name: 'Roberto Oliveira',
      location: 'São Paulo, SP',
      text: 'Antes do CTP, cobrava R$ 150 por piscina. Hoje cobro R$ 350 e tenho mais clientes do que consigo atender.',
      image: 'https://readdy.ai/api/search-image?query=Professional%20male%20pool%20technician%20portrait%2C%20smiling%2C%20uniform&width=100&height=100&seq=1'
    },
    {
      name: 'Fernanda Almeida',
      location: 'Florianópolis, SC',
      text: 'Abri minha própria empresa de manutenção de piscinas. O módulo de gestão foi fundamental.',
      image: 'https://readdy.ai/api/search-image?query=Professional%20female%20business%20owner%20portrait%2C%20confident&width=100&height=100&seq=2'
    },
    {
      name: 'Carlos Santos',
      location: 'Fortaleza, CE',
      text: 'A plataforma é muito fácil de usar. Consegui fazer todo o curso pelo celular nos intervalos do trabalho.',
      image: 'https://readdy.ai/api/search-image?query=Professional%20male%20technician%20portrait%2C%20friendly&width=100&height=100&seq=3'
    }
  ];

  const faqs = [
    {
      question: 'Quanto tempo tenho para concluir o curso?',
      answer: 'Você tem acesso ao curso por 12 meses a partir da data de inscrição. Esse prazo é mais que suficiente para concluir todos os módulos.'
    },
    {
      question: 'Preciso ter conhecimento prévio sobre piscinas?',
      answer: 'Não é necessário conhecimento prévio. O curso começa do básico e avança gradualmente.'
    },
    {
      question: 'O certificado é reconhecido pelo mercado?',
      answer: 'Sim! A ANAPP é a principal associação do setor de piscinas no Brasil. Nosso certificado é reconhecido em todo o país.'
    },
    {
      question: 'Posso assistir as aulas pelo celular?',
      answer: 'Com certeza! Nossa plataforma é 100% responsiva e otimizada para dispositivos móveis.'
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

      {/* Features Section - Blue Background with Parallax */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://readdy.ai/api/search-image?query=swimming%20pool%20equipment%20maintenance%20professional%20tools&width=1920&height=1080&seq=2&orientation=landscape)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            transform: `translateY(${scrollY * 0.3}px)`
          }}
        >
          <div className="absolute inset-0 bg-[#0072BC]/95"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-white mb-4">
              Como Funciona o <span className="font-medium">Curso CTP</span>
            </h2>
            <p className="text-lg text-blue-100 font-light max-w-2xl mx-auto">
              Método de ensino aprovado por milhares de profissionais
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all"
                >
                  <Icon className="text-[#FF6B00] mb-4" size={40} />
                  <h3 className="text-lg font-medium text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-blue-100 font-light">{feature.description}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => navigate('/conheca-ctp')}
              className="inline-flex items-center gap-2 bg-[#FF6B00] text-white py-4 px-8 rounded-full font-medium hover:bg-[#e55d00] transition-all shadow-lg hover:shadow-xl"
            >
              Ver Programa Completo
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section - White Background */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '+5.000', label: 'Alunos Certificados' },
              { number: '160h', label: 'De Conteúdo' },
              { number: '12', label: 'Módulos Práticos' },
              { number: '4.9/5', label: 'Avaliação Média' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-light text-[#0072BC] mb-2">{stat.number}</div>
                <div className="text-sm text-gray-600 font-light">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Light Blue Background */}
      <section className="bg-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-[#1f2937] mb-4">
              O que dizem nossos <span className="text-[#0072BC] font-medium">alunos</span>
            </h2>
            <p className="text-lg text-gray-600 font-light">
              Histórias reais de profissionais que transformaram suas carreiras
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

      {/* FAQ Section - White Background */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-[#1f2937] mb-4">
              Perguntas <span className="text-[#0072BC] font-medium">Frequentes</span>
            </h2>
            <p className="text-lg text-gray-600 font-light">
              Tire suas dúvidas sobre o curso
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 hover:border-[#0072BC] transition-all"
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
        </div>
      </section>

      {/* CTA Final Section - Blue Gradient */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0072BC] to-[#005a9e]"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <img 
            src="https://customer-assets.emergentagent.com/job_poolcurso/artifacts/1t3erzmd_logo%20ctp%20branco.png"
            alt="CTP Logo"
            className="w-48 mx-auto mb-8"
          />
          <h2 className="text-4xl font-light text-white mb-6">
            Pronto para transformar sua carreira?
          </h2>
          <p className="text-lg text-blue-100 font-light mb-8 max-w-2xl mx-auto">
            Inscreva-se agora no Programa CTP e dê o primeiro passo para se tornar um profissional certificado e valorizado no mercado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="bg-[#FF6B00] text-white py-4 px-8 rounded-full font-medium hover:bg-[#e55d00] transition-all shadow-lg hover:shadow-xl"
            >
              Inscreva-se Agora
            </button>
            <button
              onClick={() => navigate('/contato')}
              className="bg-white text-[#0072BC] py-4 px-8 rounded-full font-medium hover:bg-blue-50 transition-all shadow-lg"
            >
              Falar com Consultor
            </button>
          </div>
        </div>
      </section>

      <Footer user={null} />
    </div>
  );
}

export default Homepage;
