import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { COURSE_PASSING_GRADE } from '@/lib/course-requirements';

interface QuizQuestion {
  id: string;
  question_text: string;
  options: { text: string; is_correct: boolean }[];
  explanation?: string;
  points: number;
}

interface QuizComponentProps {
  questions: QuizQuestion[];
  onComplete: (score: number, answers: any[]) => void;
  chapterTitle: string;
}

export function QuizComponent({ questions, onComplete, chapterTitle }: QuizComponentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleSelectAnswer = (questionIndex: number, optionIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: optionIndex,
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    let correctCount = 0;
    const answersWithResults = questions.map((q, idx) => {
      const selectedOption = selectedAnswers[idx];
      const isCorrect = selectedOption !== undefined && q.options[selectedOption]?.is_correct;
      if (isCorrect) correctCount++;

      return {
        question_id: q.id,
        selected_option: selectedOption,
        is_correct: isCorrect,
        correct_option: q.options.findIndex(opt => opt.is_correct),
      };
    });

    const score = (correctCount / questions.length) * 10;
    const passed = score >= COURSE_PASSING_GRADE;

    setResults({
      score,
      correctCount,
      totalQuestions: questions.length,
      passed,
      answers: answersWithResults,
    });
    setShowResults(true);
    onComplete(score, answersWithResults);
  };

  if (showResults && results) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            {results.passed ? (
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
            )}
            <h2 className="text-3xl font-bold mb-2">
              {results.passed ? 'Parabéns! Você foi aprovado!' : 'Não foi dessa vez...'}
            </h2>
            <p className="text-gray-600 mb-6">
              {results.passed
                ? 'Você atingiu a nota mínima e pode avançar para o próximo capítulo!'
                : 'Você precisa de nota mínima 7,0 para avançar. Revise o conteúdo e tente novamente!'}
            </p>

            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-[#0072BC]">{results.score.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Nota Final</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{results.correctCount}</div>
                <div className="text-sm text-gray-600">Acertos</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-gray-600">{results.totalQuestions}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Gabarito Comentado</h3>
            {questions.map((q, idx) => {
              const answer = results.answers[idx];
              const isCorrect = answer.is_correct;

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-l-4 ${
                    isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-2">
                        {idx + 1}. {q.question_text}
                      </p>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-700">
                          <strong>Sua resposta:</strong>{' '}
                          {answer.selected_option !== undefined
                            ? q.options[answer.selected_option]?.text
                            : 'Não respondida'}
                        </p>
                        {!isCorrect && (
                          <p className="text-green-700">
                            <strong>Resposta correta:</strong> {q.options[answer.correct_option]?.text}
                          </p>
                        )}
                        {q.explanation && (
                          <p className="text-gray-600 mt-2">
                            <AlertCircle className="w-4 h-4 inline mr-1" />
                            {q.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            {!results.passed && (
              <Button
                onClick={() => window.location.reload()}
                className="bg-[#0072BC] hover:bg-[#005a9e]"
              >
                Tentar Novamente
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Questão {currentQuestion + 1} de {questions.length}
            </span>
            <span className="text-sm font-medium text-[#0072BC]">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#0072BC] h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-6">{question.question_text}</h3>

        <div className="space-y-3 mb-8">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectAnswer(currentQuestion, idx)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedAnswers[currentQuestion] === idx
                  ? 'border-[#0072BC] bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswers[currentQuestion] === idx
                      ? 'border-[#0072BC] bg-[#0072BC]'
                      : 'border-gray-300'
                  }`}
                >
                  {selectedAnswers[currentQuestion] === idx && (
                    <div className="w-3 h-3 bg-white rounded-full" />
                  )}
                </div>
                <span className="text-gray-900">{option.text}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Anterior
          </Button>

          {currentQuestion === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={Object.keys(selectedAnswers).length !== questions.length}
              className="bg-[#0072BC] hover:bg-[#005a9e]"
            >
              Finalizar Prova
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={selectedAnswers[currentQuestion] === undefined}
              className="bg-[#0072BC] hover:bg-[#005a9e]"
            >
              Próxima
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
