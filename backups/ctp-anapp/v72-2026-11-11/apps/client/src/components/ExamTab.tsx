import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, ClipboardCheck, AlertCircle, Trophy, TrendingUp, Lock } from 'lucide-react';
import { getExamPath } from '@/lib/index';
import { COURSE_PASSING_SCORE_PERCENT } from '@/lib/course-requirements';
import { toast } from 'sonner';

interface ExamTabProps {
  chapterId: number;
}

export function ExamTab({ chapterId }: ExamTabProps) {
  const navigate = useNavigate();
  const [exam, setExam] = useState<any>(null);
  const [bestScore, setBestScore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [canTakeExam, setCanTakeExam] = useState(false);

  useEffect(() => {
    loadExamData();
  }, [chapterId]);

  const loadExamData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar prova do capítulo
      const { data: chapterData } = await supabase
        .from('chapters')
        .select('id')
        .eq('chapter_number', chapterId)
        .single();

      if (!chapterData) return;

      const { data: examData, error: examError } = await supabase
        .from('exams')
        .select('*')
        .eq('chapter_id', chapterData.id)
        .single();

      if (examError) {
        console.error('Exam not found:', examError);
        return;
      }

      setExam(examData);

      // Buscar melhor nota do usuário
      const { data: scoreData } = await supabase
        .from('user_exam_scores')
        .select('*')
        .eq('user_id', user.id)
        .eq('exam_id', examData.id)
        .maybeSingle();

      const { data: accessData, error: accessError } = await supabase.rpc(
        'lms_exam_access_status',
        { p_exam_id: examData.id },
      );
      if (accessError) throw accessError;

      const accessStatus =
        accessData && typeof accessData === 'object'
          ? accessData as {
              can_take_exam?: boolean;
              best_score?: number | null;
              attempts_count?: number;
              is_approved?: boolean;
              historically_approved?: boolean;
            }
          : {};

      setBestScore(
        scoreData
          ? {
              ...scoreData,
              best_score: accessStatus.best_score ?? scoreData.best_score,
              attempts_count:
                accessStatus.attempts_count ?? scoreData.attempts_count,
              is_approved: accessStatus.is_approved,
              historically_approved:
                accessStatus.historically_approved,
            }
          : null,
      );
      setCanTakeExam(Boolean(accessStatus.can_take_exam));
      if (chapterId === 1 && accessStatus.can_take_exam === undefined) {
        setCanTakeExam(true);
      }
    } catch (error) {
      console.error('Error loading exam data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = () => {
    if (!exam) return;
    navigate(getExamPath(exam.id));
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Carregando prova...</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="text-center py-12">
        <ClipboardCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Prova ainda não disponível para este capítulo</p>
      </div>
    );
  }

  if (!canTakeExam) {
    return (
      <Alert className="border-amber-500 bg-amber-500/10">
        <Lock className="h-5 w-5 text-amber-500" />
        <AlertDescription>
          <strong>Prova bloqueada</strong>
          <p className="mt-2">
            Você precisa ser aprovado na prova do capítulo anterior (nota ≥ 70%) para desbloquear esta prova.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            <strong>Observação:</strong> Você pode acessar e estudar todos os capítulos livremente. Apenas as provas são liberadas sequencialmente após aprovação.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  const isPassed = Boolean(
    bestScore &&
    (
      bestScore.is_approved ??
      bestScore.best_score >=
        (Number(exam.passing_score) || COURSE_PASSING_SCORE_PERCENT)
    ),
  );

  return (
    <div className="space-y-6">
      {/* Informações da prova */}
      <div className="p-4 bg-blue-50 border-l-4 border-[#0072BC] rounded">
        <h3 className="font-bold text-[#0072BC] mb-2 flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5" />
          Informações da Prova
        </h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Nota mínima para aprovação: <strong>{exam.passing_score}%</strong></li>
          {exam.time_limit_minutes && (
            <li>• Tempo limite: <strong>{exam.time_limit_minutes} minutos</strong></li>
          )}
          <li>• Você pode refazer a prova quantas vezes quiser para melhorar sua nota</li>
          <li>• <strong>Sempre será registrada a maior nota obtida</strong> no boletim</li>
          <li>• Se tirar nota mais baixa em nova tentativa, a nota anterior (mais alta) permanece válida</li>
          <li>• Leia as instruções completas antes de iniciar</li>
        </ul>
      </div>

      {/* Status da prova */}
      {bestScore ? (
        <Card className={`border-2 ${isPassed ? 'border-green-500' : 'border-amber-500'}`}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className={`rounded-full p-3 ${isPassed ? 'bg-green-500/10' : 'bg-amber-500/10'}`}>
                {isPassed ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : (
                  <TrendingUp className="h-8 w-8 text-amber-500" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2">
                  {isPassed
                    ? bestScore.historically_approved
                      ? 'Aprovação histórica preservada'
                      : 'Aprovado!'
                    : 'Ainda não aprovado'}
                </h3>
                {bestScore.historically_approved && (
                  <p className="mb-3 text-sm text-green-700">
                    Esta aprovação permanece válida para seu progresso. A nota mínima atual para novas aprovações é 70%.
                  </p>
                )}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Melhor nota:</span>
                    <span className={`text-2xl font-bold ${isPassed ? 'text-green-500' : 'text-amber-500'}`}>
                      {bestScore.best_score.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tentativas:</span>
                    <span className="font-semibold">{bestScore.attempts_count}</span>
                  </div>
                  {bestScore.last_attempt_at && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Última tentativa:</span>
                      <span>{new Date(bestScore.last_attempt_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <Button 
                onClick={handleStartExam} 
                className="w-full bg-[#0072BC] hover:bg-[#005a9e]"
                size="lg"
              >
                {isPassed ? (
                  <>
                    <Trophy className="mr-2 h-5 w-5" />
                    Refazer Prova para Melhorar Nota
                  </>
                ) : (
                  <>
                    <ClipboardCheck className="mr-2 h-5 w-5" />
                    Tentar Novamente
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <ClipboardCheck className="w-16 h-16 text-[#0072BC] mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Prova Disponível</h3>
            <p className="text-gray-600 mb-6">
              Você ainda não realizou esta prova. Clique no botão abaixo para iniciar.
            </p>
            <Button 
              onClick={handleStartExam} 
              className="bg-[#0072BC] hover:bg-[#005a9e]"
              size="lg"
            >
              <ClipboardCheck className="mr-2 h-5 w-5" />
              Iniciar Prova
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Certificação final */}
      {exam.is_final_certification && (
        <Alert className="border-amber-500 bg-amber-500/10">
          <Trophy className="h-5 w-5 text-amber-500" />
          <AlertDescription>
            <strong>Prova de Certificação CTP ANAPP</strong>
            <p className="mt-2">
              Esta é a prova final do curso. Após aprovação, você receberá sua certificação oficial!
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
