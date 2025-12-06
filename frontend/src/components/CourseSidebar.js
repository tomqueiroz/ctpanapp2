import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Lock, Circle } from 'lucide-react';

function CourseSidebar() {
  const { chapterId } = useParams();
  const currentChapter = chapterId ? parseInt(chapterId) : 1;

  const chapters = [
    { id: 1, titulo: "A Importância das Medidas e o Sistema Internacional", status: "completed" },
    { id: 2, titulo: "Contaminação", status: "completed" },
    { id: 3, titulo: "Descontaminação", status: "completed" },
    { id: 4, titulo: "Balanceamento", status: "in-progress" },
    { id: 5, titulo: "Testes químicos", status: "locked" },
    { id: 6, titulo: "Operação e Segurança", status: "locked" },
    { id: 7, titulo: "Manutenção Preventiva", status: "locked" },
    { id: 8, titulo: "Equipamentos Avançados", status: "locked" },
    { id: 9, titulo: "Tratamentos Especiais", status: "locked" },
    { id: 10, titulo: "Diagnóstico de Problemas", status: "locked" },
    { id: 11, titulo: "Gestão de Negócios", status: "locked" },
    { id: 12, titulo: "Tendências e Inovações", status: "locked" }
  ];

  const getStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle2 className="text-green-500" size={20} />;
    if (status === 'in-progress') return <Circle className="text-[#0072BC]" size={20} />;
    return <Lock className="text-gray-400" size={20} />;
  };

  const getStatusText = (status) => {
    if (status === 'completed') return 'Concluído';
    if (status === 'in-progress') return 'Em progresso';
    return 'Bloqueado';
  };

  const getStatusColor = (status) => {
    if (status === 'completed') return 'text-green-600';
    if (status === 'in-progress') return 'text-[#0072BC]';
    return 'text-gray-400';
  };

  return (
    <div className="bg-white h-full overflow-y-auto border-r border-gray-200">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Curso Técnico em Piscinas (CTP)</h2>
        <p className="text-sm text-gray-600 mb-6">Sua jornada para a certificação ANAPP</p>

        <div className="space-y-2">
          {chapters.map((chapter) => {
            const isActive = chapter.id === currentChapter;
            const isLocked = chapter.status === 'locked';
            
            return (
              <Link
                key={chapter.id}
                to={isLocked ? '#' : `/dashboard/chapter/${chapter.id}`}
                className={`block p-4 rounded-lg transition ${
                  isActive 
                    ? 'bg-[#0072BC] text-white' 
                    : isLocked 
                    ? 'bg-gray-50 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
                onClick={(e) => isLocked && e.preventDefault()}
              >
                <div className="flex items-start">
                  <div className="mr-3 mt-1">
                    {isActive ? (
                      getStatusIcon(chapter.status)
                    ) : (
                      <span className={`font-bold ${isActive ? 'text-white' : 'text-gray-500'}`}>
                        {chapter.id < 10 ? `0${chapter.id}` : chapter.id}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold">Capítulo {chapter.id < 10 ? `0${chapter.id}` : chapter.id}</span>
                      {!isActive && (
                        <span className={`text-xs ${getStatusColor(chapter.status)}`}>
                          {getStatusText(chapter.status)}
                        </span>
                      )}
                    </div>
                    <h3 className={`text-sm font-medium ${
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
      </div>
    </div>
  );
}

export default CourseSidebar;