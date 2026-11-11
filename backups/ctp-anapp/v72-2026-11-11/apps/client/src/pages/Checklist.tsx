import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, ClipboardCheck, Download, Share2, Info, AlertCircle, FileText, User, Calendar, MapPin, Phone, Mail, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ROUTE_PATHS } from '@/lib/index';
import {
  buildChecklistPdf,
  buildChecklistPdfFileName,
} from '@/lib/checklist-pdf';

interface ChecklistItem {
  id: string;
  label: string;
  checked?: boolean;
  tip?: string;
}

interface ChecklistSection {
  title: string;
  items: ChecklistItem[];
}

interface CategoryData {
  id: string;
  title: string;
  description: string;
  sections: ChecklistSection[];
}

export default function Checklist() {
  const navigate = useNavigate();
  const pdfObjectUrlRef = useRef<string | null>(null);
  
  const [activeCategory, setActiveCategory] = useState('residencial');
  const [clientData, setClientData] = useState({
    date: new Date().toISOString().split('T')[0],
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  // Estado para armazenar os checks de todas as categorias
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [sharingPdf, setSharingPdf] = useState(false);
  const [shareFeedback, setShareFeedback] = useState('');
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');

  useEffect(() => {
    return () => {
      if (pdfObjectUrlRef.current) {
        URL.revokeObjectURL(pdfObjectUrlRef.current);
      }
    };
  }, []);

  const handleCheck = (id: string) => {
    setChecks(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const categories: Record<string, CategoryData> = {
    residencial: {
      id: 'residencial',
      title: 'Residencial',
      description: 'Uso intermitente (Finais de semana, poucas pessoas)',
      sections: [
        {
          title: 'Parte 1 - Preparação',
          items: [
            { id: 'res_prep_1', label: 'EPIs Básicos (Luvas, óculos de proteção, calçado fechado)' },
            { id: 'res_prep_2', label: 'Estojo de Teste (pH e Cloro Livre)' },
            { id: 'res_prep_3', label: 'Químicos: Cloro, Algicida de Manutenção, Elevador/Redutor de pH' },
            { id: 'res_prep_4', label: 'Equipamentos: Peneira, escova, aspirador, mangueira, cabo telescópico' }
          ]
        },
        {
          title: 'Parte 2 - Diagnóstico',
          items: [
            { id: 'res_diag_1', label: 'Verificar nível da água (deve estar no meio do skimmer)' },
            { id: 'res_diag_2', label: 'Limpar cesto do skimmer e pré-filtro da motobomba', tip: 'Sempre desligue a bomba antes de abrir o pré-filtro.' },
            { id: 'res_diag_3', label: 'Medir pH (Ideal: 7.2 a 7.6) e Cloro Livre (Ideal: 1.0 a 3.0 ppm)' },
            { id: 'res_diag_4', label: 'Avaliar aspecto visual (transparência, folhas, manchas)' }
          ]
        },
        {
          title: 'Parte 3 - Aplicação e Tratamento',
          items: [
            { id: 'res_trat_1', label: 'Peneiração da superfície e remoção de sujeira grossa' },
            { id: 'res_trat_2', label: 'Escovação das paredes e bordas' },
            { id: 'res_trat_3', label: 'Aspiração do fundo (filtrando ou drenando, dependendo da sujeira)' },
            { id: 'res_trat_4', label: 'Ajuste de pH (se necessário, aguardar recirculação)' },
            { id: 'res_trat_5', label: 'Aplicação de Cloro (diluído previamente em balde com água da piscina)', tip: 'Nunca adicione água ao cloro, sempre adicione o cloro à água.' },
            { id: 'res_trat_6', label: 'Retrolavagem do filtro (se a pressão estiver alta)' }
          ]
        },
        {
          title: 'Parte 4 - Relatório e Recomendações',
          items: [
            { id: 'res_rel_1', label: 'Medir parâmetros finais para garantir segurança' },
            { id: 'res_rel_2', label: 'Registrar imagens (Antes e Depois)' },
            { id: 'res_rel_3', label: 'Organizar e guardar equipamentos na casa de máquinas' },
            { id: 'res_rel_4', label: 'Enviar relatório resumido ao cliente via WhatsApp' }
          ]
        }
      ]
    },
    condominio: {
      id: 'condominio',
      title: 'Condomínio',
      description: 'Uso diário moderado (Múltiplas famílias, regras estritas)',
      sections: [
        {
          title: 'Parte 1 - Preparação',
          items: [
            { id: 'cond_prep_1', label: 'EPIs Completos (Luvas nitrílicas, óculos, máscara, avental)' },
            { id: 'cond_prep_2', label: 'Estojo Completo (pH, Cloro, Alcalinidade, Ácido Cianúrico)' },
            { id: 'cond_prep_3', label: 'Químicos: Hipoclorito, Barrilha, Ácido Muriático, Clarificante, Algicida Choque' },
            { id: 'cond_prep_4', label: 'Sinalização: Placas de "Piscina em Tratamento" ou "Interditada"' }
          ]
        },
        {
          title: 'Parte 2 - Diagnóstico',
          items: [
            { id: 'cond_diag_1', label: 'Isolar a área de tratamento (Segurança em 1º lugar)' },
            { id: 'cond_diag_2', label: 'Inspeção da Casa de Máquinas (vazamentos, ruídos anormais, manômetro)' },
            { id: 'cond_diag_3', label: 'Medir pH, Cloro Livre e Alcalinidade (Ideal: 80-120 ppm)' },
            { id: 'cond_diag_4', label: 'Verificar integridade de ralos de fundo e tampas de sucção', tip: 'Ralos quebrados são risco de morte. Interdite a piscina imediatamente se houver danos.' }
          ]
        },
        {
          title: 'Parte 3 - Aplicação e Tratamento',
          items: [
            { id: 'cond_trat_1', label: 'Limpeza física rigorosa (peneira, escovação de bordas com limpa-bordas)' },
            { id: 'cond_trat_2', label: 'Aspiração detalhada do fundo' },
            { id: 'cond_trat_3', label: 'Ajuste de Alcalinidade (primeiro) e pH (segundo)' },
            { id: 'cond_trat_4', label: 'Supercloração ou oxidação de choque (se houver alto uso/cloramina)' },
            { id: 'cond_trat_5', label: 'Retrolavagem do filtro (obrigatória semanalmente em condomínios)' }
          ]
        },
        {
          title: 'Parte 4 - Relatório e Recomendações',
          items: [
            { id: 'cond_rel_1', label: 'Preenchimento do Livro de Operação (Obrigatório por lei)' },
            { id: 'cond_rel_2', label: 'Registro exato dos produtos e quantidades utilizadas' },
            { id: 'cond_rel_3', label: 'Relatar anomalias (equipamentos quebrados, azulejos soltos) ao Síndico/Zelador' },
            { id: 'cond_rel_4', label: 'Remover sinalização apenas quando os parâmetros estiverem seguros' }
          ]
        }
      ]
    },
    clube: {
      id: 'clube',
      title: 'Escola / Clube',
      description: 'Uso intensivo (Alta carga orgânica, exigência sanitária rigorosa)',
      sections: [
        {
          title: 'Parte 1 - Preparação',
          items: [
            { id: 'clube_prep_1', label: 'EPIs Industriais e equipamentos de segurança' },
            { id: 'clube_prep_2', label: 'Fotômetro Digital (Recomendado para precisão) ou Estojo DPD' },
            { id: 'clube_prep_3', label: 'Químicos em grande volume (Cloro líquido/granulado, redutores, floculantes)' },
            { id: 'clube_prep_4', label: 'Verificação de dosadores automáticos e geradores de ozônio/UV' }
          ]
        },
        {
          title: 'Parte 2 - Diagnóstico',
          items: [
            { id: 'clube_diag_1', label: 'Medição rigorosa de todos os parâmetros (pH, Cloro, Alc, Dureza, Ác. Cianúrico)' },
            { id: 'clube_diag_2', label: 'Cálculo do Índice de Langelier (Equilíbrio da água)' },
            { id: 'clube_diag_3', label: 'Inspeção de segurança rigorosa (ralos anti-aprisionamento, botão de pânico)' },
            { id: 'clube_diag_4', label: 'Verificação de temperatura (se aquecida) e turbidez' }
          ]
        },
        {
          title: 'Parte 3 - Aplicação e Tratamento',
          items: [
            { id: 'clube_trat_1', label: 'Limpeza física contínua e aspiração diária' },
            { id: 'clube_trat_2', label: 'Ajustes químicos precisos baseados no volume e carga de banhistas' },
            { id: 'clube_trat_3', label: 'Tratamento de choque frequente para eliminação de cloraminas (cheiro de cloro)' },
            { id: 'clube_trat_4', label: 'Manutenção de sistemas auxiliares (limpeza de eletrodos, troca de areia programada)' },
            { id: 'clube_trat_5', label: 'Retrolavagem frequente baseada na leitura do manômetro', tip: 'Em uso intensivo, a retrolavagem pode ser necessária a cada 2-3 dias.' }
          ]
        },
        {
          title: 'Parte 4 - Relatório e Recomendações',
          items: [
            { id: 'clube_rel_1', label: 'Preenchimento rigoroso do Livro de Operação (Exigência da Vigilância Sanitária)' },
            { id: 'clube_rel_2', label: 'Assinatura do Responsável Técnico (RT)' },
            { id: 'clube_rel_3', label: 'Registro fotográfico de segurança e clareza da água' },
            { id: 'clube_rel_4', label: 'Reunião de alinhamento com a gerência sobre necessidades de manutenção' }
          ]
        }
      ]
    }
  };

  const currentCategory = categories[activeCategory];

  const requiredFieldsComplete = Boolean(
    clientData.name.trim() &&
      clientData.address.trim() &&
      clientData.date,
  );

  const sendChecklistNotification = () => {
    supabase.functions.invoke('send_notification_email_2026_05_09', {
      body: {
        type: 'checklist',
        data: {
          clientName: clientData.name,
          clientEmail: clientData.email,
          clientPhone: clientData.phone,
          clientAddress: clientData.address,
          date: clientData.date,
          category: activeCategory,
          notes: clientData.notes,
        }
      }
    }).catch((e: Error) => console.error('Notification error:', e));
  };

  const createPdfAsset = () => {
    const input = {
      client: clientData,
      category: currentCategory,
      checks,
    };
    const pdf = buildChecklistPdf(input);
    const fileName = buildChecklistPdfFileName(input);
    const blob = pdf.output('blob');
    const objectUrl = URL.createObjectURL(blob);

    if (pdfObjectUrlRef.current) {
      URL.revokeObjectURL(pdfObjectUrlRef.current);
    }
    pdfObjectUrlRef.current = objectUrl;
    setPdfPreviewUrl(objectUrl);
    setPdfFileName(fileName);

    return { blob, fileName, objectUrl };
  };

  const triggerFileDownload = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.rel = 'noopener';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Compartilhar o relatório em PDF
  const shareResults = async () => {
    if (!requiredFieldsComplete) return;

    setSharingPdf(true);
    setShareFeedback('');
    try {
      const { blob, fileName, objectUrl } = createPdfAsset();
      const file = new File([blob], fileName, { type: 'application/pdf' });
      const shareText =
        `Checklist de manutenção de piscina — ${clientData.name} — ` +
        `${new Date(`${clientData.date}T12:00:00`).toLocaleDateString('pt-BR')}.`;
      const supportsFileShare =
        typeof navigator.share === 'function' &&
        (
          typeof navigator.canShare !== 'function' ||
          navigator.canShare({ files: [file] })
        );

      if (supportsFileShare) {
        await navigator.share({
          title: 'Checklist do Piscineiro — CTP ANAPP',
          text: shareText,
          files: [file],
        });
        setShareFeedback('PDF compartilhado pelo aplicativo selecionado.');
      } else {
        triggerFileDownload(objectUrl, fileName);
        window.open(
          `https://wa.me/?text=${encodeURIComponent(
            `${shareText}\n\nO PDF foi baixado. Anexe o arquivo ${fileName} a esta conversa.`,
          )}`,
          '_blank',
          'noopener,noreferrer',
        );
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(shareText).catch(() => undefined);
        }
        setShareFeedback(
          'O PDF foi baixado e o WhatsApp foi aberto. Anexe o arquivo à conversa.',
        );
      }

      sendChecklistNotification();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setShareFeedback('Compartilhamento cancelado.');
      } else {
        console.error('Erro ao compartilhar PDF:', error);
        setShareFeedback(
          'Não foi possível abrir o compartilhamento. Use “Baixar PDF” e anexe o arquivo manualmente.',
        );
      }
    } finally {
      setSharingPdf(false);
    }
  };

  const prepareAndDownloadPdf = () => {
    if (!requiredFieldsComplete) return;

    setGeneratingPdf(true);
    try {
      const { fileName, objectUrl } = createPdfAsset();
      triggerFileDownload(objectUrl, fileName);

      sendChecklistNotification();
      window.setTimeout(() => {
        document
          .getElementById('checklist-pdf-ready')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } catch (error) {
      console.error('Erro ao gerar PDF do checklist:', error);
      alert('Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const downloadPreparedPdf = () => {
    if (!pdfPreviewUrl) return;
    const link = document.createElement('a');
    link.href = pdfPreviewUrl;
    link.download = pdfFileName || 'Checklist-CTP-ANAPP.pdf';
    link.rel = 'noopener';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const openPreparedPdf = () => {
    if (!pdfPreviewUrl) return;
    window.open(pdfPreviewUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-[#0A192F] pt-20 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate(ROUTE_PATHS.DASHBOARD)}
            className="mb-6 text-blue-200 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
Voltar ao Painel Geral
          </Button>

          <div className="flex flex-col items-center justify-center gap-4 mb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B00] to-[#E66000] rounded-2xl flex items-center justify-center shadow-lg shadow-[#FF6B00]/20">
              <ClipboardCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Checklist do Piscineiro</h1>
              <p className="text-blue-200 mt-1">Guia Prático CTP ANAPP</p>
            </div>
          </div>
          
          <div className="mt-6 bg-white/10 border border-white/20 rounded-xl p-4 text-left backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-[#00A3E0] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-100 leading-relaxed">
                <strong className="text-white">Ferramenta Exclusiva:</strong> Utilize este checklist baseado na NBR 10339 e nas boas práticas do CTP para garantir um serviço de excelência. Preencha os dados, marque as tarefas concluídas e gere um relatório profissional para seu cliente.
              </p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white shadow-2xl border-0 rounded-3xl overflow-hidden">
          
          {/* Header do Relatório (Visível no print) */}
          <div className="bg-gradient-to-br from-[#0A192F] to-[#0072BC] p-6 text-white">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="bg-[#FF6B00] p-1.5 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Relatório de Manutenção</h2>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-200 uppercase tracking-wider">CTP ANAPP</p>
              </div>
            </div>

            {/* Formulário de Identificação */}
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-blue-200 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Data *
                  </Label>
                  <Input 
                    type="date" 
                    value={clientData.date}
                    onChange={(e) => setClientData({...clientData, date: e.target.value})}
                    className="h-10 bg-white/20 border-white/20 text-white placeholder:text-white/50 focus:ring-[#00A3E0] focus:border-[#00A3E0]"
                  />
                </div>
                <div>
                  <Label className="text-blue-200 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                    <User className="w-3 h-3" /> Cliente (Nome/Sobrenome) *
                  </Label>
                  <Input 
                    type="text" 
                    placeholder="Ex: João Silva"
                    value={clientData.name}
                    onChange={(e) => setClientData({...clientData, name: e.target.value})}
                    className="h-10 bg-white/20 border-white/20 text-white placeholder:text-white/50 focus:ring-[#00A3E0] focus:border-[#00A3E0]"
                  />
                </div>
                <div>
                  <Label className="text-blue-200 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Celular
                  </Label>
                  <Input 
                    type="tel" 
                    placeholder="(00) 00000-0000"
                    value={clientData.phone}
                    onChange={(e) => setClientData({...clientData, phone: e.target.value})}
                    className="h-10 bg-white/20 border-white/20 text-white placeholder:text-white/50 focus:ring-[#00A3E0] focus:border-[#00A3E0]"
                  />
                </div>
                <div>
                  <Label className="text-blue-200 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> E-mail
                  </Label>
                  <Input 
                    type="email" 
                    placeholder="cliente@email.com"
                    value={clientData.email}
                    onChange={(e) => setClientData({...clientData, email: e.target.value})}
                    className="h-10 bg-white/20 border-white/20 text-white placeholder:text-white/50 focus:ring-[#00A3E0] focus:border-[#00A3E0]"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-blue-200 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Endereço <span className="text-red-300">*</span>
                  </Label>
                  <Input 
                    type="text" 
                    placeholder="Rua, Número, Condomínio"
                    value={clientData.address}
                    onChange={(e) => setClientData({...clientData, address: e.target.value})}
                    className="h-10 bg-white/20 border-white/20 text-white placeholder:text-white/50 focus:ring-[#00A3E0] focus:border-[#00A3E0]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Seletor de Categoria */}
            <div className="mb-8" data-html2canvas-ignore>
              <Label className="text-sm font-bold text-gray-700 mb-3 block uppercase tracking-wider">
                Selecione o Tipo de Piscina
              </Label>
              <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-gray-100 rounded-xl">
                  <TabsTrigger value="residencial" className="py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#0072BC] data-[state=active]:shadow-sm font-semibold text-xs sm:text-sm">
                    Residencial
                  </TabsTrigger>
                  <TabsTrigger value="condominio" className="py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#0072BC] data-[state=active]:shadow-sm font-semibold text-xs sm:text-sm">
                    Condomínio
                  </TabsTrigger>
                  <TabsTrigger value="clube" className="py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#0072BC] data-[state=active]:shadow-sm font-semibold text-xs sm:text-sm">
                    Escola/Clube
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Título da Categoria no Print */}
            <div className="mb-6 pb-4 border-b border-gray-100">
              <h3 className="text-2xl font-bold text-[#0072BC]">{currentCategory.title}</h3>
              <p className="text-gray-500 text-sm mt-1">{currentCategory.description}</p>
            </div>

            {/* Checklist Sections */}
            <div className="space-y-8">
              {currentCategory.sections.map((section, sIndex) => (
                <div key={sIndex} className="space-y-4">
                  <h4 className="text-lg font-bold text-[#0072BC] flex items-center gap-2">
                    <span className="bg-[#0072BC]/10 text-[#0072BC] w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold">
                      {sIndex + 1}
                    </span>
                    {section.title}
                  </h4>
                  
                  <div className="space-y-3 pl-2">
                    {section.items.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                        <Checkbox 
                          id={item.id} 
                          checked={checks[item.id] || false}
                          onCheckedChange={() => handleCheck(item.id)}
                          className="mt-1 w-5 h-5 border-gray-300 data-[state=checked]:bg-[#FF6B00] data-[state=checked]:border-[#FF6B00]"
                        />
                        <div className="grid gap-1.5 leading-none flex-1">
                          <label
                            htmlFor={item.id}
                            className={`text-sm font-medium leading-snug cursor-pointer ${checks[item.id] ? 'text-gray-400 line-through' : 'text-gray-700'}`}
                          >
                            {item.label}
                          </label>
                          {item.tip && (
                            <p className="text-xs text-[#0072BC] bg-blue-50 p-2 rounded-md mt-1 flex items-start gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                              {item.tip}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Anotações */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <Label className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2 uppercase tracking-wider">
                <FileText className="w-4 h-4 text-[#FF6B00]" />
                Anotações e Ocorrências
              </Label>
              <Textarea 
                placeholder="Registre aqui produtos utilizados, quantidades, problemas encontrados ou recomendações ao cliente..."
                className="min-h-[120px] bg-gray-50 border-gray-200 focus:ring-[#00A3E0] focus:border-[#00A3E0] rounded-xl resize-none"
                value={clientData.notes}
                onChange={(e) => setClientData({...clientData, notes: e.target.value})}
              />
            </div>

            {/* Rodapé do Relatório */}
            <div className="mt-8 bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-xs font-bold text-[#0072BC] mb-1">
                Serviço realizado de acordo com as normas técnicas (NBR 10339)
              </p>
              <p className="text-[10px] text-gray-500">
                Profissional capacitado pelo Curso Técnico de Piscinas - ANAPP
              </p>
            </div>
          </div>
        </div>

        {/* Ações (Fora do Print) */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2" data-html2canvas-ignore>
          <Button
            onClick={prepareAndDownloadPdf}
            disabled={!requiredFieldsComplete || generatingPdf}
            className="h-14 text-base font-bold bg-[#0072BC] hover:bg-[#005f9d] text-white rounded-xl shadow-lg transition-all active:scale-[0.98]"
          >
            {generatingPdf ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Gerando PDF...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5 mr-2" />
                Baixar PDF
              </>
            )}
          </Button>
          <Button
            onClick={shareResults}
            disabled={!requiredFieldsComplete || sharingPdf}
            className="h-14 text-base font-bold bg-[#FF6B00] hover:bg-[#E66000] text-white rounded-xl shadow-lg shadow-[#FF6B00]/30 transition-all active:scale-[0.98]"
          >
            {sharingPdf ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Abrindo compartilhamento...
              </>
            ) : (
              <>
                <Share2 className="w-5 h-5 mr-2" />
                Compartilhar PDF
              </>
            )}
          </Button>
        </div>
        {shareFeedback && (
          <p
            className="mt-3 rounded-lg border border-blue-300 bg-blue-950/60 px-4 py-3 text-center text-sm text-blue-100"
            role="status"
            data-html2canvas-ignore
          >
            {shareFeedback}
          </p>
        )}
        {!requiredFieldsComplete && (
          <p className="text-center text-blue-200 text-sm mt-3" data-html2canvas-ignore>
            Preencha os campos obrigatórios: <strong>Data</strong>, <strong>Nome do cliente</strong> e <strong>Endereço</strong> para habilitar o salvamento.
          </p>
        )}
        {pdfPreviewUrl && (
          <Card
            id="checklist-pdf-ready"
            className="mt-5 border-green-300 bg-green-50"
            data-html2canvas-ignore
          >
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-700" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-green-950">PDF pronto para baixar</p>
                  <p className="mt-1 break-all text-sm text-green-800">{pdfFileName}</p>
                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Button
                      type="button"
                      onClick={downloadPreparedPdf}
                      className="w-full bg-green-700 text-white hover:bg-green-800"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Baixar arquivo PDF
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={openPreparedPdf}
                      className="w-full border-green-300 bg-white text-green-900 hover:bg-green-100"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Abrir PDF em nova aba
                    </Button>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-green-800">
                    No iPhone ou iPad, se o arquivo abrir em uma nova tela, use o menu
                    Compartilhar e escolha “Salvar em Arquivos”. No Android e no
                    computador, o download é iniciado pelo navegador.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
