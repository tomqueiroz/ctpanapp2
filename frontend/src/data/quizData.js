export const quizData = {
  1: {
    title: 'Quiz - Módulo 1: Cálculos',
    description: 'Teste seus conhecimentos sobre cálculos essenciais para piscinas',
    questions: [
      {
        topic: 'Volume e Capacidade',
        question: 'Qual é a fórmula correta para calcular o volume de uma piscina retangular?',
        answers: [
          'Comprimento × Largura',
          'Comprimento × Largura × Profundidade Média',
          'Comprimento + Largura + Profundidade',
          'Comprimento × Profundidade'
        ],
        correctAnswer: 1,
        explanation: 'O volume é calculado multiplicando Comprimento × Largura × Profundidade Média. É o "CPF da Piscina"!'
      },
      {
        topic: 'Conversões',
        question: 'Quantos litros cabem em 1 metro cúbico (m³)?',
        answers: [
          '100 litros',
          '500 litros',
          '1.000 litros',
          '10.000 litros'
        ],
        correctAnswer: 2,
        explanation: '1 m³ = 1.000 litros. Esta é uma conversão fundamental para cálculos de tratamento!'
      },
      {
        topic: 'Área de Superfície',
        question: 'Por que é importante calcular a área de superfície da piscina?',
        answers: [
          'Para saber quantas pessoas cabem',
          'Para calcular a evaporação e dimensionar a capa térmica',
          'Para pintar as paredes',
          'Para instalar o filtro'
        ],
        correctAnswer: 1,
        explanation: 'A área de superfície é crucial para calcular evaporação e dimensionar corretamente capas térmicas.'
      },
      {
        topic: 'Profundidade Média',
        question: 'Como calcular a profundidade média de uma piscina com fundo inclinado?',
        answers: [
          'Apenas a parte mais funda',
          '(Profundidade Rasa + Profundidade Funda) ÷ 2',
          'Apenas a parte mais rasa',
          'Profundidade Funda × 2'
        ],
        correctAnswer: 1,
        explanation: 'Profundidade Média = (Prof. Rasa + Prof. Funda) ÷ 2. Essencial para cálculo correto de volume!'
      },
      {
        topic: 'Aplicação Prática',
        question: 'Uma piscina tem 10m × 5m × 1,5m. Qual seu volume aproximado?',
        answers: [
          '50 m³',
          '65 m³',
          '75 m³',
          '15 m³'
        ],
        correctAnswer: 2,
        explanation: 'Volume = 10 × 5 × 1,5 = 75 m³ ou 75.000 litros. Sempre calcule antes de dosar produtos!'
      }
    ]
  },
  2: {
    title: 'Quiz - Módulo 2: Volume e Capacidade',
    description: 'Domine os cálculos para formatos especiais de piscinas',
    questions: [
      {
        topic: 'Piscinas Circulares',
        question: 'Qual fórmula usar para calcular o volume de uma piscina circular?',
        answers: [
          'π × raio × profundidade',
          'π × raio² × profundidade média',
          'π × diâmetro × profundidade',
          '2 × π × raio'
        ],
        correctAnswer: 1,
        explanation: 'Volume circular = π × raio² × profundidade média. Lembre-se: raio ao quadrado!'
      },
      {
        topic: 'Piscinas Ovais',
        question: 'Para piscinas ovais/elípticas, qual fator multiplicador aproximado usamos?',
        answers: [
          '0,50',
          '0,65',
          '0,78',
          '0,90'
        ],
        correctAnswer: 2,
        explanation: 'Para piscinas ovais, multiplicamos por 0,78 (comprimento × largura × profundidade × 0,78).'
      },
      {
        topic: 'Formatos Irregulares',
        question: 'Como calcular o volume de uma piscina com formato irregular?',
        answers: [
          'Impossível calcular',
          'Dividir em seções regulares e somar',
          'Usar apenas o maior comprimento',
          'Estimar aleatoriamente'
        ],
        correctAnswer: 1,
        explanation: 'Divida em seções retangulares, circulares ou triangulares, calcule cada uma e some os volumes.'
      },
      {
        topic: 'Capacidade Real',
        question: 'Por que o volume real da piscina é sempre menor que o calculado?',
        answers: [
          'Erro de cálculo',
          'Evaporação',
          'Nível operacional abaixo da borda e degraus/bancos',
          'Temperatura da água'
        ],
        correctAnswer: 2,
        explanation: 'O nível operacional fica ~10cm abaixo da borda, e degraus/bancos ocupam espaço. Considere 85-90% do calculado.'
      },
      {
        topic: 'Piscinas de Borda Infinita',
        question: 'O que deve ser considerado em piscinas de borda infinita (infinity pool)?',
        answers: [
          'Apenas o tanque principal',
          'Tanque principal + tanque de compensação',
          'Só a largura',
          'Não precisa calcular'
        ],
        correctAnswer: 1,
        explanation: 'Piscinas infinity têm tanque de compensação que também deve ser considerado no volume total!'
      }
    ]
  },
  3: {
    title: 'Quiz - Módulo 3: Desinfecção e Produtos Químicos',
    description: 'Teste seu conhecimento sobre tipos de cloro e desinfetantes',
    questions: [
      {
        topic: 'Tipos de Cloro',
        question: 'Qual tipo de cloro tem a maior concentração de cloro ativo?',
        answers: [
          'Hipoclorito de Sódio (10-12%)',
          'Hipoclorito de Cálcio (65-70%)',
          'Tricloro (90%)',
          'Dicloro (56-62%)'
        ],
        correctAnswer: 2,
        explanation: 'O Tricloro tem ~90% de cloro ativo, sendo o mais concentrado. Ideal para tratamento de choque!'
      },
      {
        topic: 'pH e Cloro',
        question: 'Como o pH afeta a eficácia do cloro?',
        answers: [
          'Não afeta',
          'pH alto diminui eficácia',
          'pH baixo diminui eficácia',
          'Cloro funciona igual em qualquer pH'
        ],
        correctAnswer: 1,
        explanation: 'Com pH alto (>7,8), apenas 20% do cloro está ativo! Por isso pH ideal é 7,2-7,6.'
      },
      {
        topic: 'Cloro Residual',
        question: 'Qual o nível ideal de cloro livre residual em piscinas?',
        answers: [
          '0,1 a 0,5 ppm',
          '1,0 a 3,0 ppm',
          '5,0 a 10,0 ppm',
          '10,0 a 15,0 ppm'
        ],
        correctAnswer: 1,
        explanation: 'O ideal é manter entre 1,0 e 3,0 ppm de cloro livre para desinfecção eficaz e segura.'
      },
      {
        topic: 'Tratamentos Alternativos',
        question: 'Qual sistema NÃO requer cloro residual?',
        answers: [
          'Ionização',
          'Ozônio',
          'UV',
          'Todos requerem cloro residual'
        ],
        correctAnswer: 3,
        explanation: 'Ozônio e UV NÃO deixam residual! Por isso, ainda precisa de cloro (0,5-1,0 ppm) para manter a desinfecção.'
      },
      {
        topic: 'Armazenamento',
        question: 'Como armazenar produtos clorados corretamente?',
        answers: [
          'Em qualquer lugar',
          'Local fresco, seco, ventilado, longe de ácidos',
          'Próximo ao aquecedor',
          'Dentro da casa de máquinas com outros produtos'
        ],
        correctAnswer: 1,
        explanation: 'Armazene em local fresco, seco, ventilado e LONGE de ácidos! NUNCA misture cloro com ácidos!'
      }
    ]
  },
  4: {
    title: 'Quiz - Módulo 4: Equilíbrio Químico da Água',
    description: 'Teste seus conhecimentos sobre pH, AT e Dureza',
    questions: [
      {
        topic: 'pH',
        question: 'Qual é a faixa ideal de pH para piscinas?',
        answers: [
          '6,0 - 6,8',
          '7,2 - 7,6',
          '8,0 - 8,4',
          '6,5 - 7,0'
        ],
        correctAnswer: 1,
        explanation: 'pH ideal: 7,2 - 7,6. Nesta faixa o cloro é mais eficaz e o conforto dos banhistas é máximo!'
      },
      {
        topic: 'Alcalinidade Total',
        question: 'Qual a função principal da Alcalinidade Total (AT)?',
        answers: [
          'Desinfetar a água',
          'Estabilizar o pH',
          'Clarear a água',
          'Matar algas'
        ],
        correctAnswer: 1,
        explanation: 'A AT é o "colchão" que estabiliza o pH! AT ideal: 80-120 ppm.'
      },
      {
        topic: 'Dureza Cálcica',
        question: 'O que acontece se a Dureza Cálcica estiver muito baixa (<150 ppm)?',
        answers: [
          'Água mais clara',
          'Água fica agressiva e corrói superfícies',
          'Aumenta a eficácia do cloro',
          'Nada acontece'
        ],
        correctAnswer: 1,
        explanation: 'Dureza baixa = água agressiva que corrói! Dureza alta = incrustações. Ideal: 200-400 ppm.'
      },
      {
        topic: 'Índice de Langelier',
        question: 'Para que serve o Índice de Langelier (IL)?',
        answers: [
          'Medir cloro',
          'Prever se água será incrustante ou corrosiva',
          'Calcular volume',
          'Testar temperatura'
        ],
        correctAnswer: 1,
        explanation: 'IL indica tendência: negativo = corrosiva, zero = equilibrada, positivo = incrustante. Alvo: -0,3 a +0,3.'
      },
      {
        topic: 'Ordem de Ajuste',
        question: 'Qual a ordem CORRETA para ajustar os parâmetros?',
        answers: [
          'pH → AT → Dureza → Cloro',
          'AT → pH → Dureza → Cloro',
          'Cloro → pH → AT → Dureza',
          'Qualquer ordem'
        ],
        correctAnswer: 1,
        explanation: 'Ordem correta: 1º AT (estabiliza), 2º pH, 3º Dureza, 4º Cloro. Nunca ajuste pH antes da AT!'
      }
    ]
  },
  5: {
    title: 'Quiz - Módulo 5: Dosagem e Aplicação',
    description: 'Domine cálculos práticos de dosagem de produtos',
    questions: [
      {
        topic: 'Cálculo de Dosagem',
        question: 'Para aumentar 1 ppm de cloro em 10.000L, quanto de hipoclorito 10% usar?',
        answers: [
          '10 ml',
          '100 ml',
          '1 litro',
          '500 ml'
        ],
        correctAnswer: 1,
        explanation: 'Fórmula: (Volume em L × ppm desejado) ÷ (% produto × 100) = (10.000 × 1) ÷ (10 × 100) = 100 ml'
      },
      {
        topic: 'Elevação de pH',
        question: 'Para aumentar pH de 7,0 para 7,4 em 50m³, use aproximadamente quanto de barrilha?',
        answers: [
          '50g',
          '250g',
          '500g',
          '1kg'
        ],
        correctAnswer: 2,
        explanation: 'Regra prática: ~10g de barrilha/m³ para elevar 0,1 no pH. Para 0,4: 10g × 4 × 50m³ = 500g aproximadamente.'
      },
      {
        topic: 'Redução de pH',
        question: 'Qual produto usar para BAIXAR o pH?',
        answers: [
          'Barrilha (Carbonato de Sódio)',
          'Bicarbonato de Sódio',
          'Ácido Muriático ou Bissulfato de Sódio',
          'Cal Hidratada'
        ],
        correctAnswer: 2,
        explanation: 'Para BAIXAR pH use ácido muriático (HCl) ou bissulfato de sódio. CUIDADO: sempre adicione ácido na água!'
      },
      {
        topic: 'Segurança na Aplicação',
        question: 'Qual o procedimento CORRETO ao diluir ácido?',
        answers: [
          'Água no ácido',
          'Ácido na água',
          'Misturar rapidamente',
          'Tanto faz'
        ],
        correctAnswer: 1,
        explanation: 'SEMPRE ácido na água! NUNCA água no ácido (pode espirrar e causar queimaduras). "Água antes, sempre!"'
      },
      {
        topic: 'Tratamento de Choque',
        question: 'Quando fazer supercloração (tratamento de choque)?',
        answers: [
          'Toda semana',
          'Quando água está verde, turva ou após chuvas fortes',
          'Nunca',
          'Todo dia'
        ],
        correctAnswer: 1,
        explanation: 'Supercloração (10-20 ppm) quando: água verde/turva, muitos banhistas, chuvas fortes, ou periodicamente.'
      }
    ]
  },
  6: {
    title: 'Quiz - Módulo 6: Segurança das Instalações',
    description: 'Teste seu conhecimento sobre normas e segurança',
    questions: [
      {
        topic: 'NBR 10.339',
        question: 'Qual a altura MÍNIMA da cerca de proteção segundo NBR 10.339?',
        answers: [
          '0,80m',
          '1,00m',
          '1,10m',
          '1,50m'
        ],
        correctAnswer: 2,
        explanation: 'Cerca de proteção deve ter no mínimo 1,10m de altura com abertura máxima de 11cm!'
      },
      {
        topic: 'Capa de Proteção',
        question: 'Quanto peso uma capa de segurança deve suportar?',
        answers: [
          '10 kg/m²',
          '20 kg/m²',
          '40 kg/m²',
          '100 kg/m²'
        ],
        correctAnswer: 2,
        explanation: 'Capa de proteção deve suportar mínimo 40 kg/m² e ficar ancorada sem espaços nas laterais.'
      },
      {
        topic: 'Botão de Emergência',
        question: 'Qual a distância MÍNIMA do botão de emergência até a borda?',
        answers: [
          '0,5m',
          '1,0m',
          '2,0m',
          '5,0m'
        ],
        correctAnswer: 2,
        explanation: 'Botão de emergência deve ficar a mínimo 2m da borda (NBR 5410) para segurança elétrica!'
      },
      {
        topic: 'Equipamentos Salva-vidas',
        question: 'Quais equipamentos são OBRIGATÓRIOS em piscinas públicas?',
        answers: [
          'Apenas boia',
          'Boia, vara telescópica, maca e kit primeiros socorros',
          'Só vara telescópica',
          'Nenhum é obrigatório'
        ],
        correctAnswer: 1,
        explanation: 'Obrigatórios: boia salva-vidas, vara telescópica (3,6m), maca rígida e kit primeiros socorros!'
      },
      {
        topic: 'EPIs',
        question: 'Quais EPIs são essenciais ao manusear produtos químicos?',
        answers: [
          'Apenas luvas',
          'Luvas, óculos, máscara, avental e botas',
          'Só óculos',
          'Nenhum é necessário'
        ],
        correctAnswer: 1,
        explanation: 'EPIs obrigatórios: luvas químicas, óculos, máscara, avental impermeável e botas. NUNCA manuseie sem EPIs!'
      }
    ]
  },
  7: {
    title: 'Quiz - Módulo 7: Manutenção',
    description: 'Teste seus conhecimentos sobre manutenção de piscinas',
    questions: [
      {
        topic: 'Limpeza',
        question: 'Com que frequência deve-se escovar paredes e fundo da piscina?',
        answers: [
          '1 vez por mês',
          '2-3 vezes por semana',
          '1 vez por ano',
          'Apenas quando suja'
        ],
        correctAnswer: 1,
        explanation: 'Escove paredes e fundo 2-3x por semana para evitar algas e biofilme, mesmo se parecer limpo!'
      },
      {
        topic: 'Skimmer',
        question: 'Por que limpar o cesto do skimmer regularmente?',
        answers: [
          'Estética',
          'Melhora fluxo de água e eficiência do filtro',
          'Não é necessário',
          'Apenas no verão'
        ],
        correctAnswer: 1,
        explanation: 'Cesto entupido reduz vazão, sobrecarrega bomba e diminui eficiência da filtração. Limpe semanalmente!'
      },
      {
        topic: 'Retrolavagem',
        question: 'Quando fazer retrolavagem do filtro?',
        answers: [
          'Todo dia',
          'Quando manômetro indicar aumento de 7-10 psi',
          '1 vez por ano',
          'Nunca'
        ],
        correctAnswer: 1,
        explanation: 'Faça retrolavagem quando pressão subir 7-10 psi acima do normal (filtro sujo). Não faça em excesso!'
      },
      {
        topic: 'Linha de Água',
        question: 'Por que a linha d\'água acumula sujeira rapidamente?',
        answers: [
          'Só água suja',
          'Concentração de óleos, protetor solar e biofilme',
          'Problema do revestimento',
          'Normal e não precisa limpar'
        ],
        correctAnswer: 1,
        explanation: 'Linha d\'água acumula óleos corporais, protetor solar e biofilme. Limpe 1-2x por semana com produto específico!'
      },
      {
        topic: 'Casa de Máquinas',
        question: 'O que deve ser verificado na inspeção mensal da casa de máquinas?',
        answers: [
          'Apenas a bomba',
          'Bomba, filtro, tubulações, válvulas e vazamentos',
          'Só o filtro',
          'Nada, não precisa inspecionar'
        ],
        correctAnswer: 1,
        explanation: 'Inspeção mensal: bomba (ruídos), filtro (pressão), tubulações (rachaduras), válvulas e vazamentos!'
      }
    ]
  },
  8: {
    title: 'Quiz - Módulo 8: Segurança e Normas',
    description: 'Domine as normas técnicas e registros obrigatórios',
    questions: [
      {
        topic: 'Livro de Registro',
        question: 'O que deve ser registrado DIARIAMENTE no livro de registros?',
        answers: [
          'Apenas temperatura',
          'pH, cloro livre, temperatura, banhistas, ocorrências',
          'Só o cloro',
          'Nada é obrigatório'
        ],
        correctAnswer: 1,
        explanation: 'Registros diários obrigatórios: pH, cloro livre, temperatura, nº banhistas, produtos aplicados e ocorrências!'
      },
      {
        topic: 'NBR 10.339 - Sinalização',
        question: 'Quais informações devem estar visíveis na área da piscina?',
        answers: [
          'Apenas profundidade',
          'Profundidade, lotação máxima, regras, telefones emergência',
          'Nenhuma',
          'Só telefones'
        ],
        correctAnswer: 1,
        explanation: 'Sinalização obrigatória: profundidade (min/max), lotação máxima, regras de uso e telefones de emergência (192, 193)!'
      },
      {
        topic: 'Análise de Água',
        question: 'Com que frequência deve-se analisar pH e cloro?',
        answers: [
          '1 vez por semana',
          'Diariamente (piscinas públicas) ou 2-3x semana (privadas)',
          '1 vez por mês',
          'Só quando água turva'
        ],
        correctAnswer: 1,
        explanation: 'Piscinas públicas: análise DIÁRIA de pH e cloro. Piscinas residenciais: mínimo 2-3x por semana!'
      },
      {
        topic: 'Documentação',
        question: 'Por quanto tempo deve-se manter registros e laudos?',
        answers: [
          '1 mês',
          '6 meses',
          'Mínimo 5 anos',
          'Não precisa guardar'
        ],
        correctAnswer: 2,
        explanation: 'Mantenha registros, laudos e documentos por no mínimo 5 anos! São essenciais em auditorias e processos.'
      },
      {
        topic: 'Responsabilidade Técnica',
        question: 'Quem pode assinar a ART (Anotação de Responsabilidade Técnica)?',
        answers: [
          'Qualquer pessoa',
          'Profissional habilitado (engenheiro, técnico registrado)',
          'Apenas o dono',
          'Não precisa ART'
        ],
        correctAnswer: 1,
        explanation: 'ART deve ser assinada por profissional habilitado e registrado no conselho de classe (CREA, etc)!'
      }
    ]
  },
  9: {
    title: 'Quiz - Módulo 9: Sistemas de Manutenção',
    description: 'Teste seu conhecimento sobre tipos de manutenção',
    questions: [
      {
        topic: 'Tipos de Manutenção',
        question: 'Qual tipo de manutenção é mais econômica a longo prazo?',
        answers: [
          'Corretiva',
          'Preventiva',
          'Preditiva',
          'Nenhuma'
        ],
        correctAnswer: 1,
        explanation: 'Manutenção PREVENTIVA é a mais econômica! Evita falhas, prolonga vida útil e reduz custos de emergência.'
      },
      {
        topic: 'Manutenção Corretiva',
        question: 'Quando ocorre a manutenção corretiva?',
        answers: [
          'Antes da falha',
          'Durante monitoramento',
          'APÓS a falha (emergencial)',
          'Nunca'
        ],
        correctAnswer: 2,
        explanation: 'Manutenção CORRETIVA é APÓS a falha - emergencial, cara e causa paralisação. Evite com preventiva!'
      },
      {
        topic: 'Manutenção Preditiva',
        question: 'Como funciona a manutenção preditiva?',
        answers: [
          'Espera quebrar',
          'Monitora dados e antecipa falhas',
          'Troca tudo',
          'Não funciona'
        ],
        correctAnswer: 1,
        explanation: 'Manutenção PREDITIVA monitora parâmetros (vibração, temperatura) e antecipa falhas ANTES de ocorrerem!'
      },
      {
        topic: 'Plano de Manutenção',
        question: 'Qual o primeiro passo para criar um plano de manutenção?',
        answers: [
          'Comprar peças',
          'Inventariar todos os equipamentos',
          'Contratar mais gente',
          'Esperar quebrar'
        ],
        correctAnswer: 1,
        explanation: 'Primeiro: INVENTÁRIO completo de equipamentos (marca, modelo, data instalação, especificações)!'
      },
      {
        topic: 'Periodicidade',
        question: 'Com que frequência deve-se verificar o manômetro do filtro?',
        answers: [
          '1 vez por ano',
          'Diariamente',
          '1 vez por mês',
          'Nunca'
        ],
        correctAnswer: 1,
        explanation: 'Manômetro deve ser verificado DIARIAMENTE! Aumento de pressão indica necessidade de retrolavagem.'
      }
    ]
  },
  10: {
    title: 'Quiz - Módulo 10: Norma ABNT NBR 10.339',
    description: 'Teste seus conhecimentos sobre classificação e requisitos',
    questions: [
      {
        topic: 'Classificação',
        question: 'Quantos grupos de classificação de piscinas existem na NBR 10.339?',
        answers: [
          '3 grupos',
          '5 grupos',
          '7 grupos',
          '10 grupos'
        ],
        correctAnswer: 2,
        explanation: 'A NBR 10.339 classifica piscinas em 7 grupos: uso, suprimento, finalidade, temperatura, características, local e concepção!'
      },
      {
        topic: 'Taxa de Filtração',
        question: 'Qual a taxa de filtração recomendada pela NBR 10.339?',
        answers: [
          '10 a 20 m³/h/m²',
          '25 a 50 m³/h/m²',
          '50 a 100 m³/h/m²',
          'Qualquer taxa'
        ],
        correctAnswer: 1,
        explanation: 'Taxa de filtração ideal: 25 a 50 m³/h/m² (vazão dividida pela área do meio filtrante)!'
      },
      {
        topic: 'Área por Usuário',
        question: 'Qual área mínima por pessoa em piscina rasa (< 1,50m) com área circundante ≥ 2?',
        answers: [
          '0,5 m²',
          '1,0 m²',
          '2,0 m²',
          '4,0 m²'
        ],
        correctAnswer: 1,
        explanation: 'Com área circundante ≥ 2x área da piscina: 1,0 m²/pessoa (rasa) ou 2,0 m²/pessoa (funda)!'
      },
      {
        topic: 'Tempo de Filtração',
        question: 'Qual o tempo MÁXIMO de filtração para piscina residencial privada rasa?',
        answers: [
          '2h',
          '4h',
          '8h',
          '24h'
        ],
        correctAnswer: 1,
        explanation: 'Piscina residencial privada até 0,60m: máx 4h. De 0,60-1,50m: máx 8h. Acima 1,50m: máx 8h!'
      },
      {
        topic: 'Drenos de Fundo',
        question: 'Qual o espaçamento MÍNIMO entre drenos de fundo?',
        answers: [
          '0,5m',
          '1,0m',
          '1,5m',
          '3,0m'
        ],
        correctAnswer: 2,
        explanation: 'Drenos devem ter espaçamento mínimo de 1,5m e tampas anti-aprisionamento obrigatórias!'
      }
    ]
  },
  11: {
    title: 'Quiz - Módulo 11: Circulação de Água',
    description: 'Teste seus conhecimentos sobre sistemas de recirculação',
    questions: [
      {
        topic: 'Importância',
        question: 'Por que a circulação de água é essencial?',
        answers: [
          'Apenas estética',
          'Remove impurezas e homogeneíza produtos químicos',
          'Não é importante',
          'Só para aquecer'
        ],
        correctAnswer: 1,
        explanation: 'Circulação remove impurezas, homogeneíza desinfetantes e mantém qualidade da água. Essencial!'
      },
      {
        topic: 'Sistemas de Captação',
        question: 'Quais são os dois principais sistemas de captação?',
        answers: [
          'Manual e automático',
          'Sucção direta e transbordamento (overflow)',
          'Rápido e lento',
          'Antigo e moderno'
        ],
        correctAnswer: 1,
        explanation: 'Sistemas: 1) Sucção direta (drenos) 2) Transbordamento (skimmers/calhas + tanque compensação)!'
      },
      {
        topic: 'Taxa de Recirculação',
        question: 'O que é Taxa de Recirculação (T)?',
        answers: [
          'Velocidade da bomba',
          'T = Volume recirculado 24h ÷ Volume tanque',
          'Temperatura da água',
          'Tamanho do filtro'
        ],
        correctAnswer: 1,
        explanation: 'T = Vr (volume recirculado 24h) ÷ Vp (volume piscina). Indica quantas vezes a água passa pelo filtro!'
      },
      {
        topic: 'Eficiência da Filtração',
        question: 'Após a 1ª rotação (filtragem completa), quanto de água ainda NÃO foi filtrada?',
        answers: [
          '10%',
          '25%',
          '37%',
          '50%'
        ],
        correctAnswer: 2,
        explanation: 'Na 1ª rotação, 37% da água não foi filtrada! Por isso precisa de múltiplas rotações (4x = apenas 2% não filtrada)!'
      },
      {
        topic: 'Pontos Cegos',
        question: 'O que são pontos cegos e como evitá-los?',
        answers: [
          'Áreas escuras - instalar luzes',
          'Áreas sem circulação - posicionar retornos corretamente',
          'Manchas no fundo - escovar',
          'Não existem'
        ],
        correctAnswer: 1,
        explanation: 'Pontos cegos = áreas sem circulação adequada (causam algas). Evite com: projeto correto de retornos e escovação!'
      }
    ]
  },
  12: {
    title: 'Quiz Final - Certificação CTP',
    description: 'Revisão geral dos 11 módulos anteriores',
    questions: [
      {
        topic: 'Revisão Geral',
        question: 'Qual é o "CPF da Piscina"?',
        answers: [
          'Número de registro',
          'Comprimento × Profundidade × Filtro',
          'Comprimento × Largura × Profundidade (Volume)',
          'Cadastro de Piscina Federal'
        ],
        correctAnswer: 2,
        explanation: 'CPF da Piscina = Volume (C × L × P)! É a medida mais importante para todos os cálculos!'
      },
      {
        topic: 'Revisão Geral',
        question: 'Qual parâmetro deve ser ajustado PRIMEIRO?',
        answers: [
          'pH',
          'Cloro',
          'Alcalinidade Total (AT)',
          'Dureza'
        ],
        correctAnswer: 2,
        explanation: 'Ordem: 1º AT (estabiliza), 2º pH, 3º Dureza, 4º Cloro. AT é a base de tudo!'
      },
      {
        topic: 'Revisão Geral',
        question: 'Por que pH alto (>7,8) é problemático?',
        answers: [
          'Água fica azul demais',
          'Reduz drasticamente eficácia do cloro',
          'Aumenta temperatura',
          'Não é problema'
        ],
        correctAnswer: 1,
        explanation: 'pH >7,8 = apenas 20% do cloro está ativo! Por isso sempre mantenha pH entre 7,2-7,6!'
      },
      {
        topic: 'Revisão Geral',
        question: 'Qual a regra de ouro ao manusear ácidos?',
        answers: [
          'Água no ácido',
          'ÁCIDO NA ÁGUA (nunca o contrário!)',
          'Misturar rapidamente',
          'Não usar EPIs'
        ],
        correctAnswer: 1,
        explanation: 'SEMPRE adicione ácido na água, NUNCA água no ácido! "Água antes, sempre!" + use EPIs!'
      },
      {
        topic: 'Revisão Geral',
        question: 'Qual tipo de manutenção é mais econômica?',
        answers: [
          'Corretiva (após quebrar)',
          'Preventiva (antes de quebrar)',
          'Nenhuma',
          'Preditiva custa menos'
        ],
        correctAnswer: 1,
        explanation: 'Manutenção PREVENTIVA é sempre mais econômica! Evita emergências caras e prolonga vida útil dos equipamentos!'
      }
    ]
  }
};
