import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Download, CheckCircle, XCircle, Loader2, ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase, Certificate } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ROUTE_PATHS } from '@/lib';
import {
  buildCredentialPageCanvas,
  certificatePdfFileName,
} from '@/lib/certificate-credential-pdf';
import jsPDF from 'jspdf';
import certificadoBg from '/images/certificado-oficial-anapp-final-1584x1188.png';

interface Eligibility {
  eligible: boolean;
  reason: string;
  total_exams: number;
  passed_exams: number;
  final_exam_score: number;
}

export default function CertificatePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'accepted' | 'failed'>('idle');
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');
  const pdfObjectUrlRef = useRef<string | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    return () => {
      if (pdfObjectUrlRef.current) {
        URL.revokeObjectURL(pdfObjectUrlRef.current);
      }
    };
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate(ROUTE_PATHS.LOGIN);
      return;
    }
    setUser(user);
    
    await Promise.all([
      loadCertificate(user.id),
      checkEligibility(user.id)
    ]);
    setLoading(false);
  };

  const loadCertificate = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', userId)
        .eq('is_valid', true)
        .order('issued_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      setCertificate(data);
    } catch (error: any) {
      console.error('Erro ao carregar certificado:', error);
    }
  };

  const checkEligibility = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('lms_certificate_eligibility', {
        p_user_id: userId,
      });
      if (error) throw error;
      setEligibility(data as Eligibility);
    } catch (error: any) {
      console.error('Erro ao verificar elegibilidade:', error);
      setEligibility({
        eligible: false,
        reason: 'Não foi possível validar as provas concluídas.',
        total_exams: 0,
        passed_exams: 0,
        final_exam_score: 0,
      });
    }
  };

  const openPdfPreviewWindow = () => {
    const previewWindow = window.open('', '_blank');
    if (!previewWindow) return null;

    previewWindow.opener = null;
    previewWindow.document.title = 'Preparando certificado CTP ANAPP';
    previewWindow.document.body.innerHTML = `
      <main style="min-height:100vh;display:grid;place-items:center;background:#f4f7fa;font-family:Arial,sans-serif;color:#172033">
        <div style="text-align:center;padding:32px">
          <h1 style="font-size:22px;margin:0 0 10px">Preparando seu certificado</h1>
          <p style="margin:0;color:#475569">O PDF será aberto nesta página em instantes.</p>
        </div>
      </main>`;
    return previewWindow;
  };

  const closePreviewWindow = (previewWindow: Window | null) => {
    if (previewWindow && !previewWindow.closed) previewWindow.close();
  };

  const openPdfInNewTab = () => {
    if (!pdfPreviewUrl) return;
    window.open(pdfPreviewUrl, '_blank', 'noopener,noreferrer');
  };

  const downloadPdfFile = () => {
    if (!pdfPreviewUrl) return;
    const link = document.createElement('a');
    link.href = pdfPreviewUrl;
    link.download = pdfFileName || 'Certificado-CTP-ANAPP.pdf';
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const generateCertificate = async () => {
    try {
      setGenerating(true);
      setEmailStatus('idle');

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Sessão não encontrada');
      }

      const response = await supabase.functions.invoke('generate_certificate', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          resend_email: true,
        },
      });

      if (response.error) {
        throw response.error;
      }

      if (!response.data || !response.data.success) {
        throw new Error(response.data?.error || 'Resposta inválida');
      }

      let issuedCertificate: Certificate | null = null;
      if (response.data.certificate) {
        issuedCertificate = response.data.certificate as Certificate;
        setCertificate(issuedCertificate);
      } else if (user) {
        await loadCertificate(user.id);
      }

      if (!issuedCertificate) {
        throw new Error('O certificado foi emitido, mas seus dados não foram retornados.');
      }

      const emailAccepted = response.data.email_sent === true;
      setEmailStatus(emailAccepted ? 'accepted' : 'failed');
      await downloadCertificate(issuedCertificate, null, false);

      toast({
        title: 'Certificado emitido',
        description: emailAccepted
          ? 'O PDF está pronto para visualizar ou baixar e o e-mail foi aceito para envio.'
          : 'O PDF está pronto para visualizar ou baixar, mas o e-mail não foi confirmado. Use “Reenviar por e-mail”.',
        variant: emailAccepted ? 'default' : 'destructive',
      });
    } catch (error: any) {
      console.error('Erro ao gerar certificado:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível gerar o certificado',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const downloadCertificate = async (
    certificateOverride: Certificate | null = certificate,
    previewWindow: Window | null = null,
    showSuccessToast = true,
  ) => {
    if (!certificateOverride) {
      closePreviewWindow(previewWindow);
      return;
    }

    try {
      setDownloading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Sessão não encontrada');
      }

      const response = await supabase.functions.invoke('download_certificate_pdf', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw response.error;
      }

      if (!response.data || !response.data.success) {
        throw new Error(response.data?.error || 'Resposta inválida da Edge Function');
      }

      const { certificate: certData } = response.data;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Dimensões do canvas (mesmas da imagem original)
      const width = 1584;   // Largura real da imagem
      const height = 1188;  // Altura real da imagem
      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        throw new Error('Não foi possível criar canvas');
      }

      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = () => resolve(null);
        img.onerror = (e) => {
          console.error('❌ Erro ao carregar imagem:', e);
          reject(new Error('Erro ao carregar imagem de fundo'));
        };
        img.src = certificadoBg;
      });

      ctx.drawImage(img, 0, 0, width, height);

      // Todos os dados variáveis do certificado usam preto.
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#111111';

      // ========================================
      // COORDENADAS CENTRALIZADAS:
      // O texto será centralizado nestes pontos
      // ========================================
      
      // NOME - Centralizado em X=636, Y=569
      const nameX = 636;         // Centro horizontal do texto
      const nameY = 569;         // Centro vertical do texto
      const nameFontSize = 58;
      
      ctx.font = `bold ${nameFontSize}px Montserrat, Arial, sans-serif`;
      ctx.fillText(certData.formatted_name, nameX, nameY);

      // CPF - Centralizado em X=838, Y=669
      const cpfX = 838;          // Centro horizontal do texto
      const cpfY = 669;          // Centro vertical do texto
      const cpfFontSize = 31;
      
      ctx.font = `${cpfFontSize}px Montserrat, Arial, sans-serif`;
      ctx.fillText(certData.formatted_cpf, cpfX, cpfY);

      // LOCAL E DATA - peso normal e proporção equivalente ao texto do layout.
      const dateX = 608;         // Centro horizontal do texto
      const dateY = 883;         // Centro vertical do texto
      const dateFontSize = 30;

      ctx.font = `${dateFontSize}px Montserrat, Arial, sans-serif`;
      ctx.fillText(
        certData.formatted_location_date || `São Paulo, ${certData.formatted_date}.`,
        dateX,
        dateY,
      );

      // REGISTRO E CÓDIGO DE VERIFICAÇÃO - impressos no próprio certificado
      ctx.textAlign = 'left';
      ctx.fillStyle = '#111111';
      ctx.font = `18px Montserrat, Arial, sans-serif`;
      ctx.fillText(
        `Registro: ${String(certData.certificate_number || certificateOverride.certificate_number)}`,
        78,
        1090,
      );
      ctx.font = `18px Montserrat, Arial, sans-serif`;
      ctx.fillText(
        `Código de verificação: ${String(certData.verification_code || certificateOverride.verification_code || 'N/A')}`,
        78,
        1125,
      );
      ctx.font = `16px Montserrat, Arial, sans-serif`;
      ctx.fillText(
        `${window.location.origin}/verify-certificate`,
        78,
        1155,
      );

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [width, height],
      });
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, width, height);

      const credentialCanvas = await buildCredentialPageCanvas({
        certificate_number: String(
          certData.certificate_number || certificateOverride.certificate_number,
        ),
        completion_date:
          certData.completion_date || certificateOverride.completion_date,
        full_name: String(
          certData.full_name || certificateOverride.full_name,
        ),
        verification_code:
          certData.verification_code || certificateOverride.verification_code,
        is_valid:
          typeof certData.is_valid === 'boolean'
            ? certData.is_valid
            : certificateOverride.is_valid,
      });
      pdf.addPage([width, height], 'landscape');
      pdf.addImage(
        credentialCanvas.toDataURL('image/png'),
        'PNG',
        0,
        0,
        width,
        height,
      );

      const fileName = certificatePdfFileName(
        String(certData.certificate_number || certificateOverride.certificate_number),
      );
      const pdfBlob = pdf.output('blob');
      const objectUrl = URL.createObjectURL(pdfBlob);
      if (pdfObjectUrlRef.current) {
        URL.revokeObjectURL(pdfObjectUrlRef.current);
      }
      pdfObjectUrlRef.current = objectUrl;
      setPdfPreviewUrl(objectUrl);
      setPdfFileName(fileName);

      window.setTimeout(() => {
        document
          .getElementById('certificate-pdf-preview')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

      if (showSuccessToast) {
        toast({
          title: 'PDF preparado',
          description: 'O certificado e a carteirinha estão disponíveis abaixo em um único PDF com duas páginas.',
        });
      }

    } catch (error: any) {
      closePreviewWindow(previewWindow);
      console.error('Erro ao baixar certificado:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível baixar o certificado',
        variant: 'destructive',
      });
    } finally {
      setDownloading(false);
    }
  };

  const resendCertificateEmail = async () => {
    if (!certificate) return;

    try {
      setSendingEmail(true);
      setEmailStatus('idle');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão não encontrada');

      const response = await supabase.functions.invoke('generate_certificate', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          resend_email: true,
        },
      });

      if (response.error) throw response.error;
      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Não foi possível reenviar o e-mail.');
      }

      const emailAccepted = response.data.email_sent === true;
      setEmailStatus(emailAccepted ? 'accepted' : 'failed');
      if (!emailAccepted) {
        throw new Error('O provedor não confirmou o recebimento da solicitação.');
      }

      toast({
        title: 'E-mail reenviado',
        description: 'O provedor aceitou uma nova solicitação de envio.',
      });
    } catch (error: any) {
      setEmailStatus('failed');
      toast({
        title: 'E-mail não enviado',
        description: error.message || 'Não foi possível reenviar o certificado por e-mail.',
        variant: 'destructive',
      });
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#0072BC] mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(ROUTE_PATHS.DASHBOARD)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-[#0072BC] mb-2">Certificado CTP ANAPP</h1>
          <p className="text-gray-600">
            Certificado Técnico em Piscinas - Associação Nacional das Empresas e Profissionais de Piscinas
          </p>
        </div>

        {/* Certificate Card */}
        {certificate ? (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>Certificado Emitido</CardTitle>
                  <CardDescription>Parabéns! Você concluiu o curso com sucesso</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nome</p>
                  <p className="font-semibold">{certificate.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">CPF</p>
                  <p className="font-semibold">{certificate.cpf}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Número do Certificado</p>
                  <p className="font-semibold">{certificate.certificate_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Data de Conclusão</p>
                  <p className="font-semibold">
                    {certificate.completion_date ? new Date(certificate.completion_date).toLocaleDateString('pt-BR') : 'N/A'}
                  </p>
                </div>
              </div>

              {emailStatus === 'accepted' && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                  O provedor aceitou o envio do e-mail. Verifique também as pastas Spam, Lixo eletrônico e Promoções.
                </div>
              )}
              {emailStatus === 'failed' && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  O PDF continua disponível, mas o envio do e-mail não foi confirmado. Tente novamente pelo botão abaixo.
                </div>
              )}

              <div className="pt-4 border-t grid gap-3 md:grid-cols-2">
                <Button
                  onClick={() => {
                    void downloadCertificate(certificate, null);
                  }}
                  disabled={downloading || generating}
                  className="bg-[#0072BC] hover:bg-[#005a9e]"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Preparando PDF...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Preparar PDF do certificado
                    </>
                  )}
                </Button>
                <Button
                  onClick={resendCertificateEmail}
                  disabled={sendingEmail || generating}
                  variant="outline"
                  className="border-[#0072BC] text-[#0072BC] hover:bg-blue-50"
                >
                  {sendingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Reenviar por e-mail
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Award className="w-6 h-6 text-[#0072BC]" />
                </div>
                <div>
                  <CardTitle>Gerar Certificado</CardTitle>
                  <CardDescription>
                    Complete todos os requisitos para emitir seu certificado
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {eligibility && (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Provas Concluídas</span>
                      <span className="font-semibold">
                        {eligibility.passed_exams} / {eligibility.total_exams}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Nota da Prova Final</span>
                      <span className="font-semibold">
                        {eligibility.final_exam_score}%
                      </span>
                    </div>
                  </div>

                  {eligibility.eligible ? (
                    <div className="pt-4 border-t">
                      {eligibility.eligible && (
                        <div className="flex items-center gap-2 text-green-600 mb-4">
                          <CheckCircle className="w-5 h-5" />
                          <p className="font-semibold">Você está elegível para o certificado!</p>
                        </div>
                      )}
                      <Button
                        onClick={generateCertificate}
                        disabled={generating}
                        className="w-full bg-[#0072BC] hover:bg-[#005a9e]"
                      >
                        {generating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Gerando Certificado...
                          </>
                        ) : (
                          <>
                            <Award className="w-4 h-4 mr-2" />
                            Gerar Certificado
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="pt-4 border-t">
                      <div className="flex items-center gap-2 text-orange-600 mb-2">
                        <XCircle className="w-5 h-5" />
                        <p className="font-semibold">Requisitos Pendentes</p>
                      </div>
                      <p className="text-sm text-gray-600">{eligibility.reason}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {pdfPreviewUrl && (
          <Card id="certificate-pdf-preview" className="mb-6 scroll-mt-24">
            <CardHeader>
              <CardTitle>Certificado em PDF</CardTitle>
              <CardDescription>
                O PDF foi preparado com o certificado na primeira página e a carteirinha, frente e verso, na segunda página.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <iframe
                src={pdfPreviewUrl}
                title="Pré-visualização do certificado CTP ANAPP"
                className="h-[60vh] min-h-[360px] w-full rounded-lg border bg-gray-100 sm:h-[70vh] sm:min-h-[520px]"
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  onClick={downloadPdfFile}
                  className="w-full bg-[#0072BC] hover:bg-[#005a9e]"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Baixar arquivo PDF
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={openPdfInNewTab}
                  className="w-full border-[#0072BC] text-[#0072BC] hover:bg-blue-50"
                >
                  <Award className="mr-2 h-4 w-4" />
                  Abrir PDF em nova aba
                </Button>
              </div>
              <p className="text-center text-xs text-gray-500" aria-live="polite">
                Se o download não iniciar automaticamente, use “Abrir PDF em nova aba” e salve pelo menu do navegador.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Requirements Info */}
        <Card>
          <CardHeader>
            <CardTitle>Requisitos para Certificação</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">
                  Concluir todas as provas dos capítulos com nota mínima de 70% (nota 7,0)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">
                  Obter nota mínima de 70% (nota 7,0) na avaliação de certificação
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">
                  Ter CPF cadastrado no perfil
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
