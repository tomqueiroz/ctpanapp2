import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { COURSE_PASSING_SCORE_PERCENT } from '@/lib/course-requirements';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  TrendingUp,
  Users,
  Award,
  Clock,
  Download
} from 'lucide-react';
import { ROUTE_PATHS } from '@/lib';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

interface AnalyticsData {
  totalUsers: number;
  accessesByChapter: { chapter: number; count: number }[];
  accessesByContent: { type: string; count: number }[];
  accessesByHour: { hour: number; count: number }[];
  enrollmentsByDay: { date: string; count: number }[];
  enrollmentsByMonth: { month: string; count: number }[];
  progressDistribution: { range: string; count: number; percentage: number }[];
  examsByChapter: { chapter: number; completed: number; total: number }[];
  certificatesIssued: { total: number; thisMonth: number; thisWeek: number };
}

const COLORS = ['#0072BC', '#00A3E0', '#00C9FF', '#4ECDC4', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3'];

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    accessesByChapter: [],
    accessesByContent: [],
    accessesByHour: [],
    enrollmentsByDay: [],
    enrollmentsByMonth: [],
    progressDistribution: [],
    examsByChapter: [],
    certificatesIssued: { total: 0, thisMonth: 0, thisWeek: 0 },
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // 1. Acessos por capítulo
      const { data: accessLogs } = await supabase
        .from('access_logs')
        .select('chapter_number, content_type, accessed_at');

      // Processar acessos por capítulo
      const chapterCounts: { [key: number]: number } = {};
      accessLogs?.forEach((log) => {
        if (log.chapter_number) {
          chapterCounts[log.chapter_number] = (chapterCounts[log.chapter_number] || 0) + 1;
        }
      });

      const accessesByChapter = Object.entries(chapterCounts)
        .map(([chapter, count]) => ({
          chapter: parseInt(chapter),
          count: count as number,
        }))
        .sort((a, b) => a.chapter - b.chapter);

      // 2. Acessos por tipo de conteúdo
      const contentCounts: { [key: string]: number } = {};
      accessLogs?.forEach((log) => {
        if (log.content_type) {
          contentCounts[log.content_type] = (contentCounts[log.content_type] || 0) + 1;
        }
      });

      const accessesByContent = Object.entries(contentCounts).map(([type, count]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        count: count as number,
      }));

      // 3. Acessos por horário
      const hourCounts: { [key: number]: number } = {};
      accessLogs?.forEach((log) => {
        const hour = new Date(log.accessed_at).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

      const accessesByHour = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        count: hourCounts[i] || 0,
      }));

      // 4. Inscritos por dia (últimos 30 dias)
      const { data: users } = await supabase
        .from('user_roles')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const dayCounts: { [key: string]: number } = {};
      users?.forEach((user) => {
        const date = new Date(user.created_at).toLocaleDateString('pt-BR');
        dayCounts[date] = (dayCounts[date] || 0) + 1;
      });

      const enrollmentsByDay = Object.entries(dayCounts)
        .map(([date, count]) => ({ date, count: count as number }))
        .slice(-30);

      // 5. Inscritos por mês (últimos 12 meses)
      const { data: allUsers } = await supabase
        .from('user_roles')
        .select('created_at');

      const monthCounts: { [key: string]: number } = {};
      allUsers?.forEach((user) => {
        const date = new Date(user.created_at);
        const month = `${date.getMonth() + 1}/${date.getFullYear()}`;
        monthCounts[month] = (monthCounts[month] || 0) + 1;
      });

      const enrollmentsByMonth = Object.entries(monthCounts)
        .map(([month, count]) => ({ month, count: count as number }))
        .slice(-12);

      // 6. Distribuição de progresso
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('user_id, completion_percentage');

      const progressRanges = [
        { range: '0-10%', min: 0, max: 10 },
        { range: '11-20%', min: 11, max: 20 },
        { range: '21-30%', min: 21, max: 30 },
        { range: '31-40%', min: 31, max: 40 },
        { range: '41-50%', min: 41, max: 50 },
        { range: '51-60%', min: 51, max: 60 },
        { range: '61-70%', min: 61, max: 70 },
        { range: '71-80%', min: 71, max: 80 },
        { range: '81-90%', min: 81, max: 90 },
        { range: '91-100%', min: 91, max: 100 },
      ];

      const progressByUser: Record<string, number[]> = {};
      progressData?.forEach((progress) => {
        const current = progressByUser[progress.user_id] || [];
        current.push(Number(progress.completion_percentage || 0));
        progressByUser[progress.user_id] = current;
      });
      const userProgress = Object.fromEntries(
        Object.entries(progressByUser).map(([userId, values]) => [
          userId,
          values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1),
        ]),
      );

      const progressDistribution = progressRanges.map((range) => {
        const count = Object.values(userProgress).filter(
          (p) => p >= range.min && p <= range.max
        ).length;
        return {
          range: range.range,
          count,
          percentage: allUsers ? (count / allUsers.length) * 100 : 0,
        };
      });

      // 7. Provas por capítulo
      const [{ data: examScores }, { data: exams }, { data: chapters }] = await Promise.all([
        supabase.from('user_exam_scores').select('exam_id, best_score'),
        supabase.from('exams').select('id, chapter_id, passing_score'),
        supabase.from('chapters').select('id, chapter_number'),
      ]);
      const chapterById = new Map((chapters || []).map((chapter) => [chapter.id, chapter.chapter_number]));
      const examById = new Map((exams || []).map((exam) => [exam.id, exam]));
      const passedByChapter: Record<number, number> = {};
      (examScores || []).forEach((score) => {
        const exam = examById.get(score.exam_id);
        const chapterNumber = exam ? chapterById.get(exam.chapter_id) : undefined;
        if (
          chapterNumber !== undefined
          && Number(score.best_score || 0) >= Number(
            exam?.passing_score || COURSE_PASSING_SCORE_PERCENT,
          )
        ) {
          passedByChapter[chapterNumber] = (passedByChapter[chapterNumber] || 0) + 1;
        }
      });
      const examsByChapter = (exams || [])
        .map((exam) => chapterById.get(exam.chapter_id))
        .filter((chapter): chapter is number => chapter !== undefined)
        .sort((a, b) => a - b)
        .map((chapter) => ({
          chapter,
          completed: passedByChapter[chapter] || 0,
          total: allUsers?.length || 0,
        }));

      // 8. Certificados emitidos
      const { data: certificates } = await supabase
        .from('certificates')
        .select('created_at, issued_at, is_valid')
        .eq('is_valid', true);
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date(now);
      startOfWeek.setHours(0, 0, 0, 0);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const certificateDates = (certificates || []).map((certificate) =>
        new Date(certificate.issued_at || certificate.created_at),
      );
      const certificatesTotal = certificateDates.length;
      const certificatesThisMonth = certificateDates.filter((date) => date >= startOfMonth).length;
      const certificatesThisWeek = certificateDates.filter((date) => date >= startOfWeek).length;

      setAnalytics({
        totalUsers: allUsers?.length || 0,
        accessesByChapter,
        accessesByContent,
        accessesByHour,
        enrollmentsByDay,
        enrollmentsByMonth,
        progressDistribution,
        examsByChapter,
        certificatesIssued: {
          total: certificatesTotal,
          thisMonth: certificatesThisMonth,
          thisWeek: certificatesThisWeek,
        },
      });
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadTextFile = (content: string, fileName: string, type: string) => {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const exportToCSV = () => {
    const rows: Array<Array<string | number>> = [
      ['Relatório Analytics CTP ANAPP', new Date().toLocaleString('pt-BR')],
      [],
      ['Indicador', 'Valor'],
      ['Total de acessos', analytics.accessesByChapter.reduce((sum, item) => sum + item.count, 0)],
      ['Certificados válidos', analytics.certificatesIssued.total],
      ['Certificados no mês', analytics.certificatesIssued.thisMonth],
      ['Certificados na semana', analytics.certificatesIssued.thisWeek],
      [],
      ['Capítulo', 'Acessos'],
      ...analytics.accessesByChapter.map((item) => [item.chapter, item.count]),
      [],
      ['Capítulo', 'Alunos aprovados na prova', 'Total de usuários'],
      ...analytics.examsByChapter.map((item) => [item.chapter, item.completed, item.total]),
      [],
      ['Faixa de progresso', 'Usuários', 'Percentual'],
      ...analytics.progressDistribution.map((item) => [
        item.range,
        item.count,
        item.percentage.toFixed(2),
      ]),
    ];
    const escapeCell = (value: string | number) =>
      `"${String(value).split('"').join('""')}"`;
    const csv = `\uFEFF${rows.map((row) => row.map(escapeCell).join(';')).join('\n')}`;
    downloadTextFile(
      csv,
      `relatorio-analytics-ctp-anapp-${new Date().toISOString().slice(0, 10)}.csv`,
      'text/csv;charset=utf-8',
    );
    toast.success('Relatório CSV gerado');
  };

  const exportToPDF = () => {
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
    const generatedAt = new Date().toLocaleString('pt-BR');
    let y = 20;
    pdf.setTextColor(0, 114, 188);
    pdf.setFontSize(18);
    pdf.text('Relatório Analytics — CTP ANAPP', 15, y);
    y += 9;
    pdf.setTextColor(70, 70, 70);
    pdf.setFontSize(10);
    pdf.text(`Gerado em ${generatedAt}`, 15, y);
    y += 12;

    const summary = [
      ['Total de acessos', analytics.accessesByChapter.reduce((sum, item) => sum + item.count, 0)],
      ['Certificados válidos', analytics.certificatesIssued.total],
      ['Certificados emitidos no mês', analytics.certificatesIssued.thisMonth],
      ['Certificados emitidos na semana', analytics.certificatesIssued.thisWeek],
    ] as const;
    pdf.setFontSize(12);
    summary.forEach(([label, value]) => {
      pdf.text(`${label}: ${value}`, 15, y);
      y += 7;
    });

    y += 5;
    pdf.setTextColor(0, 114, 188);
    pdf.setFontSize(13);
    pdf.text('Aprovações por prova', 15, y);
    y += 8;
    pdf.setTextColor(70, 70, 70);
    pdf.setFontSize(10);
    analytics.examsByChapter.forEach((item) => {
      if (y > 280) {
        pdf.addPage();
        y = 20;
      }
      pdf.text(
        `Capítulo ${item.chapter}: ${item.completed} aluno(s) aprovado(s) de ${item.total}`,
        18,
        y,
      );
      y += 6;
    });

    pdf.save(`relatorio-analytics-ctp-anapp-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success('Relatório PDF gerado');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0072BC] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="flex">
        {/* Sidebar space */}
        <div className="hidden lg:block w-64"></div>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto px-2">
            {/* Header */}
            <div className="mb-8">
              <Button 
                variant="ghost" 
                onClick={() => navigate(ROUTE_PATHS.ADMIN)}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
Voltar ao Painel
              </Button>

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Analytics e Relatórios
                  </h1>
                  <p className="text-gray-600">
                    Análise completa de dados da plataforma
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button onClick={exportToPDF} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar PDF
                  </Button>
                  <Button onClick={exportToCSV} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar CSV
                  </Button>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total de Acessos</p>
                      <p className="text-2xl font-bold">
                        {analytics.accessesByChapter.reduce((sum, item) => sum + item.count, 0)}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-[#0072BC]" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Inscritos</p>
                      <p className="text-2xl font-bold">{analytics.totalUsers}</p>
                    </div>
                    <Users className="w-8 h-8 text-[#0072BC]" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Certificados</p>
                      <p className="text-2xl font-bold">
                        {analytics.certificatesIssued.total}
                      </p>
                    </div>
                    <Award className="w-8 h-8 text-[#0072BC]" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Horário Pico</p>
                      <p className="text-2xl font-bold">
                        {analytics.accessesByHour.reduce((max, item) => 
                          item.count > max.count ? item : max, 
                          { hour: 0, count: 0 }
                        ).hour}h
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-[#0072BC]" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Acessos por Capítulo */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Acessos por Capítulo</CardTitle>
                <CardDescription>
                  Quantidade de acessos em cada capítulo do curso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.accessesByChapter}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="chapter" label={{ value: 'Capítulo', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'Acessos', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#0072BC" name="Acessos" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Acessos por Tipo de Conteúdo */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Acessos por Tipo de Conteúdo</CardTitle>
                <CardDescription>
                  Distribuição de acessos entre vídeos, apostilas, podcasts, etc.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.accessesByContent}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, percent }: { type?: string; percent?: number }) =>
                        `${type ?? 'Conteúdo'}: ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analytics.accessesByContent.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Acessos por Horário */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Acessos por Horário</CardTitle>
                <CardDescription>
                  Distribuição de acessos ao longo do dia (24 horas)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.accessesByHour}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" label={{ value: 'Hora do Dia', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'Acessos', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#0072BC" name="Acessos" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Inscritos por Dia */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Inscritos por Dia (Últimos 30 dias)</CardTitle>
                <CardDescription>
                  Novos cadastros diários na plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.enrollmentsByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#00A3E0" name="Inscritos" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Inscritos por Mês */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Inscritos por Mês</CardTitle>
                <CardDescription>
                  Crescimento mensal de usuários cadastrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.enrollmentsByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#4ECDC4" name="Inscritos" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribuição de Progresso */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Distribuição de Progresso dos Alunos</CardTitle>
                <CardDescription>
                  Percentual de conclusão do curso por faixa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={analytics.progressDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="range" type="category" width={80} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#95E1D3" name="Alunos" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Provas por Capítulo */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Provas Concluídas por Capítulo</CardTitle>
                <CardDescription>
                  Quantidade de alunos que completaram a prova de cada capítulo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.examsByChapter}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="chapter" label={{ value: 'Capítulo', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'Alunos', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" fill="#F38181" name="Concluídas" />
                    <Bar dataKey="total" fill="#E0E0E0" name="Total de Alunos" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
