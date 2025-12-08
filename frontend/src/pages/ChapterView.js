import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoggedInHeader from '../components/LoggedInHeader';
import Footer from '../components/Footer';
import { FileText, Video, Headphones, PenTool, BookOpen, Award, ChevronRight, Menu, X, TrendingUp, Target, Rocket, CheckCircle, PlayCircle, Lock, Download, ExternalLink } from 'lucide-react';

function ChapterView({ user = { name: 'Aluno' } }) {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentChapter = chapterId ? parseInt(chapterId) : 1;
  const API_URL = process.env.REACT_APP_BACKEND_URL;

  const getProxiedImageUrl = (originalUrl) => {
    return `${API_URL}/api/proxy-image?url=${encodeURIComponent(originalUrl)}`;
  };

  const chapters = [
    { id: 1, titulo: 'Introdução ao Tratamento de Piscinas', status: 'completed', progresso: 100, imagem: 'https://customer-assets.emergentagent.com/job_poolcurso/artifacts/kjc951x6_Capitulo%201.png' },
    { id: 2, titulo: 'Segurança no Manuseio de Produtos', status: 'completed', progresso: 100, imagem: 'https://customer-assets.emergentagent.com/job_poolcurso/artifacts/st7v82pv_Capitulo%202.png' },
    { id: 3, titulo: 'Tipos de Tratamentos', status: 'completed', progresso: 100, imagem: 'https://customer-assets.emergentagent.com/job_poolcurso/artifacts/blgghqom_Capitulo%203.png' },
    { id: 4, titulo: 'Controle e Análise da Água', status: 'in-progress', progresso: 65, imagem: 'https://customer-assets.emergentagent.com/job_poolcurso/artifacts/gp10g6y5_Capitulo%204.png' },
    { id: 5, titulo: 'Tratamentos Alternativos', status: 'locked', progresso: 0, imagem: 'https://customer-assets.emergentagent.com/job_poolcurso/artifacts/tb6dxgt5_Capitulo%205.png' },
    { id: 6, titulo: 'Manutenção e Resolução', status: 'locked', progresso: 0, imagem: 'https://customer-assets.emergentagent.com/job_poolcurso/artifacts/svos7h8v_Capitulo%206.png' },
    { id: 7, titulo: 'Solução de Problemas', status: 'locked', progresso: 0, imagem: 'https://customer-assets.emergentagent.com/job_poolcurso/artifacts/8x5drcve_Capitulo%207.png' },
    { id: 8, titulo: 'Relatórios e Documentação', status: 'locked', progresso: 0, imagem: 'https://customer-assets.emergentagent.com/job_poolcurso/artifacts/cf7z8z1q_Capitulo%208.png' },
    { id: 9, titulo: 'Atendimento ao Cliente', status: 'locked', progresso: 0, imagem: 'https://customer-assets.emergentagent.com/job_poolcurso/artifacts/ncywo7ov_Capitulo%209.png' },
    { id: 10, titulo: 'Gestão de Projetos', status: 'locked', progresso: 0, imagem: 'https://customer-assets.emergentagent.com/job_poolcurso/artifacts/bmg950w8_Capitulo%2010.png' },
    { id: 11, titulo: 'Sustentabilidade', status: 'locked', progresso: 0, imagem: 'https://customer-assets.emergentagent.com/job_poolcurso/artifacts/vaus0cvy_Capitulo%2011.png' },
    { id: 12, titulo: 'Certificação Final', status: 'locked', progresso: 0, imagem: 'https://customer-assets.emergentagent.com/job_poolcurso/artifacts/jzwlf6q9_Capitulo%2012.png' }
  ];

  const chapterData = {
    numero: 1,
    titulo: 'Cálculos',
    subtitulo: 'Fundamentos essenciais para o profissional de sucesso',
    descricao: 'O aluno será inserido aos cálculos essenciais para as atividades em um ambiente de piscina ou spa, volume, área, conversão e etc.',
    duracao: '4 horas',
    recursosDisponiveis: 6,
    modulos: [
      { titulo: 'Química da Água', duracao: '45 min' },
      { titulo: 'Pesos e Medidas', duracao: '30 min' },
      { titulo: 'Sistema Internacional (SI)', duracao: '40 min' },
      { titulo: 'pH e Alcalinidade', duracao: '50 min' }
    ]
  };

  const recursos = [
    {
      tipo: 'apostila',
      titulo: 'Apostila Completa do Módulo',
      descricao: 'Material teórico completo com exercícios',
      tamanho: '6MB',
      icone: FileText,
      cor: 'from-red-500 to-red-600',
      url: 'https://heyzine.com/flip-book/6b5e7efd0f.html'
    },
    {
      tipo: 'video',
      titulo: 'Videoaula Introdutória',
      descricao: 'Apresentação visual dos conceitos principais',
      duracao: '2 minutos',
      icone: Video,
      cor: 'from-[#0072BC] to-[#005a9e]',
      url: 'https://youtu.be/PuLMcD3h2h0'
    },
    {
      tipo: 'podcast',
      titulo: 'Podcast do Capítulo',
      descricao: 'Ouça enquanto realiza outras atividades',
      duracao: '12 minutos',
      icone: Headphones,
      cor: 'from-green-500 to-green-600',
      url: 'https://creators.spotify.com/pod/show/wellington-queiroz91/episodes/Captulo-1-A-Importncia-das-Medidas-e-o-Sistema-Universal-e356ehd'
    },
    {
      tipo: 'exercicios',
      titulo: 'Exercícios Interativos',
      descricao: 'Pratique e fixe o conteúdo aprendido',
      questoes: '15 questões',
      icone: PenTool,
      cor: 'from-purple-500 to-purple-600',
      url: 'https://create.kahoot.it/share/ctp-cap-1-exercicio-1/d3c28c39-0fed-46a7-9fa0-ea8978d13406'
    }
  ];

  const materiaisAdicionais = [
    { titulo: 'Tabela de Conversão de Medidas', tipo: 'PDF', icone: Download },
    { titulo: 'Calculadora de pH Online', tipo: 'Link', icone: ExternalLink },
    { titulo: 'Guia Rápido de Referência', tipo: 'PDF', icone: Download }
  ];

  const proximoModulo = {
    numero: 2,
    titulo: 'Segurança no Manuseio de Produtos',
    descricao: 'Aprenda os protocolos essenciais de segurança, uso correto de EPIs e armazenamento adequado de produtos químicos.',
    topicos: ['Protocolos de Segurança', 'EPIs Obrigatórios', 'Armazenamento Correto']
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <LoggedInHeader user={user} />

      <div className="flex flex-1 pt-16">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-80 bg-white border-r border-gray-200 fixed left-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-sm font-light text-gray-500 mb-1">Programa CTP</h2>
              <h3 className="text-lg font-semibold text-gray-900">12 Módulos</h3>
            </div>

            <div className="space-y-3">
              {chapters.map((chapter) => {
                const isActive = chapter.id === currentChapter;
                const isLocked = chapter.status === 'locked';
                const Icon = chapter.status === 'completed' ? CheckCircle : chapter.status === 'in-progress' ? PlayCircle : Lock;
                
                return (
                  <button
                    key={chapter.id}
                    onClick={() => !isLocked && navigate(`/dashboard/chapter/${chapter.id}`)}
                    disabled={isLocked}
                    className={`w-full text-left rounded-xl p-3 transition-all ${
                      isActive
                        ? 'bg-[#0072BC] text-white shadow-lg'
                        : isLocked
                        ? 'bg-gray-50 opacity-60 cursor-not-allowed'
                        : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-[#0072BC]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 ${
                        isActive ? 'ring-2 ring-white' : ''
                      }`}>
                        <img
                          src={getProxiedImageUrl(chapter.imagem)}
                          alt={chapter.titulo}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = `https://via.placeholder.com/100x80/${isActive ? 'FFFFFF' : '0072BC'}/333333?text=M${chapter.id}`;
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-light ${
                            isActive ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            Módulo {chapter.id}
                          </span>
                          <Icon size={14} className={isActive ? 'text-white' : chapter.status === 'completed' ? 'text-green-500' : chapter.status === 'in-progress' ? 'text-[#FF6B00]' : 'text-gray-400'} />
                        </div>
                        <h4 className={`text-sm font-medium leading-tight line-clamp-2 ${
                          isActive ? 'text-white' : isLocked ? 'text-gray-400' : 'text-gray-900'
                        }`}>
                          {chapter.titulo}
                        </h4>
                        {chapter.progresso > 0 && !isActive && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div
                                className="bg-[#0072BC] h-1 rounded-full"
                                style={{ width: `${chapter.progresso}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Sidebar - Mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-80 bg-white overflow-y-auto">
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-600 hover:text-gray-900 z-10"
              >
                <X size={24} />
              </button>
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-sm font-light text-gray-500 mb-1">Programa CTP</h2>
                  <h3 className="text-lg font-semibold text-gray-900">12 Módulos</h3>
                </div>
                {/* Same content as desktop sidebar */}
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-80">
          {/* Hero Section - Acompanhe Sua Evolução */}
          <section className="bg-gradient-to-br from-[#0072BC] to-[#005a9e] text-white">
            <div className="max-w-6xl mx-auto px-6 py-12">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden mb-6 p-2 bg-white/10 rounded-lg hover:bg-white/20 inline-flex items-center gap-2"
              >
                <Menu size={20} />
                <span className="text-sm font-light">Ver Todos os Módulos</span>
              </button>

              <div className="mb-8">
                <p className="text-sm font-light text-blue-100 mb-2">Módulo 1 de 12</p>
                <h1 className="text-3xl md:text-4xl font-light mb-3">{chapterData.titulo}</h1>
                <p className="text-lg font-light text-blue-100">{chapterData.subtitulo}</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="text-blue-100" size={32} />
                    <span className="text-4xl font-light">25%</span>
                  </div>
                  <p className="text-sm font-light text-blue-100">Progresso Geral</p>
                  <div className="mt-3 bg-white/20 rounded-full h-1.5">
                    <div className="bg-white h-1.5 rounded-full" style={{ width: '25%' }} />
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <Target className="text-blue-100" size={32} />
                    <span className="text-4xl font-light">3/12</span>
                  </div>
                  <p className="text-sm font-light text-blue-100">Módulos Concluídos</p>
                  <p className="text-xs font-light text-blue-200 mt-2">Continue assim!</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <Award className="text-blue-100" size={32} />
                    <span className="text-2xl font-light">03/10</span>
                  </div>
                  <p className="text-sm font-light text-blue-100">Data da Certificação</p>
                  <p className="text-xs font-light text-blue-200 mt-2">03 de Outubro, 2025</p>
                </div>
              </div>
            </div>
          </section>

          <div className="max-w-6xl mx-auto px-6 py-12">
            {/* Seção 1: Conteúdo do Módulo */}
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 bg-[#0072BC] rounded-full"></div>
                <div>
                  <h2 className="text-2xl font-light text-gray-900">Conteúdo do Módulo</h2>
                  <p className="text-sm font-light text-gray-500">Recursos de aprendizagem disponíveis</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recursos.map((recurso, index) => {
                  const Icon = recurso.icone;
                  return (
                    <a
                      key={index}
                      href={recurso.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#0072BC] hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${recurso.cor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          <Icon className="text-white" size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 mb-1 group-hover:text-[#0072BC] transition-colors">
                            {recurso.titulo}
                          </h3>
                          <p className="text-sm font-light text-gray-600 mb-2">{recurso.descricao}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-light text-gray-500">
                              {recurso.tamanho || recurso.duracao || recurso.questoes}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="text-gray-400 group-hover:text-[#0072BC] transition-colors" size={20} />
                      </div>
                    </a>
                  );
                })}
              </div>
            </section>

            {/* Seção 2: Materiais Adicionais */}
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 bg-[#FF6B00] rounded-full"></div>
                <div>
                  <h2 className="text-2xl font-light text-gray-900">Materiais Complementares</h2>
                  <p className="text-sm font-light text-gray-500">Recursos extras para aprofundar seu conhecimento</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {materiaisAdicionais.map((material, index) => {
                  const Icon = material.icone;
                  return (
                    <button
                      key={index}
                      className="bg-white rounded-xl p-5 border border-gray-200 hover:border-[#FF6B00] hover:shadow-md transition-all text-left group"
                    >
                      <Icon className="text-[#FF6B00] mb-3 group-hover:scale-110 transition-transform" size={24} />
                      <h3 className="text-sm font-medium text-gray-900 mb-1">{material.titulo}</h3>
                      <span className="text-xs font-light text-gray-500">{material.tipo}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Seção 3: Avaliação */}
            <section className="mb-16">
              <div className="bg-gradient-to-br from-[#0072BC] to-[#005a9e] rounded-2xl p-8 text-white">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Award size={32} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-light mb-3">Avaliação do Módulo</h2>
                    <p className="text-base font-light text-blue-100 mb-6 leading-relaxed">
                      A compreensão abrangente do conteúdo é essencial para seu desenvolvimento profissional. 
                      Cada avaliação aprovada é um passo importante rumo à sua <strong className="font-medium">Certificação CTP ANAPP</strong>, 
                      o documento mais reconhecido e valorizado no mercado de piscinas do Brasil.
                    </p>
                    <div className="bg-white/10 rounded-xl p-4 mb-6">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-light">Nota mínima para aprovação</span>
                        <span className="font-medium">70%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-light">Tentativas disponíveis</span>
                        <span className="font-medium">Ilimitadas</span>
                      </div>
                    </div>
                    <button className="bg-white text-[#0072BC] px-8 py-3 rounded-xl font-medium hover:bg-blue-50 transition-all shadow-lg">
                      Iniciar Avaliação
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Seção 4: Próximo Módulo */}
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 bg-[#0072BC] rounded-full"></div>
                <div>
                  <h2 className="text-2xl font-light text-gray-900">Próximo na Sua Jornada</h2>
                  <p className="text-sm font-light text-gray-500">Continue evoluindo</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-[#0072BC] transition-all">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#0072BC] to-[#005a9e] rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Rocket className="text-white" size={32} />
                  </div>
                  <div className="flex-1">
                    <span className="inline-block text-xs font-light text-[#0072BC] bg-blue-50 px-3 py-1 rounded-full mb-3">
                      Módulo {proximoModulo.numero}
                    </span>
                    <h3 className="text-xl font-medium text-gray-900 mb-3">{proximoModulo.titulo}</h3>
                    <p className="text-base font-light text-gray-600 mb-4">{proximoModulo.descricao}</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {proximoModulo.topicos.map((topico, index) => (
                        <span key={index} className="text-xs font-light text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
                          {topico}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => navigate('/dashboard/chapter/2')}
                      className="inline-flex items-center gap-2 text-[#0072BC] font-medium hover:gap-3 transition-all"
                    >
                      <span>Visualizar próximo módulo</span>
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      <Footer user={user} />
    </div>
  );
}

export default ChapterView;