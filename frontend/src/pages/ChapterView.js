import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoggedInHeader from '../components/LoggedInHeader';
import Footer from '../components/Footer';
import { FileText, Video, Headphones, PenTool, BookOpen, Award, ChevronRight, Menu, X, TrendingUp, Target, Rocket, CheckCircle, CheckCircle2, PlayCircle, Lock, Download, ExternalLink } from 'lucide-react';
import QuizModal from '../components/QuizModal';
import { quizData } from '../data/quizData';

function ChapterView({ user = { name: 'Aluno' } }) {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const currentChapter = chapterId ? parseInt(chapterId) : 1;
  const API_URL = process.env.REACT_APP_BACKEND_URL;

  // Scroll to top when chapter changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [chapterId]);

  // Track chapter access
  useEffect(() => {
    if (currentChapter) {
      // Save last accessed chapter
      localStorage.setItem('lastAccessedChapter', currentChapter.toString());
      
      // Update chapter access history
      const history = JSON.parse(localStorage.getItem('chapterHistory') || '{}');
      history[currentChapter] = {
        lastAccessed: new Date().toISOString(),
        accessCount: (history[currentChapter]?.accessCount || 0) + 1
      };
      localStorage.setItem('chapterHistory', JSON.stringify(history));
      
      // Track time spent on chapter
      const startTime = Date.now();
      
      return () => {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000); // in seconds
        const timeTracking = JSON.parse(localStorage.getItem('chapterTimeTracking') || '{}');
        timeTracking[currentChapter] = (timeTracking[currentChapter] || 0) + timeSpent;
        localStorage.setItem('chapterTimeTracking', JSON.stringify(timeTracking));
      };
    }
  }, [currentChapter]);

  const getProxiedImageUrl = (originalUrl) => {
    return `${API_URL}/api/proxy-image?url=${encodeURIComponent(originalUrl)}`;
  };

  const chapters = [
    { id: 1, titulo: 'Cálculos', status: 'completed', progresso: 100, imagem: 'https://customer-assets.emergentagent.com/job_poolcurso/artifacts/kjc951x6_Capitulo%201.png' },
    { id: 2, titulo: 'Volume e Capacidade', status: 'in-progress', progresso: 50, imagem: 'https://customer-assets.emergentagent.com/job_poolcurso/artifacts/st7v82pv_Capitulo%202.png' },
    { id: 3, titulo: 'Desinfecção e Produtos Químicos', status: 'completed', progresso: 100, imagem: 'https://customer-assets.emergentagent.com/job_poolcurso/artifacts/blgghqom_Capitulo%203.png' },
    { id: 4, titulo: 'Equilíbrio Químico da Água', status: 'completed', progresso: 100, imagem: 'https://customer-assets.emergentagent.com/job_poolcurso/artifacts/gp10g6y5_Capitulo%204.png' },
    { id: 5, titulo: 'Dosagem e Aplicação', status: 'in-progress', progresso: 50, imagem: 'https://customer-assets.emergentagent.com/job_poolcurso/artifacts/tb6dxgt5_Capitulo%205.png' },
    { id: 6, titulo: 'Filtração e Circulação', status: 'in-progress', progresso: 30, imagem: 'https://customer-assets.emergentagent.com/job_poolcurso/artifacts/svos7h8v_Capitulo%206.png' },
    { id: 7, titulo: 'Manutenção', status: 'in-progress', progresso: 40, imagem: 'https://customer-assets.emergentagent.com/job_poolcurso/artifacts/8x5drcve_Capitulo%207.png' },
    { id: 8, titulo: 'Segurança e Normas', status: 'in-progress', progresso: 60, imagem: 'https://customer-assets.emergentagent.com/job_poolcurso/artifacts/cf7z8z1q_Capitulo%208.png' },
    { id: 9, titulo: 'Problemas e Soluções', status: 'in-progress', progresso: 20, imagem: 'https://customer-assets.emergentagent.com/job_poolcurso/artifacts/ncywo7ov_Capitulo%209.png' },
    { id: 10, titulo: 'Atendimento ao Cliente', status: 'in-progress', progresso: 70, imagem: 'https://customer-assets.emergentagent.com/job_poolcurso/artifacts/bmg950w8_Capitulo%2010.png' },
    { id: 11, titulo: 'Sustentabilidade', status: 'in-progress', progresso: 45, imagem: 'https://customer-assets.emergentagent.com/job_poolcurso/artifacts/vaus0cvy_Capitulo%2011.png' },
    { id: 12, titulo: 'Certificação Final', status: 'in-progress', progresso: 80, imagem: 'https://customer-assets.emergentagent.com/job_poolcurso/artifacts/jzwlf6q9_Capitulo%2012.png' }
  ];

  // Dados específicos de cada capítulo
  const chaptersData = {
    1: {
      numero: 1,
      titulo: 'Cálculos',
      subtitulo: 'Fundamentos essenciais para o profissional de sucesso',
      descricao: 'O aluno será inserido aos cálculos essenciais para as atividades em um ambiente de piscina ou spa, volume, área, conversão e etc.',
      duracao: '12 horas',
      recursosDisponiveis: 6,
      modulos: [
        { titulo: 'Sistema Internacional', duracao: '45 min' },
        { titulo: 'Conversões', duracao: '50 min' },
        { titulo: 'Cálculo de Volume', duracao: '60 min' },
        { titulo: 'Reposição de Água', duracao: '40 min' }
      ]
    },
    2: {
      numero: 2,
      titulo: 'Volume e Capacidade',
      subtitulo: 'Cálculos Avançados',
      descricao: 'Formatos especiais: ovais, em L, formato rim, multinível e cálculos complexos.',
      duracao: '12 horas',
      recursosDisponiveis: 5,
      modulos: [
        { titulo: 'Piscinas Ovais', duracao: '45 min' },
        { titulo: 'Formato em L', duracao: '50 min' },
        { titulo: 'Formato Rim', duracao: '45 min' },
        { titulo: 'Piscinas Multinível', duracao: '55 min' }
      ]
    },
    3: {
      numero: 3,
      titulo: 'Desinfecção e Produtos Químicos',
      subtitulo: 'Cloro, pH e Segurança na Manutenção',
      descricao: 'Tipos de cloro, dosagens, certificações de produtos e segurança na aplicação.',
      duracao: '15 horas',
      recursosDisponiveis: 6,
      modulos: [
        { titulo: 'O Cloro', duracao: '60 min' },
        { titulo: 'Tipos de Cloro', duracao: '50 min' },
        { titulo: 'Certificações', duracao: '45 min' },
        { titulo: 'Armazenamento', duracao: '40 min' }
      ]
    },
    4: {
      numero: 4,
      titulo: 'Equilíbrio Químico da Água',
      subtitulo: 'Alcalinidade, pH e Dureza - O Triângulo do Equilíbrio',
      descricao: 'Aprenda a manter o equilíbrio químico perfeito: alcalinidade total, pH e dureza cálcica.',
      duracao: '15 horas',
      recursosDisponiveis: 6,
      modulos: [
        { titulo: 'Alcalinidade Total', duracao: '50 min' },
        { titulo: 'pH', duracao: '60 min' },
        { titulo: 'Dureza de Cálcio', duracao: '50 min' },
        { titulo: 'Índice de Langelier', duracao: '45 min' }
      ]
    },
    5: {
      numero: 5,
      titulo: 'Dosagem e Aplicação',
      subtitulo: 'Cálculos Práticos',
      descricao: 'Como calcular e aplicar produtos corretamente. Técnicas de aplicação segura.',
      duracao: '12 horas',
      recursosDisponiveis: 5,
      modulos: [
        { titulo: 'Cálculo de Dosagens', duracao: '60 min' },
        { titulo: 'Métodos de Aplicação', duracao: '50 min' },
        { titulo: 'Segurança', duracao: '45 min' },
        { titulo: 'Cronogramas', duracao: '40 min' }
      ]
    },
    6: {
      numero: 6,
      titulo: 'Filtração e Circulação',
      subtitulo: 'Bombas e Filtros',
      descricao: 'Sistemas de filtração, bombas, skimmers e manutenção de equipamentos.',
      duracao: '14 horas',
      recursosDisponiveis: 5,
      modulos: [
        { titulo: 'Tipos de Filtros', duracao: '55 min' },
        { titulo: 'Bombas', duracao: '50 min' },
        { titulo: 'Manutenção', duracao: '60 min' },
        { titulo: 'Troubleshooting', duracao: '45 min' }
      ]
    },
    7: {
      numero: 7,
      titulo: 'Manutenção',
      subtitulo: 'Rotinas Diárias',
      descricao: 'Manutenção preventiva e corretiva, rotinas semanais e mensais.',
      duracao: '15 horas',
      recursosDisponiveis: 5,
      modulos: [
        { titulo: 'Rotina Diária', duracao: '50 min' },
        { titulo: 'Rotina Semanal', duracao: '55 min' },
        { titulo: 'Rotina Mensal', duracao: '60 min' },
        { titulo: 'Preventiva', duracao: '50 min' }
      ]
    },
    8: {
      numero: 8,
      titulo: 'Segurança e Normas',
      subtitulo: 'ABNT e EPIs',
      descricao: 'Normas ABNT, equipamentos de proteção e primeiros socorros.',
      duracao: '12 horas',
      recursosDisponiveis: 5,
      modulos: [
        { titulo: 'ABNT NBR 10.339', duracao: '60 min' },
        { titulo: 'EPIs', duracao: '45 min' },
        { titulo: 'Primeiros Socorros', duracao: '55 min' },
        { titulo: 'Emergências', duracao: '40 min' }
      ]
    },
    9: {
      numero: 9,
      titulo: 'Problemas e Soluções',
      subtitulo: 'Diagnóstico',
      descricao: 'Água verde, turva, algas, manchas - diagnóstico e solução.',
      duracao: '13 horas',
      recursosDisponiveis: 5,
      modulos: [
        { titulo: 'Água Verde', duracao: '50 min' },
        { titulo: 'Água Turva', duracao: '50 min' },
        { titulo: 'Algas', duracao: '55 min' },
        { titulo: 'Manchas', duracao: '45 min' }
      ]
    },
    10: {
      numero: 10,
      titulo: 'Atendimento ao Cliente',
      subtitulo: 'Comunicação',
      descricao: 'Comunicação efetiva, relatórios e fidelização de clientes.',
      duracao: '10 horas',
      recursosDisponiveis: 5,
      modulos: [
        { titulo: 'Comunicação', duracao: '45 min' },
        { titulo: 'Relatórios', duracao: '50 min' },
        { titulo: 'Fidelização', duracao: '45 min' },
        { titulo: 'Conflitos', duracao: '40 min' }
      ]
    },
    11: {
      numero: 11,
      titulo: 'Sustentabilidade',
      subtitulo: 'Práticas Ecológicas',
      descricao: 'Economizar água, energia e práticas sustentáveis.',
      duracao: '10 horas',
      recursosDisponiveis: 5,
      modulos: [
        { titulo: 'Economia de Água', duracao: '50 min' },
        { titulo: 'Economia de Energia', duracao: '45 min' },
        { titulo: 'Produtos Ecológicos', duracao: '50 min' },
        { titulo: 'Gestão Ambiental', duracao: '40 min' }
      ]
    },
    12: {
      numero: 12,
      titulo: 'Certificação Final',
      subtitulo: 'Avaliação',
      descricao: 'Revisão geral e avaliação final para certificação ANAPP.',
      duracao: '10 horas',
      recursosDisponiveis: 4,
      modulos: [
        { titulo: 'Revisão Geral', duracao: '90 min' },
        { titulo: 'Avaliação Teórica', duracao: '120 min' },
        { titulo: 'Avaliação Prática', duracao: '90 min' },
        { titulo: 'Certificação', duracao: '30 min' }
      ]
    }
  };

  const chapterData = chaptersData[currentChapter] || chaptersData[1];

  // Recursos disponíveis por capítulo
  const apostilasDisponiveis = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; // Capítulos com apostila
  const hasApostila = apostilasDisponiveis.includes(currentChapter);
  
  const recursos = [
    ...(hasApostila ? [{
      tipo: 'apostila',
      titulo: 'Apostila Completa do Módulo',
      descricao: 'Material teórico completo com exercícios e download PDF',
      tamanho: 'Versão Interativa',
      icone: FileText,
      cor: 'from-red-500 to-red-600',
      url: `/dashboard/apostila/modulo-${currentChapter}`,
      internal: true
    }] : []),
    {
      tipo: 'video',
      titulo: `Videoaula Módulo ${currentChapter}`,
      descricao: 'Apresentação visual dos conceitos principais',
      duracao: '2 minutos',
      icone: Video,
      cor: 'from-[#0072BC] to-[#005a9e]',
      url: currentChapter === 2 ? 'https://youtu.be/TFALKmgbyRs' :
           currentChapter === 3 ? 'https://youtu.be/_0l7bZ5cY8A' :
           currentChapter === 4 ? 'https://youtu.be/Wu8TCzwXNHc' :
           currentChapter === 5 ? 'https://youtu.be/H1ptautsuHk' :
           currentChapter === 6 ? 'https://youtu.be/mVaEecgo_sA' :
           currentChapter === 7 ? 'https://youtu.be/vRC0OWRGs2I' :
           currentChapter === 8 ? 'https://youtu.be/sKrXYVJr7fw' :
           currentChapter === 9 ? 'https://youtu.be/l7suM6UMwzk' :
           currentChapter === 10 ? 'https://youtu.be/dpl3MnOeG1w' :
           'https://youtu.be/fP3fInaBxNY'
    },
    ...(currentChapter === 1 ? [{
      tipo: 'podcast',
      titulo: 'Dominando a Matemática da Piscina',
      descricao: 'Do Volume (o CPF da Piscina) - Ouça ou faça download',
      duracao: 'Áudio completo',
      icone: Headphones,
      cor: 'from-green-500 to-green-600',
      url: 'https://customer-assets.emergentagent.com/job_ctp-academy/artifacts/a5mjilbl_Dominando_a_Matem%C3%A1tica_da_Piscina__Do_Volume_%28o_CPF_da_Piscina%29.m4a',
      isAudio: true
    }] : []),
    ...(currentChapter === 2 ? [{
      tipo: 'podcast',
      titulo: 'O "Supervilão" da Piscina',
      descricao: 'Crypto, Bactérias e o Protocolo de Emergência - Ouça ou faça download',
      duracao: 'Áudio completo',
      icone: Headphones,
      cor: 'from-green-500 to-green-600',
      url: 'https://customer-assets.emergentagent.com/job_ctp-academy/artifacts/7ctixszw_O__Supervil%C3%A3o__da_Piscina__Crypto%2C_Bact%C3%A9rias_e_o_Protocolo_de_E.m4a',
      isAudio: true
    }] : []),
    ...(currentChapter === 3 ? [{
      tipo: 'podcast',
      titulo: 'Cloro, Ozônio e UV',
      descricao: 'O Guia Completo da Desinfecção de Piscinas - Ouça ou faça download',
      duracao: 'Áudio completo',
      icone: Headphones,
      cor: 'from-green-500 to-green-600',
      url: 'https://customer-assets.emergentagent.com/job_ctp-academy/artifacts/rf43be9x_Cloro%2C_Oz%C3%B4nio_e_UV__O_Guia_Completo_da_Desinfec%C3%A7%C3%A3o_de_Piscinas_.m4a',
      isAudio: true
    }] : []),
    ...(currentChapter === 4 ? [{
      tipo: 'podcast',
      titulo: 'O Guia Essencial do Equilíbrio Químico',
      descricao: 'AT, pH, Dureza e muito mais - Ouça ou faça download',
      duracao: 'Áudio completo',
      icone: Headphones,
      cor: 'from-green-500 to-green-600',
      url: 'https://customer-assets.emergentagent.com/job_ctp-academy/artifacts/kz4k19dl_O_Guia_Essencial_do_Equil%C3%ADbrio_Qu%C3%ADmico_da_Piscina__AT%2C_pH%2C_Dure.m4a',
      isAudio: true
    }] : []),
    ...(currentChapter === 5 ? [{
      tipo: 'podcast',
      titulo: 'Os Segredos da Água Cristalina',
      descricao: 'Precisão nos Testes e a Química Perfeita - Ouça ou faça download',
      duracao: 'Áudio completo',
      icone: Headphones,
      cor: 'from-green-500 to-green-600',
      url: 'https://customer-assets.emergentagent.com/job_ctp-academy/artifacts/csynyd56_Os_Segredos_da_%C3%81gua_Cristalina__Precis%C3%A3o_nos_Testes_e_a_Qu%C3%ADmica.m4a',
      isAudio: true
    }] : []),
    ...(currentChapter === 6 ? [{
      tipo: 'podcast',
      titulo: 'Piscinas Seguras',
      descricao: 'O Guia Completo Contra Afogamentos e Químicos - Ouça ou faça download',
      duracao: 'Áudio completo',
      icone: Headphones,
      cor: 'from-green-500 to-green-600',
      url: 'https://customer-assets.emergentagent.com/job_ctp-academy/artifacts/ojiric9w_Piscinas_Seguras__O_Guia_Completo_Contra_Afogamentos%2C_Qu%C3%ADmicos_.m4a',
      isAudio: true
    }] : []),
    ...(currentChapter === 7 ? [{
      tipo: 'podcast',
      titulo: 'Manual do Especialista',
      descricao: 'Solução de Problemas Comuns em Piscinas - Ouça ou faça download',
      duracao: 'Áudio completo',
      icone: Headphones,
      cor: 'from-green-500 to-green-600',
      url: 'https://customer-assets.emergentagent.com/job_ctp-academy/artifacts/xbpz6dpc_Manual_do_Especialista__Solu%C3%A7%C3%A3o_de_Problemas_Comuns_em_Piscinas.m4a',
      isAudio: true
    }] : []),
    ...(currentChapter === 8 ? [{
      tipo: 'podcast',
      titulo: 'Registros Detalhados e NBR 10339',
      descricao: 'A Base Estratégica da Segurança - Ouça ou faça download',
      duracao: 'Áudio completo',
      icone: Headphones,
      cor: 'from-green-500 to-green-600',
      url: 'https://customer-assets.emergentagent.com/job_ctp-academy/artifacts/5ng6igvv_Registros_Detalhados_e_NBR_10339__A_Base_Estrat%C3%A9gica_da_Seguran.m4a',
      isAudio: true
    }] : []),
    ...(currentChapter === 9 ? [{
      tipo: 'podcast',
      titulo: 'Guia Definitivo da Manutenção',
      descricao: 'Como Prevenir Problemas em Piscinas e Spas - Ouça ou faça download',
      duracao: 'Áudio completo',
      icone: Headphones,
      cor: 'from-green-500 to-green-600',
      url: 'https://customer-assets.emergentagent.com/job_ctp-academy/artifacts/htf4ktml_Guia_Definitivo_da_Manuten%C3%A7%C3%A3o_de_Piscinas_e_Spas__Como_Prevenir.m4a',
      isAudio: true
    }] : []),
    ...(currentChapter === 10 ? [{
      tipo: 'podcast',
      titulo: 'ABNT NBR 10339',
      descricao: 'O Guia Completo da Segurança em Piscinas - Ouça ou faça download',
      duracao: 'Áudio completo',
      icone: Headphones,
      cor: 'from-green-500 to-green-600',
      url: 'https://customer-assets.emergentagent.com/job_ctp-academy/artifacts/fnz522b5_ABNT_NBR_10339__O_Guia_Completo_da_Seguran%C3%A7a_em_Piscinas_%E2%80%93_Do_R.m4a',
      isAudio: true
    }] : []),
    ...(currentChapter === 11 ? [{
      tipo: 'podcast',
      titulo: 'Segurança e Circulação Perfeita',
      descricao: 'Desvendando a Engenharia Hídrica - Ouça ou faça download',
      duracao: 'Áudio completo',
      icone: Headphones,
      cor: 'from-green-500 to-green-600',
      url: 'https://customer-assets.emergentagent.com/job_ctp-academy/artifacts/pjaeye17_Seguran%C3%A7a_e_Circula%C3%A7%C3%A3o_Perfeita__Desvendando_a_Engenharia_H%C3%ADdri.m4a',
      isAudio: true
    }] : []),
    ...(currentChapter === 12 ? [{
      tipo: 'podcast',
      titulo: 'Aquecimento de Piscinas',
      descricao: 'COP, Capas Térmicas e a Ciência por Trás - Ouça ou faça download',
      duracao: 'Áudio completo',
      icone: Headphones,
      cor: 'from-green-500 to-green-600',
      url: 'https://customer-assets.emergentagent.com/job_ctp-academy/artifacts/zaejmtxl_Aquecimento_de_Piscinas__COP%2C_Capas_T%C3%A9rmicas_e_a_Ci%C3%AAncia_por_Tr.m4a',
      isAudio: true
    }] : []),
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
                <p className="text-sm font-light text-blue-100 mb-2">Módulo {currentChapter} de 12</p>
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
                  
                  // Renderização especial para áudio
                  if (recurso.isAudio) {
                    return (
                      <div
                        key={index}
                        className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#0072BC] hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${recurso.cor} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="text-white" size={24} />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                              {recurso.titulo}
                            </h3>
                            <p className="text-sm font-light text-gray-600 mb-2">{recurso.descricao}</p>
                            <span className="text-xs font-light text-gray-500">
                              {recurso.duracao}
                            </span>
                          </div>
                        </div>
                        
                        {/* Player de Áudio */}
                        <audio 
                          controls 
                          className="w-full mb-3"
                          style={{ height: '40px' }}
                        >
                          <source src={recurso.url} type="audio/mp4" />
                          Seu navegador não suporta o elemento de áudio.
                        </audio>
                        
                        {/* Botão de Download */}
                        <a
                          href={recurso.url}
                          download="Podcast_Modulo_1_CTP.m4a"
                          className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 px-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium text-sm"
                        >
                          <Download size={18} />
                          Baixar Podcast
                        </a>
                      </div>
                    );
                  }
                  
                  // Renderização especial para quiz interativo
                  if (recurso.tipo === 'exercicios') {
                    return (
                      <button
                        key={index}
                        onClick={() => setQuizOpen(true)}
                        className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#0072BC] hover:shadow-lg transition-all text-left w-full"
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
                                {recurso.questoes}
                              </span>
                              <span className="inline-block bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded-full">
                                Gamificado
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="text-gray-400 group-hover:text-[#0072BC] transition-colors" size={20} />
                        </div>
                      </button>
                    );
                  }
                  
                  // Renderização padrão para outros recursos
                  const Component = recurso.internal ? 'button' : 'a';
                  const props = recurso.internal
                    ? { onClick: () => navigate(recurso.url) }
                    : { href: recurso.url, target: '_blank', rel: 'noopener noreferrer' };
                  
                  return (
                    <Component
                      key={index}
                      {...props}
                      className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#0072BC] hover:shadow-lg transition-all text-left w-full"
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
                    </Component>
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

            {/* Navegação Rápida - Todos os 12 Capítulos */}
            <section className="mb-16">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <BookOpen className="text-[#0072BC]" size={28} />
                  <h2 className="text-2xl font-light text-gray-900">Navegação Rápida - Todos os Módulos</h2>
                </div>
                
                <p className="text-gray-600 font-light mb-8">
                  Acesse rapidamente qualquer um dos 12 módulos do curso CTP
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {chapters.map((chapter) => {
                    const isCompleted = chapter.status === 'completed';
                    const isLocked = chapter.status === 'locked';
                    const isCurrent = chapter.id === currentChapter;
                    
                    return (
                      <button
                        key={chapter.id}
                        onClick={() => !isLocked && navigate(`/dashboard/chapter/${chapter.id}`)}
                        disabled={isLocked}
                        className={`text-left p-4 rounded-xl border-2 transition-all ${
                          isCurrent
                            ? 'bg-[#0072BC] border-[#0072BC] text-white shadow-lg'
                            : isCompleted
                            ? 'bg-white border-green-200 hover:border-green-400 hover:shadow-md'
                            : isLocked
                            ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                            : 'bg-white border-gray-200 hover:border-[#0072BC] hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className={`text-sm font-semibold ${
                            isCurrent ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            Módulo {chapter.id}
                          </span>
                          {isCompleted && !isCurrent && (
                            <CheckCircle2 className="text-green-500" size={18} />
                          )}
                          {isCurrent && (
                            <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">Atual</span>
                          )}
                          {isLocked && (
                            <Lock className="text-gray-400" size={18} />
                          )}
                        </div>
                        <h3 className={`font-medium text-sm mb-1 ${
                          isCurrent ? 'text-white' : 'text-gray-900'
                        }`}>
                          {chapter.titulo}
                        </h3>
                        {!isLocked && !isCurrent && (
                          <div className="flex items-center gap-1 text-xs text-[#0072BC] mt-2">
                            <span>Acessar</span>
                            <ChevronRight size={14} />
                          </div>
                        )}
                      </button>
                    );
                  })}
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

      {/* Quiz Modal */}
      <QuizModal
        isOpen={quizOpen}
        onClose={() => setQuizOpen(false)}
        quizData={quizData[currentChapter]}
        moduleNumber={currentChapter}
      />
    </div>
  );
}

export default ChapterView;