import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DollarSign, Shield, Rocket, Laptop, Target, MessageCircle, Users, Clock, Video, FileText, Award, Star, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { ROUTE_PATHS } from '@/lib/index';
import { IMAGES } from '@/assets/images';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [email, setEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleNewsletterSubmit = async () => {
    if (!email || !email.includes('@')) {
      toast({ title: 'Email inválido', description: 'Por favor, informe um email válido.', variant: 'destructive' });
      return;
    }
    setNewsletterLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send_notification_email_2026_05_09', {
        body: { type: 'newsletter', data: { email } }
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Falha ao registrar inscrição');
      setNewsletterSuccess(true);
      setEmail('');
      toast({ title: 'Inscrição realizada!', description: 'Você receberá nossas novidades em breve.' });
    } catch (err) {
      console.error('Newsletter error:', err);
      toast({ title: 'Erro', description: 'Tente novamente em breve.', variant: 'destructive' });
    } finally {
      setNewsletterLoading(false);
    }
  };
  const benefits = [
    {
      icon: DollarSign,
      title: 'Aumente o valor da sua mão de obra',
      description: 'Com a certificação reconhecida pela ANAPP, atenda clientes premium e cobre mais pelo seu trabalho qualificado.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Shield,
      title: 'Credibilidade profissional',
      description: 'Certificado reconhecido pela ANAPP abre portas para condomínios, clubes e clientes especiais que exigem profissionais qualificados.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Rocket,
      title: 'Seja dono do seu negócio',
      description: 'Aprenda a montar e gerenciar sua empresa. Curso completo com módulos de precificação, gestão e marketing digital.',
      color: 'from-[#FF6B00] to-[#e55d00]'
    }
  ];

  const features = [
    { icon: Laptop, title: '100% Online', description: 'Estude no seu ritmo, pelo celular ou computador, 24 horas por dia' },
    { icon: Target, title: 'Muitas dicas e as melhores práticas', description: 'Aprenda com exemplos reais do dia a dia' },
    { icon: MessageCircle, title: 'Suporte direto', description: 'Tire dúvidas pelo WhatsApp com professores especialistas' },
    { icon: Users, title: 'Comunidade VIP', description: 'Networking com profissionais de todo o Brasil' },
    { icon: Clock, title: 'Você estuda no seu ritmo', description: 'Dependendo de sua dedicação, é possível tirar seu certificado em duas semanas ou até 12 meses' }
  ];

  const platformFeatures = [
    {
      icon: Video,
      title: 'Videoaulas de alta qualidade',
      description: 'Conteúdo gravado por especialistas do setor, com muitas dicas, melhores práticas e explicações detalhadas.'
    },
    {
      icon: FileText,
      title: 'Material complementar',
      description: 'PDFs, planilhas e guias práticos para download e consulta rápida durante seu trabalho.'
    },
    {
      icon: MessageCircle,
      title: 'Suporte via WhatsApp',
      description: 'Tire suas dúvidas diretamente com os instrutores através do nosso canal exclusivo de WhatsApp.'
    },
    {
      icon: Award,
      title: 'Certificação digital',
      description: 'Receba seu certificado digital ao concluir o curso e compartilhe nas redes sociais.'
    }
  ];

  const testimonials = [
    {
      name: 'Joceara de Jesus Santos',
      location: 'Técnica em Piscinas',
      text: 'Mesmo tendo mais de 20 anos de experiência, decidi fazer o curso para aprimorar ainda mais meus conhecimentos e trazer mais credibilidade ao serviço que ofereço.',
      image: IMAGES.TESTEMUNHAL_JOCEARA
    },
    {
      name: 'Lucas dos Santos Silva Moraes',
      location: 'Técnico em Piscinas',
      text: 'O profissional que busca qualificação frequente demonstra autoridade. Isso se torna um diferencial em um mercado que está em constante crescimento.',
      image: IMAGES.TESTEMUNHAL_LUCAS
    },
    {
      name: 'Vanessa Gaspar de Siqueira',
      location: 'Técnica em Piscinas',
      text: 'O curso me ajudou a entender melhor sobre a água, os produtos e os equipamentos, trazendo mais segurança para trabalhar e mais confiança para os clientes.',
      image: IMAGES.TESTEMUNHAL_VANESSA
    },
    {
      name: 'Walter Alves de Lima',
      location: 'Empresário e Tratador de Piscinas',
      text: 'Trabalho com piscinas desde 1992 e gosto de estar sempre atualizado. O curso da ANAPP é o mais completo para se ter um excelente conhecimento geral na área.',
      image: IMAGES.TESTEMUNHAL_WALTER
    }
  ];

  const faqs = [
    {
      question: 'O curso é válido em todo o Brasil?',
      answer: 'Sim! O certificado do CTP ANAPP tem validade nacional, sendo reconhecido por condomínios, clubes e empresas do setor em todo o Brasil.'
    },
    {
      question: 'O certificado tem validade?',
      answer: 'Ele é vitalício — não tem prazo de vencimento. Porém, à medida que atualizarmos os módulos, recomendamos que você mantenha seus conhecimentos atualizados.'
    },
    {
      question: 'O acesso ao curso tem validade?',
      answer: 'Não! O acesso é vitalício. Inclusive, quando novos módulos forem adicionados, você terá acesso a eles automaticamente, sem custo adicional.'
    },
    {
      question: 'O curso prepara para ser um Piscineiro Profissional?',
      answer: 'Sim! O CTP foi desenvolvido para formar profissionais completos: do tratamento técnico da água ao empreendedorismo, atendimento ao cliente e marketing digital.'
    },
    {
      question: 'O certificado é reconhecido pela ABNT?',
      answer: 'O curso é baseado nas normas técnicas da ABNT (NBR 10339) e nas melhores práticas do setor. O certificado é emitido pela ANAPP, entidade de referência nacional no mercado de piscinas.'
    },
    {
      question: 'O curso é 100% online?',
      answer: 'Sim! O CTP é 100% online (EAD), permitindo que o aluno estude conforme sua disponibilidade, pelo celular, tablet ou computador, 24 horas por dia.'
    },
    {
      question: 'Quais temas são abordados no curso?',
      answer: 'O curso abrange: química da água, desinfecção, equipamentos, normas técnicas (NBR), segurança, manutenção, atendimento ao cliente, gestão e marketing digital — do básico ao avançado.'
    },
    {
      question: 'Associado ANAPP tem desconto?',
      answer: 'Sim! Associados ANAPP têm 50% de desconto. Para garantir o desconto, associe-se no site da ANAPP antes da compra do curso.'
    },
    {
      question: 'Quais métodos de ensino são utilizados?',
      answer: 'Vídeos, Podcasts e apostilas em PDF. Isso permite que você estude a qualquer momento do dia: assista os vídeos no trajeto, ouça o podcast enquanto trabalha, ou leia os materiais no seu ritmo.'
    },
    {
      question: 'Quanto tempo tenho para concluir o curso?',
      answer: 'Dependendo da sua dedicação, é possível concluir em duas semanas ou em até 12 meses. Você estuda no seu próprio ritmo, sem pressão!'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-white">
        {/* Background Image - Desktop */}
        <div className="hidden lg:block absolute inset-0 z-0">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${IMAGES.HOMEPAGE_CTP_523})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, #ffffff 0%, rgba(255,255,255,0.98) 24%, rgba(255,255,255,0.9) 42%, rgba(255,255,255,0.58) 58%, rgba(255,255,255,0) 74%)',
            }}
          />
        </div>

        {/* Background Image - Mobile */}
        <div className="lg:hidden absolute inset-0 z-0">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${IMAGES.HOMEPAGE_CTP_523})`,
              backgroundSize: 'cover',
              backgroundPosition: 'calc(50% - 150px) center' // Move 150px para ESQUERDA (piscineiro visível direita)
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.7) 48%, rgba(255,255,255,0.08) 78%), linear-gradient(to bottom, transparent 0%, transparent 50%, rgba(255,255,255,0.95) 70%, white 100%)',
            }}
          />
        </div>

        <div className="container mx-auto px-3 sm:px-4 lg:px-8 relative z-10 lg:pt-0" style={{ paddingTop: 'calc(8rem - 50px)', transform: 'translateY(-50px)' }}>
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block bg-white/75 backdrop-blur-sm lg:bg-[#0072BC]/10 text-[#0072BC] px-4 py-2 rounded-full text-sm font-medium mb-6">
                +5.000 profissionais já certificados
              </div>
              
              <h1 className="hero-title text-4xl md:text-6xl font-bold text-[#0072BC] mb-3 lg:mb-6 leading-tight" style={{ textShadow: '0 0 40px rgba(255,255,255,1), 0 0 80px rgba(255,255,255,1), 0 0 120px rgba(255,255,255,0.9), 0 0 160px rgba(255,255,255,0.7)' }}>
                Transforme Sua Carreira com o <span className="text-[#FF6B00]" style={{ textShadow: '0 0 40px rgba(255,255,255,1), 0 0 80px rgba(255,255,255,1), 0 0 120px rgba(255,255,255,0.9), 0 0 160px rgba(255,255,255,0.7)' }}>CTP</span>
              </h1>
              
              <p className="text-[17px] lg:text-xl text-[#005A9E] mb-8 leading-relaxed">
                Domine a técnica e aprenda a empreender! Curso completo que vai além do conhecimento técnico: transforme-se em um profissional certificado e empreendedor de sucesso.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button 
                  size="lg"
                  className="bg-[#FF6B00] hover:bg-[#e55d00] text-white text-lg px-8 py-6 rounded-full shadow-lg"
                  onClick={() => navigate(ROUTE_PATHS.SIGNUP)}
                >
                  Inscreva-se Agora
                </Button>
                <Button 
                  size="lg"
                  className="bg-[#0072BC] hover:bg-[#005a9e] text-white text-lg px-8 py-6 rounded-full shadow-lg border-2 border-[#0072BC]"
                  onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Conheça o Curso
                </Button>
              </div>

              <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#0072BC]" />
                  <span>+5.000 alunos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#FF6B00]" />
                  <span>Certificação ANAPP</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#0072BC]" />
                  <span>100% Online</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <motion.div
          className="absolute bottom-12 sm:bottom-16 md:bottom-20 lg:bottom-24 left-1/2 transform -translate-x-1/2 z-20"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex flex-col items-center gap-2 text-[#FF6B00] drop-shadow-lg"
          >
            <span className="text-sm font-semibold bg-white/90 px-4 py-2 rounded-full shadow-lg">Role para baixo</span>
            <div className="bg-white/90 rounded-full p-2 shadow-lg">
              <ChevronDown className="w-6 h-6" />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Quer ganhar mais como piscineiro?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Com o certificado CTP da ANAPP, você aumenta sua renda, conquista clientes mais exigentes e se destaca no mercado.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-xl transition-all border-0">
                    <CardContent className="p-8">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-6`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="courses" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              A formação mais completa: técnica + empreendedorismo
            </h2>
            <div className="mt-8">
              <div className="text-sm text-gray-600 mb-2">Valor para associados ANAPP</div>
              <div className="text-5xl md:text-6xl font-bold text-[#0072BC]">
                R$ 299<span className="text-2xl text-gray-600">,00</span>
              </div>
              <div className="text-sm font-semibold text-[#0072BC] mt-2">Pagamento único · acesso vitalício</div>
              <div className="text-sm font-semibold text-[#FF6B00] mt-2">✨ Piscineiros: Cadastro GRATUITO ao fazer o curso!</div>
              <div className="text-xs text-gray-500 mt-1">Torne-se associado ANAPP gratuitamente com sua certificação</div>
            </div>
            <Button 
              size="lg"
              className="mt-8 bg-[#FF6B00] hover:bg-[#e55d00] text-white text-lg px-12 py-6 rounded-full shadow-lg"
              onClick={() => navigate(ROUTE_PATHS.SIGNUP)}
            >
              Inscreva-se Agora
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section — Marquee automático */}
      <section className="py-20 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Veja como o CTP mudou a vida desses piscineiros
            </h2>
          </motion.div>
        </div>

        {/* Marquee container — sem px para ocupar largura total */}
        <div className="relative w-full overflow-hidden">
          {/* Fade lateral esquerda */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-gray-50 to-transparent" />
          {/* Fade lateral direita */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-gray-50 to-transparent" />

          <div
            className="flex gap-6"
            style={{
              animation: 'marquee-scroll 28s linear infinite',
              width: 'max-content',
            }}
            onMouseEnter={e => (e.currentTarget.style.animationPlayState = 'paused')}
            onMouseLeave={e => (e.currentTarget.style.animationPlayState = 'running')}
          >
            {/* Duplo para loop perfeito */}
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <div
                key={index}
                className="w-80 flex-shrink-0"
              >
                <Card className="h-full hover:shadow-xl transition-all bg-white">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                      />
                      <div>
                        <div className="font-bold text-gray-900">{testimonial.name}</div>
                        <div className="text-sm text-gray-600">{testimonial.location}</div>
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

      {/* Platform Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Uma plataforma completa para seu aprendizado
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {platformFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-20 h-20 rounded-2xl bg-[#0072BC]/10 flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-10 h-10 text-[#0072BC]" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Certification Section */}
      <section className="py-20 bg-gradient-to-br from-[#0072BC] to-[#005a9e] text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Award className="w-20 h-20 mx-auto mb-8" />
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
                Certificado Oficial ANAPP
              </h2>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Ao concluir o Curso Técnico em Piscinas, você receberá o certificado oficial da ANAPP, reconhecido em todo o Brasil como o padrão de excelência. Mais que um técnico qualificado, você será um empreendedor preparado para conquistar o mercado com a chancela da principal instituição do setor.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <h3 className="font-bold text-lg mb-2">Validade Nacional</h3>
                  <p className="text-blue-100">Certificado digital e impresso com validade nacional</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <h3 className="font-bold text-lg mb-2">Reconhecimento</h3>
                  <p className="text-blue-100">Reconhecido por condomínios, clubes e empresas</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-xl text-gray-600">Tire suas dúvidas sobre o Curso Técnico em Piscinas</p>
          </motion.div>

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

      {/* Newsletter Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Receba dicas e novidades sobre o mundo das piscinas
              </h2>
              <p className="text-gray-600 mb-8">
                Prometemos não enviar spam. Você pode cancelar a inscrição a qualquer momento.
              </p>
              {newsletterSuccess ? (
                <div className="bg-green-100 text-green-800 px-6 py-4 rounded-xl font-semibold">
                  ✅ Inscrição realizada com sucesso! Aguarde nossas novidades.
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="Seu melhor e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && handleNewsletterSubmit()}
                  />
                  <Button
                    className="bg-[#0072BC] hover:bg-[#005a9e] text-white"
                    onClick={handleNewsletterSubmit}
                    disabled={newsletterLoading}
                  >
                    {newsletterLoading ? 'Enviando...' : 'Inscrever-se'}
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-[#0072BC] to-[#005a9e] text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              Comece agora mesmo e garanta seu futuro na profissão que mais cresce no Brasil
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Temos condições especiais e pagamento em até 6x sem juros no cartão.
            </p>
            <Button 
              size="lg"
              className="bg-[#FF6B00] hover:bg-[#e55d00] text-white text-lg px-12 py-6 rounded-full shadow-lg"
              onClick={() => navigate(ROUTE_PATHS.SIGNUP)}
            >
              Quero Meu Certificado
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
