import { FileText, Users, CreditCard, BookOpen, ShieldAlert, AlertTriangle, Scale, RefreshCw, Mail, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function TermsOfUse() {
  const sections = [
    {
      icon: Users,
      title: '1. Aceitação dos Termos',
      content: [
        'Ao acessar e utilizar a plataforma CTP ANAPP, você declara ter lido, compreendido e concordado integralmente com estes Termos de Uso.',
        'Caso não concorde com qualquer disposição destes termos, não utilize a plataforma.',
        'Estes termos se aplicam a todos os usuários: visitantes, alunos matriculados e administradores.',
      ]
    },
    {
      icon: FileText,
      title: '2. Descrição do Serviço',
      content: [
        'A ANAPP oferece, por meio desta plataforma, o **Curso Técnico de Piscinas (CTP)** — programa de ensino a distância (EAD) composto por:',
        '• Videoaulas gravadas por especialistas do setor.',
        '• Apostilas e materiais de apoio em PDF.',
        '• Podcasts e conteúdos complementares.',
        '• Quizzes e provas de avaliação por capítulo.',
        '• Ferramentas de suporte: Calculadora AcquaCalc e Checklist do Piscineiro.',
        '• Certificado digital de conclusão emitido pela ANAPP.',
      ]
    },
    {
      icon: CheckCircle,
      title: '3. Elegibilidade e Cadastro',
      content: [
        '• O acesso à plataforma é permitido para pessoas físicas maiores de 16 anos.',
        '• O cadastro exige informações verdadeiras, completas e atualizadas. Dados falsos podem resultar em cancelamento da conta.',
        '• Você é responsável por manter sua senha, seu e-mail e sua sessão de acesso protegidos. Não compartilhe credenciais ou sessões.',
        '• É vedado criar múltiplas contas para uma mesma pessoa.',
        '• A ANAPP reserva-se o direito de recusar ou cancelar cadastros que violem estes termos.',
      ]
    },
    {
      icon: CreditCard,
      title: '4. Pagamento e Acesso',
      content: [
        '• O acesso ao curso é concedido após a confirmação do pagamento.',
        '• O acesso ao CTP ANAPP é **vitalício** — sem prazo de expiração, inclusive para módulos futuros.',
        '• O pagamento é processado de forma segura via gateway certificado. A ANAPP não armazena dados de cartão de crédito.',
        '• **Política de reembolso:** solicitações de reembolso podem ser feitas em até **7 dias corridos** após a compra, desde que o aluno não tenha concluído mais de 20% do conteúdo do curso. Após esse prazo ou percentual, não há reembolso.',
        '• Associados ANAPP têm 50% de desconto. O desconto deve ser aplicado no momento da compra — não haverá reembolso retroativo.',
        '• Em caso de cobrança indevida, entre em contato em até 30 dias: **financeiro@anapp.org.br**',
      ]
    },
    {
      icon: BookOpen,
      title: '5. Uso do Conteúdo e Propriedade Intelectual',
      content: [
        'Todo o conteúdo da plataforma — vídeos, textos, apostilas, imagens, podcasts e materiais — é de propriedade da **ANAPP** e está protegido por direitos autorais (Lei nº 9.610/1998).',
        '• É **proibido** reproduzir, distribuir, transmitir, modificar, vender ou usar o conteúdo para fins comerciais sem autorização expressa da ANAPP.',
        '• O acesso ao curso é **individual e intransferível**. Compartilhar credenciais ou sessões de acesso pode resultar em suspensão da conta.',
        '• É permitido fazer anotações pessoais e baixar materiais disponibilizados para uso exclusivamente pessoal e educacional.',
        '• Screenshots e gravações de tela das aulas são permitidos apenas para uso pessoal de estudo, sendo vedada qualquer divulgação pública.',
      ]
    },
    {
      icon: CheckCircle,
      title: '6. Sistema de Avaliação e Certificação',
      content: [
        '• **Nota mínima de aprovação:** 70% (nota 7,0) em todas as provas obrigatórias.',
        '• Todos os capítulos e materiais podem ser acessados livremente; somente as provas seguem liberação sequencial.',
        '• As provas são liberadas sequencialmente: é necessário ser aprovado na prova do capítulo anterior para acessar a próxima.',
        '• O aluno pode refazer quizzes e provas. A maior nota obtida será sempre mantida.',
        '• O **certificado digital** é emitido automaticamente após aprovação em todas as provas do curso.',
        '• O certificado tem validade nacional e é emitido em nome da ANAPP.',
        '• A ANAPP reserva-se o direito de verificar a autenticidade dos certificados emitidos.',
        '• **Carga horária do curso:** 160 horas.',
      ]
    },
    {
      icon: ShieldAlert,
      title: '7. Conduta do Usuário',
      content: [
        'É expressamente proibido:',
        '• Usar a plataforma para fins ilegais ou não autorizados.',
        '• Tentar acessar áreas restritas ou contornar mecanismos de segurança.',
        '• Publicar conteúdo ofensivo, discriminatório ou que viole direitos de terceiros.',
        '• Usar bots, scripts ou ferramentas automatizadas para acessar a plataforma.',
        '• Interferir no funcionamento da plataforma ou na experiência de outros usuários.',
        'Violações resultarão em suspensão ou cancelamento da conta, sem direito a reembolso.',
      ]
    },
    {
      icon: AlertTriangle,
      title: '8. Limitação de Responsabilidade',
      content: [
        '• A ANAPP emprega esforços razoáveis para manter a plataforma disponível 24/7, mas não garante disponibilidade ininterrupta.',
        '• A ANAPP não se responsabiliza por danos decorrentes de uso indevido da plataforma ou do conteúdo.',
        '• As informações técnicas do curso são baseadas nas melhores práticas e normas vigentes, mas não substituem a orientação de um profissional habilitado.',
        '• **Calculadora AcquaCalc:** os resultados são orientativos. Sempre consulte os rótulos dos produtos e um profissional qualificado antes de aplicar qualquer produto químico.',
        '• A ANAPP não se responsabiliza por danos diretos, indiretos ou consequentes decorrentes do uso das ferramentas da plataforma.',
      ]
    },
    {
      icon: Scale,
      title: '9. Lei Aplicável e Foro',
      content: [
        '• Estes Termos são regidos pelas leis da **República Federativa do Brasil**.',
        '• Para dirimir quaisquer controvérsias decorrentes destes Termos, fica eleito o foro da **Comarca de São Paulo/SP**, com renúncia a qualquer outro, por mais privilegiado que seja.',
        '• Em caso de conflito entre versões em diferentes idiomas, prevalece a versão em **português brasileiro**.',
      ]
    },
    {
      icon: RefreshCw,
      title: '10. Alterações nos Termos',
      content: [
        '• A ANAPP pode atualizar estes Termos periodicamente para refletir mudanças na legislação ou no serviço.',
        '• Alterações significativas serão comunicadas por e-mail com antecedência mínima de 15 dias.',
        '• O uso continuado da plataforma após as alterações constituirá aceitação dos novos termos.',
        '• A versão mais recente estará sempre disponível nesta página com a data de atualização.',
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#FF6B00] to-[#cc5500] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Termos de Uso</h1>
            <p className="text-lg text-orange-100 leading-relaxed">
              Leia com atenção os termos que regem o uso da plataforma CTP ANAPP.
              Ao se cadastrar, você concorda integralmente com estas condições.
            </p>
            <p className="text-sm text-orange-200 mt-4">
              Última atualização: 4 de agosto de 2026
            </p>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">

          {/* Intro */}
          <Card className="border-0 shadow-md mb-10 bg-orange-50">
            <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed">
                Estes Termos de Uso regulam a relação entre a <strong>ANAPP — Associação Nacional das Empresas
                e Profissionais de Piscinas</strong>, inscrita no CNPJ sob nº 01.532.580/0001-46, com sede em
                São Paulo/SP, e os usuários da plataforma de ensino <strong>CTP ANAPP</strong>.
              </p>
              <p className="text-gray-700 leading-relaxed mt-3">
                Ao criar uma conta ou utilizar qualquer funcionalidade da plataforma, você confirma que leu,
                entendeu e concorda com todos os termos abaixo. Recomendamos também a leitura da nossa{' '}
                <a href="/privacy-policy" className="text-[#0072BC] underline hover:text-[#005a9e]">
                  Política de Privacidade
                </a>.
              </p>
            </CardContent>
          </Card>

          {/* Seções */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#FF6B00]/10 flex items-center justify-center flex-shrink-0">
                      <section.icon className="w-6 h-6 text-[#FF6B00]" />
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

          {/* Contato */}
          <Card className="border-0 shadow-lg mt-10 bg-gradient-to-br from-[#FF6B00] to-[#cc5500] text-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Dúvidas sobre os Termos?</h2>
              <p className="text-orange-100 leading-relaxed mb-4">
                Se tiver dúvidas sobre estes Termos de Uso, entre em contato com nossa equipe:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-orange-200" />
                  <a href="mailto:contato@anapp.org.br" className="text-white hover:text-orange-200 transition font-medium">
                    contato@anapp.org.br
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-orange-200" />
                  <a href="/privacy-policy" className="text-white hover:text-orange-200 transition">
                    Ver também: Política de Privacidade
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
