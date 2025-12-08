import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Award, Target, Heart, Users, Building2, Wrench, Droplet, Sparkles, Home, TrendingUp, BookOpen, Calendar, Phone, Mail, MapPin, MessageCircle, CheckCircle2, Star, Factory, Store, HardHat, Ruler, Briefcase, Shield, FileText, GraduationCap, Handshake, DollarSign, ArrowRight, ExternalLink } from 'lucide-react';

function SobreAnapp() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [activeTab, setActiveTab] = useState('fabricante');
  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const valores = [
    { icon: Shield, title: "Ética", description: "Compromisso com práticas transparentes e justas em todas as relações" },
    { icon: Award, title: "Profissionalismo", description: "Excelência e qualidade em todos os serviços prestados" },
    { icon: Sparkles, title: "Criatividade", description: "Inovação constante para o desenvolvimento do setor" },
    { icon: Target, title: "Responsabilidade", description: "Compromisso sério com associados e mercado" },
    { icon: Heart, title: "Respeito", description: "Valorização de todos os profissionais do setor" }
  ];

  const timeline = [
    { 
      year: "1990", 
      title: "Fundação da ANAPP", 
      description: "Empresários do setor de piscinas se unem para criar a associação e fortalecer o mercado", 
      icon: Building2 
    },
    { 
      year: "1995", 
      title: "Primeira Feira do Setor", 
      description: "Realização da primeira feira especializada reunindo fabricantes e profissionais", 
      icon: Calendar 
    },
    { 
      year: "2000", 
      title: "Revista ANAPP", 
      description: "Criação da primeira publicação especializada com conteúdo técnico", 
      icon: BookOpen 
    },
    { 
      year: "2010", 
      title: "Programa CTP", 
      description: "Lançamento do Curso Técnico de Piscinas estabelecendo padrão de qualidade", 
      icon: GraduationCap 
    },
    { 
      year: "2015", 
      title: "Parceria FRANCAL", 
      description: "Criação da EXPOLAZER, maior evento do setor na América Latina", 
      icon: Handshake 
    },
    { 
      year: "2024", 
      title: "24ª EXPOLAZER", 
      description: "Recorde de público consolidando o evento como referência", 
      icon: TrendingUp 
    }
  ];

  const setores = [
    { icon: Droplet, title: "Piscinas", items: ["Vinil", "Fibra", "Alvenaria", "Naturais"], color: "from-blue-500 to-blue-600" },
    { icon: Sparkles, title: "Bem-Estar", items: ["Spas", "Saunas", "Ofurôs", "Hidromassagem"], color: "from-purple-500 to-purple-600" },
    { icon: Wrench, title: "Equipamentos", items: ["Bombas", "Filtros", "Aquecedores", "Automação"], color: "from-gray-500 to-gray-600" },
    { icon: Building2, title: "Tratamento", items: ["Químicos", "Testes", "Dosagem", "Alternativos"], color: "from-green-500 to-green-600" },
    { icon: Users, title: "Serviços", items: ["Construção", "Manutenção", "Reforma", "Consultoria"], color: "from-[#FF6B00] to-[#e55d00]" },
    { icon: Home, title: "Paisagismo", items: ["Deck", "Mobiliário", "Acessórios", "Projetos"], color: "from-emerald-500 to-emerald-600" }
  ];

  const publico = [
    { icon: Factory, title: "Fabricantes", description: "Indústrias de piscinas e equipamentos" },
    { icon: Store, title: "Lojistas", description: "Revendedores de produtos e equipamentos" },
    { icon: HardHat, title: "Construtores", description: "Empresas especializadas em construção" },
    { icon: Ruler, title: "Engenheiros", description: "Profissionais de engenharia hidráulica" },
    { icon: Briefcase, title: "Arquitetos", description: "Projetistas de espaços com piscinas" },
    { icon: Users, title: "Piscineiros", description: "Técnicos em tratamento de piscinas" }
  ];

  const servicos = [
    { 
      icon: FileText, 
      title: "Orientações Técnicas", 
      description: "Suporte técnico especializado com orientações sobre normas, procedimentos e melhores práticas do setor",
      link: "#"
    },
    { 
      icon: BookOpen, 
      title: "Revista Digital ANAPP", 
      description: "Publicação com conteúdo sobre mercado, normas, lançamentos, legislações e tratamento da água",
      link: "https://www.anapp.org.br/revistas"
    },
    { 
      icon: TrendingUp, 
      title: "Apoio ao Marketing", 
      description: "Suporte comercial com informações estratégicas para auxiliar empresas nas estratégias de marketing",
      link: "#"
    },
    { 
      icon: Calendar, 
      title: "Eventos e Feiras", 
      description: "Organização da EXPOLAZER, a maior feira de piscinas e bem-estar da América Latina",
      link: "#"
    },
    { 
      icon: GraduationCap, 
      title: "Cursos e Palestras", 
      description: "Realização de cursos, palestras e seminários para capacitação de profissionais e empresários",
      link: "#"
    },
    { 
      icon: Award, 
      title: "Curso Técnico de Piscina", 
      description: "Programa de capacitação com foco em boas práticas, segurança e excelência no tratamento",
      link: "/conheca-ctp"
    }
  ];

  const associacaoPlanos = {
    fabricante: {
      title: "Associado Fabricante",
      description: "Para indústrias e fabricantes de piscinas, equipamentos e produtos químicos",
      preco: "R$ 3.912,00",
      periodo: "/ano",
      beneficios: [
        "Representatividade em discussões setoriais",
        "Participação em eventos com desconto",
        "Divulgação nos canais da ANAPP",
        "Networking qualificado"
      ]
    },
    lojista: {
      title: "Associado Lojista",
      description: "Para lojas e revendedores de produtos e equipamentos para piscinas",
      preco: "R$ 216,00",
      periodo: "/ano",
      beneficios: [
        "Acesso a informações exclusivas",
        "Descontos em cursos e eventos",
        "Visibilidade no mercado",
        "Suporte técnico especializado"
      ]
    },
    profissional: {
      title: "Associado Profissional",
      description: "Para piscineiros, técnicos, engenheiros, arquitetos e outros profissionais",
      preco: "Grátis",
      periodo: "",
      beneficios: [
        "Sem pagamento de anuidade",
        "Certificação reconhecida",
        "Capacitação exclusiva",
        "Rede de contatos"
      ]
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header user={null} />

      {/* Hero Section with Parallax */}
      <section className="relative min-h-[600px] flex items-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://readdy.ai/api/search-image?query=modern%20swimming%20pool%20industry%20professional%20association%20building&width=1920&height=1080&seq=1&orientation=landscape)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `translateY(${scrollY * 0.5}px)`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#0072BC]/95 to-[#0072BC]/80"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <div className="inline-block bg-[#FF6B00] text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              Institucional
            </div>
            <h1 className="text-5xl md:text-6xl font-light text-white mb-6 leading-tight">
              Sobre a <span className="font-medium">ANAPP</span>
            </h1>
            <p className="text-xl text-blue-100 font-light mb-8 leading-relaxed">
              Conheça a história e a missão da Associação Nacional das Empresas e Profissionais de Piscinas, referência no setor desde 1990.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#historia"
                className="bg-white text-[#0072BC] py-4 px-8 rounded-full font-medium hover:bg-blue-50 transition-all shadow-lg text-center"
              >
                Nossa História
              </a>
              <a
                href="#associe-se"
                className="bg-[#FF6B00] text-white py-4 px-8 rounded-full font-medium hover:bg-[#e55d00] transition-all shadow-lg text-center"
              >
                Associe-se
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Nossa História - Gray Background */}
      <section id="historia" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-[#0072BC] text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              NOSSA HISTÓRIA
            </div>
            <h2 className="text-4xl font-light text-[#1f2937] mb-4">
              Fundação e <span className="text-[#0072BC] font-medium">Trajetória</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-8 shadow-sm border-l-4 border-[#0072BC]">
                <p className="text-lg text-gray-700 font-light leading-relaxed">
                  Fundada em <span className="font-semibold text-[#0072BC]">20 de novembro de 1990</span> por empresários visionários do segmento de lazer, a ANAPP nasceu com o propósito de promover o desenvolvimento e o fortalecimento do setor através da união de empresários e profissionais envolvidos no universo das piscinas.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <p className="text-lg text-gray-700 font-light leading-relaxed">
                  Ao longo de mais de três décadas, a ANAPP tem sido a voz do setor, representando <span className="font-medium text-[#0072BC]">fabricantes, lojistas, construtores, engenheiros, arquitetos, paisagistas e tratadores de piscina</span>, além de todos os agentes fundamentais da cadeia produtiva.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-[#0072BC] to-[#005a9e] rounded-xl p-8 shadow-lg">
                <p className="text-lg text-white font-light leading-relaxed">
                  A associação representa todos os setores ligados à área, como piscinas de vinil, fibra e alvenaria, além de acessórios, Spas, saunas, aquecedores, bombas, filtros, iluminação e tratamento de água.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-[#0072BC]/20 to-[#FF6B00]/20 rounded-3xl blur-2xl"></div>
              <div className="relative bg-white rounded-2xl p-4 shadow-2xl">
                <img
                  src={`${API_URL}/api/proxy-image?url=${encodeURIComponent('https://customer-assets.emergentagent.com/job_aqua-skills-2/artifacts/joqpm6cm_anapp.png')}`}
                  alt="Fundação da ANAPP"
                  className="w-full rounded-xl"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%230072BC" width="800" height="600"/%3E%3Ctext fill="%23ffffff" font-family="Arial" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EANAPP%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-[#FF6B00] text-white p-6 rounded-2xl shadow-xl hidden lg:block">
                <p className="text-sm font-light mb-1">Desde</p>
                <p className="text-4xl font-bold">1990</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline - Blue with Parallax */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://readdy.ai/api/search-image?query=modern%20architecture%20timeline%20professional%20growth&width=1920&height=1080&seq=2&orientation=landscape)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="absolute inset-0 bg-[#0072BC]/95"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-[#FF6B00] text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              NOSSA TRAJETÓRIA
            </div>
            <h2 className="text-4xl font-light text-white mb-4">
              Marcos <span className="font-medium">Históricos</span>
            </h2>
            <p className="text-lg text-blue-100 font-light max-w-2xl mx-auto">
              Conheça os principais acontecimentos que marcaram a história da ANAPP
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {timeline.map((milestone, index) => {
              const Icon = milestone.icon;
              return (
                <div 
                  key={index}
                  className="group bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/20 hover:border-[#FF6B00] transition-all hover:bg-white/20"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-white text-5xl font-light">{milestone.year}</div>
                    <div className="w-12 h-12 bg-[#FF6B00] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="text-white" size={24} />
                    </div>
                  </div>
                  <h3 className="text-xl font-medium text-white mb-3">{milestone.title}</h3>
                  <p className="text-base text-blue-100 font-light leading-relaxed">{milestone.description}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-16 text-center">
            <div className="inline-block bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-light text-white mb-4">Próxima Edição</h3>
              <div className="flex items-center justify-center gap-8 flex-wrap">
                <div>
                  <p className="text-[#FF6B00] text-5xl font-light mb-2">25ª</p>
                  <p className="text-white font-medium">EXPOLAZER</p>
                </div>
                <div className="h-16 w-px bg-white/20 hidden sm:block"></div>
                <div className="text-left">
                  <p className="text-white font-medium text-lg mb-1">11 a 14 de agosto de 2026</p>
                  <p className="text-blue-100 font-light">Distrito Anhembi, São Paulo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values - White */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-[#0072BC] text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              NOSSOS PRINCÍPIOS
            </div>
            <h2 className="text-4xl font-light text-[#1f2937] mb-4">
              Missão, Visão e <span className="text-[#0072BC] font-medium">Valores</span>
            </h2>
            <p className="text-lg text-gray-600 font-light">
              Os pilares que orientam nossas ações e decisões
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <div className="bg-gradient-to-br from-[#0072BC] to-[#005a9e] rounded-2xl p-10 text-white">
              <Target className="text-[#FF6B00] mb-6" size={48} />
              <h3 className="text-2xl font-medium mb-4">Missão</h3>
              <p className="text-lg font-light text-blue-100 leading-relaxed">
                Contribuir para o fortalecimento e a ascensão do mercado, priorizando o desenvolvimento empresarial, a qualificação profissional e o suporte contínuo aos empresários, lojistas e profissionais, como os tratadores de piscinas.
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-10 border-l-4 border-[#FF6B00]">
              <Heart className="text-[#0072BC] mb-6" size={48} />
              <h3 className="text-2xl font-medium text-[#1f2937] mb-4">Visão</h3>
              <p className="text-lg font-light text-gray-600 leading-relaxed">
                Tornar-se referência mundial para os setores envolvidos por meio dos serviços prestados e excelência no atendimento aos associados e a todos que procuram a ANAPP.
              </p>
            </div>
          </div>

          <div className="text-center mb-12">
            <h3 className="text-3xl font-light text-[#1f2937] mb-4">
              Nossos <span className="text-[#0072BC] font-medium">Valores</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {valores.map((valor, index) => {
              const Icon = valor.icon;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#0072BC] hover:shadow-xl transition-all text-center group"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#0072BC] to-[#005a9e] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="text-white" size={28} />
                  </div>
                  <h4 className="text-lg font-medium text-[#1f2937] mb-2">{valor.title}</h4>
                  <p className="text-sm text-gray-600 font-light leading-relaxed">{valor.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Setores - Gray Background */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-[#0072BC] text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              ÁREAS DE ATUAÇÃO
            </div>
            <h2 className="text-4xl font-light text-[#1f2937] mb-4">
              Setores <span className="text-[#0072BC] font-medium">Representados</span>
            </h2>
            <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
              A ANAPP representa todos os setores ligados ao universo das piscinas e bem-estar aquático
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {setores.map((setor, index) => {
              const Icon = setor.icon;
              return (
                <div 
                  key={index}
                  className="group bg-white rounded-2xl p-8 hover:shadow-xl transition-all cursor-pointer border-l-4 border-transparent hover:border-[#0072BC]"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${setor.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-xl font-medium text-[#1f2937] mb-4 group-hover:text-[#0072BC] transition-colors">{setor.title}</h3>
                  <ul className="space-y-2">
                    {setor.items.map((item, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600 font-light">
                        <CheckCircle2 className="text-green-500 mr-2 flex-shrink-0" size={16} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Público - White */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-[#0072BC] text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              PÚBLICO DA ANAPP
            </div>
            <h2 className="text-4xl font-light text-[#1f2937] mb-4">
              Quem <span className="text-[#0072BC] font-medium">Representamos</span>
            </h2>
            <p className="text-lg text-gray-600 font-light max-w-3xl mx-auto">
              A ANAPP representa empresários do setor de lazer e profissionais envolvidos na cadeia de valor das piscinas, cuja atuação é essencial para a segurança e qualidade dos serviços prestados
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {publico.map((item, index) => {
              const Icon = item.icon;
              return (
                <div 
                  key={index}
                  className="text-center group"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-[#0072BC] to-[#005a9e] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    <Icon className="text-white" size={32} />
                  </div>
                  <h4 className="text-base font-medium text-[#1f2937] mb-2 group-hover:text-[#0072BC] transition-colors">{item.title}</h4>
                  <p className="text-xs text-gray-600 font-light">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Serviços - Gray Background */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-[#0072BC] text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              NOSSOS SERVIÇOS
            </div>
            <h2 className="text-4xl font-light text-[#1f2937] mb-4">
              O que <span className="text-[#0072BC] font-medium">Oferecemos</span>
            </h2>
            <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
              A ANAPP atua pelo desenvolvimento contínuo do mercado de produtos e serviços ligados a piscinas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicos.map((servico, index) => {
              const Icon = servico.icon;
              return (
                <div 
                  key={index}
                  className="group bg-white rounded-2xl p-8 border-l-4 border-[#0072BC] hover:shadow-xl hover:bg-white transition-all"
                >
                  <Icon className="text-[#0072BC] mb-4 group-hover:text-[#FF6B00] transition-colors" size={32} />
                  <h3 className="text-xl font-medium text-[#1f2937] mb-3">{servico.title}</h3>
                  <p className="text-base text-gray-600 font-light leading-relaxed mb-4">{servico.description}</p>
                  {servico.link.startsWith('http') ? (
                    <a 
                      href={servico.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-[#0072BC] font-medium hover:text-[#FF6B00] transition-colors"
                    >
                      Saiba mais <ExternalLink size={16} className="ml-2" />
                    </a>
                  ) : servico.link.startsWith('/') ? (
                    <button
                      onClick={() => navigate(servico.link)}
                      className="inline-flex items-center text-[#0072BC] font-medium hover:text-[#FF6B00] transition-colors"
                    >
                      Saiba mais <ArrowRight size={16} className="ml-2" />
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Associe-se - Blue Gradient */}
      <section id="associe-se" className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0072BC] to-[#005a9e]"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-[#FF6B00] text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              ASSOCIE-SE
            </div>
            <h2 className="text-4xl font-light text-white mb-4">
              Faça Parte da <span className="font-medium">ANAPP</span>
            </h2>
            <p className="text-lg text-blue-100 font-light max-w-3xl mx-auto mb-8">
              Associe-se à ANAPP e faça parte da maior comunidade de profissionais e empresas do setor de piscinas do Brasil
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-8 gap-4 flex-wrap">
            {Object.keys(associacaoPlanos).map((key) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  activeTab === key
                    ? 'bg-[#FF6B00] text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {associacaoPlanos[key].title}
              </button>
            ))}
          </div>

          {/* Plan Content */}
          <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-medium text-white mb-2">{associacaoPlanos[activeTab].title}</h3>
              <p className="text-blue-100 font-light mb-6">{associacaoPlanos[activeTab].description}</p>
              <div className="flex items-end justify-center gap-2">
                <span className="text-5xl font-light text-[#FF6B00]">{associacaoPlanos[activeTab].preco}</span>
                <span className="text-lg text-blue-100 font-light mb-2">{associacaoPlanos[activeTab].periodo}</span>
              </div>
            </div>
            
            <div className="space-y-3 mb-8">
              {associacaoPlanos[activeTab].beneficios.map((beneficio, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle2 className="text-[#FF6B00] mr-3 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-white font-light">{beneficio}</p>
                </div>
              ))}
            </div>

            <a
              href="https://www.anapp.org.br/contato"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-[#FF6B00] text-white py-4 px-8 rounded-full font-medium hover:bg-[#e55d00] transition-all shadow-lg text-center"
            >
              Quero me Associar
            </a>
          </div>

          <p className="text-center text-blue-100 font-light text-sm mt-8">
            Valores sujeitos a alteração. Consulte condições especiais para empresas de grande porte.
          </p>
        </div>
      </section>

      {/* Contato - White */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-[#0072BC] text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              CONTATO
            </div>
            <h2 className="text-4xl font-light text-[#1f2937] mb-4">
              Fale <span className="text-[#0072BC] font-medium">Conosco</span>
            </h2>
            <p className="text-lg text-gray-600 font-light">
              Entre em contato para tirar dúvidas, solicitar informações ou associar-se
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center bg-gray-50 rounded-2xl p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0072BC] to-[#005a9e] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-white" size={28} />
              </div>
              <h4 className="font-medium text-[#1f2937] mb-2">Endereço</h4>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                Av. Queiroz Filho, 1700<br/>
                Sala 807 D – Villa Lobos<br/>
                Vila Leopoldina, São Paulo - SP
              </p>
            </div>

            <div className="text-center bg-gray-50 rounded-2xl p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0072BC] to-[#005a9e] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Phone className="text-white" size={28} />
              </div>
              <h4 className="font-medium text-[#1f2937] mb-2">Telefone</h4>
              <p className="text-lg text-[#0072BC] font-medium">(11) 5687-7888</p>
              <p className="text-xs text-gray-500 font-light mt-2">Seg a Sex: 9h às 18h</p>
            </div>

            <div className="text-center bg-gray-50 rounded-2xl p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="text-white" size={28} />
              </div>
              <h4 className="font-medium text-[#1f2937] mb-2">WhatsApp</h4>
              <a 
                href="https://wa.me/5511990001750"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg text-green-600 font-medium hover:text-green-700"
              >
                (11) 99000-1750
              </a>
              <p className="text-xs text-gray-500 font-light mt-2">Atendimento rápido</p>
            </div>

            <div className="text-center bg-gray-50 rounded-2xl p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0072BC] to-[#005a9e] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="text-white" size={28} />
              </div>
              <h4 className="font-medium text-[#1f2937] mb-2">E-mail</h4>
              <a 
                href="mailto:contato@anapp.org.br"
                className="text-sm text-[#0072BC] font-medium hover:text-[#005a9e]"
              >
                contato@anapp.org.br
              </a>
              <p className="text-xs text-gray-500 font-light mt-2">Resposta em 24h</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-[#0072BC] to-[#005a9e] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Award className="text-[#FF6B00] mx-auto mb-6" size={64} />
          <h2 className="text-4xl font-light text-white mb-6">
            Faça parte da maior comunidade do setor de piscinas do Brasil
          </h2>
          <p className="text-lg text-blue-100 font-light mb-8">
            Associe-se à ANAPP e contribua para o fortalecimento e desenvolvimento do mercado
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://www.anapp.org.br/associe-se"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#FF6B00] text-white py-4 px-8 rounded-full font-medium hover:bg-[#e55d00] transition-all shadow-lg"
            >
              Associe-se Agora
            </a>
            <a
              href="https://www.anapp.org.br/contato"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-[#0072BC] py-4 px-8 rounded-full font-medium hover:bg-blue-50 transition-all shadow-lg"
            >
              Entre em Contato
            </a>
          </div>
        </div>
      </section>

      <Footer user={null} />
    </div>
  );
}

export default SobreAnapp;
