import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Award, BookOpen, CheckCircle2, Clock, Users, Video, FileText, TrendingUp, Shield, MessageCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

function ConhecaCTP() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const modulos = [
    { numero: 1, titulo: "Introdução ao Tratamento de Piscinas", itens: ["Conceitos básicos de manutenção", "Fundamentos de limpeza", "Segurança dos usuários"], carga: "12 horas" },
    { numero: 2, titulo: "Segurança no Manuseio de Produtos", itens: ["Protocolos de segurança", "EPIs obrigatórios", "Armazenamento correto"], carga: "12 horas" },
    { numero: 3, titulo: "Tipos de Tratamentos", itens: ["Tratamento físico", "Tratamento químico", "Sistemas de filtração"], carga: "15 horas" },
    { numero: 4, titulo: "Controle e Análise da Água", itens: ["Parâmetros químicos", "Instrumentos de medição", "Ajustes e correções"], carga: "15 horas" },
    { numero: 5, titulo: "Tratamentos Alternativos", itens: ["Sistemas de ozônio", "Tratamento UV", "Tecnologias emergentes"], carga: "12 horas" },
    { numero: 6, titulo: "Manutenção e Resolução", itens: ["Manutenção preventiva", "Diagnóstico de problemas", "Soluções práticas"], carga: "14 horas" },
    { numero: 7, titulo: "Solução de Problemas", itens: ["Problemas comuns em piscinas", "Diagnóstico avançado", "Soluções específicas"], carga: "15 horas" },
    { numero: 8, titulo: "Relatórios e Documentação", itens: ["Elaboração de relatórios", "Registro de ocorrências", "Documentação técnica"], carga: "12 horas" },
    { numero: 9, titulo: "Atendimento ao Cliente", itens: ["Comunicação efetiva", "Gestão de expectativas", "Resolução de conflitos"], carga: "13 horas" },
    { numero: 10, titulo: "Gestão de Projetos", itens: ["Planejamento de serviços", "Cronograma de manutenção", "Gestão de recursos"], carga: "10 horas" },
    { numero: 11, titulo: "Sustentabilidade", itens: ["Economia de recursos", "Práticas sustentáveis", "Gestão ambiental"], carga: "10 horas" },
    { numero: 12, titulo: "Certificação Final", itens: ["Revisão geral", "Avaliação teórica", "Projeto prático"], carga: "10 horas" }
  ];

  const depoimentos = [
    {
      nome: "Roberto Almeida",
      cidade: "São Paulo, SP",
      texto: "O CTP mudou completamente minha carreira. Antes eu trabalhava como auxiliar de manutenção, e agora tenho minha própria empresa de tratamento de piscinas com mais de 30 clientes fixos. O investimento valeu cada centavo.",
      foto: "https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20Brazilian%20male%20in%20his%2040s%2C%20wearing%20blue%20work%20shirt%2C%20friendly%20smile%2C%20neutral%20background%2C%20professional%20portrait&width=100&height=100&seq=8&orientation=squarish"
    },
    {
      nome: "Fernanda Costa",
      cidade: "Florianópolis, SC",
      texto: "A metodologia do curso é excelente! Mesmo sem experiência prévia, consegui aprender tudo de forma clara e objetiva. Os vídeos práticos e o suporte dos instrutores fizeram toda a diferença no meu aprendizado.",
      foto: "https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20Brazilian%20female%20in%20her%2030s%2C%20wearing%20professional%20attire%2C%20friendly%20smile%2C%20neutral%20background%2C%20professional%20portrait&width=100&height=100&seq=9&orientation=squarish"
    },
    {
      nome: "Carlos Eduardo Santos",
      cidade: "Belo Horizonte, MG",
      texto: "Como proprietário de uma empresa de manutenção, certificar toda a minha equipe foi a melhor decisão que tomei. A qualidade do serviço melhorou significativamente e conseguimos aumentar nossos preços em 30%.",
      foto: "https://readdy.ai/api/search-image?query=Professional%20headshot%20of%20Brazilian%20male%20in%20his%2050s%2C%20wearing%20casual%20business%20attire%2C%20confident%20expression%2C%20neutral%20background%2C%20professional%20portrait&width=100&height=100&seq=10&orientation=squarish"
    }
  ];

  const faqs = [
    {
      pergunta: "Preciso ter conhecimento prévio sobre piscinas?",
      resposta: "Não é necessário conhecimento prévio. O curso começa do básico e avança gradualmente. Temos alunos que nunca trabalharam com piscinas antes e hoje são profissionais de sucesso no mercado."
    },
    {
      pergunta: "Quanto tempo tenho para concluir o curso?",
      resposta: "O tempo de acesso varia conforme o plano escolhido: 12 meses para o Plano Básico, 18 meses para o Plano Premium e acesso vitalício para o Plano Master. Esse prazo é mais que suficiente para concluir todos os módulos, mesmo estudando poucas horas por semana."
    },
    {
      pergunta: "O certificado é reconhecido pelo mercado?",
      resposta: "Sim! A ANAPP é a principal associação do setor de piscinas no Brasil. Nosso certificado é reconhecido pelas principais empresas, lojas de produtos e condomínios em todo o país, sendo um diferencial competitivo importante no mercado."
    },
    {
      pergunta: "Como funciona o curso? É totalmente online?",
      resposta: "O curso é predominantemente online, com aulas teóricas em vídeo, materiais complementares e exercícios práticos que podem ser realizados em casa. Dependendo da sua região, também oferecemos encontros presenciais opcionais para práticas supervisionadas, mas não são obrigatórios para a certificação."
    },
    {
      pergunta: "Posso parcelar o valor do curso?",
      resposta: "Sim, aceitamos cartão de crédito em até 12x. Também oferecemos opções de pagamento à vista com desconto via boleto bancário (5% de desconto) ou PIX (10% de desconto). Para empresas, temos condições especiais de pagamento."
    },
    {
      pergunta: "Recebo algum material físico?",
      resposta: "Nos planos Premium e Master, você recebe o certificado impresso via correio. Todo o material didático é digital, permitindo acesso de qualquer dispositivo e atualizações constantes. No Plano Master, você também recebe um kit de teste de água profissional para as atividades práticas."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={null} />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-[#0072BC] to-[#005a9e] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg font-semibold mb-4">Formação Profissional ANAPP</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Programa CTP: Curso Técnico em Piscinas</h1>
            <p className="text-xl max-w-3xl mx-auto mb-8">
              Torne-se um especialista certificado em tratamento e manutenção de piscinas com o curso mais reconhecido do mercado brasileiro.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#estrutura" className="bg-white text-[#0072BC] py-3 px-8 rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-lg">
                Conheça o Programa
              </a>
              <button
                onClick={() => navigate('/contato')}
                className="bg-[#FF6B00] text-white py-3 px-8 rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-lg"
              >
                Inscreva-se Agora
              </button>
            </div>
            <p className="mt-6 text-sm">Certificação Oficial ANAPP - Reconhecida em todo o Brasil</p>
          </div>
        </div>
      </section>

      {/* Sobre o Programa */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#FF6B00] font-semibold mb-2">SOBRE O PROGRAMA</p>
            <h2 className="text-3xl font-bold text-[#0072BC] mb-6">O que é o Curso Técnico em Piscinas?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-12">
            <div>
              <p className="text-lg text-gray-700 mb-4">
                O Programa CTP (Curso Técnico em Piscinas) é a formação mais completa e reconhecida do Brasil para profissionais que desejam atuar no mercado de tratamento, manutenção e instalação de piscinas.
              </p>
              <p className="text-lg text-gray-700">
                Desenvolvido pela ANAPP (Associação Nacional dos Fabricantes e Construtores de Piscinas e Produtos Afins), o curso combina conhecimentos teóricos e práticos essenciais para formar técnicos qualificados e certificados.
              </p>
            </div>
            <div>
              <img 
                src="https://static.readdy.ai/image/0649c8a07031c7fbee62019c841ca404/a4d26979d4f2baeaf6154ed789b0120b.jfif" 
                alt="Técnico CTP em ação" 
                className="w-full h-auto rounded-xl shadow-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icone: Sparkles, titulo: "Metodologia Prática", descricao: "Aprenda fazendo com exercícios reais" },
              { icone: Users, titulo: "Instrutores Especialistas", descricao: "Aprenda com os melhores do mercado" },
              { icone: Award, titulo: "Certificação Oficial", descricao: "Reconhecida em todo o Brasil" },
              { icone: MessageCircle, titulo: "Suporte Contínuo", descricao: "Tire dúvidas durante todo o curso" }
            ].map((item, index) => {
              const Icone = item.icone;
              return (
                <div key={index} className="bg-gray-50 p-6 rounded-xl text-center">
                  <Icone className="mx-auto mb-4 text-[#0072BC]" size={40} />
                  <h4 className="font-bold text-gray-900 mb-2">{item.titulo}</h4>
                  <p className="text-sm text-gray-600">{item.descricao}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Estrutura Curricular */}
      <section id="estrutura" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#FF6B00] font-semibold mb-2">ESTRUTURA CURRICULAR</p>
            <h2 className="text-3xl font-bold text-[#0072BC]">Programa Completo de Formação</h2>
            <p className="text-lg text-gray-600 mt-4">Um currículo abrangente dividido em 12 módulos principais para garantir uma formação completa e de qualidade</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {modulos.map((modulo, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
                <div className="flex items-start mb-4">
                  <div className="w-12 h-12 bg-[#0072BC] text-white rounded-lg flex items-center justify-center font-bold text-lg mr-4 shrink-0">
                    {modulo.numero}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{modulo.titulo}</h3>
                  </div>
                </div>
                <ul className="space-y-2 mb-4">
                  {modulo.itens.map((item, i) => (
                    <li key={i} className="flex items-start text-sm text-gray-600">
                      <CheckCircle2 className="text-[#0072BC] mr-2 shrink-0" size={16} />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="mr-2" size={16} />
                  {modulo.carga}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-md">
            <h3 className="text-2xl font-bold text-[#0072BC] mb-6 text-center">Carga Horária Total: 160 horas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-gray-900 mb-4">Distribuição das Atividades:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start text-gray-700">
                    <span className="text-[#0072BC] mr-2">•</span>
                    Aulas teóricas online: 90 horas
                  </li>
                  <li className="flex items-start text-gray-700">
                    <span className="text-[#0072BC] mr-2">•</span>
                    Exercícios práticos: 40 horas
                  </li>
                  <li className="flex items-start text-gray-700">
                    <span className="text-[#0072BC] mr-2">•</span>
                    Atividades supervisionadas: 20 horas
                  </li>
                  <li className="flex items-start text-gray-700">
                    <span className="text-[#0072BC] mr-2">•</span>
                    Avaliação final: 10 horas
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-4">Pré-requisitos:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start text-gray-700">
                    <CheckCircle2 className="text-[#0072BC] mr-2 shrink-0" size={18} />
                    Ensino médio completo
                  </li>
                  <li className="flex items-start text-gray-700">
                    <CheckCircle2 className="text-[#0072BC] mr-2 shrink-0" size={18} />
                    Conhecimentos básicos de matemática
                  </li>
                  <li className="flex items-start text-gray-700">
                    <CheckCircle2 className="text-[#0072BC] mr-2 shrink-0" size={18} />
                    Acesso a computador ou smartphone com internet
                  </li>
                  <li className="flex items-start text-gray-700">
                    <CheckCircle2 className="text-[#0072BC] mr-2 shrink-0" size={18} />
                    Disponibilidade para atividades práticas
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metodologia */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#FF6B00] font-semibold mb-2">METODOLOGIA</p>
            <h2 className="text-3xl font-bold text-[#0072BC]">Experiência de Aprendizagem</h2>
            <p className="text-lg text-gray-600 mt-4">Como garantimos a melhor experiência de aprendizagem para nossos alunos</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Metodologia de Ensino</h3>
              <div className="space-y-4">
                {[
                  { titulo: "Aulas teóricas interativas", desc: "Vídeos dinâmicos com animações e exemplos práticos para facilitar a compreensão." },
                  { titulo: "Conteúdos embasados nas normas ABNT", desc: "O melhor conteúdo disponível, atualizado e revisado por profissionais atuantes no mercado." },
                  { titulo: "Estudos de caso reais", desc: "Análise de situações do dia a dia para desenvolver habilidades de resolução de problemas." },
                  { titulo: "Simulações virtuais das melhores práticas", desc: "Priorizando as melhores práticas, um conteúdo revisado para treinar procedimentos técnicos com segurança." }
                ].map((item, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-bold text-gray-900 mb-2">{item.titulo}</h4>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Recursos Didáticos</h3>
              <div className="space-y-4">
                {[
                  { titulo: "Material digital atualizado", desc: "E-books, apostilas e infográficos com as informações mais recentes do setor." },
                  { titulo: "Vídeos demonstrativos", desc: "Tutoriais passo a passo para visualizar procedimentos técnicos na prática." },
                  { titulo: "Apostilas técnicas", desc: "Material de referência completo para consulta durante e após o curso." },
                  { titulo: "Exercícios práticos", desc: "Atividades para fixação do conteúdo e desenvolvimento de habilidades técnicas." }
                ].map((item, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-bold text-gray-900 mb-2">{item.titulo}</h4>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#0072BC] to-[#005a9e] rounded-2xl p-8 text-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">Plataforma de Ensino Exclusiva</h3>
                <p className="mb-6">Nossa plataforma de ensino foi desenvolvida especialmente para o Programa CTP, com recursos que facilitam o aprendizado e acompanhamento do seu progresso.</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start">
                    <CheckCircle2 className="mr-2 shrink-0" size={18} />
                    Acesso 24 horas por dia
                  </div>
                  <div className="flex items-start">
                    <CheckCircle2 className="mr-2 shrink-0" size={18} />
                    Compatível com todos dispositivos
                  </div>
                  <div className="flex items-start">
                    <CheckCircle2 className="mr-2 shrink-0" size={18} />
                    Fórum de discussão
                  </div>
                  <div className="flex items-start">
                    <CheckCircle2 className="mr-2 shrink-0" size={18} />
                    Suporte técnico
                  </div>
                  <div className="flex items-start">
                    <CheckCircle2 className="mr-2 shrink-0" size={18} />
                    Acompanhamento de progresso
                  </div>
                  <div className="flex items-start">
                    <CheckCircle2 className="mr-2 shrink-0" size={18} />
                    Certificado digital
                  </div>
                </div>
              </div>
              <div>
                <img 
                  src="https://readdy.ai/api/search-image?query=Modern%20e-learning%20platform%20interface%20on%20tablet%20showing%20swimming%20pool%20maintenance%20course%2C%20with%20video%20player%2C%20progress%20bar%2C%20and%20interactive%20elements%2C%20clean%20blue%20interface%2C%20professional%20design&width=400&height=400&seq=3&orientation=squarish" 
                  alt="Plataforma de Ensino CTP" 
                  className="w-full h-auto rounded-lg shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certificação */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#FF6B00] font-semibold mb-2">CERTIFICAÇÃO</p>
            <h2 className="text-3xl font-bold text-[#0072BC]">Processo de Certificação</h2>
            <p className="text-lg text-gray-600 mt-4 max-w-4xl mx-auto">
              A certificação CTP da ANAPP é reconhecida como padrão de excelência no mercado de piscinas em todo o Brasil. Ao concluir o curso, você receberá um certificado oficial que atesta sua competência técnica.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { numero: "1", titulo: "Conclusão dos Módulos", desc: "Finalize todos os módulos do curso com aproveitamento mínimo de 70% nas avaliações." },
              { numero: "2", titulo: "Avaliação Final", desc: "Realize a prova final teórica e prática para demonstrar seus conhecimentos adquiridos." },
              { numero: "3", titulo: "Emissão do Certificado", desc: "Receba seu certificado digital com validação online e código de autenticidade." },
              { numero: "4", titulo: "Registro no Cadastro Nacional", desc: "Seu nome será incluído no cadastro nacional de profissionais certificados pela ANAPP." }
            ].map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm text-center">
                <div className="w-16 h-16 bg-[#0072BC] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.numero}
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{item.titulo}</h4>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://static.readdy.ai/image/0649c8a07031c7fbee62019c841ca404/b12d352e47d49e2f7c7af37fc7f1d2b3.png" 
                alt="Certificado CTP" 
                className="w-full h-auto rounded-xl shadow-lg"
              />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefícios da Certificação ANAPP</h3>
              <div className="space-y-3">
                {[
                  "Reconhecimento profissional no mercado",
                  "Diferencial competitivo para clientes",
                  "Acesso a oportunidades exclusivas",
                  "Credibilidade e confiança no mercado",
                  "Atualização constante de conhecimentos",
                  "Participação na comunidade ANAPP"
                ].map((item, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle2 className="text-[#0072BC] mr-3 shrink-0" size={20} />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Investimento */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#FF6B00] font-semibold mb-2">INVESTIMENTO</p>
            <h2 className="text-3xl font-bold text-[#0072BC]">Seja um especialista em tratamento de água de piscina</h2>
          </div>

          <div className="max-w-2xl mx-auto bg-gradient-to-br from-[#0072BC] to-[#005a9e] rounded-2xl p-8 text-white text-center mb-12">
            <h3 className="text-2xl font-bold mb-4">Associe-se grátis* e ganhe 50% de desconto</h3>
            <div className="text-5xl font-bold text-[#FF6B00] mb-2">R$ 299,00</div>
            <p className="text-lg mb-6">Não associado: R$ 600,00</p>
            <p className="text-sm mb-8">(*) Promoção válida para categoria: Tratador de Piscinas.</p>
            <button
              onClick={() => navigate('/contato')}
              className="bg-[#FF6B00] text-white py-4 px-12 rounded-lg font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg"
            >
              Inscreva-se Agora
            </button>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Planos Corporativos</h3>
            <p className="text-center text-gray-700 mb-6 max-w-3xl mx-auto">
              Oferecemos condições especiais para empresas que desejam capacitar suas equipes. Entre em contato conosco para uma proposta personalizada.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h4 className="font-bold text-gray-900 mb-4">Vantagens para Empresas:</h4>
                <ul className="space-y-2">
                  {[
                    "Descontos progressivos de acordo com o número de colaboradores",
                    "Relatórios de acompanhamento de desempenho",
                    "Treinamentos personalizados para necessidades específicas",
                    "Possibilidade de aulas presenciais in company"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start text-gray-700">
                      <CheckCircle2 className="text-[#0072BC] mr-2 shrink-0" size={18} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white p-6 rounded-xl">
                <h4 className="font-bold text-gray-900 mb-4">Solicite uma proposta:</h4>
                <button
                  onClick={() => navigate('/contato')}
                  className="w-full bg-[#0072BC] text-white py-3 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition-all"
                >
                  Falar com Consultor
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#FF6B00] font-semibold mb-2">DEPOIMENTOS</p>
            <h2 className="text-3xl font-bold text-[#0072BC]">O que dizem nossos alunos</h2>
            <p className="text-lg text-gray-600 mt-4">Histórias reais de profissionais que transformaram suas carreiras com o CTP</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {depoimentos.map((depoimento, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm">
                <div className="flex items-center mb-6">
                  <img src={depoimento.foto} alt={depoimento.nome} className="w-16 h-16 rounded-full mr-4" />
                  <div>
                    <h4 className="font-bold text-gray-900">{depoimento.nome}</h4>
                    <p className="text-sm text-gray-600">{depoimento.cidade}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{depoimento.texto}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#FF6B00] font-semibold mb-2">DÚVIDAS FREQUENTES</p>
            <h2 className="text-3xl font-bold text-[#0072BC]">Perguntas Frequentes</h2>
            <p className="text-lg text-gray-600 mt-4">Tire suas dúvidas sobre o Programa CTP</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left p-6 focus:outline-none flex justify-between items-center hover:bg-gray-100 transition"
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

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Ainda tem dúvidas? Fale com nossa equipe</p>
            <a
              href="https://wa.me/5511990001750"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-[#0072BC] font-medium hover:underline"
            >
              <MessageCircle className="mr-2" size={20} />
              Conversar pelo WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-gradient-to-br from-[#0072BC] to-[#005a9e] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Pronto para transformar sua carreira?</h2>
              <p className="text-xl mb-8">
                Inscreva-se agora no Programa CTP e dê o primeiro passo para se tornar um profissional certificado e valorizado no mercado de piscinas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/contato')}
                  className="bg-[#FF6B00] text-white py-4 px-8 rounded-lg font-bold hover:bg-opacity-90 transition-all shadow-lg"
                >
                  Inscreva-se Agora
                </button>
                <a
                  href="https://wa.me/5511990001750"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-[#0072BC] py-4 px-8 rounded-lg font-bold hover:bg-opacity-90 transition-all shadow-lg text-center"
                >
                  Falar com Consultor
                </a>
              </div>
            </div>
            <div>
              <img 
                src="https://readdy.ai/api/search-image?query=Professional%20swimming%20pool%20technician%20smiling%20at%20camera%2C%20holding%20water%20testing%20kit%2C%20wearing%20blue%20uniform%20with%20logo%2C%20standing%20next%20to%20clean%20blue%20pool%2C%20sunny%20day%2C%20professional%20environment&width=400&height=600&seq=11&orientation=portrait" 
                alt="Técnico CTP Certificado" 
                className="w-full h-auto rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer user={null} />
    </div>
  );
}

export default ConhecaCTP;
