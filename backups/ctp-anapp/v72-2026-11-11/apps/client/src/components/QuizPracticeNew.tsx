import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, RotateCcw, Trophy, Flame, Target, BookOpen } from 'lucide-react';

interface QuizQuestion {
  id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string; // 'A', 'B', 'C', 'D'
  explanation?: string;
}

interface QuizPracticeNewProps {
  questions: QuizQuestion[];
  chapterTitle: string;
}

export function QuizPracticeNew({ questions, chapterTitle }: QuizPracticeNewProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [points, setPoints] = useState(0);
  const [combo, setCombo] = useState(1);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [missedTopics, setMissedTopics] = useState<string[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [showBonus, setShowBonus] = useState(false);

  const handleAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === questions[currentQuestion].correct_option;
    
    if (isCorrect && !answeredQuestions.includes(currentQuestion)) {
      setScore(score + 1);
      
      // Gamification: Points and Combo
      const pointsEarned = 100 * combo;
      setPoints(points + pointsEarned);
      
      if (combo > 1) {
        setShowBonus(true);
        setTimeout(() => setShowBonus(false), 1500);
      }
      
      setCombo(combo + 1);
      setAnsweredQuestions([...answeredQuestions, currentQuestion]);
    } else if (!isCorrect && !answeredQuestions.includes(currentQuestion)) {
      // Reset combo on wrong answer
      setCombo(1);
      
      // Add topic to review list
      const topic = chapterTitle;
      if (!missedTopics.includes(topic)) {
        setMissedTopics([...missedTopics, topic]);
      }
      
      setAnsweredQuestions([...answeredQuestions, currentQuestion]);
    }

    setShowResult(true);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setPoints(0);
    setCombo(1);
    setAnsweredQuestions([]);
    setMissedTopics([]);
    setQuizFinished(false);
  };

  const getRank = () => {
    const percentage = score / questions.length;
    if (percentage === 1) return { title: "Piscineiro de Ouro 🥇", desc: "Campeão Olímpico! Tratamento perfeito.", color: "text-yellow-500" };
    if (percentage >= 0.8) return { title: "Medalha de Prata 🥈", desc: "Nadador de Elite! Quase perfeito.", color: "text-gray-400" };
    if (percentage >= 0.6) return { title: "Medalha de Bronze 🥉", desc: "Nadador Competitivo! Bom trabalho.", color: "text-amber-600" };
    if (percentage >= 0.4) return { title: "Nadador de Fim de Semana 🏊", desc: "Sabe nadar, mas precisa de mais treino.", color: "text-blue-500" };
    return { title: "Bóia de Braço 🛟", desc: "Cuidado para não afundar! Vamos revisar o material.", color: "text-red-500" };
  };

  if (questions.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Nenhuma questão de treino disponível para este capítulo.</p>
        </CardContent>
      </Card>
    );
  }

  if (quizFinished) {
    const rank = getRank();
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50">
        <CardContent className="p-8 text-center">
          <Trophy className={`w-20 h-20 mx-auto mb-4 ${rank.color}`} />
          <h2 className={`text-3xl font-bold mb-2 ${rank.color}`}>{rank.title}</h2>
          <p className="text-xl text-gray-700 mb-6">{rank.desc}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
              <Target className="w-8 h-8 text-[#0072BC] mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{score}/{questions.length}</div>
              <div className="text-sm text-gray-500">Acertos</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100">
              <Flame className="w-8 h-8 text-[#FF6B00] mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{points}</div>
              <div className="text-sm text-gray-500">Pontos Totais</div>
            </div>
          </div>

          {missedTopics.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 text-left mb-8 max-w-2xl mx-auto">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#0072BC]" />
                Tópicos para Revisão (CTP)
              </h3>
              <ul className="space-y-2">
                {missedTopics.map((topic, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="text-red-500 font-bold">•</span>
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button onClick={handleRestart} className="bg-[#0072BC] hover:bg-[#005a9e] text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
            <RotateCcw className="w-5 h-5 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQuestion];
  const options = [
    { letter: 'A', text: question.option_a },
    { letter: 'B', text: question.option_b },
    { letter: 'C', text: question.option_c },
    { letter: 'D', text: question.option_d },
  ];
  const isCorrect = selectedAnswer === question.correct_option;

  return (
    <div className="space-y-6">
      {/* Gamification Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-gray-500 block">Questão</span>
            <span className="font-bold text-lg text-[#0072BC]">{currentQuestion + 1}/{questions.length}</span>
          </div>
          <div className="h-10 w-px bg-gray-200"></div>
          <div className="text-sm">
            <span className="text-gray-500 block">Pontos</span>
            <span className="font-bold text-lg text-[#FF6B00]">{points}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {combo > 1 && (
            <div className={`flex items-center gap-1 bg-orange-100 text-[#FF6B00] px-3 py-1 rounded-full font-bold text-sm transition-all ${showBonus ? 'scale-110 shadow-md' : ''}`}>
              <Flame className="w-4 h-4" />
              {combo}x Combo!
            </div>
          )}
        </div>
      </div>

      {/* Question Card */}
      <Card className="border-0 shadow-lg relative overflow-hidden">
        {showBonus && (
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF6B00] to-yellow-400 animate-pulse"></div>
        )}
        <CardContent className="p-6 md:p-8">
          <div className="mb-6">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-6 leading-relaxed">
              {question.question}
            </h3>

            <RadioGroup
              value={selectedAnswer || ''}
              onValueChange={(value) => setSelectedAnswer(value)}
              disabled={showResult}
              className="space-y-3"
            >
              {options.map((option) => (
                <div
                  key={option.letter}
                  className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    showResult
                      ? option.letter === question.correct_option
                        ? 'border-green-500 bg-green-50 shadow-sm'
                        : selectedAnswer === option.letter
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-100 opacity-50'
                      : selectedAnswer === option.letter
                      ? 'border-[#0072BC] bg-blue-50 shadow-sm'
                      : 'border-gray-200 hover:border-[#0072BC]/50 hover:bg-gray-50'
                  }`}
                  onClick={() => !showResult && setSelectedAnswer(option.letter)}
                >
                  <RadioGroupItem value={option.letter} id={`option-${option.letter}`} className={showResult ? 'opacity-50' : ''} />
                  <Label
                    htmlFor={`option-${option.letter}`}
                    className="flex-1 cursor-pointer text-sm md:text-base font-medium"
                  >
                    <span className="font-bold text-[#0072BC] mr-2">{option.letter})</span>
                    {option.text}
                  </Label>
                  {showResult && option.letter === question.correct_option && (
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                  )}
                  {showResult && selectedAnswer === option.letter && option.letter !== question.correct_option && (
                    <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                  )}
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Result Feedback */}
          {showResult && (
            <div
              className={`p-5 rounded-xl mb-6 animate-in fade-in slide-in-from-bottom-4 ${
                isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                )}
                <div>
                  <p className={`font-bold text-lg mb-1 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                    {isCorrect ? 'Acertou em cheio! 🎯' : 'Ops, água na lente! 🥽'}
                  </p>
                  {question.explanation && (
                    <p className="text-sm text-gray-700 leading-relaxed mt-2 bg-white/50 p-3 rounded-lg">
                      <strong>Dica do CTP:</strong> {question.explanation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-end mt-8 pt-6 border-t border-gray-100">
            {!showResult ? (
              <Button
                onClick={handleAnswer}
                disabled={selectedAnswer === null}
                className="bg-[#0072BC] hover:bg-[#005a9e] text-white px-8 py-6 rounded-full shadow-md hover:shadow-lg transition-all w-full sm:w-auto text-lg"
              >
                Verificar Resposta
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-[#FF6B00] hover:bg-[#e55d00] text-white px-8 py-6 rounded-full shadow-md hover:shadow-lg transition-all w-full sm:w-auto text-lg"
              >
                {currentQuestion < questions.length - 1 ? 'Próxima Braçada 🏊‍♂️' : 'Ver Resultado Final 🏆'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
