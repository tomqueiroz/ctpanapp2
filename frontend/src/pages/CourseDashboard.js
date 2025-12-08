import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoggedInHeader from '../components/LoggedInHeader';
import Footer from '../components/Footer';
import { CheckCircle2, Lock, PlayCircle, Calendar, Award, TrendingUp } from 'lucide-react';

function CourseDashboard({ user = { name: 'Aluno' } }) {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_BACKEND_URL;

  const getProxiedImageUrl = (originalUrl) => {
    return `${API_URL}/api/proxy-image?url=${encodeURIComponent(originalUrl)}`;
  };

  const chapters = [
    {
      id: 1,
      numero: 'I',
      titulo: 'Cálculos',
      subtitulo: 'A Importância das Medidas e o Sistema Internacional',
      descricao: 'O aluno será inserido aos cálculos essenciais para as atividades em um ambiente de piscina ou spa, volume, área, conversão e etc.',
      duracao: '12 horas',
      status: 'completed',
      imagem: 'https://customer-assets.emergentagent.com/job_poolcurso/artifacts/kjc951x6_Capitulo%201.png'
    },
    {
      id: 2,
      numero: 'II',
      titulo: 'Segurança no Manuseio de Produtos',
      subtitulo: 'Contaminação',
      descricao: 'Protocolos de segurança, EPIs obrigatórios e armazenamento correto',
      duracao: '12 horas',
      status: 'completed',
      imagem: 'https://customer-assets.emergentagent.com/job_poolcurso/artifacts/st7v82pv_Capitulo%202.png'
    },
    {
      id: 3,
      numero: 'III',
      titulo: 'Tipos de Tratamentos',
      subtitulo: 'Descontaminação',
      descricao: 'Tratamento físico, tratamento químico e sistemas de filtração',
      duracao: '15 horas',
      status: 'completed',
      imagem: 'https://customer-assets.emergentagent.com/job_poolcurso/artifacts/blgghqom_Capitulo%203.png'
    },
    {
      id: 4,
      numero: 'IV',
      titulo: 'Controle e Análise da Água',
      subtitulo: 'Balanceamento',
      descricao: 'Parâmetros químicos, instrumentos de medição e ajustes',
      duracao: '15 horas',
      status: 'in-progress',
      imagem: 'https://customer-assets.emergentagent.com/job_poolcurso/artifacts/gp10g6y5_Capitulo%204.png'
    },
    {
      id: 5,
      numero: 'V',
      titulo: 'Tratamentos Alternativos',
      subtitulo: 'Testes Químicos',
      descricao: 'Sistemas de ozônio, tratamento UV e tecnologias emergentes',
      duracao: '12 horas',
      status: 'locked',
      imagem: 'https://customer-assets.emergentagent.com/job_poolcurso/artifacts/tb6dxgt5_Capitulo%205.png'
    },
    {
      id: 6,
      numero: 'VI',
      titulo: 'Manutenção e Resolução',
      subtitulo: 'Operação e Segurança',
      descricao: 'Manutenção preventiva, diagnóstico de problemas e soluções práticas',
      duracao: '14 horas',
      status: 'locked',
      imagem: 'https://customer-assets.emergentagent.com/job_poolcurso/artifacts/svos7h8v_Capitulo%206.png'
    },
    {
      id: 7,
      numero: 'VII',
      titulo: 'Solução de Problemas',
      subtitulo: 'Manutenção Preventiva',
      descricao: 'Problemas comuns, diagnóstico avançado e soluções específicas',
      duracao: '15 horas',
      status: 'locked',
      imagem: 'https://customer-assets.emergentagent.com/job_poolcurso/artifacts/8x5drcve_Capitulo%207.png'
    },
    {
      id: 8,
      numero: 'VIII',
      titulo: 'Relatórios e Documentação',
      subtitulo: 'Equipamentos Avançados',
      descricao: 'Elaboração de relatórios, registro de ocorrências e documentação técnica',
      duracao: '12 horas',
      status: 'locked',
      imagem: 'https://customer-assets.emergentagent.com/job_poolcurso/artifacts/cf7z8z1q_Capitulo%208.png'
    },
    {
      id: 9,
      numero: 'IX',
      titulo: 'Atendimento ao Cliente',
      subtitulo: 'Tratamentos Especiais',
      descricao: 'Comunicação efetiva, gestão de expectativas e resolução de conflitos',
      duracao: '13 horas',
      status: 'locked',
      imagem: 'https://customer-assets.emergentagent.com/job_poolcurso/artifacts/ncywo7ov_Capitulo%209.png'
    },
    {
      id: 10,
      numero: 'X',
      titulo: 'Gestão de Projetos',
      subtitulo: 'Diagnóstico de Problemas',
      descricao: 'Planejamento de serviços, cronograma de manutenção e gestão de recursos',
      duracao: '10 horas',
      status: 'locked',
      imagem: 'https://customer-assets.emergentagent.com/job_poolcurso/artifacts/bmg950w8_Capitulo%2010.png'
    },
    {
      id: 11,
      numero: 'XI',
      titulo: 'Sustentabilidade',
      subtitulo: 'Gestão de Negócios',
      descricao: 'Economia de recursos, práticas sustentáveis e gestão ambiental',
      duracao: '10 horas',
      status: 'locked',
      imagem: 'https://customer-assets.emergentagent.com/job_poolcurso/artifacts/vaus0cvy_Capitulo%2011.png'
    },
    {
      id: 12,
      numero: 'XII',
      titulo: 'Certificação Final',
      subtitulo: 'Tendências e Inovações',
      descricao: 'Revisão geral, avaliação teórica e aplicação das melhores práticas',
      duracao: '10 horas',
      status: 'locked',
      imagem: 'https://customer-assets.emergentagent.com/job_poolcurso/artifacts/jzwlf6q9_Capitulo%2012.png'
    }
  ];

  const completedCount = chapters.filter(c => c.status === 'completed').length;
  const progressPercentage = Math.round((completedCount / chapters.length) * 100);

  const getStatusBadge = (status) => {
    if (status === 'completed') {
      return (
        <span className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
          <CheckCircle2 size={14} className="mr-1" />
          Concluído
        </span>
      );
    }
    if (status === 'in-progress') {
      return (
        <span className="absolute top-4 right-4 bg-[#FF6B00] text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
          <PlayCircle size={14} className="mr-1" />
          Em Progresso
        </span>
      );
    }
    return (
      <span className="absolute top-4 right-4 bg-gray-400 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
        <Lock size={14} className="mr-1" />
        Bloqueado
      </span>
    );
  };

  const handleChapterClick = (chapter) => {
    if (chapter.status !== 'locked') {
      navigate(`/dashboard/chapter/${chapter.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LoggedInHeader user={user} />

      {/* Hero Section com Progresso */}
      <div className="bg-gradient-to-br from-[#0072BC] via-[#005a9e] to-[#004a7c] text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">Curso Técnico em Piscinas (CTP)</h1>
            <p className="text-lg text-blue-100">Sua jornada para a certificação ANAPP - A mais importante do Brasil</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Progresso Total */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="text-blue-200" size={32} />
                <span className="text-4xl font-bold">{progressPercentage}%</span>
              </div>
              <p className="text-sm text-blue-100">Progresso Total</p>
              <div className="mt-3 bg-white/20 rounded-full h-2">
                <div className="bg-white h-2 rounded-full transition-all" style={{ width: `${progressPercentage}%` }} />
              </div>
            </div>

            {/* Data da Prova */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <Calendar className="text-blue-200" size={32} />
                <span className="text-2xl font-bold">03/10</span>
              </div>
              <p className="text-sm text-blue-100">Data da Prova</p>
              <p className="text-xs text-blue-200 mt-2">03 de Outubro, 2025</p>
            </div>

            {/* Capítulos Concluídos */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <Award className="text-blue-200" size={32} />
                <span className="text-4xl font-bold">{completedCount}</span>
              </div>
              <p className="text-sm text-blue-100">Capítulos Concluídos</p>
              <p className="text-xs text-blue-200 mt-2">de {chapters.length} módulos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Capítulos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Sua Jornada de Aprendizado</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {chapters.map((chapter) => (
            <div
              key={chapter.id}
              onClick={() => handleChapterClick(chapter)}
              className={`bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-xl ${
                chapter.status === 'locked' 
                  ? 'cursor-not-allowed opacity-60' 
                  : 'cursor-pointer hover:-translate-y-1'
              }`}
            >
              {/* Imagem */}
              <div className="relative h-48 bg-gray-200 overflow-hidden">
                <img
                  src={getProxiedImageUrl(chapter.imagem)}
                  alt={chapter.titulo}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300/0072BC/FFFFFF?text=Capítulo+' + chapter.id;
                  }}
                />
                {getStatusBadge(chapter.status)}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <span className="text-white font-bold text-lg">Capítulo {chapter.numero}</span>
                </div>
              </div>

              {/* Conteúdo */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{chapter.titulo}</h3>
                <p className="text-sm text-gray-600 mb-4">{chapter.descricao}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {chapter.duracao}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer user={user} />
    </div>
  );
}

export default CourseDashboard;