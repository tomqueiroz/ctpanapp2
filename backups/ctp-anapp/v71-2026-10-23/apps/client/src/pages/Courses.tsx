import { useState } from 'react';
import { IMAGES } from '@/assets/images';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Award, Users, TrendingUp, Shield, BookOpen, Video, FileText, MessageCircle, Star, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ROUTE_PATHS } from '@/lib/index';
import { motion } from 'framer-motion';

export default function Courses() {
  const navigate = useNavigate();

  const chapters = [
    {
      number: 0,
      title: 'Apresentação do Curso',
      description: 'Bem-vindo ao Curso Técnico de Piscinas (CTP) da ANAPP. Nesta introdução, você conhecerá a metodologia de ensino, os objetivos do curso e como a certificação transformará sua carreira, elevando você de um tratador comum a um Especialista em Piscinas reconhecido no mercado.'
    },
    {
      number: 1,
      title: 'O Guardião da Água',
      description: 'Domine os fundamentos matemáticos essenciais para o profissional de piscinas. Aprenda a calcular com precisão o volume de diferentes formatos de piscinas, a área de superfície e as taxas de dosagem, garantindo que você nunca mais erre na quantidade de produtos químicos aplicados.'
    },
    {
      number: 2,
      title: 'Guardião da Saúde Pública',
      description: 'Compreenda a microbiologia da água e seu papel crucial na prevenção de doenças. Este capítulo aborda os principais contaminantes, bactérias e vírus encontrados em piscinas, ensinando como identificar riscos e proteger a saúde dos banhistas através de um tratamento rigoroso.'
    },
    {
      number: 3,
      title: 'Desinfecção e Tecnologias',
      description: 'Mergulhe no universo da desinfecção química e tecnológica. Conheça os diferentes tipos de cloro (orgânico, inorgânico, estabilizado), suas aplicações corretas e explore tecnologias complementares como ozônio, ultravioleta e ionização de cobre e prata para uma água cristalina e segura.'
    },
    {
      number: 4,
      title: 'Equilíbrio Químico da Água',
      description: 'Domine o "Triângulo do Equilíbrio": pH, Alcalinidade Total e Dureza Cálcica. Aprenda como esses três fatores interagem entre si, como ajustá-los na ordem correta e por que uma água desequilibrada pode causar desde irritações na pele até a corrosão severa dos equipamentos da casa de máquinas.'
    },
    {
      number: 5,
      title: 'Análise e Testes de Água',
      description: 'Aprenda a realizar diagnósticos precisos da qualidade da água. Conheça os diferentes estojos de teste (fitas, reagentes líquidos, fotômetros digitais), como interpretar os resultados corretamente e a importância de manter seus equipamentos de medição sempre calibrados e dentro da validade.'
    },
    {
      number: 6,
      title: 'Segurança em Piscinas',
      description: 'A segurança deve ser sua prioridade número um. Este capítulo detalha os procedimentos seguros para manuseio, mistura e armazenamento de produtos químicos, além de abordar os riscos de choque elétrico, afogamento por sucção e as medidas preventivas obrigatórias na área da piscina.'
    },
    {
      number: 7,
      title: 'Equipamentos e Diagnóstico',
      description: 'Torne-se um especialista em resolução de problemas. Aprenda a diagnosticar e solucionar as falhas mais comuns em bombas, filtros e na própria água (água verde, turva, com cheiro forte), utilizando um método passo a passo para identificar a causa raiz e aplicar a correção definitiva.'
    },
    {
      number: 8,
      title: 'Registros de Operação',
      description: 'Descubra a importância legal e profissional do Livro de Operação. Aprenda a documentar corretamente suas visitas, registrar parâmetros químicos, produtos adicionados e manutenções realizadas, criando um histórico que protege você legalmente e valoriza seu serviço perante o cliente.'
    },
    {
      number: 9,
      title: 'Gestão de Ativos',
      description: 'Aprenda a realizar a manutenção preventiva de toda a casa de máquinas. Entenda como inspecionar e cuidar de motobombas, filtros de areia, skimmers e tubulações, prolongando a vida útil dos equipamentos do seu cliente e evitando quebras inesperadas e acidentes graves.'
    },
    {
      number: 10,
      title: 'Normas e Segurança',
      description: 'Conheça a fundo a legislação que rege o seu trabalho. Estudaremos a norma ABNT NBR 10339:2018 sobre construção e segurança, e a Resolução CFQ 332/2025, entendendo como essas regras impactam piscinas coletivas e como você pode usar esse conhecimento para fechar contratos mais lucrativos.'
    },
    {
      number: 11,
      title: 'Sistemas de Circulação',
      description: 'Entenda o "sistema cardiovascular" da piscina. Aprenda a diferença entre sistemas de sucção direta e transbordamento, como calcular a vazão e o tempo de recirculação ideais, e a importância do posicionamento estratégico de bocais e skimmers para eliminar pontos cegos e garantir a filtração perfeita.'
    },
    {
      number: 12,
      title: 'Aquecimento de Piscinas e Spas',
      description: 'Explore as tecnologias que garantem o uso da piscina o ano todo. Conheça os sistemas de aquecimento solar, bombas de calor, aquecedores a gás e elétricos. Aprenda a calcular a necessidade térmica, entender a eficiência energética (COP) e a importância vital do uso da capa térmica.'
    },
    {
      number: 13,
      title: 'Atendimento e Relacionamento com Clientes',
      description: 'Transforme-se de piscineiro em um empreendedor de sucesso. Aprenda técnicas de atendimento ao cliente, como se portar profissionalmente, estratégias para lidar com clientes difíceis, como apresentar orçamentos que convertem e a importância de construir relacionamentos de longo prazo.'
    },
    {
      number: 14,
      title: 'Marketing Digital para Piscineiros Empreendedores',
      description: 'Aprenda a vender seus serviços na era digital. Descubra como posicionar sua empresa no Google Meu Negócio, usar o WhatsApp Business de forma profissional, criar conteúdo atrativo para redes sociais e construir uma marca forte que atrai clientes dispostos a pagar pelo seu valor.'
    }
  ];

  const benefits = [
    {
      icon: Award,
      title: 'Reconhecimento Nacional',
      description: 'O certificado é válido em todo o Brasil, conferindo credibilidade e reconhecimento profissional em qualquer região do país.'
    },
    {
      icon: BookOpen,
      title: 'Formação Técnica + Empreendedora',
      description: 'O curso aborda desde conceitos técnicos básicos até normas da ABNT (NBR 10339:2018), além de módulos exclusivos de atendimento ao cliente, gestão de negócios e marketing digital para piscineiros empreendedores.'
    },
    {
      icon: Shield,
      title: 'Credibilidade Profissional',
      description: 'Obtenha reconhecimento oficial da principal associação do setor, aumentando sua credibilidade junto a clientes e empregadores.'
    },
    {
      icon: TrendingUp,
      title: 'Oportunidades de Mercado',
      description: 'Amplie suas oportunidades de trabalho e negócios, acessando um mercado que valoriza cada vez mais profissionais certificados.'
    },
    {
      icon: Users,
      title: 'Suporte e Comunidade',
      description: 'A ANAPP oferece suporte completo durante todo o curso e você fará parte de uma rede exclusiva de mais de 5.000 profissionais qualificados.'
    },
    {
      icon: Star,
      title: 'Investimento Acessível',
      description: 'Descontos especiais para associados ANAPP (50% off) e possibilidade de associar-se gratuitamente no ato da inscrição.'
    }
  ];

  const testimonials = [
    {
      name: 'Joceara de Jesus Santos',
      role: 'Técnica em Piscinas',
      text: 'Mesmo tendo mais de 20 anos de experiência, decidi fazer o curso para aprimorar ainda mais meus conhecimentos e trazer mais credibilidade ao serviço que ofereço.',
      image: IMAGES.TESTEMUNHAL_JOCEARA
    },
    {
      name: 'Lucas dos Santos Silva Moraes',
      role: 'Técnico em Piscinas',
      text: 'O profissional que busca qualificação frequente demonstra autoridade. Isso se torna um diferencial em um mercado que está em constante crescimento.',
      image: IMAGES.TESTEMUNHAL_LUCAS
    },
    {
      name: 'Vanessa Gaspar de Siqueira',
      role: 'Técnica em Piscinas',
      text: 'O curso me ajudou a entender melhor sobre a água, os produtos e os equipamentos, trazendo mais segurança para trabalhar e mais confiança para os clientes.',
      image: IMAGES.TESTEMUNHAL_VANESSA
    },
    {
      name: 'Walter Alves de Lima',
      role: 'Empresário e Tratador de Piscinas',
      text: 'Trabalho com piscinas desde 1992 e gosto de estar sempre atualizado. O curso da ANAPP é o mais completo para se ter um excelente conhecimento geral na área.',
      image: IMAGES.TESTEMUNHAL_WALTER
    }
  ];

  const faqs = [
    {
      question: 'Qual a carga horária do Programa CTP?',
      answer: 'O curso possui carga horária flexível, permitindo que você estude no seu próprio ritmo. Em média, os alunos completam o programa em 2 a 6 meses, dedicando algumas horas por semana.'
    },
    {
      question: 'Preciso ter conhecimento prévio para fazer o curso?',
      answer: 'Não! O curso foi desenvolvido para atender desde iniciantes até profissionais que desejam se aperfeiçoar. Começamos do básico técnico e avançamos até módulos de empreendedorismo, incluindo atendimento ao cliente e marketing digital.'
    },
    {
      question: 'Como funciona o curso na modalidade online?',
      answer: 'O curso é 100% online através de nossa plataforma. Você terá acesso a videoaulas, materiais complementares, apostilas digitais e suporte via WhatsApp com professores especialistas.'
    },
    {
      question: 'Como obtenho a certificação após concluir o curso?',
      answer: 'Após completar todos os módulos e atividades, você receberá automaticamente seu certificado digital da ANAPP, reconhecido em todo o Brasil.'
    },
    {
      question: 'Posso parcelar o valor do curso?',
      answer: 'Sim! Oferecemos parcelamento em até 6x sem juros no cartão de crédito. O valor promocional com cupom é pago à vista.'
    },
    {
      question: 'A certificação tem validade ou precisa ser renovada?',
      answer: 'O certificado CTP ANAPP não tem prazo de validade. Uma vez certificado, você mantém sua credencial profissional permanentemente.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0072BC] to-[#005a9e] text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
                Certificação Profissional Reconhecida
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Transforme Sua Carreira
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
                Seja você um iniciante buscando uma nova oportunidade ou um profissional querendo se destacar, 
                nossa certificação CTP vai além da técnica: formamos empreendedores completos, preparados para conquistar e fidelizar clientes com a chancela da ANAPP, a principal instituição do setor.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  className="bg-[#FF6B00] hover:bg-[#e55d00] text-white text-lg px-8 py-6 rounded-full shadow-lg"
                  onClick={() => navigate(ROUTE_PATHS.SIGNUP)}
                >
                  Inscreva-se Agora
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-[#0072BC] text-lg px-8 py-6 rounded-full"
                  onClick={() => document.getElementById('content')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Conheça o Programa
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[#0072BC] mb-2">95%</div>
              <div className="text-gray-600">Taxa de Empregabilidade</div>
              <div className="text-sm text-gray-500 mt-1">conseguem trabalho em até 3 meses</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#0072BC] mb-2">5.000+</div>
              <div className="text-gray-600">Profissionais Certificados</div>
              <div className="text-sm text-gray-500 mt-1">Faça parte da maior comunidade do setor</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#0072BC] mb-2">15</div>
              <div className="text-gray-600">Capítulos Completos</div>
              <div className="text-sm text-gray-500 mt-1">Técnica + Empreendedorismo</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#0072BC] mb-2">100%</div>
              <div className="text-gray-600">Online</div>
              <div className="text-sm text-gray-500 mt-1">Estude quando e onde quiser</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Por que escolher a certificação ANAPP?
            </h2>
            <p className="text-xl text-gray-600">
              Conheça todos os benefícios que farão a diferença na sua nova carreira
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-xl bg-[#0072BC]/10 flex items-center justify-center mb-4">
                      <benefit.icon className="w-7 h-7 text-[#0072BC]" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{benefit.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Chapters Section */}
      <section id="content" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              15 Capítulos do Programa CTP
            </h2>
            <p className="text-xl text-gray-600">
              Formação completa: 13 capítulos técnicos + 2 capítulos de empreendedorismo
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {chapters.map((chapter, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-0 shadow-md hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#0072BC] flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">{chapter.number}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{chapter.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{chapter.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section — Marquee automático */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Depoimentos de Profissionais Certificados
            </h2>
            <p className="text-xl text-gray-600">
              Veja o que dizem os profissionais que já concluíram o curso
            </p>
          </motion.div>
        </div>

        {/* Marquee container */}
        <div className="relative w-full overflow-hidden">
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-white to-transparent" />

          <div
            className="flex gap-6"
            style={{ animation: 'marquee-scroll 28s linear infinite', width: 'max-content' }}
            onMouseEnter={e => (e.currentTarget.style.animationPlayState = 'paused')}
            onMouseLeave={e => (e.currentTarget.style.animationPlayState = 'running')}
          >
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <div key={index} className="w-80 flex-shrink-0">
                <Card className="h-full border-0 shadow-lg bg-white">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                      />
                      <div>
                        <div className="font-bold text-gray-900">{testimonial.name}</div>
                        <div className="text-sm text-gray-600">{testimonial.role}</div>
                        <div className="flex gap-0.5 mt-1">
                          {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 fill-[#FF6B00] text-[#FF6B00]" />)}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed italic">&ldquo;{testimonial.text}&rdquo;</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-[#0072BC] to-[#005a9e]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
                Inscreva-se no Programa CTP
              </h2>
              <p className="text-xl text-white/80">
                Torne-se um técnico especializado e empreendedor preparado com a certificação mais reconhecida do mercado, chancelada pela ANAPP
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Associado */}
              <Card className="border-0 shadow-2xl">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="inline-block bg-[#FF6B00] text-white px-4 py-1 rounded-full text-sm font-semibold mb-4">
                      50% de desconto
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Associado ANAPP</h3>
                    <div className="text-sm text-gray-500 line-through mb-1">De R$ 600,00</div>
                    <div className="text-5xl font-bold text-[#0072BC] mb-2">
                      R$ 299<span className="text-2xl">,00</span>
                    </div>
                    <div className="text-sm text-gray-500">Valor único - 50% OFF</div>
                  </div>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">15 capítulos (técnica + empreendedorismo)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">Certificado ANAPP</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">Suporte via WhatsApp</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">Acesso vitalício</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-[#0072BC] hover:bg-[#005a9e] text-white py-6"
                    onClick={() => navigate(ROUTE_PATHS.SIGNUP)}
                  >
                    Inscrever-se
                  </Button>
                </CardContent>
              </Card>

              {/* Não Associado */}
              <Card className="border-0 shadow-2xl">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Não Associado</h3>
                    <div className="text-5xl font-bold text-[#0072BC] mb-2">
                      R$ 600<span className="text-2xl">,00</span>
                    </div>
                    <div className="text-sm text-gray-500">Valor integral</div>
                  </div>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">15 capítulos (técnica + empreendedorismo)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">Certificado ANAPP</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">Suporte via WhatsApp</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">Acesso vitalício</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-[#FF6B00] hover:bg-[#e55d00] text-white py-6"
                    onClick={() => navigate(ROUTE_PATHS.SIGNUP)}
                  >
                    Inscrever-se
                  </Button>
                  <p className="text-center text-sm text-gray-600 mt-4">
                    Ou parcelado em até 6x sem juros no cartão de crédito
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 text-center">
              <p className="text-white/70 text-sm">
                Ao confirmar, você será redirecionado para a página de pagamento seguro. Seus dados estão protegidos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-xl text-gray-600">
              Encontre respostas para as dúvidas mais comuns sobre nossos cursos
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="bg-white rounded-xl border-0 shadow-sm">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <span className="text-left font-semibold text-gray-900">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Não Deixe Essa Oportunidade Passar!
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Sua nova vida profissional está a apenas um clique de distância. 
              Junte-se aos milhares de profissionais que já transformaram suas carreiras com a certificação ANAPP.
            </p>
            <Button 
              size="lg"
              className="bg-[#FF6B00] hover:bg-[#e55d00] text-white text-lg px-12 py-6 rounded-full shadow-lg"
              onClick={() => navigate(ROUTE_PATHS.SIGNUP)}
            >
              Quero Meu Certificado Agora
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
