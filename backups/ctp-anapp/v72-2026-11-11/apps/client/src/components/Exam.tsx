import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Clock, FileText, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { ROUTE_PATHS, ExamWithQuestions, getExamResultPath } from '@/lib/index';
import { toast } from 'sonner';
import { getDisplayOptions } from '@/lib/exam-options';
import { createSingleFlight } from '@/lib/single-flight';

export function Exam() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<ExamWithQuestions | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [shuffledOptionsMap, setShuffledOptionsMap] = useState<Record<string, Array<{ option: string; originalIndex: number }>>>({});
  const [examStarted, setExamStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const submissionGate = useRef(createSingleFlight());
  const submitLatest = useRef<() => Promise<void>>(async () => {});
  const expiryHandled = useRef(false);

  useEffect(() => {
    let cancelled = false;
    void loadExam(() => cancelled);
    return () => { cancelled = true; };
  }, [examId]);

  useEffect(() => {
    if (examStarted && timeRemaining !== null && !showInstructions) {
      const timer = setInterval(() => {
        // State updaters must be pure: React may invoke them more than once.
        setTimeRemaining(prev => prev === null ? null : Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [examStarted, showInstructions, timeRemaining === null]);

  useEffect(() => {
    if (timeRemaining === 0 && examStarted && !expiryHandled.current) {
      expiryHandled.current = true;
      void submitLatest.current();
    }
  }, [timeRemaining, examStarted]);

  const loadExam = async (isCancelled: () => boolean) => {
    try {
      setLoading(true);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setExamStarted(false);
      setShowInstructions(true);
      setTimeRemaining(null);
      expiryHandled.current = false;
      
      const { data: examData, error: examError } = await supabase.rpc(
        'lms_get_exam_v2',
        { p_exam_id: examId },
      );
      if (isCancelled()) return;
      if (examError) throw examError;
      if (!examData) throw new Error('Prova não encontrada');

      const shuffledQuestions = (examData.questions ?? []) as ExamWithQuestions['questions'];
      if (shuffledQuestions.length !== 10) throw new Error('Prova indisponível. Tente novamente.');

      // Preserve the server's randomized delivery and original-index mapping.
      const optionsMap: Record<string, Array<{ option: string; originalIndex: number }>> = {};
      shuffledQuestions.forEach((q) => {
        optionsMap[q.id] = getDisplayOptions(q);
      });
      setShuffledOptionsMap(optionsMap);

      setExam({
        ...examData,
        questions: shuffledQuestions,
      });

      // Configurar tempo limite se houver
      if (examData.time_limit_minutes) {
        setTimeRemaining(examData.time_limit_minutes * 60);
      }
    } catch (error) {
      if (isCancelled()) return;
      setExam(null);
      console.error('Error loading exam:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao carregar a prova');
    } finally {
      if (!isCancelled()) setLoading(false);
    }
  };

  const startExam = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      setExamStarted(true);
      setShowInstructions(false);
      toast.success('Prova iniciada! Boa sorte!');
    } catch (error) {
      console.error('Error starting exam:', error);
      toast.error('Erro ao iniciar a prova');
    }
  };

  const handleAnswerChange = (questionId: string, answerIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (exam && currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmitExam = async () => {
    if (!exam || !examStarted || submitting) return;

    // Verificar se todas as questões foram respondidas
    const unansweredQuestions = exam.questions.filter(
      (q) => answers[q.id] === undefined
    );

    if (unansweredQuestions.length > 0) {
      toast.error(
        `Você ainda tem ${unansweredQuestions.length} questão(ões) sem resposta. Por favor, responda todas antes de finalizar.`
      );
      return;
    }

    // React state alone does not guard two clicks in the same event cycle.
    if (!submissionGate.current.tryAcquire()) return;
    try {
      setSubmitting(true);

      const { error } = await supabase.rpc('lms_submit_exam', {
        p_exam_id: exam.id,
        p_answers: answers,
      });

      if (error) throw error;

      toast.success('Prova finalizada!');
      navigate(getExamResultPath(exam.id));
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast.error('Erro ao finalizar a prova');
    } finally {
      submissionGate.current.release();
      setSubmitting(false);
    }
  };

  useEffect(() => {
    submitLatest.current = handleSubmitExam;
  });

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando prova...</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Prova não encontrada.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (showInstructions) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Botões de Voltar */}
        <div className="flex gap-3 mb-6">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Capítulo
          </Button>
          <Button variant="ghost" onClick={() => navigate(ROUTE_PATHS.DASHBOARD)}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Painel Geral
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{exam.title}</CardTitle>
            <CardDescription>{exam.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informações da Prova
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• Total de questões: {exam.questions.length}</li>
                <li>• Nota mínima para aprovação: <strong>{exam.passing_score}%</strong></li>
                {exam.time_limit_minutes && (
                  <li>• Tempo limite: {exam.time_limit_minutes} minutos</li>
                )}
                <li>• Tipo: Múltipla escolha (5 alternativas por questão)</li>
                <li>• <strong>Você só saberá sua nota após concluir a prova</strong></li>
                <li>• <strong>Você pode refazer a prova quantas vezes quiser</strong></li>
                <li>• <strong>Sempre será registrada a maior nota obtida</strong> no boletim</li>
                <li>• Se obtiver nota abaixo de {exam.passing_score}%, deverá refazer a prova (com ordem diferente de perguntas e respostas)</li>
                <li>• As questões e alternativas aparecem em ordem aleatória a cada tentativa</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Capítulo
              </Button>
              <Button onClick={startExam} size="lg">
                <CheckCircle className="mr-2 h-5 w-5" />
                Iniciar Prova
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  // Usar opções já embaralhadas no carregamento (não re-embaralha ao clicar)
  const shuffledOptions = shuffledOptionsMap[currentQuestion.id] || currentQuestion.options.map((option: string, index: number) => ({ option, originalIndex: index }));

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header com progresso e tempo */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{exam.title}</h1>
          {timeRemaining !== null && (
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Clock className="h-5 w-5" />
              <span className={timeRemaining < 300 ? 'text-destructive' : ''}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              Questão {currentQuestionIndex + 1} de {exam.questions.length}
            </span>
            <span>
              Respondidas: {answeredCount} / {exam.questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Questão atual */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {currentQuestionIndex + 1}. {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
<RadioGroup
            key={`radio-${currentQuestion.id}-${currentQuestionIndex}`}
            value={answers[currentQuestion.id]?.toString()}
            onValueChange={(value) =>
              handleAnswerChange(currentQuestion.id, parseInt(value))
            }
          >
{shuffledOptions.map(({ option, originalIndex }, displayIndex) => (
              <div
                key={`${currentQuestion.id}-${displayIndex}`}
                className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <RadioGroupItem
                  value={originalIndex.toString()}
                  id={`${currentQuestion.id}-option-${displayIndex}`}
                />
                <Label
                  htmlFor={`${currentQuestion.id}-option-${displayIndex}`}
                  className="flex-1 cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {/* Navegação */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)} title="Voltar ao capítulo">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Capítulo
              </Button>
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
            </div>

            <div className="flex gap-2">
              {currentQuestionIndex === exam.questions.length - 1 ? (
                <Button
                  onClick={handleSubmitExam}
                  disabled={submitting || answeredCount < exam.questions.length}
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Finalizando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Finalizar Prova
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Próxima
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mapa de questões */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">Mapa de Questões</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 gap-2">
            {exam.questions.map((question, index) => (
              <button
                key={question.id}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`
                  aspect-square rounded-md text-sm font-medium transition-colors
                  ${
                    index === currentQuestionIndex
                      ? 'bg-primary text-primary-foreground'
                      : answers[question.id] !== undefined
                      ? 'bg-green-500 text-white'
                      : 'bg-muted hover:bg-muted/80'
                  }
                `}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
