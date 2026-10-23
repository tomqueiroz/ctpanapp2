import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

interface DigitalProgressProps {
  percentage: number;
  videoCompleted?: boolean;
  apostilaCompleted?: boolean;
  podcastCompleted?: boolean;
  quizCompleted?: boolean;
  materialsCompleted?: boolean;
  showQuiz?: boolean;
}

export const DigitalProgress: React.FC<DigitalProgressProps> = ({ 
  percentage,
  videoCompleted = false,
  apostilaCompleted = false,
  podcastCompleted = false,
  quizCompleted = false,
  materialsCompleted = false,
  showQuiz = true,
}) => {
  const items = [
    { label: 'Videoaula', completed: videoCompleted },
    { label: 'Apostila', completed: apostilaCompleted },
    { label: 'Podcast', completed: podcastCompleted },
    ...(showQuiz ? [{ label: 'Quiz', completed: quizCompleted }] : []),
    { label: 'Materiais', completed: materialsCompleted },
  ];

  return (
    <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C00] text-white px-4 py-3 rounded-lg shadow-lg">
      <div className="flex items-center justify-between gap-4">
        {/* Percentual - Reduzido 30% */}
        <div className="flex items-center gap-2">
          <div className="text-3xl font-bold tabular-nums">{percentage}%</div>
          <div className="text-[10px] font-medium uppercase opacity-90 leading-tight">
            Progresso<br/>do Capítulo
          </div>
        </div>

        {/* Itens - Reduzidos 30% */}
        <div className="flex flex-col gap-0.5">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-1.5">
              {item.completed ? (
                <CheckCircle className="w-3 h-3 text-white" />
              ) : (
                <Circle className="w-3 h-3 text-white/50" />
              )}
              <span className={`text-[10px] ${item.completed ? 'font-semibold' : 'opacity-70'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
