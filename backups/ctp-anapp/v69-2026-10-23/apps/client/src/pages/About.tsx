import { Award, Users, Target, TrendingUp, Calendar, Building2, Briefcase, GraduationCap, Handshake, Trophy, Phone, Mail, MapPin, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { IMAGES } from '@/assets/images';

export default function About() {
  const timeline = [
    { year: '1990', title: 'Fundação da ANAPP', description: 'Empresários do setor de piscinas se unem para criar a associação e fortalecer o mercado' },
    { year: '1995', title: 'Primeira Feira do Setor', description: 'Realização da primeira feira especializada reunindo fabricantes e profissionais' },
    { year: '2000', title: 'Revista ANAPP', description: 'Criação da primeira publicação especializada com conteúdo técnico' },
    { year: '2005', title: 'Programa CTP', description: 'Lançamento do Curso Técnico de Piscinas estabelecendo padrão de qualidade' },
    { year: '2010', title: 'Parceria FRANCAL', description: 'Criação da EXPOLAZER, maior evento do setor na América Latina' },
    { year: '2024', title: '24ª EXPOLAZER', description: 'Recorde de público consolidando o evento como referência' },
  ];

  const valores = [
    { icon: Award, title: 'Ética', description: 'Compromisso com práticas transparentes e justas em todas as relações' },
    { icon: Trophy, title: 'Profissionalismo', description: 'Excelência e qualidade em todos os serviços prestados' },
    { icon: TrendingUp, title: 'Criatividade', description: 'Inovação constante para o desenvolvimento do setor' },
    { icon: Handshake, title: 'Responsabilidade', description: 'Compromisso sério com associados e mercado' },
    { icon: Users, title: 'Respeito', description: 'Valorização de todos os profissionais do setor' },
  ];

  const setores = [
    { title: 'Fabricantes', description: 'Indústrias de piscinas e equipamentos' },
    { title: 'Lojistas', description: 'Revendedores de produtos e equipamentos' },
    { title: 'Construtores', description: 'Empresas especializadas em construção' },
    { title: 'Engenheiros', description: 'Profissionais de engenharia hidráulica' },
    { title: 'Arquitetos', description: 'Projetistas de espaços com piscinas' },
    { title: 'Piscineiros', description: 'Técnicos em tratamento de piscinas' },
  ];

  const servicos = [
    { icon: GraduationCap, title: 'Orientações Técnicas', description: 'Suporte técnico especializado com orientações sobre normas, procedimentos e melhores práticas do setor' },
    { icon: Building2, title: 'Revista Digital ANAPP', description: 'Publicação com conteúdo sobre mercado, normas, lançamentos, legislações e tratamento da água' },
    { icon: Briefcase, title: 'Apoio ao Marketing', description: 'Suporte comercial com informações estratégicas para auxiliar empresas nas estratégias de marketing' },
    { icon: Trophy, title: 'Eventos e Feiras', description: 'Organização da EXPOLAZER, a maior feira de piscinas e bem-estar da América Latina' },
    { icon: Users, title: 'Cursos e Palestras', description: 'Realização de cursos, palestras e seminários para capacitação de profissionais e empresários' },
    { icon: Award, title: 'Curso Técnico de Piscina (CTP)', description: 'Programa completo de capacitação técnica e empreendedora: da química da água ao marketing digital, formando profissionais completos para o mercado' },
  ];

  const diretoria = [
    { nome: 'João Marcelo Caetano Garcia Silva', cargo: 'Presidente', empresa: 'Suall Indústria e Comércio Ltda' },
    { nome: 'Hugo Sirvente Lisboa', cargo: 'Vice-Presidente', empresa: 'Genco Química Industrial Ltda' },
    { nome: 'Carlos Eduardo Heise Filho', cargo: 'Diretor Financeiro', empresa: 'Panozon Ambiental S/A' },
    { nome: 'Rodrigo Sorrilha Pinheiro', cargo: 'Diretor Secretário', empresa: 'Fluidra Brasil Indústria e Comércio Ltda' },
    { nome: 'José Donizete Rossini', cargo: 'Diretor de Comunicação', empresa: 'Uni Piscinas e Lazer Indústria e Comércio Ltda' },
    { nome: 'Luiz Henrique Marques', cargo: 'Diretor Técnico', empresa: 'Comarx Equipamentos e Serviços EIRELI' },
  ];

  const conselhoFiscal = [
    { nome: 'Fábio Villatoro', cargo: 'Conselho Fiscal', empresa: 'SIBRAPE Ind e Comércio de Equipamentos Aquáticos e de Filtragem Ltda' },
    { nome: 'Gilmar Pretto', cargo: 'Conselho Fiscal', empresa: 'Morro Grande Ind e Comércio de Fibras Ltda - FIBRATEC' },
    { nome: 'Elizabete Inagaki Anan', cargo: 'Conselho Fiscal', empresa: 'Vida e Sol Comércio de Artigos de Decoração e Lazer LTDA' },
  ];

  const conselhoFiscalSubstituto = [
    { nome: 'Ricardo Rodrigues Nogueira', cargo: 'Conselho Fiscal Substituto', empresa: 'SICAR Indústria e Comércio de Produtos para Piscinas LTDA' },
    { nome: 'Rilton Marques Venâncio', cargo: 'Conselho Fiscal Substituto', empresa: 'BAUMINAS HIDROAZUL Indústria e Comércio LTDA' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#0072BC] to-[#005a9e] text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Sobre a ANAPP</h1>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed">
              Conheça a história e a missão da Associação Nacional das Empresas e Profissionais de Piscinas, 
              referência no setor desde 1990.
            </p>
          </div>
        </div>
      </div>

      {/* Fundação e Trajetória */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Fundação e Trajetória</h2>
          <div className="prose max-w-none mb-12">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Fundada em <strong>20 de novembro de 1990</strong> por empresários visionários do segmento de lazer, 
              a ANAPP nasceu com o propósito de promover o desenvolvimento e o fortalecimento do setor através da 
              união de empresários e profissionais envolvidos no universo das piscinas.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Ao longo de mais de três décadas, a ANAPP tem sido a voz do setor, representando fabricantes, lojistas, 
              construtores, engenheiros, arquitetos, paisagistas e tratadores de piscina, além de todos os agentes 
              fundamentais da cadeia produtiva.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              A associação representa todos os setores ligados à área, como piscinas de vinil, fibra e alvenaria, 
              além de acessórios, Spas, saunas, aquecedores, bombas, filtros, iluminação e tratamento de água.
            </p>
          </div>
        </div>
      </div>

      {/* Linha do Tempo */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Desde 1990</h2>
              <p className="text-xl text-gray-600">
                Conheça os principais acontecimentos que marcaram a história da ANAPP
              </p>
            </div>

            <div className="relative">
              {/* Linha vertical */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[#0072BC]"></div>

              {timeline.map((item, index) => (
                <div key={index} className="relative pl-20 pb-12 last:pb-0">
                  {/* Ponto na linha */}
                  <div className="absolute left-5 top-2 w-6 h-6 rounded-full bg-[#0072BC] border-4 border-white shadow-lg"></div>
                  
                  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
                    <div className="text-[#FF6B00] font-bold text-2xl mb-2">{item.year}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* EXPOLAZER 2026 - Bloco Único com Parallax */}
      <div className="relative min-h-[600px] flex items-center overflow-hidden">
        {/* Background Parallax */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${IMAGES.EXPOLAZER_FEIRA_57310})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        />
        {/* Overlay escuro */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60 z-10" />
        
        {/* Conteúdo */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20 py-20">
          <div className="max-w-6xl mx-auto">
            {/* Título Principal */}
            <div className="text-center mb-16">
              <h2 
                className="text-5xl md:text-7xl font-bold mb-6 text-white"
                style={{ textShadow: '0 0 30px rgba(255,255,255,0.8), 0 0 60px rgba(135,206,250,0.6)' }}
              >
                25ª EXPOLAZER
              </h2>
              <p 
                className="text-3xl md:text-4xl mb-4 text-white font-semibold"
                style={{ textShadow: '0 0 20px rgba(255,255,255,0.6), 0 0 40px rgba(135,206,250,0.4)' }}
              >
                11 a 14 de agosto de 2026
              </p>
              <p 
                className="text-2xl text-white/90"
                style={{ textShadow: '0 0 15px rgba(255,255,255,0.5)' }}
              >
                Distrito Anhembi, São Paulo
              </p>
            </div>

            {/* Descrição */}
            <div className="text-center mb-12">
              <p 
                className="text-xl md:text-2xl text-white leading-relaxed max-w-4xl mx-auto"
                style={{ textShadow: '0 0 15px rgba(0,0,0,0.8), 0 0 30px rgba(135,206,250,0.3)' }}
              >
                A maior feira internacional de piscinas, spas, decoração e wellness da América Latina
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div 
                  className="text-5xl md:text-6xl font-bold mb-2 text-white"
                  style={{ textShadow: '0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(135,206,250,0.5)' }}
                >
                  300+
                </div>
                <div 
                  className="text-lg text-white/90"
                  style={{ textShadow: '0 0 10px rgba(0,0,0,0.8)' }}
                >
                  Expositores
                </div>
              </div>
              <div>
                <div 
                  className="text-5xl md:text-6xl font-bold mb-2 text-white"
                  style={{ textShadow: '0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(135,206,250,0.5)' }}
                >
                  30.000+
                </div>
                <div 
                  className="text-lg text-white/90"
                  style={{ textShadow: '0 0 10px rgba(0,0,0,0.8)' }}
                >
                  Visitantes
                </div>
              </div>
              <div>
                <div 
                  className="text-5xl md:text-6xl font-bold mb-2 text-white"
                  style={{ textShadow: '0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(135,206,250,0.5)' }}
                >
                  15+
                </div>
                <div 
                  className="text-lg text-white/90"
                  style={{ textShadow: '0 0 10px rgba(0,0,0,0.8)' }}
                >
                  Países
                </div>
              </div>
              <div>
                <div 
                  className="text-5xl md:text-6xl font-bold mb-2 text-white"
                  style={{ textShadow: '0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(135,206,250,0.5)' }}
                >
                  25.000m²
                </div>
                <div 
                  className="text-lg text-white/90"
                  style={{ textShadow: '0 0 10px rgba(0,0,0,0.8)' }}
                >
                  Área
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Missão, Visão e Valores */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">Missão, Visão e Valores</h2>
          <p className="text-xl text-gray-600 mb-12 text-center">
            Os pilares que orientam nossas ações e decisões
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="w-16 h-16 rounded-2xl bg-[#0072BC]/10 flex items-center justify-center mb-6">
                  <Target className="w-8 h-8 text-[#0072BC]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Missão</h3>
                <p className="text-gray-600 leading-relaxed">
                  Contribuir para o fortalecimento e a ascensão do mercado, priorizando o desenvolvimento empresarial, 
                  a qualificação técnica e empreendedora dos profissionais, e o suporte contínuo aos empresários, lojistas e tratadores de piscinas, 
                  formando não apenas técnicos qualificados, mas empreendedores preparados para o mercado.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="w-16 h-16 rounded-2xl bg-[#FF6B00]/10 flex items-center justify-center mb-6">
                  <Award className="w-8 h-8 text-[#FF6B00]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Visão</h3>
                <p className="text-gray-600 leading-relaxed">
                  Tornar-se referência mundial para os setores envolvidos por meio dos serviços prestados e 
                  excelência no atendimento aos associados e a todos que procuram a ANAPP.
                </p>
              </CardContent>
            </Card>
          </div>

          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Nossos Valores</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {valores.map((valor, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-[#0072BC]/10 flex items-center justify-center mb-4">
                    <valor.icon className="w-6 h-6 text-[#0072BC]" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{valor.title}</h4>
                  <p className="text-gray-600 text-sm">{valor.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Setores Representados */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">Quem Representamos</h2>
            <p className="text-xl text-gray-600 mb-12 text-center">
              A ANAPP representa empresários do setor de lazer e profissionais envolvidos na cadeia de valor das piscinas
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {setores.map((setor, index) => (
                <Card key={index} className="border-0 shadow-md hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 text-center">
                    <h4 className="text-xl font-bold text-[#0072BC] mb-2">{setor.title}</h4>
                    <p className="text-gray-600">{setor.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* O que Oferecemos */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">O que Oferecemos</h2>
          <p className="text-xl text-gray-600 mb-12 text-center">
            A ANAPP atua pelo desenvolvimento contínuo do mercado de produtos e serviços ligados a piscinas
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servicos.map((servico, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-xl bg-[#0072BC]/10 flex items-center justify-center mb-4">
                    <servico.icon className="w-7 h-7 text-[#0072BC]" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-3">{servico.title}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{servico.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Diretoria */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">Diretoria Executiva</h2>
            <p className="text-xl text-gray-600 mb-12 text-center">
              Conheça os profissionais que lideram a ANAPP
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {diretoria.map((membro, index) => (
                <Card key={index} className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="text-[#FF6B00] font-semibold text-sm mb-2">{membro.cargo}</div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{membro.nome}</h4>
                    <p className="text-gray-600 text-sm">{membro.empresa}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Conselho Fiscal</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {conselhoFiscal.map((membro, index) => (
                <Card key={index} className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="text-[#0072BC] font-semibold text-sm mb-2">{membro.cargo}</div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{membro.nome}</h4>
                    <p className="text-gray-600 text-sm">{membro.empresa}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Conselho Fiscal Substituto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
              {conselhoFiscalSubstituto.map((membro, index) => (
                <Card key={index} className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="text-[#FF6B00] font-semibold text-sm mb-2">{membro.cargo}</div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{membro.nome}</h4>
                    <p className="text-gray-600 text-sm">{membro.empresa}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section — Marquee automático */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              O que dizem os profissionais certificados
            </h2>
            <p className="text-xl text-gray-600">
              Histórias reais de quem transformou a carreira com o CTP ANAPP
            </p>
          </div>
        </div>

        <div className="relative w-full overflow-hidden">
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-white to-transparent" />

          <div
            className="flex gap-6"
            style={{ animation: 'marquee-scroll 28s linear infinite', width: 'max-content' }}
            onMouseEnter={e => (e.currentTarget.style.animationPlayState = 'paused')}
            onMouseLeave={e => (e.currentTarget.style.animationPlayState = 'running')}
          >
            {[
              { name: 'Joceara de Jesus Santos', role: 'Técnica em Piscinas', text: 'Mesmo tendo mais de 20 anos de experiência, decidi fazer o curso para aprimorar ainda mais meus conhecimentos e trazer mais credibilidade ao serviço que ofereço.', image: IMAGES.TESTEMUNHAL_JOCEARA },
              { name: 'Lucas dos Santos Silva Moraes', role: 'Técnico em Piscinas', text: 'O profissional que busca qualificação frequente demonstra autoridade. Isso se torna um diferencial em um mercado que está em constante crescimento.', image: IMAGES.TESTEMUNHAL_LUCAS },
              { name: 'Vanessa Gaspar de Siqueira', role: 'Técnica em Piscinas', text: 'O curso me ajudou a entender melhor sobre a água, os produtos e os equipamentos, trazendo mais segurança para trabalhar e mais confiança para os clientes.', image: IMAGES.TESTEMUNHAL_VANESSA },
              { name: 'Walter Alves de Lima', role: 'Empresário e Tratador de Piscinas', text: 'Trabalho com piscinas desde 1992 e gosto de estar sempre atualizado. O curso da ANAPP é o mais completo para se ter um excelente conhecimento geral na área.', image: IMAGES.TESTEMUNHAL_WALTER },
              { name: 'Joceara de Jesus Santos', role: 'Técnica em Piscinas', text: 'Mesmo tendo mais de 20 anos de experiência, decidi fazer o curso para aprimorar ainda mais meus conhecimentos e trazer mais credibilidade ao serviço que ofereço.', image: IMAGES.TESTEMUNHAL_JOCEARA },
              { name: 'Lucas dos Santos Silva Moraes', role: 'Técnico em Piscinas', text: 'O profissional que busca qualificação frequente demonstra autoridade. Isso se torna um diferencial em um mercado que está em constante crescimento.', image: IMAGES.TESTEMUNHAL_LUCAS },
              { name: 'Vanessa Gaspar de Siqueira', role: 'Técnica em Piscinas', text: 'O curso me ajudou a entender melhor sobre a água, os produtos e os equipamentos, trazendo mais segurança para trabalhar e mais confiança para os clientes.', image: IMAGES.TESTEMUNHAL_VANESSA },
              { name: 'Walter Alves de Lima', role: 'Empresário e Tratador de Piscinas', text: 'Trabalho com piscinas desde 1992 e gosto de estar sempre atualizado. O curso da ANAPP é o mais completo para se ter um excelente conhecimento geral na área.', image: IMAGES.TESTEMUNHAL_WALTER },
            ].map((t, index) => (
              <div key={index} className="w-80 flex-shrink-0">
                <Card className="h-full border-0 shadow-lg bg-white">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <img src={t.image} alt={t.name} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
                      <div>
                        <div className="font-bold text-gray-900">{t.name}</div>
                        <div className="text-sm text-gray-600">{t.role}</div>
                        <div className="flex gap-0.5 mt-1">
                          {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 fill-[#FF6B00] text-[#FF6B00]" />)}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Fale Conosco */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Fale Conosco</h2>
            <p className="text-xl text-gray-600">Entre em contato com a equipe ANAPP</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Telefone */}
            <Card className="border-0 shadow-md hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#0072BC]/10 flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-7 h-7 text-[#0072BC]" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Telefone</h4>
                <a href="tel:+551156877888" className="text-gray-600 hover:text-[#0072BC] transition text-sm">
                  (11) 5687-7888
                </a>
              </CardContent>
            </Card>

            {/* WhatsApp */}
            <Card className="border-0 shadow-md hover:shadow-xl transition-shadow border-2 border-green-200">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">WhatsApp</h4>
                <a
                  href="https://wa.me/5511990001750?text=Ol%C3%A1%2C%20tenho%20interesse%20no%20Curso%20T%C3%A9cnico%20de%20Piscinas%20CTP%20ANAPP!"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#1ebe5b] transition-colors mt-1"
                >
                  Iniciar conversa
                </a>
              </CardContent>
            </Card>

            {/* E-mail */}
            <Card className="border-0 shadow-md hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#0072BC]/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-7 h-7 text-[#0072BC]" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">E-mail</h4>
                <a href="mailto:contato@anapp.org.br" className="text-gray-600 hover:text-[#0072BC] transition text-sm">
                  contato@anapp.org.br
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Faça parte da maior comunidade do setor de piscinas do Brasil
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Associe-se à ANAPP e contribua para o fortalecimento e desenvolvimento do mercado
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-[#FF6B00] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#e55d00] transition-colors shadow-lg hover:shadow-xl"
          >
            Associe-se Agora
          </button>
        </div>
      </div>
    </div>
  );
}
