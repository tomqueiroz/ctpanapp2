import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Download, Trophy, TrendingUp, Award, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { GradeReport } from '@/lib/index';
import { downloadGradeReportPdf } from '@/lib/grade-report-pdf';
import { COURSE_PASSING_SCORE_PERCENT } from '@/lib/course-requirements';
import { toast } from 'sonner';
import { FinalExamCard } from '@/components/FinalExamCard';

export function Grades() {
  const [report, setReport] = useState<GradeReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    loadGrades();
  }, []);

  const loadGrades = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase.rpc('lms_grade_report');
      if (error) throw error;
      if (!data || typeof data !== 'object') {
        throw new Error('O boletim não retornou dados válidos.');
      }

      setReport(data as GradeReport);
    } catch (error: any) {
      console.error('Error loading grades:', error);
      const message =
        error?.message ||
        'Não foi possível consultar as notas. Tente novamente em instantes.';
      setLoadError(message);
      toast.error('Erro ao carregar notas');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!report) return;

    try {
      setGenerating(true);
      toast.info('Gerando PDF...');

      downloadGradeReportPdf(report);

      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erro ao gerar PDF');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando boletim...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p>Não foi possível carregar o boletim.</p>
            {loadError && <p className="mt-1 text-sm">{loadError}</p>}
            <Button className="mt-4" variant="outline" onClick={loadGrades}>
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const progressPercentage = report.total_chapters > 0
    ? (report.completed_chapters / report.total_chapters) * 100
    : 0;
  const passingScore = report.passing_score || COURSE_PASSING_SCORE_PERCENT;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Botão de download */}
      <div className="flex justify-end mb-6">
        <Button onClick={generatePDF} disabled={generating}>
          {generating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Gerando PDF...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Baixar Relatório em PDF
            </>
          )}
        </Button>
      </div>

      {/* Conteúdo do relatório (para PDF) */}
      <FinalExamCard />
      <div className="bg-background p-8 space-y-6">
        {/* Cabeçalho */}
        <div className="text-center border-b pb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold">Boletim de Notas</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Curso de Tratador de Piscinas - CTP ANAPP
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Data do relatório: {new Date(report.generated_at).toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* Dados do aluno */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Dados do Aluno
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Nome Completo</p>
              <p className="font-semibold">
                {report.user.first_name} {report.user.last_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">CPF</p>
              <p className="font-semibold">{report.user.cpf || 'Não informado'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className={`font-semibold ${report.is_certified ? 'text-green-500' : 'text-amber-500'}`}>
                {report.is_certified ? '✓ Certificado' : 'Em andamento'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Resumo geral */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-3xl font-bold">{report.average_score.toFixed(1)}%</div>
                <p className="text-sm text-muted-foreground">Média Final</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="text-3xl font-bold">
                  {report.completed_chapters}/{report.total_chapters}
                </div>
                <p className="text-sm text-muted-foreground">Provas Aprovadas</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Award className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                <div className="text-3xl font-bold">{Math.round(progressPercentage)}%</div>
                <p className="text-sm text-muted-foreground">Progresso</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progresso visual */}
        <Card>
          <CardHeader>
            <CardTitle>Progresso Geral do Curso</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercentage} className="h-3 mb-2" />
            <p className="text-sm text-muted-foreground text-center">
              {report.completed_chapters} de {report.total_chapters} provas concluídas com aprovação
            </p>
          </CardContent>
        </Card>

        {/* Notas por capítulo */}
        <Card>
          <CardHeader>
            <CardTitle>Notas por Capítulo</CardTitle>
            <CardDescription>
              Nota mínima para aprovação: {passingScore}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.chapters.map((chapter) => {
                const isApproved =
                  chapter.is_approved ??
                  chapter.best_score >= passingScore;

                return (
                  <div
                    key={chapter.chapter_number}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          Capítulo {chapter.chapter_number}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {chapter.chapter_title}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <Progress
                          value={chapter.best_score}
                          className={`h-2 flex-1 ${
                            isApproved
                              ? '[&>div]:bg-green-500'
                              : '[&>div]:bg-destructive'
                          }`}
                        />
                        <span className="text-sm text-muted-foreground">
                          {chapter.attempts} tentativa(s)
                        </span>
                      </div>
                      {chapter.historically_approved && (
                        <p className="mt-2 text-xs font-medium text-green-700">
                          Aprovação histórica preservada. Novas aprovações exigem nota mínima 7,0.
                        </p>
                      )}
                    </div>
                    <div className="ml-4 text-right">
                      <div
                        className={`text-2xl font-bold ${
                          isApproved ? 'text-green-500' : 'text-destructive'
                        }`}
                      >
                        {chapter.best_score.toFixed(1)}%
                      </div>
                      {isApproved ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto mt-1" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-destructive mx-auto mt-1" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Mensagem de certificação */}
        {report.is_certified && (
          <Alert className="border-green-500 bg-green-500/10">
            <Trophy className="h-5 w-5 text-green-500" />
            <AlertDescription className="text-lg">
              <strong>Parabéns! Você conquistou a Certificação CTP ANAPP!</strong>
              <div className="mt-4 space-y-2 text-sm">
                <p>
                  🎓 Você demonstrou excelência e dedicação ao completar todos os capítulos do curso com aprovação.
                </p>
                <p>
                  💼 Como profissional certificado CTP ANAPP, você está qualificado para atuar como Tratador de Piscinas,
                  com conhecimento técnico reconhecido pela Associação Nacional de Profissionais de Piscinas.
                </p>
                <p className="font-semibold text-green-600 dark:text-green-500">
                  ✨ Benefícios exclusivos para certificados:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Reconhecimento profissional pela ANAPP</li>
                  <li>Acesso a oportunidades de trabalho exclusivas</li>
                  <li>Networking com outros profissionais certificados</li>
                  <li>Atualizações e conteúdos exclusivos</li>
                  <li>Suporte técnico prioritário</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Rodapé */}
        <div className="text-center text-sm text-muted-foreground pt-6 border-t">
          <p>
            Este documento é um relatório oficial do desempenho do aluno no Curso de Tratador de Piscinas CTP ANAPP.
          </p>
          <p className="mt-2">
            © 2026 ANAPP - Associação Nacional de Profissionais de Piscinas
          </p>
        </div>
      </div>
    </div>
  );
}
