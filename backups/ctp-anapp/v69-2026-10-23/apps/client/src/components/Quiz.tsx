import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, FileText, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { ROUTE_PATHS } from '@/lib/index';
import { toast } from 'sonner';

interface QuizQuestion {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

interface QuizData {
  id: string;
  title: string;
  description: string;
  passing_score: number;
  questions: QuizQuestion[];
}

export function Quiz() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [shuffledOptions, setShuffledOptions] = useState<Record<string, Array<{text: string; originalLetter: string}>>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      
      const { data: quizData, error: quizError } = await supabase.rpc(
        'lms_get_quiz',
        { p_quiz_id: quizId },
      );
      if (quizError) throw quizError;
      if (!quizData) throw new Error('Quiz não encontrado');

      const questionsData = (quizData.questions ?? []) as QuizQuestion[];

      const shuffledQuestions = [...questionsData];

      // Embaralhar opções: armazenar texto + letra original juntos (evita re-embaralhar no render)
      const optionsMap: Record<string, Array<{text: string; originalLetter: string}>> = {};
      shuffledQuestions.forEach((q) => {
        const pairs = [
          { text: q.option_a, originalLetter: 'A' },
          { text: q.option_b, originalLetter: 'B' },
          { text: q.option_c, originalLetter: 'C' },
          { text: q.option_d, originalLetter: 'D' },
        ];
        optionsMap[q.id] = pairs.sort(() => Math.random() - 0.5);
      });

      setShuffledOptions(optionsMap);
      setQuiz({
        ...quizData,
        questions: shuffledQuestions,
      });
    } catch (error) {
      console.error('Error loading quiz:', error);
      toast.error('Erro ao carregar o quiz');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      setShowInstructions(false);
      toast.success('Quiz iniciado! Boa sorte!');
    } catch (error) {
      console.error('Error starting quiz:', error);
      toast.error('Erro ao iniciar o quiz');
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;

    // Verificar se todas as questões foram respondidas
    const unansweredQuestions = quiz.questions.filter(
      (q) => !answers[q.id]
    );

    if (unansweredQuestions.length > 0) {
      toast.error(
        `Você ainda tem ${unansweredQuestions.length} questão(ões) sem resposta. Por favor, responda todas antes de finalizar.`
      );
      return;
    }

    try {
      setSubmitting(true);
      const { data: result, error } = await supabase.rpc('lms_submit_quiz', {
        p_quiz_id: quiz.id,
        p_answers: answers,
      });
      if (error) throw error;
      if (!result?.attempt_id) throw new Error('Resultado do quiz inválido');

      toast.success('Quiz finalizado!');
      navigate(`/dashboard/quiz/${quizId}/result/${result.attempt_id}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Erro ao finalizar o quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Quiz não encontrado.</AlertDescription>
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
            <CardTitle className="text-2xl">{quiz.title}</CardTitle>
            <CardDescription>{quiz.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informações do Quiz
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• Total de questões: {quiz.questions.length}</li>
                <li>• Nota mínima para aprovação: <strong>{quiz.passing_score}%</strong></li>
                <li>• Tipo: Múltipla escolha (4 alternativas por questão)</li>
                <li>• <strong>Você pode refazer o quiz quantas vezes quiser</strong></li>
                <li>• <strong>Sempre será registrada a maior nota obtida</strong></li>
                <li>• As questões e alternativas aparecem em ordem aleatória a cada tentativa</li>
                <li>• Você só saberá sua nota <strong>após concluir o quiz</strong></li>
                <li>• Se obtiver nota abaixo de {quiz.passing_score}%, refaça o quiz (com ordem diferente)</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Capítulo
              </Button>
              <Button onClick={startQuiz} size="lg">
                <CheckCircle className="mr-2 h-5 w-5" />
                Iniciar Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  // Opções já embaralhadas com letra original mapeada (não re-embaralha ao clicar)
  const displayLabels = ['A', 'B', 'C', 'D'];
  const storedOptions = shuffledOptions[currentQuestion.id] || [
    { text: currentQuestion.option_a, originalLetter: 'A' },
    { text: currentQuestion.option_b, originalLetter: 'B' },
    { text: currentQuestion.option_c, originalLetter: 'C' },
    { text: currentQuestion.option_d, originalLetter: 'D' },
  ];
  const options = storedOptions.map((opt, idx) => ({
    label: displayLabels[idx],
    text: opt.text,
    originalLetter: opt.originalLetter
  }));

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header com progresso */}
      <div className="mb-6 space-y-4">
        <h1 className="text-2xl font-bold">{quiz.title}</h1>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              Questão {currentQuestionIndex + 1} de {quiz.questions.length}
            </span>
            <span>
              Respondidas: {answeredCount} / {quiz.questions.length}
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
            value={answers[currentQuestion.id]}
            onValueChange={(value) =>
              handleAnswerChange(currentQuestion.id, value)
            }
          >
{options.map((option, idx) => (
              <div
                key={`${currentQuestion.id}-${option.label}-${idx}`}
                className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <RadioGroupItem
                  value={option.originalLetter}
                  id={`${currentQuestion.id}-option-${option.label}`}
                />
                <Label
                  htmlFor={`${currentQuestion.id}-option-${option.label}`}
                  className="flex-1 cursor-pointer flex items-center gap-3"
                >
                  <span className="font-bold text-lg min-w-[32px] text-primary">{option.label})</span>
                  <span>{option.text}</span>
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
              {currentQuestionIndex === quiz.questions.length - 1 ? (
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={submitting || answeredCount < quiz.questions.length}
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
                      Finalizar Quiz
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
            {quiz.questions.map((question, index) => (
              <button
                key={question.id}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`
                  aspect-square rounded-md text-sm font-medium transition-colors
                  ${
                    index === currentQuestionIndex
                      ? 'bg-primary text-primary-foreground'
                      : answers[question.id]
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
