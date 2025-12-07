import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Award, BookOpen, CheckCircle2, Clock, Users, Video, FileText, TrendingUp, Shield, Target, ChevronRight, Star } from 'lucide-react';

function ConhecaCTP() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const modulos = [
    { numero: 1, titulo: "Introdução ao Tratamento de Piscinas", descricao: "A Importância das Medidas e o Sistema Internacional", carga: "12h", imagem: "https://customer-assets.emergentagent.com/job_poolcurso/artifacts/kjc951x6_Capitulo%201.png" },
    { numero: 2, titulo: "Segurança no Manuseio de Produtos", descricao: "Protocolos de segurança e EPIs obrigatórios", carga: "12h", imagem: "https://customer-assets.emergentagent.com/job_poolcurso/artifacts/st7v82pv_Capitulo%202.png" },
    { numero: 3, titulo: "Tipos de Tratamentos", descricao: "Tratamento físico, químico e sistemas de filtração", carga: "15h", imagem: "https://customer-assets.emergentagent.com/job_poolcurso/artifacts/blgghqom_Capitulo%203.png" },
    { numero: 4, titulo: "Controle e Análise da Água", descricao: "Parâmetros químicos e instrumentos de medição", carga: "15h", imagem: "https://customer-assets.emergentagent.com/job_poolcurso/artifacts/gp10g6y5_Capitulo%204.png" },
    { numero: 5, titulo: "Tratamentos Alternativos", descricao: "Ozônio, UV e tecnologias emergentes", carga: "12h", imagem: "https://customer-assets.emergentagent.com/job_poolcurso/artifacts/tb6dxgt5_Capitulo%205.png" },
    { numero: 6, titulo: "Manutenção e Resolução", descricao: "Manutenção preventiva e diagnóstico", carga: "14h", imagem: "https://customer-assets.emergentagent.com/job_poolcurso/artifacts/svos7h8v_Capitulo%206.png" },
    { numero: 7, titulo: "Solução de Problemas", descricao: "Problemas comuns e soluções específicas", carga: "15h", imagem: "https://customer-assets.emergentagent.com/job_poolcurso/artifacts/8x5drcve_Capitulo%207.png" },
    { numero: 8, titulo: "Relatórios e Documentação", descricao: "Elaboração de relatórios técnicos", carga: "12h", imagem: "https://customer-assets.emergentagent.com/job_poolcurso/artifacts/cf7z8z1q_Capitulo%208.png" },
    { numero: 9, titulo: "Atendimento ao Cliente", descricao: "Comunicação efetiva e gestão de expectativas", carga: "13h", imagem: "https://customer-assets.emergentagent.com/job_poolcurso/artifacts/ncywo7ov_Capitulo%209.png" },
    { numero: 10, titulo: "Gestão de Projetos", descricao: "Planejamento e cronograma de serviços", carga: "10h", imagem: "https://customer-assets.emergentagent.com/job_poolcurso/artifacts/bmg950w8_Capitulo%2010.png" },
    { numero: 11, titulo: "Sustentabilidade", descricao: "Economia de recursos e práticas sustentáveis", carga: "10h", imagem: "https://customer-assets.emergentagent.com/job_poolcurso/artifacts/vaus0cvy_Capitulo%2011.png" },
    { numero: 12, titulo: "Certificação Final", descricao: "Revisão geral e avaliação completa", carga: "10h", imagem: "https://customer-assets.emergentagent.com/job_poolcurso/artifacts/jzwlf6q9_Capitulo%2012.png" }
  ];

  const benefits = [
    { icon: Award, title: "Certificação ANAPP", description: "Reconhecida em todo o Brasil" },
    { icon: Clock, title: "160 Horas", description: "De conteúdo prático" },
    { icon: Video, title: "100% Online", description: "Estude no seu ritmo" },
    { icon: Users, title: "+5.000 Alunos", description: "Já certificados" }
  ];

  const testimonials = [
    {
      name: "Roberto Almeida",
      location: "São Paulo, SP",
      text: "O CTP mudou completamente minha carreira. Agora tenho minha própria empresa com mais de 30 clientes fixos.",
      image: "https://readdy.ai/api/search-image?query=professional%20male%20portrait%20smiling&width=100&height=100&seq=1"
    },
    {
      name: "Fernanda Costa",
      location: "Florianópolis, SC",
      text: "A metodologia é excelente! Mesmo sem experiência prévia, consegui aprender tudo de forma clara.",
      image: "https://readdy.ai/api/search-image?query=professional%20female%20portrait%20confident&width=100&height=100&seq=2"
    },
    {
      name: "Carlos Eduardo Santos",
      location: "Belo Horizonte, MG",
      text: "Certificar toda a minha equipe foi a melhor decisão. Aumentamos nossos preços em 30%.",
      image: "https://readdy.ai/api/search-image?query=professional%20male%20business%20owner&width=100&height=100&seq=3"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header user={null} />

      {/* Hero Section with Parallax */}
      <section className="relative min-h-[600px] flex items-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://readdy.ai/api/search-image?query=professional%20pool%20maintenance%20training%20certification%20modern&width=1920&height=1080&seq=1&orientation=landscape)',
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
              Programa de Certificação Profissional
            </div>
            <h1 className="text-5xl md:text-6xl font-light text-white mb-6 leading-tight">
              Conheça o <span className="font-medium">Curso CTP</span>
            </h1>
            <p className="text-xl text-blue-100 font-light mb-8 leading-relaxed">
              O Curso Técnico em Piscinas mais completo do Brasil. 12 módulos práticos, 160 horas de conteúdo e certificação ANAPP reconhecida nacionalmente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/login')}
                className="bg-[#FF6B00] text-white py-4 px-8 rounded-full font-medium hover:bg-[#e55d00] transition-all shadow-lg hover:shadow-xl"
              >
                Inscreva-se Agora
              </button>
              <button
                onClick={() => navigate('/cursos')}
                className="bg-white text-[#0072BC] py-4 px-8 rounded-full font-medium hover:bg-blue-50 transition-all shadow-lg"
              >
                Ver Outros Cursos
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - White */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#0072BC] to-[#005a9e] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-lg font-medium text-[#1f2937] mb-1">{benefit.title}</h3>
                  <p className="text-sm text-gray-600 font-light">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Program Overview - Gray Background */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-[#1f2937] mb-4">
              Programa Completo do <span className="text-[#0072BC] font-medium">CTP</span>
            </h2>
            <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
              12 módulos estruturados para transformar você em um profissional completo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modulos.map((modulo) => (
              <div 
                key={modulo.numero}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-[#0072BC] hover:shadow-xl transition-all"
              >
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={modulo.imagem}
                    alt={modulo.titulo}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/400x300/0072BC/FFFFFF?text=Módulo+${modulo.numero}`;
                    }}
                  />
                  <div className="absolute top-4 left-4 w-12 h-12 bg-[#FF6B00] rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{modulo.numero}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <div className="flex items-center text-white text-sm">
                      <Clock size={16} className="mr-1" />
                      {modulo.carga}
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-[#1f2937] mb-2 group-hover:text-[#0072BC] transition-colors">
                    {modulo.titulo}
                  </h3>
                  <p className="text-sm text-gray-600 font-light leading-relaxed">
                    {modulo.descricao}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why CTP Section - Blue with Parallax */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://readdy.ai/api/search-image?query=swimming%20pool%20clear%20water%20professional&width=1920&height=1080&seq=2&orientation=landscape)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="absolute inset-0 bg-[#0072BC]/95"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-light text-white mb-6">
                Por que escolher o <span className="font-medium">CTP ANAPP?</span>
              </h2>
              <div className="space-y-4">
                {[
                  "Certificação reconhecida nacionalmente pela ANAPP",
                  "Metodologia prática e focada no mercado",
                  "Professores com experiência de mais de 20 anos",
                  "Conteúdo atualizado com as últimas tecnologias",
                  "Suporte completo durante e após o curso",
                  "Acesso vitalício ao material didático"
                ].map((item, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle2 className="text-[#FF6B00] mr-3 flex-shrink-0 mt-1" size={24} />
                    <p className="text-lg text-blue-100 font-light">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <img 
                src="https://customer-assets.emergentagent.com/job_poolcurso/artifacts/wlsjloh6_logo%20ctp%20fdo%20transp.png"
                alt="CTP Logo"
                className="w-full max-w-sm mx-auto mb-6"
              />
              <div className="text-center">
                <p className="text-white font-light text-lg mb-6">
                  Junte-se aos mais de 5.000 profissionais certificados
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-[#FF6B00] text-white py-4 px-8 rounded-full font-medium hover:bg-[#e55d00] transition-all shadow-lg w-full"
                >
                  Comece Agora
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Light Blue Background */}
      <section className="bg-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-[#1f2937] mb-4">
              Histórias de <span className="text-[#0072BC] font-medium">Sucesso</span>
            </h2>
            <p className="text-lg text-gray-600 font-light">
              Veja como o CTP transformou a vida de nossos alunos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all border-l-4 border-[#0072BC]"
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

      {/* CTA Final - Gradient Blue */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0072BC] to-[#005a9e]"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Award className="text-[#FF6B00] mx-auto mb-6" size={64} />
          <h2 className="text-4xl font-light text-white mb-6">
            Pronto para se tornar um profissional certificado?
          </h2>
          <p className="text-lg text-blue-100 font-light mb-8 max-w-2xl mx-auto">
            Inscreva-se agora e comece sua jornada rumo à certificação CTP ANAPP. Vagas limitadas!
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

export default ConhecaCTP;
