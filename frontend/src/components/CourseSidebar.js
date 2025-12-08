import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Lock, PlayCircle } from 'lucide-react';

function CourseSidebar() {
  const { chapterId } = useParams();
  const currentChapter = chapterId ? parseInt(chapterId) : 1;

  const chapters = [
    { id: 1, numero: 'I', titulo: 'Cálculos', status: 'completed', hasApostila: true },
    { id: 2, numero: 'II', titulo: 'Volume e Capacidade', status: 'locked' },
    { id: 3, numero: 'III', titulo: 'Desinfecção e Produtos Químicos', status: 'completed', hasApostila: true },
    { id: 4, numero: 'IV', titulo: 'Equilíbrio Químico da Água', status: 'completed', hasApostila: true },
    { id: 5, numero: 'V', titulo: 'Dosagem e Aplicação', status: 'locked' },
    { id: 6, numero: 'VI', titulo: 'Filtração e Circulação', status: 'locked' },
    { id: 7, numero: 'VII', titulo: 'Manutenção', status: 'locked' },
    { id: 8, numero: 'VIII', titulo: 'Segurança e Normas', status: 'locked' },
    { id: 9, numero: 'IX', titulo: 'Problemas e Soluções', status: 'locked' },
    { id: 10, numero: 'X', titulo: 'Atendimento ao Cliente', status: 'locked' },
    { id: 11, numero: 'XI', titulo: 'Sustentabilidade', status: 'locked' },
    { id: 12, numero: 'XII', titulo: 'Certificação Final', status: 'locked' }
  ];

  const getStatusIcon = (status, isActive) => {
    const iconClass = isActive ? 'text-white' : '';
    if (status === 'completed') return <CheckCircle2 className={`text-green-500 ${iconClass}`} size={20} />;
    if (status === 'in-progress') return <PlayCircle className={`text-[#FF6B00] ${iconClass}`} size={20} />;
    return <Lock className={`text-gray-400 ${iconClass}`} size={20} />;
  };

  const getStatusText = (status) => {
    if (status === 'completed') return 'Concluído';
    if (status === 'in-progress') return 'Em progresso';
    return 'Bloqueado';
  };

  const getStatusColor = (status) => {
    if (status === 'completed') return 'text-green-600';
    if (status === 'in-progress') return 'text-[#FF6B00]';
    return 'text-gray-400';
  };

  return (
    <div className="bg-white h-full overflow-y-auto border-r border-gray-200">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Curso Técnico em Piscinas</h2>
          <p className="text-xs text-gray-500">Certificação ANAPP</p>
          
          {/* Progresso resumido */}
          <div className="mt-4 bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progresso</span>
              <span className="font-semibold">25%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-[#0072BC] h-1.5 rounded-full" style={{ width: '25%' }} />
            </div>
          </div>
        </div>

        {/* Lista de Capítulos */}
        <div className="space-y-2">
          {chapters.map((chapter) => {
            const isActive = chapter.id === currentChapter;
            const isLocked = chapter.status === 'locked';
            
            return (
              <Link
                key={chapter.id}
                to={isLocked ? '#' : `/dashboard/chapter/${chapter.id}`}
                className={`block p-4 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#0072BC] to-[#005a9e] text-white shadow-md' 
                    : isLocked 
                    ? 'bg-gray-50 text-gray-400 cursor-not-allowed' 
                    : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-[#0072BC] hover:shadow-sm'
                }`}
                onClick={(e) => isLocked && e.preventDefault()}
              >
                <div className="flex items-start">
                  <div className="mr-3 mt-0.5">
                    {getStatusIcon(chapter.status, isActive)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold ${
                        isActive ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        Módulo {chapter.numero}
                      </span>
                      {!isActive && (
                        <span className={`text-xs font-medium ${getStatusColor(chapter.status)}`}>
                          {getStatusText(chapter.status)}
                        </span>
                      )}
                    </div>
                    <h3 className={`text-sm font-semibold leading-tight ${
                      isActive ? 'text-white' : isLocked ? 'text-gray-400' : 'text-gray-900'
                    }`}>
                      {chapter.titulo}
                    </h3>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-600 mb-1">Data da Prova</p>
            <p className="text-sm font-bold text-[#0072BC]">03 de Outubro, 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseSidebar;