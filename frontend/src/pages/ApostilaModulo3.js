import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoggedInHeader from '../components/LoggedInHeader';
import Footer from '../components/Footer';
import { Download, BookOpen, CheckCircle2, AlertTriangle, Lightbulb, Droplet, Shield, TestTube, ArrowRight, Zap, ThermometerSun } from 'lucide-react';
import { generateApostilaPDF } from '../utils/pdfGenerator';

function ApostilaModulo3({ user = { name: 'Aluno' } }) {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('apostila-content');
      
      const opt = {
        margin: [0.8, 0.5, 0.8, 0.5],
        filename: 'Apostila-CTP-Modulo-3-Desinfeccao.pdf',
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { 
          unit: 'in', 
          format: 'letter', 
          orientation: 'portrait',
          compress: true
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      // Gerar o PDF
      const pdf = await html2pdf().set(opt).from(element).toPdf().get('pdf');
      
      const totalPages = pdf.internal.getNumberOfPages();
      
      // Adicionar cabeçalho e rodapé em cada página
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        
        // Cabeçalho
        pdf.setFontSize(10);
        pdf.setTextColor(0, 114, 188); // Azul CTP
        pdf.setFont('helvetica', 'bold');
        pdf.text('CTP ANAPP', 0.5, 0.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text('Módulo 3 - Desinfecção e Produtos Químicos', 0.5, 0.65);
        
        // Linha do cabeçalho
        pdf.setDrawColor(0, 114, 188);
        pdf.setLineWidth(0.01);
        pdf.line(0.5, 0.75, 8, 0.75);
        
        // Rodapé
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.setFont('helvetica', 'italic');
        pdf.text('Proibida a reprodução - Direitos Autorais Aplicáveis', 0.5, 10.7);
        
        // Numeração da página
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Página ${i} de ${totalPages}`, 7.2, 10.7);
        
        // Linha do rodapé
        pdf.setDrawColor(200, 200, 200);
        pdf.line(0.5, 10.55, 8, 10.55);
      }
      
      pdf.save('Apostila-CTP-Modulo-3-Desinfeccao.pdf');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LoggedInHeader user={user} />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#0072BC] to-[#005a9e] text-white pt-24 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={40} />
            <div>
              <p className="text-sm font-light text-blue-100">Apostila Completa</p>
              <h1 className="text-3xl md:text-4xl font-light">Módulo 3 - Desinfecção e Produtos Químicos</h1>
            </div>
          </div>
          <p className="text-lg text-blue-100 font-light mb-6">
            Cloro, pH e Segurança na Manutenção de Piscinas
          </p>
          
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="bg-[#FF6B00] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#e55d00] transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            <Download size={20} />
            {downloading ? 'Gerando PDF...' : 'Baixar Apostila em PDF'}
          </button>
        </div>
      </div>

      {/* Conteúdo da Apostila */}
      <div id="apostila-content" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Objetivos */}
        <div className="bg-blue-50 border-l-4 border-[#0072BC] rounded-r-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="text-[#0072BC] flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-[#0072BC] mb-3">🎯 Objetivos deste Capítulo</h3>
              <p className="text-gray-700 mb-2">Ao final deste capítulo, você será capaz de:</p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-[#0072BC]">•</span>
                  <span>Compreender o processo de desinfecção</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0072BC]">•</span>
                  <span>Conhecer os principais produtos químicos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0072BC]">•</span>
                  <span>Diferenciar tipos de cloro e suas aplicações</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0072BC]">•</span>
                  <span>Entender sobre certificações de produtos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0072BC]">•</span>
                  <span>Aplicar produtos de forma segura e eficaz</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Importante - Certificações */}
        <section className="mb-12">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">▲ IMPORTANTE</h4>
                <p className="text-gray-700 mb-3">
                  Neste capítulo, apresentaremos inúmeras formas e produtos habitualmente utilizados nos processos 
                  de desinfecção, bem como suas composições.
                </p>
                <p className="text-gray-700 mb-3">
                  Geralmente os desinfetantes e equipamentos são registrados pela:
                </p>
                <ul className="space-y-2 text-gray-700 ml-4">
                  <li>• <strong>ANVISA</strong> - Agência Nacional de Vigilância Sanitária</li>
                  <li>• <strong>INMETRO</strong> - Instituto Nacional de Metrologia, Qualidade e Tecnologia</li>
                  <li>• <strong>ABNT</strong> - Associação Brasileira de Normas Técnicas</li>
                </ul>
                <p className="text-gray-700 mt-3">
                  O profissional antes de utilizar algum produto deve se certificar da existência de tal certificação 
                  por parte do fabricante, evitando assim a utilização de materiais que podem ser nocivos aos usuários.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Descontaminação da Água */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Descontaminação da Água</h2>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Droplet className="text-cyan-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Definição de Desinfecção</h3>
                <p className="text-gray-700">
                  <strong>Desinfecção:</strong> É a destruição ou inativação de microrganismos encontrados na água. 
                  Trata-se da utilização de produtos ou processos que inativam ou destroem estes organismos, deixando 
                  a água própria para o usuário.
                </p>
              </div>
            </div>
            
            <p className="text-gray-700 mt-4">
              A descontaminação é o processo mais importante no tratamento de piscinas. Sem uma desinfecção adequada, 
              a água se torna um meio propício para proliferação de bactérias, vírus e outros patógenos.
            </p>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg p-6">
            <div className="flex items-start gap-3">
              <Lightbulb className="text-yellow-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Lembre-se!</h4>
                <p className="text-gray-700">
                  Uma piscina sem o devido tratamento pode parecer limpa visualmente, mas estar repleta de 
                  microrganismos invisíveis que causam doenças.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Produtos Certificados */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Produtos Certificados</h2>
          
          <p className="text-gray-700 mb-6">
            Todos os produtos químicos devem possuir em seus rótulos instruções sobre:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-green-800 font-medium">✓ Armazenamento</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-green-800 font-medium">✓ Descarte</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-green-800 font-medium">✓ Concentração do produto</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-green-800 font-medium">✓ Método de utilização</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-green-800 font-medium">✓ Frequência para o tratamento da água</p>
            </div>
          </div>

          <p className="text-gray-700 mb-6">
            Quanto mais informações contidas nas embalagens, maior a segurança do profissional na utilização.
          </p>

          <div className="bg-orange-50 border-l-4 border-orange-500 rounded-r-lg p-6">
            <div className="flex items-start gap-3">
              <Shield className="text-orange-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">▲ RESPONSABILIDADE PROFISSIONAL</h4>
                <p className="text-gray-700 mb-3">
                  Tenha sempre em mente que você está lidando com a saúde de uma ou mais famílias, sendo de suma 
                  importância a utilização de produtos certificados e de boa procedência.
                </p>
                <p className="text-gray-700 mb-3">
                  Todas as instruções nas embalagens ou manuais devem ser seguidas pelos profissionais. Foram realizados 
                  uma infinidade de testes pelos fabricantes para que estas indicações estejam nas embalagens.
                </p>
                <div className="bg-white rounded-lg p-4 mt-4">
                  <p className="text-sm font-semibold text-orange-800 mb-2">⚠️ ATENÇÃO:</p>
                  <p className="text-sm text-gray-700">
                    Produtos similares podem ter indicações completamente diferentes entre fabricantes. Um pode indicar 
                    3 mg/l e outro 6 mg/l. Uma superdosagem pode ser prejudicial para o usuário ou danificar equipamentos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* O Cloro */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">O Cloro: Desinfetante Principal</h2>
          
          <p className="text-gray-700 mb-6">
            O desinfetante mais comum utilizado é o <strong>Cloro (ácido hipocloroso)</strong>, que possui entre suas funções:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <Zap className="mb-3" size={32} />
              <h3 className="text-xl font-semibold mb-2">Desinfecção</h3>
              <p className="text-blue-100">Elimina microrganismos patogênicos</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
              <TestTube className="mb-3" size={32} />
              <h3 className="text-xl font-semibold mb-2">Oxidação</h3>
              <p className="text-green-100">Decompõe contaminantes orgânicos</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-[#0072BC] to-[#005a9e] px-6 py-4">
              <h3 className="text-lg font-semibold text-white">Por que o Cloro é o Mais Usado?</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Vantagem</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Descrição</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr><td className="px-6 py-4 text-sm font-medium">Disponibilidade</td><td className="px-6 py-4 text-sm">Facilmente encontrado no mercado</td></tr>
                  <tr className="bg-gray-50"><td className="px-6 py-4 text-sm font-medium">Eficiência</td><td className="px-6 py-4 text-sm">Excelente oxidante e desinfetante</td></tr>
                  <tr><td className="px-6 py-4 text-sm font-medium">Residual</td><td className="px-6 py-4 text-sm">Permanece ativo por longos períodos</td></tr>
                  <tr className="bg-gray-50"><td className="px-6 py-4 text-sm font-medium">Custo</td><td className="px-6 py-4 text-sm">Preço acessível comparado a alternativas</td></tr>
                  <tr><td className="px-6 py-4 text-sm font-medium">Desinfecção Contínua</td><td className="px-6 py-4 text-sm">Protege a água continuamente</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
            <p className="text-sm font-semibold text-cyan-900 mb-2">💡 Definição Importante:</p>
            <p className="text-sm text-gray-700">
              <strong>Residual:</strong> É a quantidade de desinfetante que permanece ativo na água após a desinfecção 
              inicial, continuando a proteger contra novos contaminantes.
            </p>
          </div>
        </section>

        {/* Como o Cloro Funciona */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Como o Cloro Funciona</h2>
          
          <p className="text-gray-700 mb-6">Quando adicionado na água da piscina ou spa, o cloro gera:</p>

          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 mb-6 border-2 border-blue-200">
            <p className="text-center text-xl font-semibold text-gray-900 mb-6">
              Cloro + Água = Ácido Hipocloroso + Subprodutos
            </p>
            
            <h3 className="font-semibold text-gray-900 mb-4">Componentes Gerados:</h3>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4">
                <p className="font-semibold text-blue-700">1. Ácido Hipocloroso</p>
                <p className="text-sm text-gray-600">Principal agente desinfetante</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="font-semibold text-blue-700">2. Íon Hipoclorito</p>
                <p className="text-sm text-gray-600">Também desinfeta (menos eficaz)</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="font-semibold text-blue-700">3. Íon de Hidrogênio</p>
                <p className="text-sm text-gray-600">Afeta o pH</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold text-[#0072BC] mb-3">📊 Cloro Livre (CL)</h3>
            <p className="text-gray-700">
              É a soma do <strong>ácido hipocloroso + íon hipoclorito</strong>. É o cloro disponível na água para 
              desinfecção. Este é o valor que medimos nos testes.
            </p>
          </div>

          {/* Cloraminas */}
          <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">▲ Cloraminas - O Vilão do Cheiro</h4>
                <p className="text-gray-700 mb-3">
                  As cloraminas são formadas quando o cloro reage com contaminantes orgânicos (suor, urina, cosméticos). 
                  Elas causam:
                </p>
                <ul className="space-y-2 text-gray-700 ml-4 mb-4">
                  <li>• Odor forte de "cloro" (na verdade, é cheiro de cloramina!)</li>
                  <li>• Irritação nos olhos</li>
                  <li>• Irritação na pele e mucosas</li>
                </ul>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm font-semibold text-red-800 mb-2">💭 Curiosidade:</p>
                  <p className="text-sm text-gray-700">
                    Quando dizemos "a piscina está com muito cheiro de cloro", na verdade o problema é <strong>FALTA 
                    de cloro livre</strong>, que permite a formação de cloraminas!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tipos de Cloro */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Tipos de Cloro</h2>
          
          <p className="text-gray-700 mb-6">
            Os liberadores de ácido hipocloroso podem ser divididos em duas categorias:
          </p>

          {/* Cloros Não Estabilizados */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Cloros Não Estabilizados (Inorgânicos)</h3>
            
            <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
              <p className="text-sm font-semibold text-blue-900 mb-2">Definição:</p>
              <p className="text-sm text-gray-700">
                <strong>Cloro Não Estabilizado:</strong> Não contém ácido cianúrico. Ação rápida, mas se degrada 
                facilmente com sol. Ideal para tratamentos de choque.
              </p>
            </div>

            <p className="font-semibold text-gray-900 mb-3">Exemplos:</p>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-900">Hipoclorito de Sódio (cloro líquido)</p>
                <p className="text-sm text-gray-600">10-13% de cloro</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-900">Hipoclorito de Cálcio (pó/granulado)</p>
                <p className="text-sm text-gray-600">65-75% de cloro</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-900">Hipoclorito de Lítio (pó)</p>
                <p className="text-sm text-gray-600">35% de cloro</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-900">Gás Cloro (industrial)</p>
                <p className="text-sm text-gray-600">100% de cloro</p>
              </div>
            </div>
          </div>

          {/* Cloros Estabilizados */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Cloros Estabilizados (Orgânicos)</h3>
            
            <div className="bg-green-50 rounded-lg p-4 mb-4 border border-green-200">
              <p className="text-sm font-semibold text-green-900 mb-2">Definição:</p>
              <p className="text-sm text-gray-700">
                <strong>Cloro Estabilizado:</strong> Contém ácido cianúrico que protege o cloro da degradação solar. 
                Ação mais lenta, mas duradoura. Ideal para manutenção diária.
              </p>
            </div>

            <p className="font-semibold text-gray-900 mb-3">Exemplos:</p>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-900">Tricloro (tabletes)</p>
                <p className="text-sm text-gray-600">90% de cloro, pH ácido</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-900">Dicloro (granulado)</p>
                <p className="text-sm text-gray-600">56-62% de cloro, pH neutro</p>
              </div>
            </div>
          </div>

          {/* Como Escolher */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-200">
            <h3 className="text-lg font-semibold text-orange-900 mb-4">🎯 Como Escolher?</h3>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-1">Manutenção Diária:</p>
                <p className="text-sm text-gray-700">Use cloro estabilizado (tricloro/dicloro)</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-1">Tratamento de Choque:</p>
                <p className="text-sm text-gray-700">Prefira cloro não estabilizado (hipoclorito de cálcio)</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-1">Piscinas Cobertas:</p>
                <p className="text-sm text-gray-700">Prefira cloro não estabilizado (menos raios UV)</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-1">Piscinas Externas:</p>
                <p className="text-sm text-gray-700">Use cloro estabilizado (proteção contra sol)</p>
              </div>
            </div>
          </div>
        </section>

        {/* Níveis Ideais de Cloro */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Níveis Ideais de Cloro Livre</h2>
          
          <p className="text-gray-700 mb-6">
            Existem diversas normas e leis que estabelecem os níveis de concentração de cloro livre na água:
          </p>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 px-6 py-4">
              <h3 className="text-lg font-semibold text-white">Normas e Legislações Brasileiras</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Norma/Legislação</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Faixa de Cloro Livre (mg/L ou PPM)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr><td className="px-6 py-4 text-sm">ABNT NBR 10818:2016</td><td className="px-6 py-4 text-sm font-semibold text-cyan-600">0,8 a 3,0 mg/L</td></tr>
                  <tr className="bg-gray-50"><td className="px-6 py-4 text-sm">Decreto 13.166/79 SP</td><td className="px-6 py-4 text-sm font-semibold text-cyan-600">0,5 a 0,8 mg/L</td></tr>
                  <tr><td className="px-6 py-4 text-sm">Lei 1.899 RJ (1991)</td><td className="px-6 py-4 text-sm font-semibold text-cyan-600">0,8 a 3,0 mg/L</td></tr>
                  <tr className="bg-gray-50"><td className="px-6 py-4 text-sm">Resolução DVS 0013 SC</td><td className="px-6 py-4 text-sm font-semibold text-cyan-600">0,8 a 3,0 mg/L</td></tr>
                  <tr><td className="px-6 py-4 text-sm">Literaturas Internacionais</td><td className="px-6 py-4 text-sm font-semibold text-cyan-600">1,0 a 4,0 mg/L</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">▲ ATENÇÃO PROFISSIONAL</h4>
                <p className="text-gray-700">
                  O profissional deve estar atento aos regulamentos de seu estado/município, bem como o indicado pelo 
                  fabricante do produto impresso em suas embalagens ou manual.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">☐ Recomendação Geral</h4>
                <p className="text-gray-700">
                  Para a maioria das situações, mantenha o cloro livre entre <strong>1,0 e 3,0 PPM</strong>. Este é um 
                  nível seguro, eficaz e aceito pela maioria das normas.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Fatores que Afetam a Desinfecção */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Fatores que Afetam a Desinfecção</h2>
          
          <p className="text-gray-700 mb-6">Ao escolher o desinfetante, considere:</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[
              { icon: ThermometerSun, title: 'Temperatura da água', desc: 'Águas mais quentes exigem mais cloro' },
              { icon: Shield, title: 'Quantidade de usuários', desc: 'Mais banhistas = mais contaminação' },
              { icon: Zap, title: 'Exposição solar', desc: 'Sol degrada cloro não estabilizado' },
              { icon: TestTube, title: 'pH da água', desc: 'pH incorreto reduz eficácia do cloro' },
              { icon: Droplet, title: 'Carga orgânica', desc: 'Sujeira, folhas, insetos consomem cloro' },
              { icon: Shield, title: 'Armazenamento', desc: 'Local adequado preserva o produto' },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="text-[#0072BC]" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Exemplo Prático */}
          <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
            <h4 className="font-semibold text-gray-900 mb-3">📝 Exemplo Prático</h4>
            <div className="space-y-3 text-gray-700">
              <p><strong>Situação:</strong> Piscina em dia de festa com 20 banhistas, temperatura de 28°C, sol forte.</p>
              <p><strong>Ação:</strong></p>
              <ol className="space-y-2 ml-6 list-decimal">
                <li>Aumentar a dosagem de cloro antes da festa</li>
                <li>Usar cloro estabilizado (proteção contra sol)</li>
                <li>Verificar pH (deve estar em 7,2-7,6)</li>
                <li>Monitorar cloro durante o evento</li>
                <li>Fazer tratamento de choque após a festa</li>
              </ol>
            </div>
          </div>
        </section>

        {/* Testes de Água */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Testes de Água</h2>
          
          <p className="text-gray-700 mb-6">
            O teste regular da água é essencial para garantir sua qualidade e segurança.
          </p>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
              <h3 className="text-lg font-semibold text-white">O Que Testar?</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Parâmetro</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Frequência Mínima</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ideal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr><td className="px-6 py-4 text-sm font-medium">Cloro Livre</td><td className="px-6 py-4 text-sm">Diária</td><td className="px-6 py-4 text-sm font-semibold text-purple-600">1,0 - 3,0 PPM</td></tr>
                  <tr className="bg-gray-50"><td className="px-6 py-4 text-sm font-medium">pH</td><td className="px-6 py-4 text-sm">Diária</td><td className="px-6 py-4 text-sm font-semibold text-purple-600">7,2 - 7,6</td></tr>
                  <tr><td className="px-6 py-4 text-sm font-medium">Alcalinidade</td><td className="px-6 py-4 text-sm">Semanal</td><td className="px-6 py-4 text-sm font-semibold text-purple-600">80 - 120 PPM</td></tr>
                  <tr className="bg-gray-50"><td className="px-6 py-4 text-sm font-medium">Dureza Cálcica</td><td className="px-6 py-4 text-sm">Mensal</td><td className="px-6 py-4 text-sm font-semibold text-purple-600">200 - 400 PPM</td></tr>
                  <tr><td className="px-6 py-4 text-sm font-medium">Ácido Cianúrico</td><td className="px-6 py-4 text-sm">Mensal</td><td className="px-6 py-4 text-sm font-semibold text-purple-600">30 - 50 PPM</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-6">
            <div className="flex items-start gap-3">
              <Lightbulb className="text-blue-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">💡 Dica Profissional</h4>
                <p className="text-gray-700">
                  Teste sempre no mesmo horário para resultados consistentes. O melhor momento é pela manhã, antes do 
                  uso da piscina.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* pH - O Equilíbrio da Água */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">pH - O Equilíbrio da Água</h2>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold text-[#0072BC] mb-3">O que é pH?</h3>
            <p className="text-gray-700 mb-4">
              <strong>pH:</strong> Significa "potencial de Hidrogênio". É uma escala de 0 a 14 que mede se a água é 
              ácida, neutra ou alcalina (básica).
            </p>

            <div className="bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 to-blue-500 h-12 rounded-lg mb-4 flex items-center justify-center text-white font-bold text-lg">
              <span className="bg-black/30 px-4 py-1 rounded">IDEAL: 7,2 - 7,6</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Valor</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Classificação</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Efeito</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr><td className="px-6 py-4 text-sm font-medium">0 - 6,9</td><td className="px-6 py-4 text-sm">Ácida</td><td className="px-6 py-4 text-sm">Corrói equipamentos, irrita pele</td></tr>
                  <tr className="bg-gray-50"><td className="px-6 py-4 text-sm font-medium">7,0</td><td className="px-6 py-4 text-sm">Neutra</td><td className="px-6 py-4 text-sm">Água pura</td></tr>
                  <tr><td className="px-6 py-4 text-sm font-medium">7,1 - 14</td><td className="px-6 py-4 text-sm">Alcalina</td><td className="px-6 py-4 text-sm">Forma incrustações, água turva</td></tr>
                  <tr className="bg-green-50"><td className="px-6 py-4 text-sm font-medium">7,2 - 7,6</td><td className="px-6 py-4 text-sm font-semibold text-green-700">IDEAL</td><td className="px-6 py-4 text-sm font-semibold text-green-700">Zona de conforto e eficiência</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-4">Por que pH é Tão Importante?</h3>
          <div className="space-y-3 mb-6">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-green-800">✓ Afeta a eficácia do cloro (pH alto = cloro menos eficaz)</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-green-800">✓ Influencia no conforto dos banhistas</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-green-800">✓ Protege equipamentos contra corrosão ou incrustações</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-green-800">✓ Previne irritação nos olhos e pele</p>
            </div>
          </div>

          <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">▲ ATENÇÃO:</h4>
                <p className="text-gray-700">
                  Com pH de 8,0, o cloro perde até <strong>80% da sua eficácia</strong>! Mantenha sempre entre 7,2 e 7,6.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Armazenamento de Produtos */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Armazenamento de Produtos</h2>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Regras de Ouro para Armazenamento:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-green-800">✓ Local seco, fresco e ventilado</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-green-800">✓ Longe da luz solar direta</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-green-800">✓ Produtos separados (nunca misture!)</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-green-800">✓ Embalagens bem fechadas</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-green-800">✓ Fora do alcance de crianças e animais</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-green-800">✓ Identificação clara dos produtos</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-green-800">✓ Longe de materiais inflamáveis</p>
            </div>
          </div>

          <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">⛔ NUNCA FAÇA ISSO:</h4>
                <ul className="space-y-2 text-gray-700 ml-4">
                  <li>• Misturar diferentes produtos químicos</li>
                  <li>• Armazenar em local úmido</li>
                  <li>• Usar embalagens sem rótulo</li>
                  <li>• Deixar produtos expostos ao sol</li>
                  <li>• Armazenar próximo a alimentos</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Resumo */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Resumo do Capítulo 3</h2>
          
          <div className="bg-gradient-to-br from-[#0072BC] to-[#005a9e] rounded-xl p-8 text-white mb-6">
            <h3 className="text-xl font-semibold mb-6">Parabéns! Você completou o Capítulo 3!</h3>
            
            <div className="bg-white rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tema</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Pontos-Chave</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr><td className="px-6 py-4 text-sm font-medium text-gray-900">Desinfecção</td><td className="px-6 py-4 text-sm text-gray-700">Processo de eliminar microrganismos da água</td></tr>
                  <tr className="bg-gray-50"><td className="px-6 py-4 text-sm font-medium text-gray-900">Cloro</td><td className="px-6 py-4 text-sm text-gray-700">Principal desinfetante, eficaz e com residual</td></tr>
                  <tr><td className="px-6 py-4 text-sm font-medium text-gray-900">Tipos de Cloro</td><td className="px-6 py-4 text-sm text-gray-700">Estabilizado (manutenção) e Não Estabilizado (choque)</td></tr>
                  <tr className="bg-gray-50"><td className="px-6 py-4 text-sm font-medium text-gray-900">Cloro Livre</td><td className="px-6 py-4 text-sm text-gray-700">Ideal: 1,0 - 3,0 PPM</td></tr>
                  <tr><td className="px-6 py-4 text-sm font-medium text-gray-900">pH</td><td className="px-6 py-4 text-sm text-gray-700">Ideal: 7,2 - 7,6 para máxima eficácia</td></tr>
                  <tr className="bg-gray-50"><td className="px-6 py-4 text-sm font-medium text-gray-900">Certificação</td><td className="px-6 py-4 text-sm text-gray-700">Use sempre produtos certificados (ANVISA, INMETRO, ABNT)</td></tr>
                  <tr><td className="px-6 py-4 text-sm font-medium text-gray-900">Testes</td><td className="px-6 py-4 text-sm text-gray-700">Diários para cloro e pH</td></tr>
                  <tr className="bg-gray-50"><td className="px-6 py-4 text-sm font-medium text-gray-900">Armazenamento</td><td className="px-6 py-4 text-sm text-gray-700">Local seco, ventilado, produtos separados</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Lições Principais</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>✓ Produtos certificados garantem segurança</li>
                  <li>✓ Cloro é eficaz quando pH está correto</li>
                  <li>✓ Testes regulares previnem problemas</li>
                  <li>✓ Armazenamento correto preserva os produtos</li>
                  <li>✓ Siga sempre as instruções do fabricante</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Próximo Capítulo */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-[#FF6B00] to-[#e55d00] rounded-xl p-8 text-white text-center">
            <h3 className="text-2xl font-semibold mb-4">Preparado para o Próximo Capítulo?</h3>
            <p className="text-lg mb-6">
              No Capítulo 4, vamos aprender sobre <strong>Produtos Químicos para Tratamento</strong> – 
              algicidas, clarificantes, floculantes e muito mais!
            </p>
            <button
              onClick={() => navigate('/dashboard/chapter/4')}
              className="bg-white text-[#FF6B00] px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all inline-flex items-center gap-2"
            >
              Ir para Módulo 4
              <ArrowRight size={20} />
            </button>
          </div>
        </section>

        {/* Página Final */}
        <section className="mb-8">
          <div className="bg-gradient-to-br from-[#0072BC] to-[#005a9e] rounded-xl p-8 text-white text-center">
            <Shield className="mx-auto mb-4" size={64} />
            <h3 className="text-2xl font-semibold mb-4">Parabéns por Completar o Módulo 3!</h3>
            
            <p className="text-lg text-blue-100 mb-6">
              Você dominou os fundamentos da desinfecção e está pronto para garantir piscinas seguras e cristalinas!
            </p>

            <div className="bg-white/10 rounded-lg p-6 text-left">
              <h4 className="font-semibold mb-3">Contato ANAPP</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Site:</strong> www.anapp.org.br</p>
                <p><strong>Curso Online:</strong> www.ctpanapp.online</p>
                <p><strong>E-mail:</strong> contato@anapp.org.br</p>
              </div>
            </div>

            <p className="text-sm text-blue-100 mt-6">
              © 2025 ANAPP - Associação Nacional das Empresas e Profissionais de Piscinas
            </p>
            <p className="text-xs text-blue-200 mt-2">
              Material Didático - CTP 3.0 - Versão para Estudo
            </p>
          </div>
        </section>

      </div>

      <Footer user={user} />
    </div>
  );
}

export default ApostilaModulo3;
