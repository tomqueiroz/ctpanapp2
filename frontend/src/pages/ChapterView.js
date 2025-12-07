import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoggedInHeader from '../components/LoggedInHeader';
import CourseSidebar from '../components/CourseSidebar';
import { FileText, Video, Headphones, PenTool, Clock, BookOpen, Calendar, Award, ChevronRight, Menu, X, Info, MessageCircle, TrendingUp } from 'lucide-react';

function ChapterView({ user = { name: 'Aluno' } }) {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentChapter = chapterId ? parseInt(chapterId) : 1;

  // Dados dos capítulos
  const chaptersData = {
    1: {
      numero: 'I',
      titulo: 'Introdução ao Tratamento de Piscinas',
      subtitulo: 'Conhecendo o Sistema Internacional e as Principais Medidas para o Piscineiro de Sucesso',
      descricao: 'Aprenda as diferentes medidas fundamentais que são essenciais para que o piscineiro tenha sucesso em todos os seus clientes. Esta base de conhecimento deve vir antes de se conhecer aos princípios fundamentais do balanceamento químico da água da piscina, incluindo pH, alcalinidade, dureza cálcica e outros parâmetros essenciais.',
      tags: ['Química da Água', 'Pesos e Medidas', 'Sistema de Medidas (SI)', 'pH, Alcalinidade, Dureza Cálcica'],
      tempo: '4 horas',
      recursos: 6,
      apostila: {
        titulo: 'Apostila Completa',
        tamanho: '6MB',
        url: 'https://heyzine.com/flip-book/6b5e7efd0f.html'
      },
      video: {
        titulo: 'Vídeo de Introdução',
        duracao: '2 minutos',
        url: 'https://youtu.be/PuLMcD3h2h0'
      },
      podcast: {
        titulo: 'Podcast do Capítulo',
        duracao: '12 minutos',
        url: 'https://creators.spotify.com/pod/show/wellington-queiroz91/episodes/Captulo-1-A-Importncia-das-Medidas-e-o-Sistema-Universal-e356ehd'
      },
      quiz: {
        titulo: 'Pratique para Lembrar',
        descricao: 'Exercícios práticos',
        url: 'https://create.kahoot.it/share/ctp-cap-1-exercicio-1/d3c28c39-0fed-46a7-9fa0-ea8978d13406'
      }
    },
    // Adicionar dados para outros capítulos conforme necessário
  };

  const chapterData = chaptersData[currentChapter] || chaptersData[1];

  return (
    <div className="min-h-screen bg-gray-50">
      <LoggedInHeader user={user} />

      <div className="flex pt-16">
        {/* Sidebar - Desktop */}
        <div className="hidden lg:block w-80 fixed left-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <CourseSidebar />
        </div>

        {/* Sidebar - Mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-80 bg-white overflow-y-auto">
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-600 hover:text-gray-900 z-10"
              >
                <X size={24} />
              </button>
              <CourseSidebar />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-80">
          {/* Box de Localização */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden mr-4 p-2 bg-white/10 rounded-lg hover:bg-white/20"
                >
                  <Menu size={24} />
                </button>
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Info size={20} className="mr-2" />
                    <span className="text-sm font-medium text-blue-100">Você está em:</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    Módulo {chapterData.numero} - {chapterData.titulo}
                  </h1>
                </div>
              </div>
            </div>
          </div>

          {/* Barra de Performance */}
          <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#0072BC] to-[#005a9e] rounded-lg flex items-center justify-center mr-3">
                    <TrendingUp className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Progresso Total</p>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-1.5 mr-2">
                        <div className="bg-[#0072BC] h-1.5 rounded-full" style={{ width: '25%' }} />
                      </div>
                      <span className="text-sm font-bold text-gray-900">25%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B00] to-[#e55d00] rounded-lg flex items-center justify-center mr-3">
                    <Calendar className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Data da Prova</p>
                    <p className="text-sm font-bold text-gray-900">03/10/2025</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
                    <Award className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Capítulos Concluídos</p>
                    <p className="text-sm font-bold text-gray-900">3 de 12</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-5xl mx-auto">
              {/* Chapter Info Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
                <div className="mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{chapterData.subtitulo}</h2>
                  <p className="text-gray-700 leading-relaxed">{chapterData.descricao}</p>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {chapterData.tags.map((tag, index) => (
                    <span key={index} className="bg-blue-50 text-[#0072BC] px-4 py-2 rounded-full text-sm font-medium border border-blue-100">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center">
                    <Clock className="mr-2 text-[#0072BC]" size={18} />
                    <span className="font-medium">Tempo estimado: {chapterData.tempo}</span>
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="mr-2 text-[#0072BC]" size={18} />
                    <span className="font-medium">{chapterData.recursos} recursos disponíveis</span>
                  </div>
                </div>
              </div>

              {/* Resources Grid */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Recursos de Aprendizado</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Apostila */}
                  <a
                    href={chapterData.apostila.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-red-200 transition-all group"
                  >
                    <div className="flex items-start">
                      <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mr-4 shrink-0 group-hover:scale-110 transition-transform">
                        <FileText className="text-white" size={24} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-1 group-hover:text-red-600 transition-colors">
                          {chapterData.apostila.titulo}
                        </h4>
                        <p className="text-sm text-gray-600">PDF • {chapterData.apostila.tamanho}</p>
                      </div>
                      <ChevronRight className="text-gray-400 group-hover:text-red-600 transition-colors" size={20} />
                    </div>
                  </a>

                  {/* Vídeo */}
                  <a
                    href={chapterData.video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-200 transition-all group"
                  >
                    <div className="flex items-start">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#0072BC] to-[#005a9e] rounded-xl flex items-center justify-center mr-4 shrink-0 group-hover:scale-110 transition-transform">
                        <Video className="text-white" size={24} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-1 group-hover:text-[#0072BC] transition-colors">
                          {chapterData.video.titulo}
                        </h4>
                        <p className="text-sm text-gray-600">{chapterData.video.duracao}</p>
                      </div>
                      <ChevronRight className="text-gray-400 group-hover:text-[#0072BC] transition-colors" size={20} />
                    </div>
                  </a>

                  {/* Podcast */}
                  <a
                    href={chapterData.podcast.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-green-200 transition-all group"
                  >
                    <div className="flex items-start">
                      <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4 shrink-0 group-hover:scale-110 transition-transform">
                        <Headphones className="text-white" size={24} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                          {chapterData.podcast.titulo}
                        </h4>
                        <p className="text-sm text-gray-600">{chapterData.podcast.duracao}</p>
                      </div>
                      <ChevronRight className="text-gray-400 group-hover:text-green-600 transition-colors" size={20} />
                    </div>
                  </a>

                  {/* Quiz */}
                  <a
                    href={chapterData.quiz.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-purple-200 transition-all group"
                  >
                    <div className="flex items-start">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shrink-0 group-hover:scale-110 transition-transform">
                        <PenTool className="text-white" size={24} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                          {chapterData.quiz.titulo}
                        </h4>
                        <p className="text-sm text-gray-600">{chapterData.quiz.descricao}</p>
                      </div>
                      <ChevronRight className="text-gray-400 group-hover:text-purple-600 transition-colors" size={20} />
                    </div>
                  </a>
                </div>
              </div>

              {/* Dicas e Suporte */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <Info className="text-[#0072BC] mb-3" size={24} />
                  <h4 className="font-bold text-gray-900 mb-2">Dicas e Informações Úteis</h4>
                  <p className="text-sm text-gray-700">Guia rápido de referência para este módulo</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                  <MessageCircle className="text-[#FF6B00] mb-3" size={24} />
                  <h4 className="font-bold text-gray-900 mb-2">Fale com a Coordenação</h4>
                  <p className="text-sm text-gray-700">Suporte técnico e tire suas dúvidas</p>
                </div>
              </div>

              {/* Próximos Eventos */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Próximos Eventos</h3>
                <div className="space-y-4">
                  <div className="flex items-start p-4 bg-blue-50 rounded-xl border-l-4 border-[#0072BC]">
                    <Calendar className="text-[#0072BC] mr-4 shrink-0" size={24} />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">Webinar ao Vivo: Balanceamento Químico Avançado</h4>
                      <p className="text-sm text-gray-600 mb-2">10 de Julho, 2025 • 19:00</p>
                      <button className="text-[#0072BC] text-sm font-semibold hover:underline">
                        Adicionar ao calendário
                      </button>
                    </div>
                  </div>
                  <div className="flex items-start p-4 bg-orange-50 rounded-xl border-l-4 border-[#FF6B00]">
                    <Calendar className="text-[#FF6B00] mr-4 shrink-0" size={24} />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">Sessão de Dúvidas: Preparação para Avaliação</h4>
                      <p className="text-sm text-gray-600 mb-2">15 de Julho, 2025 • 18:30</p>
                      <button className="text-[#FF6B00] text-sm font-semibold hover:underline">
                        Adicionar ao calendário
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Certificação */}
              <div className="bg-gradient-to-br from-[#0072BC] via-[#005a9e] to-[#004a7c] text-white rounded-2xl p-6 sm:p-8 shadow-lg">
                <div className="flex items-start">
                  <Award className="mr-4 shrink-0" size={48} />
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">Certificação ANAPP</h3>
                    <h4 className="text-lg font-semibold mb-3">Técnico em Piscinas Certificado</h4>
                    <p className="text-sm text-blue-100 mb-4">A certificação mais reconhecida do Brasil</p>
                    <p className="text-sm mb-6 leading-relaxed">
                      Complete todos os 12 capítulos e realize a avaliação final para obter sua certificação oficial ANAPP como Técnico em Piscinas.
                    </p>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/20">
                      <p className="text-xs text-blue-100 mb-2">Data da Prova de Certificação</p>
                      <p className="text-xl font-bold">03 de Outubro, 2025</p>
                    </div>
                    <button className="bg-white text-[#0072BC] px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-md hover:shadow-lg">
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChapterView;