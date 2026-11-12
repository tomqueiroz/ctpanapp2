import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Award, 
  Clock, 
  Target,
  CheckCircle,
  XCircle,
  Calendar,
  BarChart3,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { ROUTE_PATHS } from '@/lib';

interface ProgressStats {
  totalChapters: number;
  completedChapters: number;
  averageScore: number;
  totalStudyTime: number;
  quizzesPassed: number;
  examsPassed: number;
}

interface AttemptHistory {
  id: string;
  chapter_id: number;
  chapter_title: string;
  type: 'quiz' | 'exam';
  score: number;
  passed: boolean;
  created_at: string;
}

export default function ProgressDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProgressStats>({
    totalChapters: 12,
    completedChapters: 0,
    averageScore: 0,
    totalStudyTime: 0,
    quizzesPassed: 0,
    examsPassed: 0,
  });
  const [chapterProgress, setChapterProgress] = useState<any[]>([]);
  const [quizHistory, setQuizHistory] = useState<AttemptHistory[]>([]);
  const [examHistory, setExamHistory] = useState<AttemptHistory[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate(ROUTE_PATHS.LOGIN);
        return;
      }

      // Buscar progresso dos capítulos
      const { data: progressData } = await supabase
        .from('user_progress')
        .select(`
          *,
          chapters (
            id,
            chapter_number,
            title
          )
        `)
        .eq('user_id', user.id)
        .order('chapter_id');

      // Buscar histórico de quizzes
      const { data: quizData } = await supabase
        .from('user_quiz_attempts')
        .select(`
          *,
          chapters (
            chapter_number,
            title
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Buscar histórico de provas
      const { data: examData } = await supabase
        .from('exam_attempts')
        .select(`
          *,
          exams (
            chapter_id,
            chapters (
              chapter_number,
              title
            )
          )
        `)
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

      // Calcular estatísticas
      const completedChapters = progressData?.filter(p => p.completion_percentage === 100).length || 0;
      const quizzesPassed = quizData?.filter(q => q.passed).length || 0;
      const examsPassed = examData?.filter(e => e.is_passed).length || 0;
      
      const allScores = [
        ...(quizData?.map(q => q.score) || []),
        ...(examData?.map(e => e.score) || [])
      ];
      const averageScore = allScores.length > 0
        ? allScores.reduce((a, b) => a + b, 0) / allScores.length
        : 0;

      setStats({
        totalChapters: 12,
        completedChapters,
        averageScore,
        totalStudyTime: 0, // TODO: implementar tracking de tempo
        quizzesPassed,
        examsPassed,
      });

      setChapterProgress(progressData || []);
      
      // Formatar histórico
      const formattedQuizHistory: AttemptHistory[] = (quizData || []).map(q => ({
        id: q.id,
        chapter_id: q.chapter_id,
        chapter_title: `Cap. ${q.chapters?.chapter_number} - ${q.chapters?.title}`,
        type: 'quiz',
        score: q.score,
        passed: q.passed,
        created_at: q.created_at,
      }));

      const formattedExamHistory: AttemptHistory[] = (examData || []).map(e => ({
        id: e.id,
        chapter_id: e.exams?.chapter_id,
        chapter_title: `Cap. ${e.exams?.chapters?.chapter_number} - ${e.exams?.chapters?.title}`,
        type: 'exam',
        score: e.score,
        passed: e.is_passed,
        created_at: e.completed_at || e.started_at,
      }));

      setQuizHistory(formattedQuizHistory);
      setExamHistory(formattedExamHistory);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#0072BC] mx-auto mb-4" />
          <p className="text-gray-600">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  const progressPercentage = (stats.completedChapters / stats.totalChapters) * 100;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(ROUTE_PATHS.DASHBOARD)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
Voltar ao Painel Geral
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Meu Progresso
          </h1>
          <p className="text-gray-600">
            Acompanhe seu desempenho e evolução no curso
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Progresso Geral</p>
                  <p className="text-3xl font-bold text-[#0072BC]">
                    {progressPercentage.toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.completedChapters}/{stats.totalChapters} capítulos
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 text-[#0072BC] opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Média de Notas</p>
                  <p className="text-3xl font-bold text-[#FF6B00]">
                    {stats.averageScore.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    De 10.0 pontos
                  </p>
                </div>
                <Award className="w-12 h-12 text-[#FF6B00] opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Quizzes Aprovados</p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.quizzesPassed}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Nota mínima 7.0
                  </p>
                </div>
                <Target className="w-12 h-12 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Provas Aprovadas</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {stats.examsPassed}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Nota mínima 7.0
                  </p>
                </div>
                <CheckCircle className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="chapters" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chapters">
              <BarChart3 className="w-4 h-4 mr-2" />
              Por Capítulo
            </TabsTrigger>
            <TabsTrigger value="quizzes">
              <Target className="w-4 h-4 mr-2" />
              Quizzes
            </TabsTrigger>
            <TabsTrigger value="exams">
              <Award className="w-4 h-4 mr-2" />
              Provas
            </TabsTrigger>
          </TabsList>

          {/* Progresso por Capítulo */}
          <TabsContent value="chapters">
            <Card>
              <CardHeader>
                <CardTitle>Progresso por Capítulo</CardTitle>
                <CardDescription>
                  Veja seu progresso em cada capítulo do curso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chapterProgress.map((progress) => (
                    <div key={progress.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Cap. {progress.chapters?.chapter_number} - {progress.chapters?.title}
                        </span>
                        <span className="text-sm font-bold text-[#0072BC]">
                          {progress.completion_percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#0072BC] h-2 rounded-full transition-all"
                          style={{ width: `${progress.completion_percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Histórico de Quizzes */}
          <TabsContent value="quizzes">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Quizzes</CardTitle>
                <CardDescription>
                  Todas as suas tentativas de quiz
                </CardDescription>
              </CardHeader>
              <CardContent>
                {quizHistory.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Nenhum quiz realizado ainda
                  </p>
                ) : (
                  <div className="space-y-3">
                    {quizHistory.map((attempt) => (
                      <div
                        key={attempt.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {attempt.passed ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                          <div>
                            <p className="font-medium text-sm">{attempt.chapter_title}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(attempt.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                            {attempt.score.toFixed(1)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {attempt.passed ? 'Aprovado' : 'Reprovado'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Histórico de Provas */}
          <TabsContent value="exams">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Provas</CardTitle>
                <CardDescription>
                  Todas as suas tentativas de prova oficial
                </CardDescription>
              </CardHeader>
              <CardContent>
                {examHistory.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Nenhuma prova realizada ainda
                  </p>
                ) : (
                  <div className="space-y-3">
                    {examHistory.map((attempt) => (
                      <div
                        key={attempt.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {attempt.passed ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                          <div>
                            <p className="font-medium text-sm">{attempt.chapter_title}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(attempt.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                            {attempt.score.toFixed(1)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {attempt.passed ? 'Aprovado' : 'Reprovado'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
