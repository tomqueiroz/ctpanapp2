import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Trophy, Star, TrendingUp, RefreshCw, Award } from 'lucide-react';

function QuizModal({ isOpen, onClose, quizData, moduleNumber }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(true);
  const [totalAccumulatedScore, setTotalAccumulatedScore] = useState(0);

  // Carregar pontuação acumulada ao abrir
  useEffect(() => {
    if (isOpen) {
      const savedScores = JSON.parse(localStorage.getItem('quizScores') || '{}');
      const total = Object.values(savedScores).reduce((sum, score) => sum + score, 0);
      setTotalAccumulatedScore(total);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && timerActive && !showResult && !quizComplete) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeout();
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen, timerActive, showResult, quizComplete]);

  const handleTimeout = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = { correct: false, selected: null, timedOut: true, score: 0 };
    setAnswers(newAnswers);
    // Pontuação é 0 em timeout
    setShowResult(true);
    setTimerActive(false);
  };

  const handleAnswerSelect = (answerIndex) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
    setTimerActive(false);

    const isCorrect = answerIndex === quizData.questions[currentQuestion].correctAnswer;
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = { 
      correct: isCorrect, 
      selected: answerIndex,
      timeBonus: Math.floor(timeLeft / 3)
    };
    setAnswers(newAnswers);

    if (isCorrect) {
      const points = 10 + Math.floor(timeLeft / 3);
      setScore(score + points);
    }

    setShowResult(true);
  };

  const handleNext = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(60);
      setTimerActive(true);
    } else {
      setQuizComplete(true);
      // Salvar pontuação deste módulo no localStorage
      const savedScores = JSON.parse(localStorage.getItem('quizScores') || '{}');
      savedScores[`module_${moduleNumber}`] = score;
      localStorage.setItem('quizScores', JSON.stringify(savedScores));
      // Atualizar total acumulado
      const total = Object.values(savedScores).reduce((sum, s) => sum + s, 0);
      setTotalAccumulatedScore(total);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswers([]);
    setQuizComplete(false);
    setTimeLeft(60);
    setTimerActive(true);
  };

  const getWeakTopics = () => {
    const topicErrors = {};
    answers.forEach((answer, index) => {
      if (!answer.correct) {
        const topic = quizData.questions[index].topic;
        topicErrors[topic] = (topicErrors[topic] || 0) + 1;
      }
    });
    return Object.entries(topicErrors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic]) => topic);
  };

  const getPerformanceLevel = () => {
    const percentage = (score / (quizData.questions.length * 13)) * 100;
    if (percentage >= 85) return { level: 'Excelente!', color: 'text-green-600', icon: Trophy };
    if (percentage >= 70) return { level: 'Muito Bom!', color: 'text-blue-600', icon: Award };
    if (percentage >= 50) return { level: 'Bom', color: 'text-yellow-600', icon: Star };
    return { level: 'Precisa Revisar', color: 'text-red-600', icon: TrendingUp };
  };

  if (!isOpen) return null;

  const question = quizData.questions[currentQuestion];
  const performance = getPerformanceLevel();
  const PerformanceIcon = performance.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0072BC] to-[#005a9e] text-white p-6 rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-all"
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">{quizData.title}</h2>
              <p className="text-blue-100 text-sm">{quizData.description}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{score}</div>
              <div className="text-xs text-blue-100">pontos (módulo)</div>
              {totalAccumulatedScore > 0 && (
                <div className="text-sm text-blue-200 mt-1">
                  Total: {totalAccumulatedScore} pts
                </div>
              )}
            </div>
          </div>

          {!quizComplete && (
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-white/20 rounded-full h-2">
                <div
                  className="bg-[#FF6B00] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / quizData.questions.length) * 100}%` }}
                />
              </div>
              <div className="text-sm font-medium">
                {currentQuestion + 1}/{quizData.questions.length}
              </div>
              <div className={`text-sm font-bold ${timeLeft <= 15 ? 'text-red-300 animate-pulse' : ''}`}>
                ⏱️ {timeLeft}s
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {!quizComplete ? (
            <>
              {/* Question */}
              <div className="mb-6">
                <div className="flex items-start gap-3 mb-4">
                  {question.image && (
                    <img
                      src={question.image}
                      alt="Question illustration"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <span className="inline-block bg-blue-100 text-[#0072BC] text-xs font-medium px-3 py-1 rounded-full mb-2">
                      {question.topic}
                    </span>
                    <h3 className="text-xl font-medium text-gray-900">{question.question}</h3>
                  </div>
                </div>
              </div>

              {/* Answers */}
              <div className="space-y-3">
                {question.answers.map((answer, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === question.correctAnswer;
                  const showCorrect = showResult && isCorrect;
                  const showWrong = showResult && isSelected && !isCorrect;

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showResult}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        showCorrect
                          ? 'bg-green-50 border-green-500'
                          : showWrong
                          ? 'bg-red-50 border-red-500'
                          : isSelected
                          ? 'bg-blue-50 border-[#0072BC]'
                          : 'bg-white border-gray-200 hover:border-[#0072BC] hover:bg-blue-50'
                      } ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{answer}</span>
                        {showCorrect && <CheckCircle className="text-green-600" size={24} />}
                        {showWrong && <XCircle className="text-red-600" size={24} />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {showResult && (
                <div className={`mt-6 p-4 rounded-xl ${
                  answers[currentQuestion]?.timedOut
                    ? 'bg-yellow-50 border-2 border-yellow-300'
                    : answers[currentQuestion]?.correct
                    ? 'bg-green-50 border-2 border-green-300'
                    : 'bg-red-50 border-2 border-red-300'
                }`}>
                  <div className="flex items-start gap-3">
                    {answers[currentQuestion]?.timedOut ? (
                      <>
                        <XCircle className="text-yellow-600 flex-shrink-0 mt-1" size={24} />
                        <div>
                          <h4 className="font-bold text-yellow-900 mb-1">⏰ Tempo Esgotado! +0 pontos</h4>
                          <p className="text-gray-700 text-sm mb-2">Você não respondeu a tempo. A resposta correta era: <strong>{question.answers[question.correctAnswer]}</strong></p>
                          <p className="text-gray-700 text-sm">{question.explanation}</p>
                        </div>
                      </>
                    ) : answers[currentQuestion]?.correct ? (
                      <>
                        <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={24} />
                        <div>
                          <h4 className="font-bold text-green-900 mb-1">
                            Correto! +{10 + answers[currentQuestion].timeBonus} pontos
                            {answers[currentQuestion].timeBonus > 0 && ` (Bônus de velocidade: +${answers[currentQuestion].timeBonus})`}
                          </h4>
                          <p className="text-gray-700 text-sm">{question.explanation}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <XCircle className="text-red-600 flex-shrink-0 mt-1" size={24} />
                        <div>
                          <h4 className="font-bold text-red-900 mb-1">Incorreto</h4>
                          <p className="text-gray-700 text-sm">{question.explanation}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Next Button */}
              {showResult && (
                <button
                  onClick={handleNext}
                  className="w-full mt-6 bg-[#0072BC] text-white py-4 px-6 rounded-xl font-semibold hover:bg-[#005a9e] transition-all"
                >
                  {currentQuestion < quizData.questions.length - 1 ? 'Próxima Pergunta' : 'Ver Resultado'}
                </button>
              )}
            </>
          ) : (
            /* Results Screen */
            <div className="text-center py-8">
              <PerformanceIcon className={`mx-auto mb-4 ${performance.color}`} size={64} />
              <h3 className={`text-3xl font-bold mb-2 ${performance.color}`}>{performance.level}</h3>
              <p className="text-gray-600 mb-8">
                Você acertou {answers.filter(a => a.correct).length} de {quizData.questions.length} questões
              </p>

              <div className="bg-gradient-to-r from-[#0072BC] to-[#005a9e] text-white rounded-xl p-8 mb-8">
                <div className="text-5xl font-bold mb-2">{score}</div>
                <div className="text-blue-100 mb-4">Pontos neste Módulo</div>
                {totalAccumulatedScore > 0 && (
                  <div className="border-t border-blue-300 pt-4 mt-4">
                    <div className="text-3xl font-bold mb-1">{totalAccumulatedScore}</div>
                    <div className="text-blue-100 text-sm">🏆 Pontuação Total Acumulada (Todos os Módulos)</div>
                  </div>
                )}
              </div>

              {getWeakTopics().length > 0 && (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="text-yellow-600 flex-shrink-0" size={24} />
                    <div className="text-left">
                      <h4 className="font-bold text-yellow-900 mb-2">Temas para Revisar:</h4>
                      <ul className="space-y-1">
                        {getWeakTopics().map((topic, index) => (
                          <li key={index} className="text-gray-700 text-sm">• {topic}</li>
                        ))}
                      </ul>
                      <p className="text-xs text-gray-600 mt-3">
                        Revisar estes tópicos na apostila vai melhorar seu desempenho!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleRestart}
                  className="flex-1 bg-[#0072BC] text-white py-4 px-6 rounded-xl font-semibold hover:bg-[#005a9e] transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={20} />
                  Tentar Novamente
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-200 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuizModal;
