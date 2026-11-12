import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, ClipboardCheck, AlertCircle, Trophy, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface QuizTabProps {
  chapterId: number;
}

export function QuizTab({ chapterId }: QuizTabProps) {
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<any>(null);
  const [bestScore, setBestScore] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuizData();
  }, [chapterId]);

  const loadQuizData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar quiz do capítulo
      const { data: chapterData } = await supabase
        .from('chapters')
        .select('id')
        .eq('chapter_number', chapterId)
        .single();

      if (!chapterData) return;

      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('chapter_id', chapterData.id)
        .single();

      if (quizError) {
        console.error('Quiz not found:', quizError);
        return;
      }

      setQuiz(quizData);

      // Buscar melhor nota do usuário
      const { data: scoreData } = await supabase
        .from('user_quiz_scores')
        .select('*')
        .eq('user_id', user.id)
        .eq('quiz_id', quizData.id)
        .maybeSingle();

      setBestScore(scoreData);
    } catch (error) {
      console.error('Error loading quiz data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    if (!quiz) return;
    navigate(`/dashboard/quiz/${quiz.id}`);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Carregando quiz...</p>
        </CardContent>
      </Card>
    );
  }

  if (!quiz) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nenhum quiz disponível para este capítulo.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quiz Info */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <ClipboardCheck className="w-6 h-6 text-[#0072BC]" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{quiz.title}</h3>
              <p className="text-gray-600 mb-4">{quiz.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Nota mínima:</span>
                  <span className="ml-2 font-semibold text-gray-900">{quiz.passing_score}%</span>
                </div>
                {quiz.time_limit_minutes && (
                  <div>
                    <span className="text-gray-500">Tempo limite:</span>
                    <span className="ml-2 font-semibold text-gray-900">{quiz.time_limit_minutes} min</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Score */}
      {bestScore && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Trophy className="w-10 h-10 text-green-600" />
              <div>
                <h4 className="font-bold text-gray-900">Melhor Pontuação</h4>
                <p className="text-2xl font-bold text-green-600">{bestScore.best_score.toFixed(1)}%</p>
                <p className="text-sm text-gray-600">{bestScore.attempts_count} tentativa(s)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Start Button */}
      <Button
        onClick={handleStartQuiz}
        className="w-full bg-[#0072BC] hover:bg-[#005a9e] text-white py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        <ClipboardCheck className="w-5 h-5 mr-2" />
        {bestScore ? 'Tentar Novamente' : 'Iniciar Quiz'}
      </Button>

      {/* Info Alert */}
      <Alert>
        <AlertDescription>
          <strong>Dica:</strong> Este é um quiz de treino. Você pode fazê-lo quantas vezes quiser para praticar!
        </AlertDescription>
      </Alert>
    </div>
  );
}
