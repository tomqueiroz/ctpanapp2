import { Shield, Lock, Eye, Database, Mail, Phone, FileText, AlertCircle, RefreshCw, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function PrivacyPolicy() {
  const sections = [
    {
      icon: Database,
      title: '1. Dados Coletados',
      content: [
        'Ao se cadastrar na plataforma CTP ANAPP, coletamos as seguintes informações:',
        '• **Nome completo** — para identificação e emissão do certificado.',
        '• **Endereço de e-mail** — para acesso à plataforma e comunicações.',
        '• **CPF** — exclusivamente para fins de emissão do certificado oficial.',
        '• **Dados de pagamento** — processados com segurança pelo gateway e.Rede. Não armazenamos número completo do cartão nem código de segurança.',
        '• **Dados de uso e progresso** — capítulos assistidos, notas em quizzes/provas e conclusão do curso.',
        '• **Informações de dispositivo** — tipo de navegador, sistema operacional e endereço IP (para segurança e melhoria da plataforma).',
      ]
    },
    {
      icon: Eye,
      title: '2. Finalidade do Uso dos Dados',
      content: [
        'Utilizamos seus dados exclusivamente para:',
        '• Criar e gerenciar sua conta na plataforma.',
        '• Processar pagamentos e liberar acesso ao curso.',
        '• Registrar seu progresso e emitir certificados de conclusão.',
        '• Enviar comunicações sobre o curso, atualizações de conteúdo e novidades da ANAPP.',
        '• Cumprir obrigações legais e regulatórias.',
        '• Melhorar continuamente a experiência da plataforma.',
      ]
    },
    {
      icon: Lock,
      title: '3. Proteção e Segurança dos Dados',
      content: [
        'A ANAPP adota medidas técnicas e organizacionais para proteger seus dados:',
        '• Transmissão de dados via **protocolo HTTPS/TLS** (criptografia em trânsito).',
        '• Armazenamento em infraestrutura segura com controle de acesso restrito.',
        '• As senhas são processadas pelo serviço de autenticação do Supabase e armazenadas somente em formato criptograficamente protegido; o CTP ANAPP não visualiza sua senha.',
        '• Acesso administrativo aos dados limitado a colaboradores autorizados.',
        '• Monitoramento contínuo para detecção de acessos não autorizados.',
      ]
    },
    {
      icon: Globe,
      title: '4. Compartilhamento de Dados',
      content: [
        'Seus dados **não são vendidos** a terceiros. Podemos compartilhá-los apenas com:',
        '• **Prestadores de serviço essenciais**: gateway de pagamento, provedor de e-mail transacional e infraestrutura em nuvem.',
        '• **Autoridades competentes**: quando exigido por lei, ordem judicial ou regulação aplicável.',
        '• Todos os parceiros são contratualmente obrigados a manter a confidencialidade e não usar seus dados para outras finalidades.',
      ]
    },
    {
      icon: FileText,
      title: '5. Seus Direitos (LGPD)',
      content: [
        'Conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a:',
        '• **Confirmação** da existência de tratamento dos seus dados.',
        '• **Acesso** aos seus dados pessoais que possuímos.',
        '• **Correção** de dados incompletos, inexatos ou desatualizados.',
        '• **Anonimização, bloqueio ou eliminação** de dados desnecessários.',
        '• **Portabilidade** dos seus dados a outro fornecedor.',
        '• **Revogação do consentimento** a qualquer momento.',
        '• **Oposição** ao tratamento de dados em caso de descumprimento da LGPD.',
        'Para exercer esses direitos, entre em contato: **contato@anapp.org.br**',
      ]
    },
    {
      icon: RefreshCw,
      title: '6. Retenção e Exclusão de Dados',
      content: [
        '• Mantemos seus dados enquanto sua conta estiver ativa ou conforme necessário para cumprir obrigações legais.',
        '• Certificados emitidos são mantidos em nossos registros por prazo indeterminado para fins de verificação de autenticidade.',
        '• Ao solicitar a exclusão da conta, seus dados pessoais serão removidos em até **30 dias**, exceto os exigidos por lei.',
      ]
    },
    {
      icon: AlertCircle,
      title: '7. Cookies e Tecnologias de Rastreamento',
      content: [
        '• Utilizamos cookies essenciais para manter sua sessão autenticada na plataforma.',
        '• Cookies de análise (anonimizados) são usados para entender o comportamento de uso e melhorar a experiência.',
        '• Você pode desabilitar cookies no seu navegador, mas isso pode afetar o funcionamento da plataforma.',
      ]
    },
    {
      icon: Mail,
      title: '8. Comunicações e Marketing',
      content: [
        '• Ao se cadastrar, você pode receber comunicações sobre o curso, certificados e novidades da ANAPP.',
        '• Você pode cancelar o recebimento de e-mails de marketing a qualquer momento clicando em "Cancelar inscrição" no rodapé de qualquer e-mail.',
        '• E-mails transacionais de acesso e certificado não podem ser desativados pois são essenciais ao serviço.',
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0072BC] to-[#005a9e] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Política de Privacidade</h1>
            <p className="text-lg text-blue-100 leading-relaxed">
              A ANAPP respeita e protege a privacidade dos seus dados pessoais,
              em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
            </p>
            <p className="text-sm text-blue-200 mt-4">
              Última atualização: 4 de agosto de 2026
            </p>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">

          {/* Intro */}
          <Card className="border-0 shadow-md mb-10 bg-blue-50">
            <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed">
                Esta Política de Privacidade descreve como a <strong>ANAPP — Associação Nacional das Empresas
                e Profissionais de Piscinas</strong>, inscrita no CNPJ sob nº 01.532.580/0001-46, com sede em
                São Paulo/SP, coleta, utiliza, armazena e protege os dados pessoais dos usuários da plataforma
                de ensino <strong>CTP ANAPP</strong> (Curso Técnico de Piscinas).
              </p>
              <p className="text-gray-700 leading-relaxed mt-3">
                Ao utilizar nossa plataforma, você declara estar de acordo com esta política.
                Caso não concorde, recomendamos que não utilize nossos serviços.
              </p>
            </CardContent>
          </Card>

          {/* Seções */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#0072BC]/10 flex items-center justify-center flex-shrink-0">
                      <section.icon className="w-6 h-6 text-[#0072BC]" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mt-2">{section.title}</h2>
                  </div>
                  <div className="space-y-2 pl-16">
                    {section.content.map((line, i) => (
                      <p
                        key={i}
                        className="text-gray-700 leading-relaxed text-sm"
                        dangerouslySetInnerHTML={{
                          __html: line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                        }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contato DPO */}
          <Card className="border-0 shadow-lg mt-10 bg-gradient-to-br from-[#0072BC] to-[#005a9e] text-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Encarregado de Dados (DPO)</h2>
              <p className="text-blue-100 leading-relaxed mb-4">
                Para dúvidas, solicitações ou exercício dos seus direitos previstos na LGPD,
                entre em contato com nosso Encarregado de Proteção de Dados:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-200" />
                  <a href="mailto:contato@anapp.org.br" className="text-white hover:text-blue-200 transition font-medium">
                    contato@anapp.org.br
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-200" />
                  <a href="tel:+551156877888" className="text-white hover:text-blue-200 transition">
                    (11) 5687-7888
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
