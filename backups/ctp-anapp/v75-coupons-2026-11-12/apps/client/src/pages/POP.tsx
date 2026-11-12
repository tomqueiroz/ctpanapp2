import { ArrowLeft, Download, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ROUTE_PATHS } from '@/lib';

const POP_PDF_URL = '/documents/POPVFULL.pdf';

export default function POP() {
  const navigate = useNavigate();
  const absolutePdfUrl =
    typeof window === 'undefined' ? POP_PDF_URL : `${window.location.origin}${POP_PDF_URL}`;
  const embeddedViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(absolutePdfUrl)}&embedded=true`;

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-12 pt-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white shadow">
              <img
                src="/images/pop-mask.jpg"
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#0072BC]">Material de apoio</p>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">POP para Operador de Piscinas</h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-600">
                Consulte o Procedimento Operacional Padrão diretamente na Área do Aluno.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTE_PATHS.DASHBOARD)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <Button asChild className="gap-2 bg-[#0072BC] hover:bg-[#005a9e]">
              <a href={POP_PDF_URL} download="POPVFULL.pdf">
                <Download className="h-4 w-4" />
                Baixar PDF
              </a>
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <CardContent className="p-0">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
              <FileText className="h-4 w-4 text-[#0072BC]" />
              <span>Visualização do documento — 10 páginas</span>
            </div>
            <div className="h-[72vh] min-h-[560px] w-full bg-slate-100">
              <iframe
                title="Visualização do POP para Operador de Piscinas"
                src={embeddedViewerUrl}
                loading="lazy"
                className="h-full w-full border-0"
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-950 sm:flex-row sm:items-center sm:justify-between">
          <span>Se o visualizador não abrir no seu dispositivo, use o botão “Baixar PDF”.</span>
          <a
            href={POP_PDF_URL}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-[#0072BC] underline underline-offset-2"
          >
            Abrir em nova aba
          </a>
        </div>
      </div>
    </div>
  );
}
