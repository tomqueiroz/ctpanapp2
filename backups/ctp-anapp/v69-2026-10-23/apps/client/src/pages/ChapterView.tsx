import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, FileText, Headphones, CheckCircle, ChevronRight, ChevronLeft, ClipboardCheck, Download, BookOpen, Brain, Calculator, Presentation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ROUTE_PATHS } from '@/lib/index';
import { supabase, Chapter, UserProgress, type ApostilaContent } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { QuizTab } from '@/components/QuizTab';
import { PODCAST_DURATIONS, VIDEO_DURATIONS } from '@/lib/podcast-durations';
import { DigitalProgress } from '@/components/DigitalProgress';
import { ExamTab } from '@/components/ExamTab';
import { SafeCourseHtml } from '@/components/SafeCourseHtml';
import {
  calculateChapterCompletionPercentage,
  chapterHasAssessments,
} from '@/lib/course-requirements';

function openExternal(url: string | null | undefined) {
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

function normalizeApostilaContent(value: Chapter['apostila_content']): ApostilaContent | null {
  if (!value) return null;
  if (typeof value !== 'string') return value;

  try {
    const parsed = JSON.parse(value) as unknown;
    if (parsed && typeof parsed === 'object') {
      return parsed as ApostilaContent;
    }
  } catch {
    // Some legacy rows stored the HTML directly instead of JSON.
  }

  return { html_content: value };
}

export default function ChapterView() {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('video');
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // RESETAR TODO O ESTADO ao mudar de capítulo
    setChapter(null);
    setProgress(null);
    setLoading(true);
    setActiveTab('video'); // Sempre voltar para a aba de vídeo
    
    // Scroll AGRESSIVO para o topo ao carregar/mudar de capítulo
    window.scrollTo({ top: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    checkUser();
    
    // Forçar scroll após render
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 100);
  }, [chapterId]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate(ROUTE_PATHS.LOGIN);
      return;
    }
    setUser(user);
    loadChapter();
    loadProgress(user.id);
  };

  const loadChapter = async () => {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('chapter_number', Number(chapterId))
        .single();

      if (error) throw error;
      setChapter(data);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar capítulo',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async (userId: string) => {
    try {
      // Primeiro busca o chapter_id
      const { data: chapterData } = await supabase
        .from('chapters')
        .select('id')
        .eq('chapter_number', Number(chapterId))
        .single();

      if (!chapterData) return;

      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('chapter_id', chapterData.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setProgress(data);
    } catch (error: any) {
      console.error('Erro ao carregar progresso:', error);
    }
  };

const updateProgress = async (field: 'video_completed' | 'apostila_completed' | 'podcast_completed' | 'quiz_completed' | 'materials_completed' | 'slides_completed', value: boolean) => {
    if (!user || !chapter) return;

    try {
      const updates: any = {
        user_id: user.id,
        chapter_id: chapter.id,
        [field]: value,
        last_accessed_at: new Date().toISOString(),
      };

      const nextProgress = {
        ...progress,
        [field]: value,
      };
      updates.completion_percentage = calculateChapterCompletionPercentage(
        chapter.chapter_number,
        nextProgress,
      );

      if (updates.completion_percentage === 100) {
        updates.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('user_progress')
        .upsert(updates, { onConflict: 'user_id,chapter_id' })
        .select()
        .single();

      if (error) throw error;

      setProgress(data);
      toast({
        title: 'Progresso salvo!',
        description: `${updates.completion_percentage}% concluído`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar progresso',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={{ paddingTop: 'calc(5rem - 25px)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0072BC] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando capítulo...</p>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: 'calc(5rem - 25px)' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Capítulo não encontrado</h1>
          <Button onClick={() => navigate(ROUTE_PATHS.DASHBOARD)}>
            Voltar ao Painel Geral CTP
          </Button>
        </div>
      </div>
    );
  }

  const chapterNum = chapter.chapter_number;
  const completionPercentage = calculateChapterCompletionPercentage(
    chapterNum,
    progress,
  );
  const apostilaContent = normalizeApostilaContent(chapter.apostila_content);
  
  // Capítulos que não devem ter quiz/prova: 0 (Introdução), 13 e 14 (Módulo Empreendedor)
  const shouldShowQuizAndExam = chapterHasAssessments(chapterNum);
  
  // Capítulo 0 não tem materiais complementares nem slides
  const shouldShowMateriais = chapterNum !== 0;
  const shouldShowSlides = chapterNum !== 0;

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: 'calc(5rem - 25px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
        {/* Header */}
        <div className="mb-3 lg:mb-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(ROUTE_PATHS.DASHBOARD)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Painel Geral CTP
          </Button>

          {/* Título do Capítulo */}
          <div className="mb-4">
            <div className="text-xs text-[#FF6B00] font-semibold mb-1" style={{fontSize: 'clamp(0.7rem, 1.2vw, 0.875rem)'}}>
              CAPÍTULO {chapterId}
            </div>
            <h1 className="text-xl lg:text-2xl font-bold text-[#0072BC] mb-1" style={{fontSize: 'clamp(1.25rem, 2vw, 1.75rem)'}}>
              {chapter.title}
            </h1>
            <p className="text-sm lg:text-base text-gray-600" style={{fontSize: 'clamp(0.875rem, 1.5vw, 1rem)'}}>
              {chapter.subtitle}
            </p>
          </div>

          {/* Progresso Digital */}
          <div className="mb-4">
            <DigitalProgress 
              percentage={completionPercentage}
              videoCompleted={progress?.video_completed || false}
              apostilaCompleted={progress?.apostila_completed || false}
              podcastCompleted={progress?.podcast_completed || false}
              quizCompleted={progress?.quiz_completed || false}
              materialsCompleted={progress?.materials_completed || false}
              showQuiz={shouldShowQuizAndExam}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-0">
                <Tabs key={`chapter-${chapterId}-tabs`} value={activeTab} onValueChange={setActiveTab}>
                  <div className="border-b">
                    <TabsList className="w-full justify-start rounded-none bg-transparent p-0 overflow-x-auto">
                      <TabsTrigger 
                        value="video" 
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0072BC] data-[state=active]:bg-transparent px-2 md:px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm whitespace-nowrap"
                      >
                        <Video className="w-4 h-4 mr-1 md:mr-2" />
                        Videoaula
                      </TabsTrigger>
                      <TabsTrigger 
                        value="apostila"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0072BC] data-[state=active]:bg-transparent px-2 md:px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm whitespace-nowrap"
                      >
                        <FileText className="w-4 h-4 mr-1 md:mr-2" />
                        Apostila
                      </TabsTrigger>
                      <TabsTrigger 
                        value="podcast"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0072BC] data-[state=active]:bg-transparent px-2 md:px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm whitespace-nowrap"
                      >
                        <Headphones className="w-4 h-4 mr-1 md:mr-2" />
                        Podcast
                      </TabsTrigger>
                      {shouldShowSlides && (
                        <TabsTrigger
                          value="slides"
                          className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0072BC] data-[state=active]:bg-transparent px-2 md:px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm whitespace-nowrap"
                        >
                          <Presentation className="w-4 h-4 mr-1 md:mr-2" />
                          Slides
                        </TabsTrigger>
                      )}
                      {shouldShowMateriais && (
                        <TabsTrigger 
                          value="materiais"
                          className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0072BC] data-[state=active]:bg-transparent px-2 md:px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm"
                        >
                          <Download className="w-4 h-4 mr-1 md:mr-2" />
                          <span className="hidden sm:inline">Materiais</span>
                          <span className="sm:hidden">Docs</span>
                        </TabsTrigger>
                      )}
                      {shouldShowQuizAndExam && (
                        <>
                          <TabsTrigger 
                            value="quiz"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0072BC] data-[state=active]:bg-transparent px-2 md:px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm"
                          >
                            <Brain className="w-4 h-4 mr-1 md:mr-2" />
                            Quiz
                          </TabsTrigger>
                          <TabsTrigger 
                            value="prova"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0072BC] data-[state=active]:bg-transparent px-2 md:px-4 lg:px-6 py-3 md:py-4 text-xs md:text-sm"
                          >
                            <ClipboardCheck className="w-4 h-4 mr-1 md:mr-2" />
                            Prova
                          </TabsTrigger>
                        </>
                      )}
                    </TabsList>
                  </div>

                  <TabsContent value="video" className="p-2 md:p-3 lg:p-4">
                    {chapter.video_url ? (
                      <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4 lg:mb-6">
                        <iframe
                          width="100%"
                          height="100%"
                          src={(() => {
                            const url = chapter.video_url;
                            // Converte youtu.be/ID para youtube.com/embed/ID (SEM autoplay)
                            if (url.includes('youtu.be/')) {
                              const videoId = url.split('youtu.be/')[1].split('?')[0];
                              return `https://www.youtube.com/embed/${videoId}?rel=0`;
                            }
                            // Converte youtube.com/watch?v=ID para youtube.com/embed/ID (SEM autoplay)
                            if (url.includes('watch?v=')) {
                              const embedUrl = url.replace('watch?v=', 'embed/');
                              return `${embedUrl}?rel=0`;
                            }
                            // Se já estiver no formato embed, adiciona parâmetro para desabilitar autoplay
                            if (url.includes('embed/')) {
                              return url.includes('?') ? `${url}&autoplay=0&rel=0` : `${url}?autoplay=0&rel=0`;
                            }
                            // Fallback: retorna URL original
                            return url;
                          })()}
                          title={`Videoaula - ${chapter.title}`}
                          frameBorder="0"
                          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center mb-4 lg:mb-6">
                        <div className="text-center text-white">
                          <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg">Videoaula do Capítulo {chapterId}</p>
                          <p className="text-sm text-gray-400 mt-2">Conteúdo em vídeo será adicionado em breve</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Checkbox 
                        id="video-complete"
                        checked={progress?.video_completed || false}
                        onCheckedChange={(checked) => updateProgress('video_completed', checked as boolean)}
                      />
                      <label htmlFor="video-complete" className="text-sm font-medium cursor-pointer">
                        Marcar vídeo como concluído
                      </label>
                    </div>

                    <div className="mt-4 lg:mt-5">
                      <h3 className="text-lg lg:text-xl font-bold mb-3">Sobre esta aula</h3>
                      <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
                        {chapter.description}
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="apostila" className="p-2 md:p-3 lg:p-4">
                    {/* PDF Viewer for Apostila - Priority */}
                    {chapter.apostila_pdf_url ? (
                      <div className="space-y-6">
                        {/* Introdução */}
                        <div className="bg-gradient-to-br from-[#0072BC] to-[#005a9e] rounded-lg p-6 md:p-8 text-white">
                          <FileText className="w-12 h-12 mb-4 text-white" />
                          <h3 className="text-2xl font-bold mb-2 text-white">Apostila do Capítulo {chapterId}</h3>
                          <p className="text-white leading-relaxed">
                            Material completo de estudo com todos os conceitos teóricos, exemplos práticos, 
                            tabelas de referência e exercícios. Leia com atenção e faça anotações para 
                            fixar o conteúdo.
                          </p>
                        </div>

                        {/* Visualizador de PDF - Optimized for PORTRAIT (A4) documents */}
                        <div className="w-full bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 relative" style={{ height: '85vh', maxHeight: '1000px', minHeight: '600px' }}>
                          <iframe
                            src={`https://docs.google.com/viewer?url=${encodeURIComponent(chapter.apostila_pdf_url)}&embedded=true`}
                            className="w-full h-full"
                            title={`Apostila - ${chapter.title}`}
                            frameBorder="0"
                          />
                        </div>
                        
                        {/* Botões de ação */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button 
                            onClick={() => openExternal(chapter.apostila_pdf_url)}
                            className="flex-1 bg-[#0072BC] hover:bg-[#005a9e]"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Baixar Apostila (PDF)
                          </Button>
                          <Button 
                            onClick={() => openExternal(chapter.apostila_pdf_url)}
                            variant="outline"
                            className="flex-1"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Abrir em Tela Cheia
                          </Button>
                        </div>

                        {/* Dicas de estudo */}
                        <div className="bg-blue-50 border-l-4 border-[#0072BC] p-4 rounded">
                          <p className="text-sm text-gray-700">
                            <strong>💡 Dicas de estudo:</strong>
                          </p>
                          <ul className="text-sm text-gray-600 mt-2 space-y-1 ml-4">
                            <li>• Leia com atenção e faça anotações importantes</li>
                            <li>• Destaque os conceitos-chave e fórmulas</li>
                            <li>• Resolva os exercícios práticos ao final</li>
                            <li>
                              {shouldShowQuizAndExam
                                ? '• Revise antes de fazer o quiz e a prova'
                                : '• Revise os pontos principais antes de concluir o capítulo'}
                            </li>
                          </ul>
                        </div>

                        {/* Checkbox de conclusão */}
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                          <Checkbox 
                            id="apostila-complete"
                            checked={progress?.apostila_completed || false}
                            onCheckedChange={(checked) => updateProgress('apostila_completed', checked as boolean)}
                          />
                          <label htmlFor="apostila-complete" className="text-sm font-medium cursor-pointer">
                            Marcar apostila como concluída
                          </label>
                        </div>
                      </div>
                    ) : (
                    <div className="prose max-w-none">
                      {/* Fallback: Existing HTML content */}
                      {/* Render HTML content if available (support both html and html_content) */}
                      {apostilaContent && (apostilaContent.html_content || apostilaContent.html) ? (
                        <div 
                          className="apostila-html-content"
                        ><SafeCourseHtml html={apostilaContent.html_content || apostilaContent.html || ''} /></div>
                      ) : (
                        <>
                          <h3 className="text-2xl font-bold mb-6">Apostila - Capítulo {chapterId}</h3>
                          
                          {apostilaContent?.sections ? (
                        <div className="space-y-8">
                          {apostilaContent.sections.map((section, idx: number) => (
                            <div key={idx} className="border-l-4 border-[#0072BC] pl-6">
                              <h4 className="text-xl font-bold text-[#0072BC] mb-4">{section.title}</h4>
                              
                              {/* Renderizar imagem se disponível */}
                              {section.image && (
                                <div className="mb-6">
                                  <img 
                                    src={section.image} 
                                    alt={section.title} 
                                    className="w-full rounded-lg shadow-md"
                                    loading="lazy"
                                  />
                                </div>
                              )}
                              
                              {/* Renderizar conteúdo como HTML */}
                              <div 
                                className="apostila-section-content text-gray-700 leading-relaxed mb-4"
                              ><SafeCourseHtml html={section.content || ''} /></div>
                              
                              {section.subsections && section.subsections.map((sub: any, subIdx: number) => (
                                <div key={subIdx} className="ml-4 mb-4 p-4 bg-gray-50 rounded-lg">
                                  <h5 className="font-semibold text-gray-900 mb-2">{sub.subtitle}</h5>
                                  <p className="text-gray-700">{sub.text}</p>
                                </div>
                              ))}
                              
                              {section.conversions && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                  {section.conversions.map((conv: any, convIdx: number) => (
                                    <div key={convIdx} className="p-4 bg-blue-50 rounded-lg">
                                      <h6 className="font-bold text-[#0072BC] mb-2">{conv.type}</h6>
                                      <p className="text-sm text-gray-700 mb-1">{conv.formula}</p>
                                      <p className="text-xs text-gray-600 italic">{conv.example}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {section.formulas && (
                                <div className="space-y-4 mt-4">
                                  {section.formulas.map((formula: any, fIdx: number) => (
                                    <div key={fIdx} className="p-4 bg-gradient-to-r from-blue-50 to-white rounded-lg border border-blue-200">
                                      <h6 className="font-bold text-[#0072BC] mb-2">{formula.type}</h6>
                                      <p className="font-mono text-sm bg-white p-2 rounded mb-2">{formula.formula}</p>
                                      <p className="text-sm text-gray-700">{formula.example}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {section.safety_tips && (
                                <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                                  <h6 className="font-bold text-red-700 mb-3">⚠️ Dicas de Segurança</h6>
                                  <ul className="space-y-2">
                                    {section.safety_tips.map((tip: string, tipIdx: number) => (
                                      <li key={tipIdx} className="text-sm text-gray-700 flex items-start gap-2">
                                        <span className="text-red-500 mt-1">•</span>
                                        <span>{tip}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {section.products && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                  {section.products.map((product: any, pIdx: number) => (
                                    <div key={pIdx} className="p-3 bg-white border border-gray-200 rounded-lg">
                                      <h6 className="font-semibold text-gray-900">{product.name}</h6>
                                      <p className="text-sm text-gray-600">{product.function}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {section.errors && (
                                <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                                  <h6 className="font-bold text-yellow-700 mb-3">❌ Erros Comuns a Evitar</h6>
                                  <ul className="space-y-2">
                                    {section.errors.map((error: string, errIdx: number) => (
                                      <li key={errIdx} className="text-sm text-gray-700">{error}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {section.exercises && (
                                <div className="mt-4 space-y-3">
                                  <h6 className="font-bold text-[#0072BC] mb-3">📝 Exercícios Práticos</h6>
                                  {section.exercises.map((ex: any, exIdx: number) => (
                                    <div key={exIdx} className="p-4 bg-gray-50 rounded-lg">
                                      <p className="font-semibold text-gray-900 mb-2">{exIdx + 1}. {ex.question}</p>
                                      <details className="mt-2">
                                        <summary className="cursor-pointer text-sm text-[#0072BC] hover:underline">
                                          Ver resposta
                                        </summary>
                                        <p className="mt-2 text-sm text-gray-700 bg-white p-3 rounded">{ex.answer}</p>
                                      </details>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-blue-50 border-l-4 border-[#0072BC] p-6 mb-6">
                          <p className="text-gray-700">
                            <strong>Material de estudo completo</strong> com todos os conceitos, 
                            exemplos práticos e exercícios para fixação do conteúdo.
                          </p>
                        </div>
                      )}
                        </>
                      )}
                      
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg mt-6">
                        <Checkbox 
                          id="apostila-complete-fallback"
                          checked={progress?.apostila_completed || false}
                          onCheckedChange={(checked) => updateProgress('apostila_completed', checked as boolean)}
                        />
                        <label htmlFor="apostila-complete-fallback" className="text-sm font-medium cursor-pointer">
                          Marcar apostila como concluída
                        </label>
                      </div>
                    </div>
                    )}
                  </TabsContent>

                  <TabsContent value="podcast" className="p-2 md:p-3 lg:p-4">
                    <div className="bg-gradient-to-br from-[#0072BC] to-[#005a9e] rounded-lg p-8 text-white mb-6">
                      <Headphones className="w-12 h-12 mb-4 text-white" />
                      <h3 className="text-2xl font-bold mb-2 text-white">Podcast do Capítulo {chapterId}</h3>
                      <p className="text-white mb-6">
                        Ouça o conteúdo enquanto trabalha, dirige ou faz outras atividades
                      </p>
                      
                      {chapter.podcast_url ? (
                        <div className="space-y-4">
                          {/* Podcast Principal */}
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                            <h4 className="font-semibold mb-3">🎙️ Podcast Principal</h4>
                            <audio 
                              controls 
                              className="w-full mb-4"
                              style={{
                                filter: 'invert(1) hue-rotate(180deg)',
                                borderRadius: '8px'
                              }}
                            >
                              <source src={chapter.podcast_url} type="audio/mpeg" />
                              <source src={chapter.podcast_url} type="audio/mp4" />
                              Seu navegador não suporta o elemento de áudio.
                            </audio>
                            
                            <div className="flex items-center justify-between text-sm">
                              <span>Duração: {PODCAST_DURATIONS[chapterNum] || chapter.duration}</span>
                              <a 
                                href={chapter.podcast_url} 
                                download={`CTP_Capitulo_${chapterId}_Podcast.mp3`}
                                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Baixar Áudio
                              </a>
                            </div>
                          </div>

                          {/* Informações Adicionais */}
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                            <h4 className="font-semibold mb-2">🎧 Dicas para aproveitar melhor:</h4>
                            <ul className="text-sm text-blue-100 space-y-1">
                              <li>• Ouça durante o trajeto para o trabalho</li>
                              <li>• Revise o conteúdo enquanto faz manutenção de piscinas</li>
                              <li>• Baixe para ouvir offline</li>
                              <li>• Aumente a velocidade de reprodução para revisão rápida</li>
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white/20 rounded-lg p-4">
                          <div className="text-sm mb-2">Duração: {chapter.duration}</div>
                          <div className="text-xs text-blue-100">🎧 Podcast em breve! Estamos preparando o áudio para você.</div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Checkbox 
                        id="podcast-complete"
                        checked={progress?.podcast_completed || false}
                        onCheckedChange={(checked) => updateProgress('podcast_completed', checked as boolean)}
                      />
                      <label htmlFor="podcast-complete" className="text-sm font-medium cursor-pointer">
                        Marcar podcast como concluído
                      </label>
                    </div>
                  </TabsContent>

                  <TabsContent value="slides" className="p-2 md:p-3 lg:p-4">
                    <div className="space-y-6">
                      {/* Introdução */}
                      <div className="bg-gradient-to-br from-[#0072BC] to-[#005a9e] rounded-lg p-6 md:p-8 text-white">
                        <Presentation className="w-12 h-12 mb-4 text-white" />
                        <h3 className="text-2xl font-bold mb-2 text-white">Cartões de Estudo Ilustrados</h3>
                        <p className="text-white leading-relaxed">
                          Cada slide é um <strong className="text-white">cartão de estudo ilustrado</strong>, com os principais tópicos que complementam a videoaula e a apostila. 
                          São recomendados para uso no estudo e na revisão sempre que necessário, por serem muito úteis e completos.
                        </p>
                      </div>

                      {/* Visualizador de PDF */}
                      {chapter.slides_url ? (
                        <div className="space-y-4">
                          {/* Preview do PDF com Google Docs Viewer - Funciona em todos os navegadores */}
                          <div className="w-full aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 relative" style={{ maxHeight: '70vh', minHeight: '400px' }}>
                            <iframe
                              src={`https://docs.google.com/viewer?url=${encodeURIComponent(chapter.slides_url)}&embedded=true`}
                              className="w-full h-full"
                              title={`Slides - ${chapter.title}`}
                              frameBorder="0"
                            />
                          </div>
                          
                          
                          {/* Botões de ação */}
                          <div className="flex flex-col sm:flex-row gap-3">
                            <Button 
                              onClick={() => openExternal(chapter.slides_url)}
                              className="flex-1 bg-[#FF6B00] hover:bg-[#e55d00]"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Baixar Slides (PDF)
                            </Button>
                            <Button 
                              onClick={() => openExternal(chapter.slides_url)}
                              variant="outline"
                              className="flex-1"
                            >
                              <Presentation className="w-4 h-4 mr-2" />
                              Abrir em Tela Cheia
                            </Button>
</div>

                          {/* Checkbox de conclusão */}
                          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <Checkbox
                              id="slides-completed"
                              checked={progress?.slides_completed || false}
                              onCheckedChange={(checked) => updateProgress('slides_completed', checked as boolean)}
                              className="h-5 w-5"
                            />
                            <Label
                              htmlFor="slides-completed"
                              className="text-sm font-medium cursor-pointer flex-1"
                            >
                              <CheckCircle className="w-4 h-4 inline mr-2 text-green-600" />
                              Marque como concluído os slides deste capítulo
                            </Label>
                          </div>

                          {/* Dicas de uso */}
                          <div className="bg-blue-50 border-l-4 border-[#0072BC] p-4 rounded">
                            <p className="text-sm text-gray-700">
                              <strong>💡 Dicas de uso:</strong>
                            </p>
                            <ul className="text-sm text-gray-600 mt-2 space-y-1 ml-4">
                              <li>
                                {shouldShowQuizAndExam
                                  ? '• Use os slides para revisão rápida antes das provas'
                                  : '• Use os slides para revisar e consolidar o conteúdo'}
                              </li>
                              <li>• Imprima e crie seu próprio caderno de estudos</li>
                              <li>• Consulte durante o trabalho prático em piscinas</li>
                              <li>• Compartilhe com colegas para estudo em grupo</li>
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <Card className="border-2 border-dashed border-gray-300">
                          <CardContent className="p-8 text-center">
                            <Presentation className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h4 className="text-lg font-bold text-gray-900 mb-2">
                              Slides em Preparação
                            </h4>
                            <p className="text-gray-600 mb-4">
                              Os cartões de estudo ilustrados para este capítulo serão disponibilizados em breve.
                            </p>
                            <div className="bg-orange-50 border-l-4 border-[#FF6B00] p-3 rounded inline-block">
                              <p className="text-sm text-orange-800">
                                📚 <strong>Em breve!</strong> Estamos preparando material de alta qualidade para você.
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                  {shouldShowMateriais && (
                  <TabsContent value="materiais" className="p-4 md:p-6">
                    {/* Container 30% mais largo */}
                    <div className="max-w-[1400px] mx-auto space-y-6">
                      
                      {/* Header Compacto */}
                      <div className="bg-gradient-to-br from-[#0072BC] to-[#005a9e] rounded-lg p-6 text-white">
                        <div className="flex items-center gap-3 mb-2">
                          <Download className="w-8 h-8 text-white" />
                          <h3 className="text-xl font-bold text-white">Materiais Complementares</h3>
                        </div>
                        <p className="text-sm text-white">
                          Baixe PDFs, apostilas, slides e infográficos para consulta rápida
                        </p>
                      </div>

                      {/* Cards em Coluna Única - Empilhados Verticalmente */}
                      <div className="space-y-4">
                        
                        {/* Card Apostila */}
                        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-14 h-14 rounded-xl bg-[#0072BC]/10 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-7 h-7 text-[#0072BC]" />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-lg font-bold text-gray-900 mb-1">
                                  Apostila - Capítulo {chapterId}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  Material completo em PDF para estudo offline
                                </p>
                              </div>
                            </div>
                            {chapter.apostila_pdf_url ? (
                              <Button 
                                onClick={() => openExternal(chapter.apostila_pdf_url)}
                                className="w-full bg-[#0072BC] hover:bg-[#005a9e] text-white"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Baixar
                              </Button>
                            ) : (
                              <div className="bg-amber-50 border-l-4 border-amber-500 px-4 py-2 rounded text-center">
                                <p className="text-xs text-amber-800">📄 Em preparação</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Card Slides — oculto no cap. 0 */}
                        {shouldShowSlides && <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-14 h-14 rounded-xl bg-[#FF6B00]/10 flex items-center justify-center flex-shrink-0">
                                <Presentation className="w-7 h-7 text-[#FF6B00]" />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-lg font-bold text-gray-900 mb-1">
                                  Slides - Capítulo {chapterId}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  Cartões de estudo ilustrados em PDF
                                </p>
                              </div>
                            </div>
                            {chapter.slides_url ? (
                              <Button 
                                onClick={() => openExternal(chapter.slides_url)}
                                className="w-full bg-[#FF6B00] hover:bg-[#e55f00] text-white"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Baixar
                              </Button>
                            ) : (
                              <div className="bg-amber-50 border-l-4 border-amber-500 px-4 py-2 rounded text-center">
                                <p className="text-xs text-amber-800">🎨 Em preparação</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>}

                        {/* Card Infográfico */}
                        {chapter.infografico_url && (
                          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                  </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-bold text-gray-900 truncate">
                                    Infográfico Cap {chapterId}
                                  </h4>
                                  <p className="text-xs text-gray-600">Resumo visual</p>
                                </div>
                              </div>
                              <Button 
                                onClick={() => openExternal(chapter.infografico_url)}
                                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white h-9 text-xs"
                              >
                                <Download className="w-3 h-3 mr-1" />
                                Baixar
                              </Button>
                            </CardContent>
                          </Card>
                        )}

                        {/* Card NBR 10339 removido - PDF completo da norma não deve ser disponibilizado */}

                        {/* Card Checklist ABNT 10339 */}
                        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-14 h-14 rounded-xl bg-[#0072BC]/10 flex items-center justify-center flex-shrink-0">
                                <ClipboardCheck className="w-7 h-7 text-[#0072BC]" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-lg font-bold text-gray-900">
                                    Checklist ABNT 10339
                                  </h4>
                                  <span className="px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded">CONFORMIDADE</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                  Checklist de conformidade para instalações residenciais e comerciais
                                </p>
                              </div>
                            </div>
                            <Button 
                              onClick={() => window.open('https://egihufoowzfykieozusr.supabase.co/storage/v1/object/public/materiais/Checklist-ANAPP-ABNT-10339.pdf', '_blank')}
                              className="w-full bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Baixar Checklist
                            </Button>
                          </CardContent>
                        </Card>

                      </div>

                      {/* Dica Compacta */}
                      <div className="bg-blue-50 border-l-4 border-[#0072BC] p-3 rounded">
                        <p className="text-xs text-gray-700">
                          <strong>💡 Dica:</strong> Imprima os materiais para consulta rápida!
                        </p>
                      </div>

                      {/* Checkbox de conclusão */}
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <Checkbox 
                          id="materials-complete"
                          checked={progress?.materials_completed || false}
                          onCheckedChange={(checked) => updateProgress('materials_completed', checked as boolean)}
                        />
                        <label htmlFor="materials-complete" className="text-sm font-medium cursor-pointer">
                          Marcar materiais adicionais como concluídos
                        </label>
                      </div>

                    </div>
                  </TabsContent>
                  )}

                  {shouldShowQuizAndExam && (
                    <>
                      <TabsContent value="quiz" className="p-2 md:p-3 lg:p-4">
                        <QuizTab chapterId={Number(chapterId)} />
                      </TabsContent>

                      <TabsContent value="prova" className="p-2 md:p-3 lg:p-4">
                        <ExamTab chapterId={Number(chapterId)} />
                      </TabsContent>
                    </>
                  )}
                </Tabs>
              </CardContent>
            </Card>

            {/* Navigation - Esconder durante quiz/prova */}
            {activeTab !== 'quiz' && activeTab !== 'prova' && (
              <div className="flex items-center justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (chapterNum > 0) {
                      navigate(`${ROUTE_PATHS.DASHBOARD}/chapter/${chapterNum - 1}`);
                    }
                  }}
                  disabled={chapterNum === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Capítulo Anterior
                </Button>
                <Button
                  onClick={() => {
                    if (chapterNum < 14) {
                      navigate(`${ROUTE_PATHS.DASHBOARD}/chapter/${chapterNum + 1}`);
                    }
                  }}
                  disabled={chapterNum === 14}
                  className="bg-[#0072BC] hover:bg-[#005a9e]"
                >
                  Próximo Capítulo
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <Card className="border-0 shadow-lg sticky top-24">
              <CardContent className="p-3 lg:p-4">
                <h3 className="text-base lg:text-lg font-bold mb-3">Recursos do Capítulo</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => {
                      console.log('Clicking Video button, setting activeTab to: video');
                      setActiveTab('video');
                    }}
                    className={`w-full flex items-center gap-2 lg:gap-3 p-2 lg:p-3 rounded-lg hover:bg-gray-50 transition text-left cursor-pointer ${activeTab === 'video' ? 'bg-blue-50 border-l-4 border-[#0072BC]' : ''}`}
                  >
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-[#0072BC]/10 flex items-center justify-center">
                      {progress?.video_completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Video className="w-5 h-5 text-[#0072BC]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">Videoaula</div>
                      <div className="text-xs text-gray-600">{VIDEO_DURATIONS[chapterNum] || chapter.duration}</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => {
                      console.log('Clicking Apostila button, setting activeTab to: apostila');
                      setActiveTab('apostila');
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition text-left cursor-pointer ${activeTab === 'apostila' ? 'bg-blue-50 border-l-4 border-[#0072BC]' : ''}`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#0072BC]/10 flex items-center justify-center">
                      {progress?.apostila_completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <FileText className="w-5 h-5 text-[#0072BC]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">Apostila Digital</div>
                      <div className="text-xs text-gray-600">PDF para estudo</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => {
                      console.log('Clicking Podcast button, setting activeTab to: podcast');
                      setActiveTab('podcast');
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition text-left cursor-pointer ${activeTab === 'podcast' ? 'bg-blue-50 border-l-4 border-[#0072BC]' : ''}`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#0072BC]/10 flex items-center justify-center">
                      {progress?.podcast_completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Headphones className="w-5 h-5 text-[#0072BC]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">Podcast</div>
                      <div className="text-xs text-gray-600">{PODCAST_DURATIONS[chapterNum] || 'Áudio'}</div>
                    </div>
                  </button>

                  {shouldShowSlides && (
                    <button
                      onClick={() => setActiveTab('slides')}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition text-left cursor-pointer ${activeTab === 'slides' ? 'bg-blue-50 border-l-4 border-[#0072BC]' : ''}`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center">
                        <Presentation className="w-5 h-5 text-[#FF6B00]" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">Slides</div>
                        <div className="text-xs text-gray-600">Cartões de Estudo</div>
                      </div>
                    </button>
                  )}

                  <button 
                    onClick={() => {
                      console.log('Clicking Materiais button, setting activeTab to: materiais');
                      setActiveTab('materiais');
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition text-left cursor-pointer ${activeTab === 'materiais' ? 'bg-blue-50 border-l-4 border-[#0072BC]' : ''}`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#0072BC]/10 flex items-center justify-center">
                      <Download className="w-5 h-5 text-[#0072BC]" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">Materiais</div>
                      <div className="text-xs text-gray-600">Downloads</div>
                    </div>
                  </button>


                  {shouldShowQuizAndExam && (
                    <>
                      <button 
                        onClick={() => {
                          console.log('Clicking Quiz button, setting activeTab to: quiz');
                          setActiveTab('quiz');
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition text-left cursor-pointer ${activeTab === 'quiz' ? 'bg-blue-50 border-l-4 border-[#0072BC]' : ''}`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-[#0072BC]/10 flex items-center justify-center">
                          <Brain className="w-5 h-5 text-[#0072BC]" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">Quiz</div>
                          <div className="text-xs text-gray-600">Prática</div>
                        </div>
                      </button>

                      <button 
                        onClick={() => {
                          console.log('Clicking Prova button, setting activeTab to: prova');
                          setActiveTab('prova');
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition text-left cursor-pointer ${activeTab === 'prova' ? 'bg-blue-50 border-l-4 border-[#0072BC]' : ''}`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-[#0072BC]/10 flex items-center justify-center">
                          <ClipboardCheck className="w-5 h-5 text-[#0072BC]" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">Prova</div>
                          <div className="text-xs text-gray-600">Avaliação</div>
                        </div>
                      </button>
                    </>
                  )}
                  
                  
                  {/* Ferramentas Exclusivas */}
                  <div className="pt-4 mt-4 border-t border-gray-200 space-y-3">
                    <button 
                      onClick={() => navigate(ROUTE_PATHS.CHECKLIST)}
                      className="w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#e55d00] hover:from-[#e55d00] hover:to-[#cc4f00] transition text-left cursor-pointer shadow-lg hover:shadow-xl"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                        <ClipboardCheck className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-sm text-white">Checklist</div>
                        <div className="text-xs text-orange-100">Guia do Piscineiro</div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white" />
                    </button>

                    <button 
                      onClick={() => navigate(ROUTE_PATHS.CALCULATOR)}
                      className="w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-[#00A3E0] to-[#0072BC] hover:from-[#0072BC] hover:to-[#005a9e] transition text-left cursor-pointer shadow-lg hover:shadow-xl"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                        <Calculator className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-sm text-white">AcquaCalc CTP</div>
                        <div className="text-xs text-blue-100">Calculadora Profissional</div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
