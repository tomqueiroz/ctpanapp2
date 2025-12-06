import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CourseSidebar from '../components/CourseSidebar';
import { FileText, Video, Headphones, PenTool, Clock, BookOpen, Calendar, Award, ChevronRight, Menu, X } from 'lucide-react';

function ChapterView() {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentChapter = chapterId ? parseInt(chapterId) : 1;

  // Dados dos capítulos
  const chaptersData = {
    1: {
      numero: "I",
      titulo: "Conhecendo o Sistema Internacional e as Principais Medidas para o Piscineiro de Sucesso",
      descricao: "Aprenda as diferentes medidas fundamentais que são essenciais para que o piscineiro tenha sucesso em todos os seus clientes. Esta base de conhecimento deve vir antes de se conhecer aos princípios fundamentais do balanceamento químico da água da piscina, incluindo pH, alcalinidade, dureza cálcica e outros parâmetros essenciais.",
      tags: ["Química da Água", "Pesos e Medidas", "Sistema de Medidas (SI)", "pH, Alcalinidade, Dureza Cálcica"],
      tempo: "4 horas",
      recursos: 6,
      apostila: {
        titulo: "Apostila Completa",
        tamanho: "6MB",
        url: "https://heyzine.com/flip-book/6b5e7efd0f.html"
      },
      video: {
        titulo: "Vídeo de Introdução",
        duracao: "2 minutos",
        url: "https://youtu.be/PuLMcD3h2h0"
      },
      podcast: {
        titulo: "Podcast do Capítulo",
        duracao: "12 minutos",
        url: "https://creators.spotify.com/pod/show/wellington-queiroz91/episodes/Captulo-1-A-Importncia-das-Medidas-e-o-Sistema-Universal-e356ehd"
      },
      quiz: {
        titulo: "Pratique para Lembrar",
        descricao: "Exercícios práticos",
        url: "https://create.kahoot.it/share/ctp-cap-1-exercicio-1/d3c28c39-0fed-46a7-9fa0-ea8978d13406"
      }
    },
    // Adicionar dados para outros capítulos conforme necessário
  };

  const chapterData = chaptersData[currentChapter] || chaptersData[1];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block w-80 fixed left-0 top-0 h-full">
        <CourseSidebar />
      </div>

      {/* Sidebar - Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-80 bg-white">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-600 hover:text-gray-900"
            >
              <X size={24} />
            </button>
            <CourseSidebar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-80">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden mr-4 p-2 text-gray-600 hover:text-gray-900"
                >
                  <Menu size={24} />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Capítulo {chapterData.numero}</h1>
                  <p className="text-sm text-gray-600">{chapterData.titulo}</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-[#0072BC] hover:underline"
              >
                Voltar ao Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gradient-to-br from-[#0072BC] to-[#005a9e] text-white px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-blue-100 mb-1">Progresso Total</p>
              <div className="flex items-center">
                <div className="flex-1 bg-white/20 rounded-full h-2 mr-3">
                  <div className="bg-white h-2 rounded-full" style={{ width: '25%' }} />
                </div>
                <span className="font-bold">25%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-blue-100 mb-1">Data da Prova</p>
              <p className="font-bold">03/10/2025</p>
            </div>
            <div>
              <p className="text-sm text-blue-100 mb-1">Capítulos Concluídos</p>
              <p className="font-bold">3 de 12</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-5xl mx-auto">
            {/* Chapter Info */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{chapterData.titulo}</h2>
              <p className="text-gray-700 mb-6">{chapterData.descricao}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {chapterData.tags.map((tag, index) => (
                  <span key={index} className="bg-blue-50 text-[#0072BC] px-3 py-1 rounded-full text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Clock className="mr-2" size={16} />
                <span className="mr-6">Tempo estimado: {chapterData.tempo}</span>
                <BookOpen className="mr-2" size={16} />
                <span>{chapterData.recursos} recursos disponíveis</span>
              </div>
            </div>

            {/* Resources */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Apostila */}
              <a
                href={chapterData.apostila.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition group"
              >
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4 shrink-0">
                    <FileText className="text-red-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1 group-hover:text-[#0072BC]">
                      {chapterData.apostila.titulo}
                    </h3>
                    <p className="text-sm text-gray-600">PDF • {chapterData.apostila.tamanho}</p>
                  </div>
                  <ChevronRight className="text-gray-400 group-hover:text-[#0072BC]" size={20} />
                </div>
              </a>

              {/* Vídeo */}
              <a
                href={chapterData.video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition group"
              >
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 shrink-0">
                    <Video className="text-[#0072BC]" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1 group-hover:text-[#0072BC]">
                      {chapterData.video.titulo}
                    </h3>
                    <p className="text-sm text-gray-600">{chapterData.video.duracao}</p>
                  </div>
                  <ChevronRight className="text-gray-400 group-hover:text-[#0072BC]" size={20} />
                </div>
              </a>

              {/* Podcast */}
              <a
                href={chapterData.podcast.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition group"
              >
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4 shrink-0">
                    <Headphones className="text-green-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1 group-hover:text-[#0072BC]">
                      {chapterData.podcast.titulo}
                    </h3>
                    <p className="text-sm text-gray-600">{chapterData.podcast.duracao}</p>
                  </div>
                  <ChevronRight className="text-gray-400 group-hover:text-[#0072BC]" size={20} />
                </div>
              </a>

              {/* Quiz */}
              <a
                href={chapterData.quiz.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition group"
              >
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4 shrink-0">
                    <PenTool className="text-purple-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1 group-hover:text-[#0072BC]">
                      {chapterData.quiz.titulo}
                    </h3>
                    <p className="text-sm text-gray-600">{chapterData.quiz.descricao}</p>
                  </div>
                  <ChevronRight className="text-gray-400 group-hover:text-[#0072BC]" size={20} />
                </div>
              </a>
            </div>

            {/* Próximos Eventos */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Próximos Eventos</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-[#0072BC] pl-4">
                  <h4 className="font-bold text-gray-900 mb-1">Webinar ao Vivo: Balanceamento Químico Avançado</h4>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="mr-2" size={16} />
                    10 de Julho, 2025 • 19:00
                  </div>
                  <button className="mt-2 text-[#0072BC] text-sm font-semibold hover:underline">
                    Adicionar ao calendário
                  </button>
                </div>
                <div className="border-l-4 border-[#FF6B00] pl-4">
                  <h4 className="font-bold text-gray-900 mb-1">Sessão de Dúvidas: Preparação para Avaliação</h4>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="mr-2" size={16} />
                    15 de Julho, 2025 • 18:30
                  </div>
                  <button className="mt-2 text-[#0072BC] text-sm font-semibold hover:underline">
                    Adicionar ao calendário
                  </button>
                </div>
              </div>
            </div>

            {/* Certificação */}
            <div className="bg-gradient-to-br from-[#0072BC] to-[#005a9e] text-white rounded-xl p-6">
              <div className="flex items-start">
                <Award className="mr-4 shrink-0" size={48} />
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Certificação ANAPP</h3>
                  <h4 className="font-semibold mb-2">Técnico em Piscinas Certificado</h4>
                  <p className="text-sm text-blue-100 mb-4">A certificação mais reconhecida do Brasil</p>
                  <p className="text-sm mb-4">
                    Complete todos os 12 capítulos e realize a avaliação final para obter sua certificação oficial ANAPP como Técnico em Piscinas.
                  </p>
                  <div className="bg-white/10 rounded-lg p-3 mb-4">
                    <p className="text-xs text-blue-100 mb-1">Data da Prova de Certificação</p>
                    <p className="font-bold">03 de Outubro, 2025</p>
                  </div>
                  <button className="bg-white text-[#0072BC] px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition">
                    Ver Detalhes
                  </button>
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
