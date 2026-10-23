// Dashboard - Versão sem imagens nos cards (atualizado 2026-04-02)
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Award, ChevronRight, LogOut, Calculator, ClipboardCheck, FileText, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ROUTE_PATHS } from '@/lib/index';
import { supabase, Chapter, UserProgress } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getLmsAccessContext, type LmsAccessContext } from '@/lib/lms-access';
import { FinalExamCard } from '@/components/FinalExamCard';

export default function Dashboard() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [progress, setProgress] = useState<Record<number, UserProgress>>({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [access, setAccess] = useState<LmsAccessContext | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    loadChapters();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate(ROUTE_PATHS.LOGIN);
      return;
    }
    setUser(user);
    try {
      setAccess(await getLmsAccessContext());
    } catch {
      setAccess(null);
    }
    loadProgress(user.id);
  };

  const loadChapters = async () => {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .order('chapter_number', { ascending: true });

      if (error) throw error;
      setChapters(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar capítulos',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      const progressMap: Record<number, UserProgress> = {};
      data?.forEach((p) => {
        progressMap[p.chapter_id] = p;
      });
      setProgress(progressMap);
    } catch (error: any) {
      console.error('Erro ao carregar progresso:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate(ROUTE_PATHS.HOME);
  };

  const totalProgress = chapters.length > 0
    ? chapters.reduce((acc, ch) => {
        const chapterProgress = progress[ch.id];
        return acc + (chapterProgress?.completion_percentage || 0);
      }, 0) / chapters.length
    : 0;

  const completedChapters = chapters.filter(ch => progress[ch.id]?.completion_percentage === 100).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0072BC] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: 'calc(5rem - 25px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-5">
        {access && !access.can_access_paid_content && (
          <Card className="mb-5 border-blue-200 bg-blue-50 shadow-sm">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-[#0072BC]" />
                <div>
                  <h2 className="font-bold text-blue-950">Seu e-mail foi confirmado</h2>
                  <p className="mt-1 text-sm text-blue-900">
                    O Capítulo Zero já está liberado. Escolha o plano para não associados
                    por R$ 600,00 ou, se sua associação ANAPP estiver validada, o plano
                    exclusivo por R$ 299,00. Você também poderá informar um cupom no checkout.
                  </p>
                </div>
              </div>
              <Button asChild className="shrink-0 bg-[#FF6B00] hover:bg-[#e55d00]">
                <Link to={ROUTE_PATHS.CHECKOUT}>Escolher plano e liberar acesso</Link>
              </Button>
            </CardContent>
          </Card>
        )}
        {user && access === null && (
          <Card className="mb-5 border-amber-200 bg-amber-50 shadow-sm">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-bold text-amber-950">Conclua sua inscrição</h2>
                <p className="mt-1 text-sm text-amber-900">
                  Se este é seu primeiro acesso, escolha uma das modalidades de
                  inscrição para liberar o curso completo.
                </p>
              </div>
              <Button asChild className="shrink-0 bg-[#FF6B00] hover:bg-[#e55d00]">
                <Link to={ROUTE_PATHS.CHECKOUT}>Ir para pagamento</Link>
              </Button>
            </CardContent>
          </Card>
        )}
        {/* Header */}
        <div className="mb-4 lg:mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2" style={{fontSize: 'clamp(1.25rem, 2vw, 1.75rem)'}}>
              Bem-vindo ao Curso CTP ANAPP
            </h1>
            <p className="text-sm lg:text-base text-gray-600" style={{fontSize: 'clamp(0.875rem, 1.5vw, 1rem)'}}>
              Continue seus estudos e conquiste sua certificação profissional. Formação técnica + empreendedora com a chancela da ANAPP
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>

        {/* Progress Overview */}
        <Card className="mb-4 lg:mb-5 border-0 shadow-lg">
          <CardContent className="p-3 lg:p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-2" style={{fontSize: 'clamp(1rem, 1.8vw, 1.5rem)'}}>Seu Progresso</h2>
                <p className="text-gray-600">
                  {completedChapters} de {chapters.length} capítulos concluídos
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl lg:text-3xl font-bold text-[#0072BC]" style={{fontSize: 'clamp(1.5rem, 2.5vw, 2rem)'}}>{Math.round(totalProgress)}%</div>
                <div className="text-sm text-gray-600">Completo</div>
              </div>
            </div>
            <Progress value={totalProgress} className="h-3" />
          </CardContent>
        </Card>

        {access?.can_access_paid_content && <FinalExamCard />}

        {/* Chapters Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Módulos do Curso</h2>
        </div>

        {/* Grid de 1 Coluna - Responsivo para Mobile e Desktop */}
        <div className="space-y-4 max-w-4xl mx-auto">
          {chapters.map((chapter) => {
            const chapterProgress = progress[chapter.id];
            const completionPercentage = chapterProgress?.completion_percentage || 0;

            return (
              <Card key={chapter.id} className="hover:shadow-xl transition-all border-0 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    {/* Ícone */}
                    <div className="w-14 h-14 rounded-xl bg-[#0072BC]/10 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-7 h-7 text-[#0072BC]" />
                    </div>
                    
                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          Capítulo {chapter.chapter_number}
                        </h3>
                        <div className="text-sm text-gray-600 flex items-center gap-1 flex-shrink-0">
                          <Clock className="w-4 h-4" />
                          {chapter.duration}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-1">
                        {chapter.title}
                      </p>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-600">Progresso</span>
                            <span className="font-semibold text-[#0072BC]">{completionPercentage}%</span>
                          </div>
                          <Progress value={completionPercentage} className="h-2" />
                        </div>
                        
                        <Link 
                          to={`/dashboard/chapter/${chapter.chapter_number}`}
                          onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
                          className="flex-shrink-0"
                        >
                          <Button className="bg-[#0072BC] hover:bg-[#005a9e] text-white">
                            {completionPercentage === 0 ? 'Começar' : completionPercentage === 100 ? 'Revisar' : 'Continuar'}
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Ferramentas Exclusivas CTP */}
        {access?.can_access_paid_content && <div className="mt-12 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Ferramentas Exclusivas CTP</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Checklist Card */}
            <Card className="hover:shadow-xl transition-all border-2 border-[#FF6B00]/20 bg-gradient-to-br from-orange-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#e55d00] flex items-center justify-center shadow-lg">
                    <ClipboardCheck className="w-7 h-7 text-white" />
                  </div>
                  <span className="bg-[#FF6B00] text-white text-xs font-bold px-3 py-1 rounded-full">
                    NOVO
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Checklist do Piscineiro
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Guia prático passo a passo para manutenção de piscinas residenciais, condomínios e clubes. Gere relatórios profissionais.
                </p>

                <Link to="/dashboard/checklist" onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}>
                  <Button className="w-full bg-gradient-to-r from-[#FF6B00] to-[#e55d00] hover:from-[#e55d00] hover:to-[#cc4f00] text-white shadow-lg">
                    Abrir Checklist
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Calculator Card */}
            <Card className="hover:shadow-xl transition-all border-2 border-[#00A3E0]/20 bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00A3E0] to-[#0072BC] flex items-center justify-center shadow-lg">
                    <Calculator className="w-7 h-7 text-white" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  AcquaCalc CTP ANAPP
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Calculadora profissional de tratamento de piscinas. Calcule com precisão os produtos químicos necessários baseado na NBR 10339:2018.
                </p>

                <Link to="/dashboard/calculator" onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}>
                  <Button className="w-full bg-gradient-to-r from-[#00A3E0] to-[#0072BC] hover:from-[#0072BC] hover:to-[#005a9e] text-white shadow-lg">
                    Abrir AcquaCalc CTP
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Grades/Boletim Card */}
            <Card className="hover:shadow-xl transition-all border-2 border-green-500/20 bg-gradient-to-br from-green-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    NOVO
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Boletim de Notas
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Acompanhe seu desempenho em todas as provas, visualize sua média final e baixe seu relatório em PDF.
                </p>

                <Link to="/dashboard/grades" onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}>
                  <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg">
                    Ver Boletim
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Certificate Card */}
            <Card className="hover:shadow-xl transition-all border-2 border-[#0072BC]/20 bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0072BC] to-[#005a9e] flex items-center justify-center shadow-lg">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  <span className="bg-[#0072BC] text-white text-xs font-bold px-3 py-1 rounded-full">
                    CERTIFICAÇÃO
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Certificado CTP ANAPP
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Consulte os requisitos, emita seu certificado e baixe o PDF pelo celular ou computador.
                </p>

                <Link to={ROUTE_PATHS.CERTIFICATE} onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}>
                  <Button className="w-full bg-gradient-to-r from-[#0072BC] to-[#005a9e] hover:from-[#005a9e] hover:to-[#00457a] text-white shadow-lg">
                    Abrir Certificado
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>}

        {/* Certificate Section */}
        {access?.can_access_paid_content && <Card className="mt-12 border-0 shadow-lg bg-gradient-to-br from-[#0072BC] to-[#005a9e] text-white">
          <CardContent className="p-8 text-center">
            <Award className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4 text-white">Certificado CTP ANAPP</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Complete todos os módulos e obtenha seu certificado oficial reconhecido pela ANAPP
            </p>
            <Button
              onClick={() => navigate(ROUTE_PATHS.CERTIFICATE)}
              className="bg-white text-[#0072BC] hover:bg-gray-100"
            >
              Abrir página do certificado
            </Button>
          </CardContent>
        </Card>}
      </div>
    </div>
  );
}
