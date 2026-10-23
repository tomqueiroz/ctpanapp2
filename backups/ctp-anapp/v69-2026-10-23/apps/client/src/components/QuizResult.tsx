import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Trophy, RotateCcw, Home, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface QuizQuestion {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  explanation: string;
}

interface QuizAttemptData {
  id: string;
  quiz_id: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  answers: Record<string, string>;
}

interface QuizSummary {
  id: string;
  title: string;
  description?: string | null;
  passing_score: number;
}

interface QuizResultData {
  attempt: QuizAttemptData;
  quiz: QuizSummary;
  questions: QuizQuestion[];
}

export function QuizResult() {
  const { quizId, attemptId } = useParams<{ quizId: string; attemptId: string }>();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<QuizAttemptData | null>(null);
  const [quiz, setQuiz] = useState<QuizSummary | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [attemptId]);

  const loadResults = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase.rpc('lms_get_quiz_result', {
        p_attempt_id: attemptId,
      });
      if (error) throw error;
      if (!data) throw new Error('Resultado não encontrado');

      const result = data as QuizResultData;
      if (result.quiz.id !== quizId) {
        throw new Error('O resultado não corresponde ao quiz informado');
      }

      setAttempt(result.attempt);
      setQuiz(result.quiz);
      setQuestions(result.questions);
    } catch (error) {
      console.error('Error loading results:', error);
      toast.error('Erro ao carregar resultados');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    navigate(`/dashboard/quiz/${quizId}`);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando resultados...</p>
        </div>
      </div>
    );
  }

  if (!attempt || !quiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Resultados não encontrados.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const isPassed = attempt.score >= quiz.passing_score;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Resultado geral */}
      <Card className={`mb-6 ${isPassed ? 'border-green-500' : 'border-red-500'}`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {isPassed ? (
              <Trophy className="w-16 h-16 text-green-500" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-3xl">
            {isPassed ? 'Parabéns!' : 'Continue Praticando!'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-5xl font-bold mb-2">{attempt.score.toFixed(1)}%</p>
            <p className="text-muted-foreground">
              {attempt.correct_answers} de {attempt.total_questions} questões corretas
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Acertos</p>
              <p className="text-2xl font-bold text-green-600">{attempt.correct_answers}</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Erros</p>
              <p className="text-2xl font-bold text-red-600">
                {attempt.total_questions - attempt.correct_answers}
              </p>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={handleRetry} className="flex-1" variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              Tentar Novamente
            </Button>
            <Button onClick={handleBackToDashboard} className="flex-1">
              <Home className="mr-2 h-4 w-4" />
Voltar ao Painel Geral
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Revisão das questões */}
      <Card>
        <CardHeader>
          <CardTitle>Revisão das Questões</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((question, index) => {
            const userAnswer = attempt.answers[question.id];
            const isCorrect = userAnswer === question.correct_option;

            const options = [
              { label: 'A', value: 'A', text: question.option_a },
              { label: 'B', value: 'B', text: question.option_b },
              { label: 'C', value: 'C', text: question.option_c },
              { label: 'D', value: 'D', text: question.option_d },
            ];

            return (
              <div
                key={question.id}
                className={`p-4 rounded-lg border-2 ${
                  isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  {isCorrect ? (
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold mb-2">
                      {index + 1}. {question.question}
                    </p>

                    <div className="space-y-2 mb-3">
                      {options.map((option) => {
                        const isUserAnswer = userAnswer === option.value;
                        const isCorrectAnswer = question.correct_option === option.value;

                        return (
                          <div
                            key={option.value}
                            className={`p-2 rounded ${
                              isCorrectAnswer
                                ? 'bg-green-200 font-semibold'
                                : isUserAnswer
                                ? 'bg-red-200'
                                : 'bg-white'
                            }`}
                          >
                            <span className="font-semibold mr-2">{option.label})</span>
                            {option.text}
                            {isCorrectAnswer && (
                              <span className="ml-2 text-green-700">(Correta)</span>
                            )}
                            {isUserAnswer && !isCorrectAnswer && (
                              <span className="ml-2 text-red-700">(Sua resposta)</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {question.explanation && (
                      <div className="bg-blue-50 p-3 rounded border border-blue-200">
                        <p className="text-sm">
                          <strong>Explicação:</strong> {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
