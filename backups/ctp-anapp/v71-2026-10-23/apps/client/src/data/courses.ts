import { Course, Testimonial, FAQItem } from '@/lib/index';
import { IMAGES } from '@/assets/images';

// Dados dos 15 Capítulos do Curso CTP ANAPP (0-14)
export const chapters = [
  { id: 0, titulo: 'Apresentação do Curso', status: 'completed', progresso: 100, duracao: '1 hora', subtitulo: 'Bem-vindo ao CTP ANAPP', descricao: 'Introdução ao curso, metodologia e objetivos de aprendizagem.' },
  { id: 1, titulo: 'O Guardião da Água', status: 'completed', progresso: 100, duracao: '12 horas', subtitulo: 'Fundamentos e Cálculos Essenciais', descricao: 'Cálculos essenciais: volume, área, conversões e fundamentos para o profissional de piscinas.' },
  { id: 2, titulo: 'Guardião da Saúde Pública', status: 'completed', progresso: 100, duracao: '12 horas', subtitulo: 'Microbiologia e Contaminação', descricao: 'Microbiologia da água, contaminantes e proteção da saúde pública.' },
  { id: 3, titulo: 'Desinfecção e Tecnologias', status: 'completed', progresso: 100, duracao: '15 horas', subtitulo: 'Cloro e Alternativas', descricao: 'Tipos de cloro, dosagens, tecnologias alternativas e segurança na aplicação.' },
  { id: 4, titulo: 'Equilíbrio Químico da Água', status: 'completed', progresso: 100, duracao: '15 horas', subtitulo: 'pH, Alcalinidade e Dureza', descricao: 'O triângulo do equilíbrio: alcalinidade total, pH e dureza cálcica.' },
  { id: 5, titulo: 'Análise e Testes de Água', status: 'completed', progresso: 100, duracao: '12 horas', subtitulo: 'Medição e Interpretação', descricao: 'Técnicas de análise, interpretação de resultados e correções necessárias.' },
  { id: 6, titulo: 'Segurança em Piscinas', status: 'completed', progresso: 100, duracao: '14 horas', subtitulo: 'NBR 10339 e Prevenção', descricao: 'Normas de segurança, prevenção de acidentes e primeiros socorros.' },
  { id: 7, titulo: 'Equipamentos e Diagnóstico', status: 'completed', progresso: 100, duracao: '15 horas', subtitulo: 'Bombas, Filtros e Falhas', descricao: 'Sistemas de filtração, bombas, diagnóstico de falhas e manutenção.' },
  { id: 8, titulo: 'Registros de Operação', status: 'completed', progresso: 100, duracao: '12 horas', subtitulo: 'Livro de Operação e Documentação', descricao: 'Documentação obrigatória, registros e conformidade legal.' },
  { id: 9, titulo: 'Gestão de Ativos', status: 'completed', progresso: 100, duracao: '13 horas', subtitulo: 'Manutenção Preventiva', descricao: 'Gestão de equipamentos, manutenção preventiva e vida útil.' },
  { id: 10, titulo: 'Normas e Segurança', status: 'completed', progresso: 100, duracao: '10 horas', subtitulo: 'NBR 10339 e CFQ 332/2025', descricao: 'Normas técnicas, certificação profissional e conformidade.' },
  { id: 11, titulo: 'Sistemas de Circulação', status: 'completed', progresso: 100, duracao: '10 horas', subtitulo: 'Sucção Direta vs Transbordamento', descricao: 'Tipos de circulação, posicionamento de bocais e cálculos de vazão.' },
  { id: 12, titulo: 'Aquecimento de Piscinas', status: 'completed', progresso: 100, duracao: '10 horas', subtitulo: 'Tecnologias e Dimensionamento', descricao: 'Sistemas de aquecimento: solar, bomba de calor, gás e elétrico.' },
  { id: 13, titulo: 'Atendimento e Relacionamento com Clientes', status: 'completed', progresso: 100, duracao: '8 horas', subtitulo: 'Do Piscineiro ao Empreendedor', descricao: 'Perfis de clientes, postura profissional, ferramentas digitais e fidelização.' },
  { id: 14, titulo: 'Marketing Digital para Piscineiros', status: 'completed', progresso: 100, duracao: '8 horas', subtitulo: 'Seja Encontrado, Seja Lembrado', descricao: 'Google Meu Negócio, redes sociais, WhatsApp Business e estratégias de marketing.' }
];

export const courses: Course[] = [
  {
    id: 'ctp-completo',
    title: 'Curso Técnico em Piscinas - CTP ANAPP',
    level: 'Básico',
    description: 'Formação completa que vai além da técnica: domine o tratamento de piscinas e aprenda a empreender! Com a certificação reconhecida pela ANAPP, você se torna um profissional técnico qualificado e um empreendedor preparado para conquistar clientes premium e construir um negócio de sucesso.',
    duration: '2 semanas a 12 meses',
    price: {
      oneTime: 299,
    },
    modules: chapters.map(chapter => ({
      id: `mod-${chapter.id}`,
      title: chapter.titulo,
      duration: chapter.duracao,
      lessons: [] as any[]
    })),
    features: [
      'Videoaulas de alta qualidade',
      'Material complementar (PDFs, planilhas)',
      'Suporte via WhatsApp',
      'Certificação digital ANAPP',
      'Estude no seu ritmo, 24h por dia',
      'Acesso vitalício ao conteúdo',
    ],
    image: IMAGES.POOL_WATER_1,
    certificationType: 'Certificação CTP ANAPP',
  },
];

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Roberto Oliveira',
    location: 'São Paulo, SP',
    text: 'Antes do CTP, cobrava R$ 150 por piscina. Hoje cobro R$ 350 e tenho mais clientes do que consigo atender. O curso me ensinou a trabalhar direito e dar valor ao meu serviço.',
    rating: 5,
    image: IMAGES.TRAINING_1,
  },
  {
    id: '2',
    name: 'Carlos Eduardo Santos',
    location: 'Fortaleza, CE',
    text: 'A plataforma de estudos é muito fácil de usar. Consegui fazer todo o curso pelo celular nos intervalos do trabalho. Os vídeos são curtos e diretos ao ponto.',
    rating: 5,
    image: IMAGES.ONLINE_LEARNING_5,
  },
  {
    id: '3',
    name: 'Fernanda Almeida',
    location: 'Florianópolis, SC',
    text: 'Abri minha própria empresa de manutenção de piscinas depois do curso. O módulo de gestão de negócios foi fundamental para eu entender como precificar meus serviços.',
    rating: 5,
    image: IMAGES.CERTIFICATE_2,
  },
];

export const faqItems: FAQItem[] = [
  {
    id: '1',
    question: 'Quanto tempo tenho para concluir o curso?',
    answer: 'Dependendo de sua dedicação, é possível tirar seu certificado em duas semanas ou até 12 meses. Você estuda no seu ritmo!',
  },
  {
    id: '2',
    question: 'Preciso ter conhecimento prévio sobre piscinas?',
    answer: 'Não! O curso CTP foi desenvolvido para iniciantes e profissionais que desejam se aperfeiçoar. Começamos do básico e avançamos gradualmente.',
  },
  {
    id: '3',
    question: 'O certificado é reconhecido pelo mercado?',
    answer: 'Sim! O certificado CTP ANAPP é reconhecido em todo o Brasil e abre portas para condomínios, clubes e clientes especiais que exigem profissionais qualificados.',
  },
  {
    id: '4',
    question: 'Posso assistir as aulas pelo celular?',
    answer: 'Sim! A plataforma é 100% responsiva. Você pode estudar pelo celular, tablet ou computador, 24 horas por dia, 7 dias por semana.',
  },
  {
    id: '5',
    question: 'Como funciona o pagamento?',
    answer: 'Oferecemos pagamento em até 6x sem juros no cartão de crédito. O valor promocional com cupom é pago à vista.',
  },
];
