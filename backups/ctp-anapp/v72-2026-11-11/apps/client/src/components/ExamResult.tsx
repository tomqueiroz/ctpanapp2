import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, AlertCircle, RotateCcw, Home, Trophy, TrendingUp } from 'lucide-react';
import { ExamAttempt, Exam, ROUTE_PATHS, getExamPath } from '@/lib/index';
import { toast } from 'sonner';

export function ExamResult() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResult();
  }, [examId]);

  const loadResult = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar última tentativa do usuário
      const { data: attemptData, error: attemptError } = await supabase
        .from('exam_attempts')
        .select('*')
        .eq('exam_id', examId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (attemptError) throw attemptError;

      // Buscar dados da prova
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .select('*')
        .eq('id', examId)
        .single();

      if (examError) throw examError;

      setAttempt(attemptData);
      setExam(examData);
    } catch (error) {
      console.error('Error loading result:', error);
      toast.error('Erro ao carregar resultado');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    navigate(getExamPath(examId!));
  };

  const handleGoToDashboard = () => {
    navigate(ROUTE_PATHS.DASHBOARD);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando resultado...</p>
        </div>
      </div>
    );
  }

  if (!attempt || !exam) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Resultado não encontrado.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const isPassed = attempt.is_passed;
  const score = attempt.score || 0;
  const correctAnswers = attempt.correct_answers || 0;
  const totalQuestions = attempt.total_questions;
  const percentage = Math.round(score);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Resultado Principal */}
      <Card className={`mb-6 ${isPassed ? 'border-green-500' : 'border-destructive'}`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {isPassed ? (
              <div className="rounded-full bg-green-500/10 p-6">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
            ) : (
              <div className="rounded-full bg-destructive/10 p-6">
                <XCircle className="h-16 w-16 text-destructive" />
              </div>
            )}
          </div>
          <CardTitle className="text-3xl">
            {isPassed ? 'Parabéns! Você foi aprovado!' : 'Não foi dessa vez...'}
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            {exam.title}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pontuação */}
          <div className="text-center space-y-2">
            <div className="text-6xl font-bold">
              {percentage}%
            </div>
            <p className="text-muted-foreground">
              {correctAnswers} de {totalQuestions} questões corretas
            </p>
          </div>

          {/* Barra de progresso */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Sua pontuação</span>
              <span className="font-semibold">{percentage}%</span>
            </div>
            <Progress 
              value={percentage} 
              className={`h-3 ${isPassed ? '[&>div]:bg-green-500' : '[&>div]:bg-destructive'}`}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Nota mínima: {exam.passing_score}%</span>
              <span className={isPassed ? 'text-green-500 font-semibold' : 'text-destructive font-semibold'}>
                {isPassed ? `+${percentage - exam.passing_score}%` : `${percentage - exam.passing_score}%`}
              </span>
            </div>
          </div>

          {/* Mensagem de feedback */}
          <Alert className={isPassed ? 'border-green-500 bg-green-500/10' : 'border-destructive bg-destructive/10'}>
            {isPassed ? (
              <Trophy className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingUp className="h-4 w-4 text-destructive" />
            )}
            <AlertDescription>
              {isPassed ? (
                <>
                  <strong>Excelente trabalho!</strong> Você atingiu a nota mínima de {exam.passing_score}% e está aprovado nesta prova.
                  {exam.is_final_certification && (
                    <span className="block mt-2">
                      🎓 <strong>Certificação CTP ANAPP conquistada!</strong> Parabéns pela sua dedicação e esforço!
                    </span>
                  )}
                </>
              ) : (
                <>
                  <strong>Continue tentando!</strong> Você precisa de pelo menos {exam.passing_score}% para ser aprovado. 
                  Revise o conteúdo do capítulo e tente novamente. Você pode refazer a prova quantas vezes quiser!
                </>
              )}
            </AlertDescription>
          </Alert>

          {/* Estatísticas adicionais */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-500">{correctAnswers}</div>
              <div className="text-sm text-muted-foreground">Acertos</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-destructive">{totalQuestions - correctAnswers}</div>
              <div className="text-sm text-muted-foreground">Erros</div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {!isPassed && (
              <Button onClick={handleRetry} className="flex-1" size="lg">
                <RotateCcw className="mr-2 h-5 w-5" />
                Refazer Prova
              </Button>
            )}
            <Button 
              onClick={handleGoToDashboard} 
              variant={isPassed ? "default" : "outline"}
              className="flex-1" 
              size="lg"
            >
              <Home className="mr-2 h-5 w-5" />
              {isPassed ? 'Continuar Estudos' : 'Voltar ao Dashboard'}
            </Button>
          </div>

          {/* Nota sobre refazer */}
          {isPassed && (
            <div className="text-center text-sm text-muted-foreground pt-4 border-t">
              <p>
                Você pode refazer esta prova para melhorar sua nota. 
                A melhor pontuação será considerada para a média final.
              </p>
              <Button 
                onClick={handleRetry} 
                variant="ghost" 
                size="sm"
                className="mt-2"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Refazer para melhorar a nota
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações importantes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações Importantes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <p>
              Sua melhor nota será registrada no histórico e considerada para a média final antes da certificação.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <p>
              Você pode refazer esta prova quantas vezes quiser para melhorar sua pontuação.
            </p>
          </div>
          {!exam.is_final_certification && (
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <p>
                O próximo capítulo será desbloqueado automaticamente após a aprovação nesta prova.
              </p>
            </div>
          )}
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-amber-600 dark:text-amber-500">
              <strong>Lembre-se:</strong> É terminantemente proibido compartilhar perguntas e/ou respostas das provas com terceiros.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
