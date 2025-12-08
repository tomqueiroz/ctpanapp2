import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Check, TrendingUp, Users, Award, DollarSign, MessageCircle, Phone, Mail, MapPin, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

function CursosECertificacoes() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const API_URL = process.env.REACT_APP_BACKEND_URL;

  const getProxiedImageUrl = (originalUrl) => {
    return `${API_URL}/api/proxy-image?url=${encodeURIComponent(originalUrl)}`;
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const capitulos = [
    {
      numero: "I",
      titulo: "Cálculos",
      descricao: "O aluno será inserido aos cálculos essenciais para as atividades em um ambiente de piscina ou spa, volume, área, conversão e etc.",
      imagem: "https://customer-assets.emergentagent.com/job_poolcurso/artifacts/kjc951x6_Capitulo%201.png"
    },
    {
      numero: "II",
      titulo: "Contaminação",
      descricao: "Capítulo específico sobre os possíveis contaminantes em uma piscina ou spa, microbiologia, sintomas, desinfecção e etc.",
      imagem: "https://customer-assets.emergentagent.com/job_poolcurso/artifacts/st7v82pv_Capitulo%202.png"
    },
    {
      numero: "III",
      titulo: "Descontaminação",
      descricao: "Apresentamos os métodos para a desinfecção da piscina ou spa, tipos de produtos, funções, apresentações, equipamentos e suas funcionalidades.",
      imagem: "https://customer-assets.emergentagent.com/job_poolcurso/artifacts/blgghqom_Capitulo%203.png"
    },
    {
      numero: "IV",
      titulo: "Balanceamento",
      descricao: "Tão importante quando a escolha do método de tratamento é o balanceamento da água, pH, alcalinidade, níveis e problemas encontrados.",
      imagem: "https://customer-assets.emergentagent.com/job_poolcurso/artifacts/gp10g6y5_Capitulo%204.png"
    },
    {
      numero: "V",
      titulo: "Testes químicos",
      descricao: "Equipamentos utilizados para a realização de testes de níveis na água de piscina ou spa, métodos utilizados, manutenção de equipamentos e etc.",
      imagem: "https://customer-assets.emergentagent.com/job_poolcurso/artifacts/tb6dxgt5_Capitulo%205.png"
    },
    {
      numero: "VI",
      titulo: "Operação e Segurança",
      descricao: "Primordial para o profissional, apresentamos toda a operação da piscina como processo de filtração, drenagem, limpeza física, adição de produtos químicos e muito mais.",
      imagem: "https://customer-assets.emergentagent.com/job_poolcurso/artifacts/svos7h8v_Capitulo%206.png"
    },
    {
      numero: "VII",
      titulo: "Solução de problemas",
      descricao: "Principais problemas encontrados no ambiente da piscina ou spa, problemas na água, equipamentos e suas soluções.",
      imagem: "https://customer-assets.emergentagent.com/job_poolcurso/artifacts/8x5drcve_Capitulo%207.png"
    },
    {
      numero: "VIII",
      titulo: "Relatórios",
      descricao: "Procedimento para criação de relatórios de visitas para os tratadores, ocorrências, manutenção e etc. Este procedimento assegura ao profissional a credibilidade de suas atividades.",
      imagem: "https://customer-assets.emergentagent.com/job_poolcurso/artifacts/cf7z8z1q_Capitulo%208.png"
    },
    {
      numero: "IX",
      titulo: "Manutenção preventiva",
      descricao: "Imprescindível para a piscina ou spa, garantindo a longa duração dos equipamentos utilizados, bem como, evitar acidentes como choques elétricos entre outros.",
      imagem: "https://customer-assets.emergentagent.com/job_poolcurso/artifacts/ncywo7ov_Capitulo%209.png"
    },
    {
      numero: "X",
      titulo: "ABNT NBR 10339:2018",
      descricao: "Conteúdo especial sobre as atenções do profissional conforme orientação fornecida pela norma, conceitos de piscina, temperaturas, equipamentos, segurança e muito mais.",
      imagem: "https://customer-assets.emergentagent.com/job_poolcurso/artifacts/bmg950w8_Capitulo%2010.png"
    },
    {
      numero: "XI",
      titulo: "Circulação de água",
      descricao: "Para garantir uma boa qualidade da água, item fundamental são as rotinas de circulação e filtragem constantes a água da piscina ou spa. O dimensionamento, funcionalidades e segurança são apresentados neste capítulo.",
      imagem: "https://customer-assets.emergentagent.com/job_poolcurso/artifacts/vaus0cvy_Capitulo%2011.png"
    },
    {
      numero: "XII",
      titulo: "Aquecimento",
      descricao: "Neste capítulo você conhecerá os processos e equipamentos utilizados para aquecer uma piscina ou spa.",
      imagem: "https://customer-assets.emergentagent.com/job_poolcurso/artifacts/jzwlf6q9_Capitulo%2012.png"
    }
  ];

  const depoimentos = [
    {
      nome: "Roberto Almeida",
      cargo: "Técnico em Piscinas - São Paulo",
      texto: "O Programa CTP mudou completamente minha carreira. Hoje atendo clientes de alto padrão e tenho reconhecimento no mercado graças à certificação da ANAPP.",
      foto: "https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20Brazilian%20male%20pool%20technician%20in%20his%2040s%2C%20wearing%20blue%20uniform%20shirt%2C%20confident%20expression%2C%20neutral%20background%2C%20professional%20portrait%2C%20high-quality%20photography&width=100&height=100&seq=3&orientation=squarish"
    },
    {
      nome: "Patrícia Costa",
      cargo: "Empresária - Rio de Janeiro",
      texto: "Após concluir o curso, consegui expandir minha empresa de manutenção de piscinas. O conhecimento técnico adquirido foi fundamental para oferecer serviços de maior qualidade.",
      foto: "https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20Brazilian%20female%20pool%20business%20owner%20in%20her%2030s%2C%20wearing%20business%20casual%20attire%2C%20confident%20expression%2C%20neutral%20background%2C%20professional%20portrait%2C%20high-quality%20photography&width=100&height=100&seq=4&orientation=squarish"
    },
    {
      nome: "Marcos Oliveira",
      cargo: "Especialista em Manutenção - Belo Horizonte",
      texto: "A certificação da ANAPP abriu portas para trabalhar com condomínios de luxo e resorts. O investimento no curso se pagou em menos de três meses com novos contratos.",
      foto: "https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20Brazilian%20male%20pool%20maintenance%20specialist%20in%20his%2030s%2C%20wearing%20polo%20shirt%2C%20friendly%20expression%2C%20neutral%20background%2C%20professional%20portrait%2C%20high-quality%20photography&width=100&height=100&seq=5&orientation=squarish"
    }
  ];

  const faqs = [
    {
      pergunta: "Qual a carga horária do Programa CTP?",
      resposta: "O Programa CTP possui carga horária total de 60 horas, distribuídas em aulas teóricas e práticas, além de atividades complementares que podem ser realizadas no seu próprio ritmo."
    },
    {
      pergunta: "Preciso ter conhecimento prévio para fazer o curso?",
      resposta: "Não é necessário conhecimento prévio. O curso foi desenvolvido para atender desde iniciantes até profissionais que já atuam no mercado e desejam aprimorar seus conhecimentos técnicos."
    },
    {
      pergunta: "Como funciona o curso na modalidade online?",
      resposta: "O curso online é realizado através de uma plataforma digital com aulas ao vivo nos horários programados. Você receberá acesso ao material didático digital e poderá interagir com o instrutor e outros alunos durante as aulas."
    },
    {
      pergunta: "Como obtenho a certificação após concluir o curso?",
      resposta: "Para obter a certificação, é necessário ter frequência mínima de 75% nas aulas e aprovação na avaliação final com nota mínima 7,0. Após aprovado, você receberá o certificado digital e poderá solicitar a versão impressa."
    },
    {
      pergunta: "Posso parcelar o valor do curso?",
      resposta: "Sim, oferecemos parcelamento em até 3x sem juros no cartão de crédito. Para associados ANAPP, há condições especiais de pagamento, incluindo desconto de 50% no valor total."
    },
    {
      pergunta: "A certificação tem validade ou precisa ser renovada?",
      resposta: "A certificação do Programa CTP tem validade de 2 anos. Após esse período, recomendamos a realização de um curso de atualização para renovação, garantindo que o profissional esteja sempre atualizado com as novidades do setor."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={null} />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-[#0072BC] to-[#005a9e] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Transforme Sua Vida Profissional</h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">Inicie Uma Nova Carreira de Sucesso</h2>
            <p className="text-xl mb-8 max-w-4xl mx-auto">
              Seja você um iniciante buscando uma nova oportunidade ou um profissional querendo se destacar, nossa certificação CTP é o primeiro passo para uma carreira sólida e promissora no setor de piscinas.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-3xl mx-auto">
              <div className="flex items-center justify-center">
                <Check className="mr-2" size={20} />
                <span>Mercado em crescimento</span>
              </div>
              <div className="flex items-center justify-center">
                <Check className="mr-2" size={20} />
                <span>Renda atrativa</span>
              </div>
              <div className="flex items-center justify-center">
                <Check className="mr-2" size={20} />
                <span>Flexibilidade</span>
              </div>
              <div className="flex items-center justify-center">
                <Check className="mr-2" size={20} />
                <span>Reconhecimento</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  navigate('/conheca-ctp');
                  setTimeout(() => window.scrollTo(0, 0), 100);
                }}
                className="bg-white text-[#0072BC] py-3 px-8 rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-lg"
              >
                Conheça o Programa
              </button>
              <button
                onClick={() => {
                  document.getElementById('inscricao')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-[#FF6B00] text-white py-3 px-8 rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-lg"
              >
                Comece Agora
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#0072BC] mb-6 text-center">
            Quer transformar sua vida e conquistar uma carreira de sucesso no setor de piscinas?
          </h2>
          <div className="max-w-4xl mx-auto space-y-4 text-lg text-gray-700">
            <p>
              O Curso de Tratamento de Piscinas da ANAPP é a sua chance de se tornar um profissional certificado, reconhecido em todo o Brasil. Com uma formação completa, atualizada e 100% online, você vai aprender tudo sobre tratamento, segurança e manutenção de piscinas, seguindo as normas técnicas mais importantes do mercado.
            </p>
            <p className="font-semibold text-[#0072BC]">
              Profissionais certificados pela ANAPP ganham mais credibilidade, conquistam clientes de alto padrão e têm acesso a oportunidades exclusivas no mercado.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button
              onClick={() => {
                navigate('/conheca-ctp');
                setTimeout(() => window.scrollTo(0, 0), 100);
              }}
              className="bg-[#0072BC] text-white py-3 px-8 rounded-lg font-semibold hover:bg-opacity-90 transition-all"
            >
              Conheça o Programa
            </button>
            <button
              onClick={() => {
                document.getElementById('inscricao')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-[#FF6B00] text-white py-3 px-8 rounded-lg font-semibold hover:bg-opacity-90 transition-all"
            >
              Comece Agora
            </button>
          </div>
        </div>
      </section>

      {/* Transformation Timeline */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#FF6B00] font-semibold mb-2">SUA NOVA VIDA COMEÇA AQUI</p>
            <h2 className="text-3xl font-bold text-[#0072BC] mb-4">Transforme Sua Carreira em 8 Semanas</h2>
            <p className="text-lg text-gray-600">Milhares de profissionais já mudaram de vida com nossa certificação. Agora é a sua vez de conquistar independência financeira e reconhecimento profissional.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Antes */}
            <div className="bg-white rounded-xl p-8 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Antes da Certificação</h3>
              <ul className="space-y-3">
                <li className="flex items-start text-gray-600">
                  <span className="text-red-500 mr-2">•</span>
                  Trabalhos instáveis ou mal remunerados
                </li>
                <li className="flex items-start text-gray-600">
                  <span className="text-red-500 mr-2">•</span>
                  Falta de reconhecimento profissional
                </li>
                <li className="flex items-start text-gray-600">
                  <span className="text-red-500 mr-2">•</span>
                  Dificuldade para conseguir clientes
                </li>
                <li className="flex items-start text-gray-600">
                  <span className="text-red-500 mr-2">•</span>
                  Insegurança técnica
                </li>
                <li className="flex items-start text-gray-600">
                  <span className="text-red-500 mr-2">•</span>
                  Dependência de terceiros
                </li>
              </ul>
            </div>

            {/* Durante */}
            <div className="bg-[#0072BC] text-white rounded-xl p-8 shadow-md transform scale-105">
              <h3 className="text-xl font-bold mb-6">Durante o Programa CTP</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="mr-2 shrink-0" size={20} />
                  8 semanas de capacitação intensiva
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 shrink-0" size={20} />
                  Conhecimento técnico completo
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 shrink-0" size={20} />
                  Certificação reconhecida nacionalmente
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 shrink-0" size={20} />
                  Suporte especializado
                </li>
                <li className="flex items-start">
                  <Check className="mr-2 shrink-0" size={20} />
                  Networking com profissionais
                </li>
              </ul>
            </div>

            {/* Depois */}
            <div className="bg-white rounded-xl p-8 shadow-md">
              <h3 className="text-xl font-bold text-[#FF6B00] mb-6">Após a Certificação</h3>
              <ul className="space-y-3">
                <li className="flex items-start text-gray-700">
                  <Check className="text-green-500 mr-2 shrink-0" size={20} />
                  Renda média 300% maior
                </li>
                <li className="flex items-start text-gray-700">
                  <Check className="text-green-500 mr-2 shrink-0" size={20} />
                  Credibilidade no mercado
                </li>
                <li className="flex items-start text-gray-700">
                  <Check className="text-green-500 mr-2 shrink-0" size={20} />
                  Clientes de alto padrão
                </li>
                <li className="flex items-start text-gray-700">
                  <Check className="text-green-500 mr-2 shrink-0" size={20} />
                  Autonomia profissional
                </li>
                <li className="flex items-start text-gray-700">
                  <Check className="text-green-500 mr-2 shrink-0" size={20} />
                  Crescimento constante
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-center text-[#0072BC] mb-12">Histórias Reais de Transformação</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-[#FF6B00] mb-2">+300%</div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Aumento de Renda</h4>
              <p className="text-gray-600">Profissionais certificados ganham em média 300% mais</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-[#FF6B00] mb-2">95%</div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Taxa de Empregabilidade</h4>
              <p className="text-gray-600">95% conseguem trabalho em até 3 meses</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-[#FF6B00] mb-2">5.000+</div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Rede de Profissionais</h4>
              <p className="text-gray-600">Faça parte da maior comunidade do setor</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-[#FF6B00] mb-2">R$ 299</div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Investimento Acessível</h4>
              <p className="text-gray-600">Para associados ANAPP com desconto de 50%</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#FF6B00] font-semibold mb-2">VANTAGENS EXCLUSIVAS</p>
            <h2 className="text-3xl font-bold text-[#0072BC]">Por que escolher a certificação ANAPP?</h2>
            <p className="text-lg text-gray-600 mt-4">Conheça todos os benefícios que farão a diferença na sua nova carreira</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Award className="text-[#0072BC]" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Reconhecimento Nacional</h3>
              <p className="text-gray-600">O certificado é válido em todo o Brasil, conferindo credibilidade e reconhecimento profissional em qualquer região do país.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Check className="text-[#0072BC]" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Capacitação Técnica Completa</h3>
              <p className="text-gray-600">O curso aborda desde conceitos básicos até normas técnicas da ABNT (NBR 10339:2018), garantindo formação completa e atualizada.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="text-[#0072BC]" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Credibilidade Profissional</h3>
              <p className="text-gray-600">Obtenha reconhecimento oficial da principal associação do setor, aumentando sua credibilidade junto a clientes e empregadores.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="text-[#0072BC]" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Oportunidades de Mercado</h3>
              <p className="text-gray-600">Amplie suas oportunidades de trabalho e negócios, acessando um mercado que valoriza cada vez mais profissionais certificados.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-[#0072BC]" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Suporte e Comunidade</h3>
              <p className="text-gray-600">A ANAPP oferece suporte completo durante todo o curso e você fará parte de uma rede exclusiva de mais de 5.000 profissionais qualificados.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="text-[#FF6B00]" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Investimento Acessível</h3>
              <p className="text-gray-600">Descontos especiais para associados ANAPP (50% off) e possibilidade de associar-se gratuitamente no ato da inscrição.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#FF6B00] font-semibold mb-2">CONTEÚDO PROGRAMÁTICO</p>
            <h2 className="text-3xl font-bold text-[#0072BC]">Capítulos do Programa CTP</h2>
            <p className="text-lg text-gray-600 mt-4">Conheça o conteúdo completo do nosso curso técnico</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capitulos.map((capitulo, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all group">
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={getProxiedImageUrl(capitulo.imagem)}
                    alt={capitulo.titulo}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/400x300/0072BC/FFFFFF?text=Capítulo+${capitulo.numero}`;
                    }}
                  />
                  <div className="absolute top-4 left-4 w-12 h-12 bg-[#0072BC] text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-lg">
                    {capitulo.numero}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{capitulo.titulo}</h3>
                  <p className="text-gray-600 text-sm">{capitulo.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#FF6B00] font-semibold mb-2">EXPERIÊNCIAS</p>
            <h2 className="text-3xl font-bold text-[#0072BC]">Depoimentos de Profissionais Certificados</h2>
            <p className="text-lg text-gray-600 mt-4">Veja o que dizem os profissionais que já concluíram nossos cursos</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {depoimentos.map((depoimento, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm">
                <div className="flex items-center mb-6">
                  <img src={depoimento.foto} alt={depoimento.nome} className="w-16 h-16 rounded-full mr-4" />
                  <div>
                    <h4 className="font-bold text-gray-900">{depoimento.nome}</h4>
                    <p className="text-sm text-gray-600">{depoimento.cargo}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{depoimento.texto}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#FF6B00] font-semibold mb-2">MATRÍCULA</p>
            <h2 className="text-3xl font-bold text-[#0072BC]">Inscreva-se no Programa CTP</h2>
            <p className="text-lg text-gray-600 mt-4">Seja um especialista em tratamento de água de piscina com a certificação mais reconhecida do mercado.</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-[#0072BC] to-[#005a9e] rounded-2xl p-8 md:p-12 text-white text-center">
              <h3 className="text-2xl font-bold mb-4">Investimento</h3>
              <p className="text-xl mb-6">Oferta Especial!</p>
              <p className="text-lg mb-8">Associe-se gratuitamente à ANAPP e ganhe 50% de desconto no curso. Uma economia de R$ 301,00!</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                  <h4 className="text-lg font-semibold mb-2">Associado ANAPP</h4>
                  <div className="text-4xl font-bold text-[#FF6B00] mb-2">R$ 299,00</div>
                  <p className="text-sm">50% de desconto</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                  <h4 className="text-lg font-semibold mb-2">Não Associado</h4>
                  <div className="text-4xl font-bold mb-2">R$ 600,00</div>
                  <p className="text-sm">Valor integral</p>
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur rounded-xl p-6 mb-8">
                <h4 className="text-lg font-bold mb-4">Benefícios da Associação Gratuita:</h4>
                <ul className="space-y-2 text-left">
                  <li className="flex items-start">
                    <Check className="mr-2 shrink-0" size={20} />
                    Associação gratuita por 1 ano
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 shrink-0" size={20} />
                    Desconto de 50% no curso
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 shrink-0" size={20} />
                    Acesso à rede de profissionais
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 shrink-0" size={20} />
                    Benefícios exclusivos
                  </li>
                </ul>
              </div>

              <button
                onClick={() => navigate('/contato')}
                className="bg-[#FF6B00] text-white py-4 px-12 rounded-lg font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg"
              >
                Inscrever-se Agora
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#FF6B00] font-semibold mb-2">DÚVIDAS</p>
            <h2 className="text-3xl font-bold text-[#0072BC]">Perguntas Frequentes</h2>
            <p className="text-lg text-gray-600 mt-4">Encontre respostas para as dúvidas mais comuns sobre nossos cursos</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left p-6 focus:outline-none flex justify-between items-center hover:bg-gray-50 transition"
                >
                  <h3 className="text-lg font-semibold text-[#0072BC] pr-8">{faq.pergunta}</h3>
                  {openFaq === index ? <ChevronUp className="text-[#0072BC] shrink-0" /> : <ChevronDown className="text-[#0072BC] shrink-0" />}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600">{faq.resposta}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#FF6B00] font-semibold mb-2">FALE CONOSCO</p>
            <h2 className="text-3xl font-bold text-[#0072BC]">Dúvidas sobre os Cursos?</h2>
            <p className="text-lg text-gray-600 mt-4">Entre em contato com nossa equipe para mais informações</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Informações de Contato</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <MapPin className="text-[#0072BC] mr-4 shrink-0" size={24} />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Endereço</h4>
                    <p className="text-gray-600">Av. Queiroz Filho, 1700 Sala 807 D – Villa Lobos Office Park</p>
                    <p className="text-gray-600">Vila Leopoldina – 05319-000 São Paulo – SP</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="text-[#0072BC] mr-4 shrink-0" size={24} />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Telefone</h4>
                    <p className="text-gray-600">(11) 5687-7888</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="text-[#0072BC] mr-4 shrink-0" size={24} />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">E-mail</h4>
                    <p className="text-gray-600">cursos@anapp.org.br</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MessageCircle className="text-[#0072BC] mr-4 shrink-0" size={24} />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">WhatsApp</h4>
                    <p className="text-gray-600">(11) 99000-1750</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-900 mb-2">Horário de Atendimento</h4>
                  <p className="text-gray-600">Segunda a Sexta: 9h às 18h</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Envie sua Mensagem</h3>
              <button
                onClick={() => navigate('/contato')}
                className="w-full bg-[#0072BC] text-white py-3 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition-all"
              >
                Ir para Formulário de Contato
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Formulário de Inscrição */}
      <section id="inscricao" className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block bg-[#FF6B00] text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              INSCREVA-SE
            </div>
            <h2 className="text-4xl font-light text-[#1f2937] mb-4">
              Garanta Sua Vaga no <span className="text-[#0072BC] font-medium">CTP ANAPP</span>
            </h2>
            <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
              Preencha o formulário abaixo e inicie sua jornada de certificação profissional
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    placeholder="Digite seu nome completo"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0072BC] focus:outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0072BC] focus:outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone (DDD + Número) *
                  </label>
                  <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0072BC] focus:outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CPF
                  </label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0072BC] focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Empresa (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Sua empresa"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0072BC] focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-[#0072BC]">
                <h3 className="text-lg font-medium text-[#0072BC] mb-3">Investimento do Curso</h3>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-4xl font-light text-[#0072BC]">R$ 1.497,00</span>
                  <span className="text-gray-600 font-light mb-2">à vista</span>
                </div>
                <p className="text-sm text-gray-600 font-light mb-4">
                  Ou parcelado em até 12x no cartão de crédito
                </p>
                <ul className="space-y-2">
                  {[
                    "Certificado reconhecido pela ANAPP",
                    "160 horas de conteúdo prático",
                    "Acesso vitalício à plataforma",
                    "Suporte completo durante o curso"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-700">
                      <CheckCircle2 className="text-green-500 mr-2 flex-shrink-0" size={16} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#0072BC] text-white py-4 px-8 rounded-full font-medium hover:bg-[#005a9e] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Formulário enviado! Você será redirecionado para o pagamento.');
                  }}
                >
                  <CheckCircle2 size={20} />
                  Confirmar Inscrição
                </button>
                <a
                  href="https://www.cursoanapp.org.br/inscricao"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-[#FF6B00] text-white py-4 px-8 rounded-full font-medium hover:bg-[#e55d00] transition-all shadow-lg hover:shadow-xl text-center flex items-center justify-center gap-2"
                >
                  <DollarSign size={20} />
                  Ir para Pagamento
                </a>
              </div>

              <p className="text-xs text-gray-500 text-center font-light">
                Ao confirmar, você será redirecionado para a página de pagamento seguro. Seus dados estão protegidos.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Final CTA - Black */}
      <section className="py-20 bg-gradient-to-br from-[#0072BC] to-[#005a9e] text-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Não Deixe Essa Oportunidade Passar!</h2>
          <p className="text-xl mb-8">Sua nova vida profissional está a apenas um clique de distância</p>
          <p className="text-lg mb-8">Junte-se aos milhares de profissionais que já transformaram suas carreiras com a certificação ANAPP</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 max-w-3xl mx-auto">
            <div>
              <div className="text-4xl font-bold text-[#FF6B00] mb-2">8 Semanas</div>
              <p>Para mudar sua vida</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#FF6B00] mb-2">R$ 299</div>
              <p>Investimento que se paga</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#FF6B00] mb-2">+5.000</div>
              <p>Profissionais formados</p>
            </div>
          </div>

          <button
            onClick={() => {
              document.getElementById('inscricao')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-[#FF6B00] text-white py-4 px-12 rounded-lg font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg"
          >
            Comece Sua Transformação Agora
          </button>
          <p className="mt-6 text-sm">Comece agora mesmo • Curso 100% online</p>
        </div>
      </section>

      <Footer user={null} />
    </div>
  );
}

export default CursosECertificacoes;