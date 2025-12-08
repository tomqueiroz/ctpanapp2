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
      titulo: 'Introdução ao Tratamento de Piscinas',
      subtitulo: 'A Importância das Medidas e o Sistema Internacional',
      descricao: 'Conceitos básicos de manutenção, fundamentos de limpeza e segurança dos usuários',
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
      imagem: 'https://readdy.ai/api/search-image?query=pH%20testing%20of%20pool%20water%2C%20water%20balance%20chemicals%2C%20alkalinity%20adjustment%2C%20calcium%20hardness%20testing%2C%20professional%20water%20testing%20kit%20with%20color%20chart%2C%20technical%20pool%20water%20analysis&width=400&height=300&seq=4&orientation=landscape'
    },
    {
      id: 5,
      numero: 'V',
      titulo: 'Tratamentos Alternativos',
      subtitulo: 'Testes Químicos',
      descricao: 'Sistemas de ozônio, tratamento UV e tecnologias emergentes',
      duracao: '12 horas',
      status: 'locked',
      imagem: 'https://readdy.ai/api/search-image?query=chemical%20test%20strips%2C%20reagent%20drops%2C%20colorimetric%20analysis%2C%20electronic%20water%20testers%2C%20laboratory%20equipment%20for%20pool%20water%20analysis%2C%20professional%20testing%20procedures&width=400&height=300&seq=5&orientation=landscape'
    },
    {
      id: 6,
      numero: 'VI',
      titulo: 'Manutenção e Resolução',
      subtitulo: 'Operação e Segurança',
      descricao: 'Manutenção preventiva, diagnóstico de problemas e soluções práticas',
      duracao: '14 horas',
      status: 'locked',
      imagem: 'https://readdy.ai/api/search-image?query=pool%20equipment%20operation%2C%20safety%20gear%20for%20pool%20maintenance%2C%20warning%20signs%2C%20emergency%20procedures%2C%20pool%20pump%20system%20operation%2C%20technical%20safety%20equipment&width=400&height=300&seq=6&orientation=landscape'
    },
    {
      id: 7,
      numero: 'VII',
      titulo: 'Solução de Problemas',
      subtitulo: 'Manutenção Preventiva',
      descricao: 'Problemas comuns, diagnóstico avançado e soluções específicas',
      duracao: '15 horas',
      status: 'locked',
      imagem: 'https://readdy.ai/api/search-image?query=preventive%20pool%20maintenance%2C%20routine%20checks%2C%20equipment%20inspection%2C%20filter%20cleaning%2C%20professional%20pool%20technician%20performing%20maintenance%20tasks%2C%20modern%20pool%20equipment&width=400&height=300&seq=7&orientation=landscape'
    },
    {
      id: 8,
      numero: 'VIII',
      titulo: 'Relatórios e Documentação',
      subtitulo: 'Equipamentos Avançados',
      descricao: 'Elaboração de relatórios, registro de ocorrências e documentação técnica',
      duracao: '12 horas',
      status: 'locked',
      imagem: 'https://readdy.ai/api/search-image?query=advanced%20pool%20equipment%2C%20automated%20systems%2C%20smart%20pool%20controllers%2C%20modern%20filtration%20systems%2C%20high-tech%20pool%20maintenance%20devices%2C%20professional%20pool%20technology&width=400&height=300&seq=8&orientation=landscape'
    },
    {
      id: 9,
      numero: 'IX',
      titulo: 'Atendimento ao Cliente',
      subtitulo: 'Tratamentos Especiais',
      descricao: 'Comunicação efetiva, gestão de expectativas e resolução de conflitos',
      duracao: '13 horas',
      status: 'locked',
      imagem: 'https://readdy.ai/api/search-image?query=special%20pool%20treatments%2C%20algae%20removal%2C%20stain%20treatment%2C%20water%20clarification%2C%20professional%20pool%20cleaning%20techniques%2C%20specialized%20pool%20maintenance&width=400&height=300&seq=9&orientation=landscape'
    },
    {
      id: 10,
      numero: 'X',
      titulo: 'Gestão de Projetos',
      subtitulo: 'Diagnóstico de Problemas',
      descricao: 'Planejamento de serviços, cronograma de manutenção e gestão de recursos',
      duracao: '10 horas',
      status: 'locked',
      imagem: 'https://readdy.ai/api/search-image?query=pool%20problem%20diagnosis%2C%20water%20testing%20equipment%2C%20troubleshooting%20tools%2C%20professional%20inspection%2C%20pool%20maintenance%20analysis%2C%20technical%20assessment&width=400&height=300&seq=10&orientation=landscape'
    },
    {
      id: 11,
      numero: 'XI',
      titulo: 'Sustentabilidade',
      subtitulo: 'Gestão de Negócios',
      descricao: 'Economia de recursos, práticas sustentáveis e gestão ambiental',
      duracao: '10 horas',
      status: 'locked',
      imagem: 'https://readdy.ai/api/search-image?query=pool%20business%20management%2C%20customer%20service%2C%20professional%20documentation%2C%20pool%20maintenance%20scheduling%2C%20business%20planning%2C%20modern%20office%20environment&width=400&height=300&seq=11&orientation=landscape'
    },
    {
      id: 12,
      numero: 'XII',
      titulo: 'Certificação Final',
      subtitulo: 'Tendências e Inovações',
      descricao: 'Revisão geral, avaliação teórica e projeto prático',
      duracao: '10 horas',
      status: 'locked',
      imagem: 'https://readdy.ai/api/search-image?query=pool%20industry%20trends%2C%20innovative%20technologies%2C%20sustainable%20solutions%2C%20smart%20pool%20systems%2C%20modern%20pool%20designs%2C%20futuristic%20pool%20maintenance&width=400&height=300&seq=12&orientation=landscape'
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
                  src={chapter.imagem}
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