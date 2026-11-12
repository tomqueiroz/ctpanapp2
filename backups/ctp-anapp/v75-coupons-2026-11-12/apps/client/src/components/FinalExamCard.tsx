import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getExamPath } from '@/lib/index';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ClipboardCheck } from 'lucide-react';

interface FinalStatus {
  can_take_exam: boolean;
  best_score: number | null;
  attempts_count: number;
  passed_required_exams: number;
}

export function FinalExamCard() {
  const [examId, setExamId] = useState<string | null>(null);
  const [status, setStatus] = useState<FinalStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data: exam, error } = await supabase.from('exams')
          .select('id').eq('is_final_certification', true).is('chapter_id', null).single();
        if (error || !exam) throw new Error('Não foi possível consultar a prova final.');
        const { data, error: accessError } = await supabase.rpc('lms_exam_access_status', { p_exam_id: exam.id });
        if (accessError) throw accessError;
        if (!cancelled) {
          setExamId(exam.id);
          setStatus(data as FinalStatus);
        }
      } catch {
        if (!cancelled) setErrorMessage('Não foi possível carregar a prova final. Atualize a página para tentar novamente.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  return (
    <Card className="mb-6 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <ClipboardCheck className="h-6 w-6 text-primary" /> Prova Final
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Dez questões de revisão das apostilas atuais. Cinco alternativas por questão,
          apenas uma correta e aprovação com pelo menos 7 acertos (70%).
        </p>
        {loading && <p role="status">Consultando liberação...</p>}
        {errorMessage && <Alert variant="destructive"><AlertDescription>{errorMessage}</AlertDescription></Alert>}
        {status && (
          <>
            {status.attempts_count > 0 && <p className="text-sm">
              Melhor nota: <strong>{status.best_score ?? 0}%</strong> · Tentativas: {status.attempts_count}
            </p>}
            {status.can_take_exam && examId ? (
              <Button asChild className="w-full sm:w-auto">
                <Link to={getExamPath(examId)}>
                  {status.attempts_count > 0 ? 'Refazer Prova Final' : 'Iniciar Prova Final'}
                </Link>
              </Button>
            ) : <p className="text-sm text-muted-foreground">
              A prova final será liberada após a aprovação nas provas dos capítulos 1 a 12
              ({status.passed_required_exams}/12), respeitando aprovações históricas.
            </p>}
            <p className="text-xs text-muted-foreground">
              Esta revisão final não cancela aprovações ou certificados anteriores e não
              altera os critérios de certificação já vigentes.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
