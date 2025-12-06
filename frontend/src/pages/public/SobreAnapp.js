import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Award, Target, Heart, Users, Building2, Wrench, Droplet, Sparkles, Home, TrendingUp, BookOpen, Calendar, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

function SobreAnapp() {
  const navigate = useNavigate();

  const timeline = [
    { ano: "1990", titulo: "Fundação da ANAPP", descricao: "Em 20 de novembro, empresários do setor de piscinas se unem para criar a Associação Nacional das Empresas e Profissionais de Piscinas, com o objetivo de fortalecer o mercado e estabelecer padrões de qualidade." },
    { ano: "1995", titulo: "Primeira Feira do Setor", descricao: "Realização da primeira feira especializada em piscinas e produtos afins, reunindo fabricantes, lojistas e profissionais do setor para apresentação de novidades e networking." },
    { ano: "2000", titulo: "Lançamento da Revista ANAPP", descricao: "Criação da primeira publicação especializada do setor, com conteúdo técnico e informações relevantes para profissionais e empresas do mercado de piscinas." },
    { ano: "2010", titulo: "Criação do Programa CTP", descricao: "Lançamento do Curso Técnico de Piscinas, programa de capacitação voltado à formação e atualização de técnicos em piscinas, estabelecendo um padrão de qualidade para o mercado." },
    { ano: "2015", titulo: "Parceria com a FRANCAL", descricao: "Estabelecimento de parceria estratégica com a FRANCAL para a realização da EXPOLAZER – Feira Internacional de Piscinas, Spas, Decoração e Wellness, consolidando o evento como o maior do setor na América Latina." },
    { ano: "2024", titulo: "24ª Edição da EXPOLAZER", descricao: "Realização da 24ª edição da EXPOLAZER com recorde de público e expositores, consolidando-se como o principal evento do setor de piscinas e bem-estar na América Latina." },
    { ano: "2026", titulo: "25ª Edição da EXPOLAZER", descricao: "Preparativos para a 25ª edição da EXPOLAZER, agendada para 11 a 14 de agosto de 2026, no Distrito Anhembi, em São Paulo, com expectativa de superar todos os recordes anteriores." }
  ];

  const setores = [
    { icone: Droplet, titulo: "Piscinas", itens: ["Piscinas de Vinil", "Piscinas de Fibra", "Piscinas de Alvenaria", "Piscinas Naturais"] },
    { icone: Sparkles, titulo: "Bem-Estar", itens: ["Spas", "Saunas", "Ofurôs", "Hidromassagem"] },
    { icone: Wrench, titulo: "Equipamentos", itens: ["Bombas e Filtros", "Aquecedores", "Iluminação", "Automação"] },
    { icone: Building2, titulo: "Tratamento", itens: ["Produtos Químicos", "Equipamentos de Teste", "Sistemas de Dosagem", "Tratamentos Alternativos"] },
    { icone: Users, titulo: "Serviços", itens: ["Construção", "Manutenção", "Reforma", "Consultoria"] },
    { icone: Home, titulo: "Paisagismo", itens: ["Deck e Bordas", "Mobiliário", "Acessórios", "Projetos de Área de Lazer"] }
  ];

  const servicos = [
    { titulo: "Orientações Técnicas", descricao: "Fornecemos suporte técnico especializado para associados, com orientações sobre normas, procedimentos e melhores práticas do setor." },
    { titulo: "Revista Digital ANAPP", descricao: "Publicação especializada com conteúdo sobre mercado, normas, lançamentos, legislações, instalação, manutenção e tratamento da água." },
    { titulo: "Apoio ao Marketing", descricao: "Suporte comercial com acervo interno de informações estratégicas para auxiliar empresas associadas em suas estratégias de marketing." },
    { titulo: "Eventos e Feiras", descricao: "Organização e promoção de eventos do setor, incluindo a EXPOLAZER, a maior feira de piscinas e bem-estar da América Latina." },
    { titulo: "Cursos e Palestras", descricao: "Realização de cursos, palestras e seminários para capacitação e atualização de profissionais e empresários do setor." },
    { titulo: "Curso Técnico de Piscina", descricao: "Programa de capacitação voltado à formação de técnicos em piscinas, com foco em boas práticas, segurança e excelência no tratamento da água." }
  ];

  const diretoria = [
    { nome: "João Marcelo Caetano Garcia Silva", cargo: "Presidente", empresa: "Suall Indústria e Comércio Ltda" },
    { nome: "Rodrigo Sorrilha Pinheiro", cargo: "Vice-Presidente", empresa: "Fluidra Brasil Indústria e Comércio Ltda" },
    { nome: "Hugo Lisboa", cargo: "Diretor Financeiro", empresa: "Genco Química Industrial" },
    { nome: "Elizabete Inagaki Anan", cargo: "Diretora Técnica", empresa: "Vida e Sol Comércio" },
    { nome: "Luiz Henrique Marques", cargo: "Diretor de Comunicação", empresa: "Comarx Equipamentos e Serviços EIRELI" },
    { nome: "Carlos Eduardo Heise Filho", cargo: "Diretor Secretário", empresa: "Panozon Ambiental S/A" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={null} />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-[#0072BC] to-[#005a9e] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg font-semibold mb-4">INSTITUCIONAL</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Quem Somos</h1>
            <p className="text-xl max-w-3xl mx-auto mb-8">
              Conheça a história e a missão da Associação Nacional das Empresas e Profissionais de Piscinas, referência no setor desde 1990.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#historia" className="bg-white text-[#0072BC] py-3 px-8 rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-lg">
                Nossa História
              </a>
              <a href="#associe-se" className="bg-[#FF6B00] text-white py-3 px-8 rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-lg">
                Associe-se
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* História */}
      <section id="historia" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#FF6B00] font-semibold mb-2">NOSSA HISTÓRIA</p>
            <h2 className="text-3xl font-bold text-[#0072BC] mb-6">Fundação e Trajetória</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-lg text-gray-700 mb-4">
                Fundada em 20 de novembro de 1990 por empresários visionários do segmento de lazer, a ANAPP – Associação Nacional das Empresas e Profissionais de Piscinas nasceu com o propósito de promover o desenvolvimento e o fortalecimento do setor através da união de empresários e profissionais envolvidos no universo das piscinas.
              </p>
              <p className="text-lg text-gray-700 mb-4">
                Ao longo de mais de três décadas, a ANAPP tem sido a voz do setor, representando fabricantes, lojistas, construtores, engenheiros, arquitetos, paisagistas, tratadores de piscina (piscineiros) e todos os agentes fundamentais da cadeia produtiva.
              </p>
              <p className="text-lg text-gray-700">
                A associação representa todos os setores ligados à área, como piscinas de vinil, fibra e alvenaria, além de acessórios, Spas, saunas, aquecedores, bombas, filtros, iluminação, tratamento de água, entre outros.
              </p>
            </div>
            <div>
              <img 
                src="https://static.readdy.ai/image/0649c8a07031c7fbee62019c841ca404/9c883d466da490a2c2611478abee8ff5.jfif" 
                alt="Fundação da ANAPP" 
                className="w-full h-auto rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#FF6B00] font-semibold mb-2">NOSSA TRAJETÓRIA</p>
            <h2 className="text-3xl font-bold text-[#0072BC]">Marcos Históricos</h2>
            <p className="text-lg text-gray-600 mt-4">Conheça os principais acontecimentos que marcaram a história da ANAPP ao longo dos anos</p>
          </div>

          <div className="space-y-8">
            {timeline.map((item, index) => (
              <div key={index} className="flex gap-8">
                <div className="w-24 shrink-0">
                  <div className="bg-[#0072BC] text-white text-2xl font-bold py-3 px-4 rounded-lg text-center">
                    {item.ano}
                  </div>
                </div>
                <div className="flex-1 bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.titulo}</h3>
                  <p className="text-gray-600">{item.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Missão, Visão, Valores */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#FF6B00] font-semibold mb-2">NOSSOS PRINCÍPIOS</p>
            <h2 className="text-3xl font-bold text-[#0072BC]">Missão, Visão e Valores</h2>
            <p className="text-lg text-gray-600 mt-4">Os pilares que orientam nossas ações e decisões</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-[#0072BC] to-[#005a9e] text-white p-8 rounded-xl shadow-lg">
              <Target className="mb-4" size={48} />
              <h3 className="text-2xl font-bold mb-4">Missão</h3>
              <p>Contribuir para o fortalecimento e a ascensão do mercado, priorizando o desenvolvimento empresarial, a qualificação profissional e o suporte contínuo aos empresários, lojistas e profissionais, como os tratadores de piscinas.</p>
            </div>

            <div className="bg-gradient-to-br from-[#FF6B00] to-[#e55a00] text-white p-8 rounded-xl shadow-lg">
              <TrendingUp className="mb-4" size={48} />
              <h3 className="text-2xl font-bold mb-4">Visão</h3>
              <p>Tornar-se referência mundial para os setores envolvidos por meio dos serviços prestados e excelência no atendimento aos associados e a todos que procuram a ANAPP.</p>
            </div>

            <div className="bg-gradient-to-br from-[#0072BC] to-[#005a9e] text-white p-8 rounded-xl shadow-lg">
              <Heart className="mb-4" size={48} />
              <h3 className="text-2xl font-bold mb-4">Valores</h3>
              <ul className="space-y-2">
                <li>• Ética</li>
                <li>• Profissionalismo</li>
                <li>• Criatividade</li>
                <li>• Responsabilidade</li>
                <li>• Respeito</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Áreas de Atuação */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#FF6B00] font-semibold mb-2">ÁREAS DE ATUAÇÃO</p>
            <h2 className="text-3xl font-bold text-[#0072BC]">Setores Representados</h2>
            <p className="text-lg text-gray-600 mt-4">A ANAPP representa todos os setores ligados ao universo das piscinas e bem-estar aquático</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {setores.map((setor, index) => {
              const Icone = setor.icone;
              return (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icone className="text-[#0072BC]" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{setor.titulo}</h3>
                  <ul className="space-y-2 text-gray-600">
                    {setor.itens.map((item, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-[#0072BC] mr-2">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Público */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#FF6B00] font-semibold mb-2">PÚBLICO DA ANAPP</p>
            <h2 className="text-3xl font-bold text-[#0072BC]">Quem Representamos</h2>
            <p className="text-lg text-gray-600 mt-4 max-w-4xl mx-auto">
              A ANAPP representa empresários do setor de lazer e profissionais envolvidos na cadeia de valor das piscinas, cuja atuação é essencial para a segurança e qualidade dos serviços prestados ao consumidor final.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
            {[
              { titulo: "Fabricantes", subtitulo: "Indústrias de piscinas e equipamentos" },
              { titulo: "Lojistas", subtitulo: "Revendedores de produtos e equipamentos" },
              { titulo: "Construtores", subtitulo: "Empresas especializadas em construção" },
              { titulo: "Engenheiros", subtitulo: "Profissionais de engenharia hidráulica" },
              { titulo: "Arquitetos", subtitulo: "Projetistas de espaços com piscinas" },
              { titulo: "Piscineiros", subtitulo: "Técnicos em tratamento de piscinas" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-[#0072BC] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="text-white" size={32} />
                </div>
                <h4 className="font-bold text-gray-900 mb-1">{item.titulo}</h4>
                <p className="text-sm text-gray-600">{item.subtitulo}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl overflow-hidden shadow-lg">
            <img 
              src="https://readdy.ai/api/search-image?query=Diverse%20group%20of%20swimming%20pool%20industry%20professionals%20including%20manufacturers%2C%20retailers%2C%20builders%2C%20engineers%2C%20architects%20and%20pool%20technicians%20gathered%20in%20professional%20setting%2C%20discussing%20industry%20standards%2C%20high-quality%20corporate%20photography%2C%20showing%20collaboration%20and%20networking&width=600&height=600&seq=3&orientation=squarish" 
              alt="Público da ANAPP" 
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#FF6B00] font-semibold mb-2">NOSSOS SERVIÇOS</p>
            <h2 className="text-3xl font-bold text-[#0072BC]">O que Oferecemos</h2>
            <p className="text-lg text-gray-600 mt-4">A ANAPP atua pelo desenvolvimento contínuo do mercado de produtos e serviços ligados a piscinas e áreas correlatas do setor de lazer</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicos.map((servico, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
                <h3 className="text-xl font-bold text-[#0072BC] mb-3">{servico.titulo}</h3>
                <p className="text-gray-600 mb-4">{servico.descricao}</p>
                {servico.titulo === "Curso Técnico de Piscina" && (
                  <button
                    onClick={() => navigate('/cursos')}
                    className="text-[#0072BC] font-semibold hover:underline"
                  >
                    Conhecer o CTP →
                  </button>
                )}
                {servico.titulo === "Revista Digital ANAPP" && (
                  <a
                    href="https://www.anapp.org.br/revistas"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0072BC] font-semibold hover:underline"
                  >
                    Acessar revista →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diretoria */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#FF6B00] font-semibold mb-2">NOSSA EQUIPE</p>
            <h2 className="text-3xl font-bold text-[#0072BC]">Diretoria Executiva e Conselho Fiscal</h2>
            <p className="text-lg text-gray-600 mt-4">Conheça os profissionais que lideram a ANAPP</p>
          </div>

          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Diretoria Executiva</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {diretoria.map((membro, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-xl">
                  <h4 className="text-lg font-bold text-gray-900 mb-1">{membro.nome}</h4>
                  <p className="text-[#0072BC] font-semibold mb-2">{membro.cargo}</p>
                  <p className="text-sm text-gray-600">{membro.empresa}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EXPOLAZER */}
      <section className="py-16 bg-gradient-to-br from-[#0072BC] to-[#005a9e] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-lg font-semibold mb-2">EVENTO</p>
            <h2 className="text-4xl font-bold mb-4">EXPOLAZER</h2>
            <p className="text-xl">A maior feira internacional de piscinas, spas, decoração e wellness da América Latina</p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold mb-4">25ª Edição - EXPOLAZER 2026</h3>
            <p className="text-lg mb-6">
              Em parceria com a FRANCAL, a ANAPP idealizou a EXPOLAZER, que chegou à sua 24ª edição em 2024 com recorde de público. A 25ª edição já tem data marcada: de 11 a 14 de agosto de 2026, no Distrito Anhembi, em São Paulo.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold text-[#FF6B00] mb-2">300+</div>
                <p>Expositores</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#FF6B00] mb-2">30.000+</div>
                <p>Visitantes</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#FF6B00] mb-2">15+</div>
                <p>Países Representados</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#FF6B00] mb-2">25.000m²</div>
                <p>Área de Exposição</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Associe-se */}
      <section id="associe-se" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#FF6B00] font-semibold mb-2">ASSOCIE-SE</p>
            <h2 className="text-3xl font-bold text-[#0072BC]">Faça Parte da ANAPP</h2>
            <p className="text-lg text-gray-600 mt-4 max-w-3xl mx-auto">
              Associe-se à ANAPP e faça parte da maior comunidade de profissionais e empresas do setor de piscinas do Brasil. Conheça os benefícios exclusivos para associados:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-gray-50 p-6 rounded-xl text-center">
              <Award className="mx-auto mb-4 text-[#0072BC]" size={48} />
              <h4 className="font-bold text-gray-900 mb-2">Representatividade Setorial</h4>
              <p className="text-sm text-gray-600">Participação em discussões e decisões importantes para o setor</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl text-center">
              <Users className="mx-auto mb-4 text-[#0072BC]" size={48} />
              <h4 className="font-bold text-gray-900 mb-2">Networking Qualificado</h4>
              <p className="text-sm text-gray-600">Acesso a uma rede de contatos com os principais players do mercado</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl text-center">
              <BookOpen className="mx-auto mb-4 text-[#0072BC]" size={48} />
              <h4 className="font-bold text-gray-900 mb-2">Capacitação Exclusiva</h4>
              <p className="text-sm text-gray-600">Descontos especiais em cursos, eventos e na EXPOLAZER</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl text-center">
              <TrendingUp className="mx-auto mb-4 text-[#0072BC]" size={48} />
              <h4 className="font-bold text-gray-900 mb-2">Visibilidade no Mercado</h4>
              <p className="text-sm text-gray-600">Divulgação da sua empresa nos canais de comunicação da ANAPP</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#0072BC] to-[#005a9e] rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-8">Categorias de Associados</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <h4 className="text-xl font-bold mb-2">Associado Fabricante</h4>
                <p className="text-sm mb-4">Para indústrias e fabricantes de piscinas, equipamentos e produtos químicos.</p>
                <div className="text-3xl font-bold text-[#FF6B00] mb-2">R$ 3.912,00</div>
                <p className="text-sm">/ano</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <h4 className="text-xl font-bold mb-2">Associado Lojista</h4>
                <p className="text-sm mb-4">Para lojas e revendedores de produtos e equipamentos para piscinas.</p>
                <div className="text-3xl font-bold text-[#FF6B00] mb-2">R$ 216,00</div>
                <p className="text-sm">/ano</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <h4 className="text-xl font-bold mb-2">Associado Profissional</h4>
                <p className="text-sm mb-4">Para piscineiros, técnicos, engenheiros, arquitetos e outros profissionais.</p>
                <div className="text-3xl font-bold text-[#FF6B00] mb-2">GRÁTIS</div>
                <p className="text-sm">Não paga anuidade</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/contato')}
              className="mt-8 bg-[#FF6B00] text-white py-4 px-12 rounded-lg font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg"
            >
              Quero me Associar
            </button>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#FF6B00] font-semibold mb-2">CONTATO</p>
            <h2 className="text-3xl font-bold text-[#0072BC]">Fale Conosco</h2>
            <p className="text-lg text-gray-600 mt-4">Entre em contato com a ANAPP para tirar dúvidas, solicitar informações ou associar-se</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Informações de Contato</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <MapPin className="text-[#0072BC] mr-4 shrink-0" size={24} />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Endereço</h4>
                    <p className="text-gray-600">Av. Queiroz Filho, 1700 Sala 807 D – Villa Lobos Office Park</p>
                    <p className="text-gray-600">Vila Leopoldina – 05319-000 São Paulo – SP</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="text-[#0072BC] mr-4 shrink-0" size={24} />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Telefone</h4>
                    <p className="text-gray-600">(11) 5687-7888</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="text-[#0072BC] mr-4 shrink-0" size={24} />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">E-mail</h4>
                    <p className="text-gray-600">contato@anapp.org.br</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MessageCircle className="text-[#0072BC] mr-4 shrink-0" size={24} />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">WhatsApp</h4>
                    <p className="text-gray-600">(11) 99000-1750</p>
                  </div>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-900 mb-2">Horário de Atendimento</h4>
                  <p className="text-gray-600">Segunda a Sexta: 9h às 18h</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Envie sua Mensagem</h3>
              <button
                onClick={() => navigate('/contato')}
                className="w-full bg-[#0072BC] text-white py-3 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition-all"
              >
                Ir para Formulário de Contato
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-[#0072BC] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Faça parte da maior comunidade do setor de piscinas do Brasil</h2>
          <p className="text-xl mb-8">Associe-se à ANAPP e contribua para o fortalecimento e desenvolvimento do mercado.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/contato')}
              className="bg-[#FF6B00] text-white py-4 px-12 rounded-lg font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg"
            >
              Associe-se Agora
            </button>
            <button
              onClick={() => navigate('/contato')}
              className="bg-white text-[#0072BC] py-4 px-12 rounded-lg font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg"
            >
              Entre em Contato
            </button>
          </div>
        </div>
      </section>

      <Footer user={null} />
    </div>
  );
}

export default SobreAnapp;