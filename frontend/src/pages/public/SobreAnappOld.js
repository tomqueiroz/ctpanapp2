import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Award, Target, Heart, Users, Building2, Wrench, Droplet, Sparkles, Home, TrendingUp, BookOpen, Calendar, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

function SobreAnapp() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const valores = [
    { icon: Award, title: "Ética", description: "Compromisso com práticas transparentes e justas" },
    { icon: Heart, title: "Profissionalismo", description: "Excelência em todos os serviços prestados" },
    { icon: Users, title: "Criatividade", description: "Inovação constante para o desenvolvimento do setor" },
    { icon: TrendingUp, title: "Responsabilidade", description: "Compromisso com associados e o mercado" },
    { icon: Target, title: "Respeito", description: "Valorização de todos os profissionais do setor" }
  ];

  const setores = [
    { icon: Droplet, title: "Piscinas", color: "from-blue-500 to-blue-600" },
    { icon: Sparkles, title: "Bem-Estar", color: "from-purple-500 to-purple-600" },
    { icon: Wrench, title: "Equipamentos", color: "from-gray-500 to-gray-600" },
    { icon: Building2, title: "Tratamento", color: "from-green-500 to-green-600" },
    { icon: Users, title: "Serviços", color: "from-[#FF6B00] to-[#e55d00]" },
    { icon: Home, title: "Paisagismo", color: "from-emerald-500 to-emerald-600" }
  ];

  const milestones = [
    { year: "1990", title: "Fundação da ANAPP", description: "Empresários do segmento de lazer fundam a ANAPP em 20 de novembro", icon: Building2 },
    { year: "2000", title: "Revista Digital ANAPP", description: "Lançamento do veículo oficial com conteúdo técnico e de mercado", icon: BookOpen },
    { year: "2001", title: "EXPOLAZER", description: "Primeira edição da feira em parceria com a FRANCAL", icon: Calendar },
    { year: "2010", title: "Programa CTP", description: "Lançamento do curso de capacitação para tratadores de piscinas", icon: Award },
    { year: "2018", title: "Norma ABNT", description: "Participação ativa na atualização da NBR 10339:2018", icon: Target },
    { year: "2024", title: "24ª EXPOLAZER", description: "Recorde de público com 25ª edição agendada para 2026", icon: TrendingUp }
  ];

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
            <img 
              src="https://customer-assets.emergentagent.com/job_poolcurso/artifacts/un0adg8b_logo.png"
              alt="ANAPP Logo"
              className="w-48 mb-8"
            />
            <h1 className="text-5xl md:text-6xl font-light text-white mb-6 leading-tight">
              Sobre a <span className="font-medium">ANAPP</span>
            </h1>
            <p className="text-xl text-blue-100 font-light mb-8 leading-relaxed">
              Fundada em 1990, a ANAPP – Associação Nacional das Empresas e Profissionais de Piscinas promove o desenvolvimento do setor através da união de empresários e profissionais de todo o Brasil.
            </p>
          </div>
        </div>
      </section>

      {/* About ANAPP - Gray Background */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-light text-[#1f2937] mb-4">
                Quem <span className="text-[#0072BC] font-medium">Somos</span>
              </h2>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
              <p className="text-lg text-gray-700 font-light leading-relaxed mb-6">
                Fundada em <span className="font-medium text-[#0072BC]">20 de novembro de 1990</span> por empresários do segmento de lazer, a <span className="font-medium text-[#0072BC]">ANAPP – Associação Nacional das Empresas e Profissionais de Piscinas</span> tem como propósito promover o desenvolvimento e o fortalecimento do setor por meio da união de empresários e profissionais envolvidos no universo das piscinas.
              </p>
              <p className="text-lg text-gray-700 font-light leading-relaxed mb-6">
                A entidade atua na defesa dos interesses do segmento, que engloba <span className="font-medium">fabricantes, lojistas, construtores, engenheiros, arquitetos, paisagistas, tratadores de piscina (piscineiros)</span> e outros agentes fundamentais da cadeia produtiva.
              </p>
              <p className="text-lg text-gray-700 font-light leading-relaxed">
                A ANAPP representa todos os setores ligados à área, como piscinas de vinil, fibra e alvenaria, além de acessórios, Spas, saunas, aquecedores, bombas, filtros, iluminação, tratamento de água, entre outros.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border-l-4 border-[#0072BC]">
                <BookOpen className="text-[#0072BC] mb-4" size={32} />
                <h3 className="text-xl font-medium text-[#1f2937] mb-3">Revista Digital ANAPP</h3>
                <p className="text-base text-gray-600 font-light leading-relaxed">
                  Veículo oficial direcionado a empresas e profissionais de todo o país. A publicação reúne conteúdo técnico, institucional e de mercado, com foco em informação de qualidade e fortalecimento do setor.
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-6 border-l-4 border-[#FF6B00]">
                <Calendar className="text-[#FF6B00] mb-4" size={32} />
                <h3 className="text-xl font-medium text-[#1f2937] mb-3">EXPOLAZER</h3>
                <p className="text-base text-gray-600 font-light leading-relaxed">
                  Em parceria com a FRANCAL, a ANAPP idealizou a Feira Internacional de Piscinas, Spas, Decoração e Wellness, que chegou à sua 24ª edição em 2024 com recorde de público.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values - White */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            <div className="bg-gradient-to-br from-[#0072BC] to-[#005a9e] rounded-2xl p-10 text-white">
              <Target className="text-[#FF6B00] mb-6" size={48} />
              <h2 className="text-3xl font-light mb-4">Nossa Missão</h2>
              <p className="text-lg font-light text-blue-100 leading-relaxed">
                Contribuir para o fortalecimento e a ascensão do mercado, priorizando o desenvolvimento empresarial, a qualificação profissional e o suporte contínuo aos empresários, lojistas e profissionais, como os tratadores de piscinas.
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-10 border-l-4 border-[#FF6B00]">
              <Heart className="text-[#0072BC] mb-6" size={48} />
              <h2 className="text-3xl font-light text-[#1f2937] mb-4">Nossa Visão</h2>
              <p className="text-lg font-light text-gray-600 leading-relaxed">
                Tornar-se referência mundial para os setores envolvidos por meio dos serviços prestados e excelência no atendimento aos associados e a todos que procuram a ANAPP.
              </p>
            </div>
          </div>

          <div className="text-center mb-12">
            <h2 className="text-4xl font-light text-[#1f2937] mb-4">
              Nossos <span className="text-[#0072BC] font-medium">Valores</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {valores.map((valor, index) => {
              const Icon = valor.icon;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#0072BC] hover:shadow-xl transition-all text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#0072BC] to-[#005a9e] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-lg font-medium text-[#1f2937] mb-2">{valor.title}</h3>
                  <p className="text-sm text-gray-600 font-light">{valor.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sectors - Gray Background */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-[#1f2937] mb-4">
              Setores que <span className="text-[#0072BC] font-medium">Representamos</span>
            </h2>
            <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
              A ANAPP atua em diversos segmentos do mercado de piscinas e bem-estar
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {setores.map((setor, index) => {
              const Icon = setor.icon;
              return (
                <div 
                  key={index}
                  className="group bg-white rounded-2xl p-6 text-center hover:shadow-xl transition-all cursor-pointer"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${setor.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-sm font-medium text-[#1f2937] group-hover:text-[#0072BC] transition-colors">{setor.title}</h3>
                </div>
              );
            })}
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
            <h2 className="text-4xl font-light text-white mb-4">
              Nossa <span className="font-medium">Trajetória</span>
            </h2>
            <p className="text-lg text-blue-100 font-light max-w-2xl mx-auto">
              Mais de 35 anos de história fortalecendo o setor de piscinas no Brasil
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {milestones.map((milestone, index) => {
              const Icon = milestone.icon;
              return (
                <div 
                  key={index}
                  className="group bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/20 hover:border-[#FF6B00] transition-all hover:bg-white/20"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-[#FF6B00] text-5xl font-light">{milestone.year}</div>
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
              <div className="flex items-center justify-center gap-8">
                <div>
                  <p className="text-[#FF6B00] text-5xl font-light mb-2">25ª</p>
                  <p className="text-white font-medium">EXPOLAZER</p>
                </div>
                <div className="h-16 w-px bg-white/20"></div>
                <div className="text-left">
                  <p className="text-white font-medium text-lg mb-1">11 a 14 de agosto de 2026</p>
                  <p className="text-blue-100 font-light">Distrito Anhembi, São Paulo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services - White */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-[#1f2937] mb-4">
              Nossos <span className="text-[#0072BC] font-medium">Serviços</span>
            </h2>
            <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
              Apoio completo para profissionais e empresas do setor
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: "Orientações Técnicas", description: "Suporte especializado sobre normas e melhores práticas" },
              { icon: Calendar, title: "Eventos e Feiras", description: "EXPOLAZER e outros eventos do setor" },
              { icon: TrendingUp, title: "Apoio ao Marketing", description: "Estratégias e informações para associados" },
              { icon: Award, title: "Curso CTP", description: "Capacitação profissional reconhecida" },
              { icon: MessageCircle, title: "Revista Digital", description: "Conteúdo especializado para o mercado" },
              { icon: Users, title: "Networking", description: "Conexão entre profissionais do setor" }
            ].map((service, index) => {
              const Icon = service.icon;
              return (
                <div 
                  key={index}
                  className="group bg-gray-50 rounded-2xl p-6 border-l-4 border-[#0072BC] hover:shadow-xl hover:bg-white transition-all"
                >
                  <Icon className="text-[#0072BC] mb-4 group-hover:text-[#FF6B00] transition-colors" size={32} />
                  <h3 className="text-lg font-medium text-[#1f2937] mb-2">{service.title}</h3>
                  <p className="text-sm text-gray-600 font-light leading-relaxed">{service.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact CTA - Blue Gradient */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0072BC] to-[#005a9e]"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Users className="text-[#FF6B00] mx-auto mb-6" size={64} />
            <h2 className="text-4xl font-light text-white mb-6">
              Faça parte da ANAPP
            </h2>
            <p className="text-lg text-blue-100 font-light mb-8 max-w-2xl mx-auto">
              Associe-se e tenha acesso a todos os benefícios, eventos e suporte técnico que oferecemos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/contato')}
                className="bg-[#FF6B00] text-white py-4 px-8 rounded-full font-medium hover:bg-[#e55d00] transition-all shadow-lg hover:shadow-xl"
              >
                Entre em Contato
              </button>
              <button
                onClick={() => navigate('/conheca-ctp')}
                className="bg-white text-[#0072BC] py-4 px-8 rounded-full font-medium hover:bg-blue-50 transition-all shadow-lg"
              >
                Conheça o CTP
              </button>
            </div>

            <div className="mt-12 pt-12 border-t border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="flex items-start">
                  <MapPin className="text-[#FF6B00] mr-3 flex-shrink-0" size={24} />
                  <div>
                    <p className="text-sm font-light text-blue-100">
                      Av. Queiroz Filho, 1700 Sala 807 D<br/>
                      Villa Lobos Office Park<br/>
                      São Paulo - SP
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="text-[#FF6B00] mr-3 flex-shrink-0" size={24} />
                  <div>
                    <p className="text-sm font-light text-blue-100">
                      (11) 5687-7888
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="text-[#FF6B00] mr-3 flex-shrink-0" size={24} />
                  <div>
                    <p className="text-sm font-light text-blue-100">
                      contato@anapp.org.br
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer user={null} />
    </div>
  );
}

export default SobreAnapp;
