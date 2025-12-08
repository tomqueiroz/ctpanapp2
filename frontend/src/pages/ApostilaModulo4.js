import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoggedInHeader from '../components/LoggedInHeader';
import Footer from '../components/Footer';
import { Download, BookOpen, CheckCircle2, AlertTriangle, Lightbulb, Scale, TrendingUp, TrendingDown, ArrowRight, Droplets, Beaker } from 'lucide-react';
import { generateApostilaPDF } from '../utils/pdfGenerator';

function ApostilaModulo4({ user = { name: 'Aluno' } }) {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    
    const result = await generateApostilaPDF('apostila-content', 4, 'Equilibrio-Quimico');
    
    if (!result.success) {
      alert(`Erro ao gerar PDF: ${result.error}`);
    }
    
    setDownloading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LoggedInHeader user={user} />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#0072BC] to-[#005a9e] text-white pt-24 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Scale size={40} />
            <div>
              <p className="text-sm font-light text-blue-100">Apostila Completa</p>
              <h1 className="text-3xl md:text-4xl font-light">Módulo 4 - Equilíbrio Químico da Água</h1>
            </div>
          </div>
          <p className="text-lg text-blue-100 font-light mb-6">
            Alcalinidade, pH e Dureza - O Triângulo do Equilíbrio
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
                  <span>Compreender o conceito de equilíbrio químico</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0072BC]">•</span>
                  <span>Dominar os três parâmetros principais: Alcalinidade, pH e Dureza</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0072BC]">•</span>
                  <span>Saber ajustar cada parâmetro corretamente</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0072BC]">•</span>
                  <span>Entender o Índice de Saturação de Langelier</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0072BC]">•</span>
                  <span>Proteger equipamentos e garantir conforto aos usuários</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Por Que o Equilíbrio é Importante */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Por Que o Equilíbrio é Importante?</h2>
          
          <p className="text-gray-700 mb-6">
            Ter uma água de piscina/spa quimicamente equilibrada traz vários benefícios:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-green-800">✓ Auxilia no processo de desinfecção</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-green-800">✓ Propicia bom desempenho dos agentes sanitizantes</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-green-800">✓ Protege equipamentos contra corrosão e incrustações</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-green-800">✓ Evita agressões ao revestimento (azulejos, pastilhas)</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-green-800">✓ Prolonga vida útil da piscina e equipamentos</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-green-800">✓ Garante conforto aos banhistas</p>
            </div>
          </div>

          <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">▲ ATENÇÃO PROFISSIONAL</h4>
                <p className="text-gray-700">
                  A ausência ou baixa concentração de materiais dissolvidos podem causar o aparecimento de compostos 
                  decorrentes do desequilíbrio da água, que acarretam agressões tanto sobre a argamassa quanto nos 
                  componentes das bombas.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* O Triângulo do Equilíbrio */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">O Triângulo do Equilíbrio</h2>
          
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-8 mb-6 border-2 border-blue-200">
            <h3 className="text-xl font-semibold text-center text-gray-900 mb-6">
              Equilíbrio Químico da Água é Possível
            </h3>
            
            <div className="flex justify-center mb-6">
              <div className="relative w-64 h-64">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold text-center">
                    pH<br/>7,2 - 7,8
                  </div>
                </div>
                <div className="absolute bottom-0 left-0">
                  <div className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold text-center text-sm">
                    ALCALINIDADE<br/>80 - 120 PPM
                  </div>
                </div>
                <div className="absolute bottom-0 right-0">
                  <div className="bg-purple-500 text-white px-6 py-3 rounded-lg font-semibold text-center text-sm">
                    DUREZA CÁLCICA<br/>200 - 400 PPM
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Para ajustar o equilíbrio da água da piscina, deve-se realizar 3 testes na sequência abaixo:
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                  1º
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Alcalinidade Total</p>
                  <p className="text-sm text-gray-600">80 a 120 PPM</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                  2º
                </div>
                <div>
                  <p className="font-semibold text-gray-900">pH</p>
                  <p className="text-sm text-gray-600">7,2 a 7,8</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                  3º
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Dureza de Cálcio</p>
                  <p className="text-sm text-gray-600">200 a 400 PPM</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border-l-4 border-orange-500 rounded-r-lg p-6 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-orange-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">ORDEM CORRETA É FUNDAMENTAL!</h4>
                <p className="text-gray-700 mb-2">
                  Sempre ajuste na ordem: <strong>1º Alcalinidade → 2º pH → 3º Dureza</strong>
                </p>
                <p className="text-gray-700">
                  <strong>Por quê?</strong> Porque a alcalinidade afeta o pH, e ambos afetam a dureza. Se você ajustar 
                  fora de ordem, terá que refazer tudo!
                </p>
              </div>
            </div>
          </div>

          <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
            <p className="text-sm font-semibold text-cyan-900 mb-2">💡 Definição Importante:</p>
            <p className="text-sm text-gray-700">
              <strong>Equilíbrio Químico:</strong> É quando os três parâmetros principais (alcalinidade, pH e dureza) 
              estão nas faixas ideais, trabalhando em harmonia para manter a água saudável e proteger a estrutura.
            </p>
          </div>
        </section>

        {/* 1. Alcalinidade Total */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">1. Alcalinidade Total</h2>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Droplets className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Definição</h3>
                <p className="text-gray-700">
                  <strong>Alcalinidade Total:</strong> É uma medida que demonstra a capacidade da água em resistir às 
                  alterações nos níveis de pH. Funciona como um "amortecedor" ou "tampão" que protege o pH de variar bruscamente.
                </p>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-4">Por Que é Tão Importante?</h3>
          <p className="text-gray-700 mb-4">
            A alcalinidade é um auxiliar na manutenção do pH. Por este motivo deve ser a <strong>primeira a ser medida e ajustada</strong>.
          </p>

          <p className="text-gray-700 mb-4">Sem a correta alcalinidade total:</p>
          <div className="space-y-3 mb-6">
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <p className="text-red-800">• O pH sofre alterações facilmente</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <p className="text-red-800">• Mesmo mínimas adições de produtos alteram tudo</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <p className="text-red-800">• Balanceamento fica comprometido e difícil de corrigir</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <p className="text-red-800">• Cloro perde capacidade de inativar bactérias</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <p className="text-red-800">• Aparecem manchas na piscina</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <p className="text-red-800">• Irritação na pele dos usuários</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <p className="text-red-800">• Corrosão de equipamentos</p>
            </div>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-6 mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">Faixa Ideal: 80 a 120 PPM (mg/L)</h4>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-6">
            <div className="flex items-start gap-3">
              <Lightbulb className="text-blue-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">☐ Dica de Ajuste</h4>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>Hipocloritos:</strong> Operam melhor próximo de 80 PPM (possuem pH alto)</li>
                  <li><strong>Bromo, Tricloro, Cloro Gás:</strong> Operam melhor próximo de 120 PPM (possuem pH baixo)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Ajustes de Alcalinidade */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Ajustes de Alcalinidade Total</h2>
          
          {/* Alcalinidade ALTA */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="text-red-600" size={32} />
              <h3 className="text-xl font-semibold text-red-600">Alcalinidade ALTA (acima de 120 PPM)</h3>
            </div>
            
            <h4 className="font-semibold text-gray-900 mb-3">Sintomas:</h4>
            <ul className="space-y-2 mb-4 text-gray-700 ml-4">
              <li>• pH também está alto</li>
              <li>• Água turva</li>
              <li>• Extremamente difícil alterar parâmetros</li>
            </ul>

            <h4 className="font-semibold text-gray-900 mb-3">Solução - Para DIMINUIR a alcalinidade:</h4>
            
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="font-semibold text-blue-900 mb-2">Opção 1: Ácido Muriático (líquido)</p>
                <p className="text-sm text-gray-700">Adicionar <strong>5 a 6 mL</strong> para cada 1m³ (1.000 litros)</p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="font-semibold text-blue-900 mb-2">Opção 2: Bissulfato de Sódio (granulado)</p>
                <p className="text-sm text-gray-700">Adicionar <strong>8g</strong> para cada 1m³ (1.000 litros)</p>
              </div>
            </div>
          </div>

          {/* Alcalinidade BAIXA */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingDown className="text-orange-600" size={32} />
              <h3 className="text-xl font-semibold text-orange-600">Alcalinidade BAIXA (abaixo de 80 PPM)</h3>
            </div>
            
            <h4 className="font-semibold text-gray-900 mb-3">Sintomas:</h4>
            <ul className="space-y-2 mb-4 text-gray-700 ml-4">
              <li>• Corrosão de equipamentos</li>
              <li>• Ataque ao piso e paredes da piscina/spa</li>
              <li>• pH instável</li>
            </ul>

            <h4 className="font-semibold text-gray-900 mb-3">Solução - Para ELEVAR a alcalinidade:</h4>
            
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="font-semibold text-green-900 mb-2">Bicarbonato de Sódio</p>
              <p className="text-sm text-gray-700">
                <strong>670g para cada 40.000 litros</strong> promove elevação de aproximadamente 10 PPM
              </p>
            </div>
          </div>

          <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">▲ IMPORTANTE:</h4>
                <p className="text-gray-700">
                  O bicarbonato de sódio deve ser utilizado <strong>apenas para ajustar/elevar a alcalinidade total</strong>, 
                  e não se deve utilizá-lo unicamente para regular o nível de pH.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. pH */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">2. Potencial Hidrogeniônico - pH</h2>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Beaker className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Definição</h3>
                <p className="text-gray-700">
                  <strong>pH (Potencial Hidrogeniônico):</strong> É uma medida de concentração de íons de hidrogênio 
                  presentes na água. Indica se a água é ácida, neutra ou alcalina (básica).
                </p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-4">
              O pH é fundamental no equilíbrio da água da piscina/spa. A escala do pH divide-se basicamente em 3 setores:
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Valor</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Classificação</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Efeitos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr><td className="px-6 py-4 text-sm font-medium">&lt; 7,0</td><td className="px-6 py-4 text-sm">Água Ácida</td><td className="px-6 py-4 text-sm">Irritação nos olhos e mucosas<br/>Corrosão de equipamentos</td></tr>
                  <tr className="bg-green-50"><td className="px-6 py-4 text-sm font-medium">7,2 - 7,8</td><td className="px-6 py-4 text-sm font-semibold text-green-700">IDEAL</td><td className="px-6 py-4 text-sm font-semibold text-green-700">Faixa de segurança e conforto</td></tr>
                  <tr><td className="px-6 py-4 text-sm font-medium">&gt; 7,8</td><td className="px-6 py-4 text-sm">Água Alcalina (Básica)</td><td className="px-6 py-4 text-sm">Atrapalha eficiência dos produtos<br/>Irritação nos olhos<br/>Causa turbidez na água</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-6 mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">Faixa Ideal: 7,2 a 7,8</h4>
            <p className="text-sm text-gray-700">
              Para cada tipo de produto de tratamento de água, há uma indicação de faixa ideal de pH. O profissional 
              deve sempre consultar as instruções nos rótulos.
            </p>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fatores que Alteram o pH</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-gray-700">• Evaporação da água</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-gray-700">• Número de usuários na piscina</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-gray-700">• Aplicação de desinfetantes na água</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-gray-700">• Partículas aéreas que caem na piscina</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-gray-700">• Chuva</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-gray-700">• Temperatura</p>
            </div>
          </div>
        </section>

        {/* Ajustes de pH */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Ajustes de pH</h2>
          
          {/* pH ALTO */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="text-red-600" size={32} />
              <h3 className="text-xl font-semibold text-red-600">pH ALTO (acima de 7,8)</h3>
            </div>
            
            <h4 className="font-semibold text-gray-900 mb-3">Sintomas:</h4>
            <ul className="space-y-2 mb-4 text-gray-700 ml-4">
              <li>• Água turva e opaca</li>
              <li>• Cloro perde eficácia (até 80% com pH 8,0!)</li>
              <li>• Irritação nos olhos</li>
              <li>• Formação de incrustações</li>
            </ul>

            <h4 className="font-semibold text-gray-900 mb-3">Solução - Para REDUZIR o pH:</h4>
            
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="font-semibold text-blue-900 mb-2">Redutor de pH (Ácido)</p>
              <p className="text-sm text-gray-700 mb-1">Use ácido muriático ou bissulfato de sódio</p>
              <p className="text-sm text-gray-700"><strong>Dosagem:</strong> Conforme instruções do fabricante</p>
            </div>
          </div>

          {/* pH BAIXO */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingDown className="text-orange-600" size={32} />
              <h3 className="text-xl font-semibold text-orange-600">pH BAIXO (abaixo de 7,2)</h3>
            </div>
            
            <h4 className="font-semibold text-gray-900 mb-3">Sintomas:</h4>
            <ul className="space-y-2 mb-4 text-gray-700 ml-4">
              <li>• Água corrosiva</li>
              <li>• Danifica equipamentos metálicos</li>
              <li>• Irritação nos olhos e pele</li>
              <li>• Consome cloro rapidamente</li>
            </ul>

            <h4 className="font-semibold text-gray-900 mb-3">Solução - Para ELEVAR o pH:</h4>
            
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="font-semibold text-green-900 mb-2">Elevador de pH (Barrilha)</p>
              <p className="text-sm text-gray-700 mb-1">Use carbonato de sódio (barrilha)</p>
              <p className="text-sm text-gray-700"><strong>Dosagem:</strong> Conforme instruções do fabricante</p>
            </div>
          </div>

          <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">▲ NUNCA FAÇA ISSO:</h4>
                <ul className="space-y-2 text-gray-700 ml-4">
                  <li>• Adicionar ácido e base ao mesmo tempo</li>
                  <li>• Usar bicarbonato de sódio para elevar pH (ele eleva alcalinidade!)</li>
                  <li>• Fazer ajustes bruscos (sempre gradual)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-6">
            <div className="flex items-start gap-3">
              <Lightbulb className="text-blue-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">☐ Dica Profissional</h4>
                <p className="text-gray-700">
                  Faça ajustes pequenos, aguarde algumas horas e teste novamente. É melhor fazer vários ajustes pequenos 
                  do que um grande de uma vez!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Dureza de Cálcio */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">3. Dureza de Cálcio</h2>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Scale className="text-purple-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Definição</h3>
                <p className="text-gray-700">
                  <strong>Dureza de Cálcio:</strong> É a quantidade de cálcio dissolvido na água. O cálcio é um mineral 
                  importante para o equilíbrio químico.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border-l-4 border-purple-500 rounded-r-lg p-6 mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">Faixa Ideal: 200 a 400 PPM (mg/L)</h4>
          </div>

          {/* Dureza ALTA */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="text-red-600" size={32} />
              <h3 className="text-xl font-semibold text-red-600">Dureza ALTA (acima de 400 PPM)</h3>
            </div>
            
            <h4 className="font-semibold text-gray-900 mb-3">Sintomas:</h4>
            <ul className="space-y-2 mb-4 text-gray-700 ml-4">
              <li>• Água turva e esbranquiçada</li>
              <li>• Formação de incrustações (manchas brancas)</li>
              <li>• Entupimento de filtros</li>
              <li>• Depósitos nas bordas e azulejos</li>
              <li>• Sensação áspera ao toque</li>
            </ul>

            <h4 className="font-semibold text-gray-900 mb-3">Solução - Para REDUZIR dureza:</h4>
            
            <div className="space-y-3">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="font-semibold text-blue-900">1. Diluição (mais prático)</p>
                <p className="text-sm text-gray-700">Descartar parte da água e completar com água nova</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="font-semibold text-blue-900">2. Produtos sequestrantes de metais</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="font-semibold text-blue-900">3. Ajustar pH</p>
                <p className="text-sm text-gray-700">Para evitar precipitação do cálcio</p>
              </div>
            </div>
          </div>

          {/* Dureza BAIXA */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingDown className="text-orange-600" size={32} />
              <h3 className="text-xl font-semibold text-orange-600">Dureza BAIXA (abaixo de 200 PPM)</h3>
            </div>
            
            <h4 className="font-semibold text-gray-900 mb-3">Sintomas:</h4>
            <ul className="space-y-2 mb-4 text-gray-700 ml-4">
              <li>• Água corrosiva</li>
              <li>• Ataca revestimentos de mármore e pedras</li>
              <li>• Dissolve argamassa</li>
              <li>• Corrói equipamentos metálicos</li>
            </ul>

            <h4 className="font-semibold text-gray-900 mb-3">Solução - Para ELEVAR dureza:</h4>
            
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="font-semibold text-green-900 mb-2">Cloreto de Cálcio</p>
              <p className="text-sm text-gray-700 mb-1">Adicionar cloreto de cálcio conforme instruções do fabricante</p>
              <p className="text-sm text-gray-700"><strong>Importante:</strong> Dissolva completamente antes de adicionar à piscina</p>
            </div>
          </div>
        </section>

        {/* Índice de Saturação de Langelier */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Índice de Saturação de Langelier (ISL)</h2>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">O que é o ISL?</h3>
            <p className="text-gray-700 mb-4">
              <strong>Índice de Saturação de Langelier (ISL):</strong> É um cálculo que indica se a água está em 
              equilíbrio, corrosiva ou incrustante. Considera alcalinidade, pH, dureza e temperatura.
            </p>
            <p className="text-gray-700">
              O ISL ajuda a prever o comportamento da água em relação ao cálcio:
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Valor ISL</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Condição</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Efeito</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="bg-red-50"><td className="px-6 py-4 text-sm font-medium">&lt; -0,3</td><td className="px-6 py-4 text-sm font-semibold text-red-700">Corrosiva</td><td className="px-6 py-4 text-sm">Dissolve cálcio, ataca revestimentos e equipamentos</td></tr>
                  <tr className="bg-green-50"><td className="px-6 py-4 text-sm font-medium">-0,3 a +0,3</td><td className="px-6 py-4 text-sm font-semibold text-green-700">EQUILIBRADA</td><td className="px-6 py-4 text-sm font-semibold text-green-700">Água balanceada, não corrói nem incrusta</td></tr>
                  <tr className="bg-orange-50"><td className="px-6 py-4 text-sm font-medium">&gt; +0,3</td><td className="px-6 py-4 text-sm font-semibold text-orange-700">Incrustante</td><td className="px-6 py-4 text-sm">Deposita cálcio, forma manchas brancas</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-6">
            <div className="flex items-start gap-3">
              <Lightbulb className="text-blue-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">☐ Como Usar o ISL</h4>
                <p className="text-gray-700 mb-2">
                  O ISL é calculado considerando todos os parâmetros juntos. Quando você mantém alcalinidade, pH e dureza 
                  nas faixas ideais, automaticamente o ISL fica equilibrado!
                </p>
                <p className="text-gray-700">
                  Existem calculadoras online e tabelas prontas para determinar o ISL.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Água Balanceada vs Desbalanceada */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Água Balanceada vs Desbalanceada</h2>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <h3 className="text-lg font-semibold text-white">Benefícios da Água Balanceada</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Aspecto</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Água Balanceada</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Água Desbalanceada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr><td className="px-6 py-4 text-sm font-medium">Aparência</td><td className="px-6 py-4 text-sm text-green-700">Cristalina e convidativa</td><td className="px-6 py-4 text-sm text-red-700">Turva, opaca ou esbranquiçada</td></tr>
                  <tr className="bg-gray-50"><td className="px-6 py-4 text-sm font-medium">Cloro</td><td className="px-6 py-4 text-sm text-green-700">Eficácia máxima</td><td className="px-6 py-4 text-sm text-red-700">Perde até 80% da eficácia</td></tr>
                  <tr><td className="px-6 py-4 text-sm font-medium">Equipamentos</td><td className="px-6 py-4 text-sm text-green-700">Protegidos e duráveis</td><td className="px-6 py-4 text-sm text-red-700">Corroídos ou incrustados</td></tr>
                  <tr className="bg-gray-50"><td className="px-6 py-4 text-sm font-medium">Revestimento</td><td className="px-6 py-4 text-sm text-green-700">Preservado</td><td className="px-6 py-4 text-sm text-red-700">Manchas, dissolução, rachaduras</td></tr>
                  <tr><td className="px-6 py-4 text-sm font-medium">Usuários</td><td className="px-6 py-4 text-sm text-green-700">Confortáveis</td><td className="px-6 py-4 text-sm text-red-700">Irritação nos olhos e pele</td></tr>
                  <tr className="bg-gray-50"><td className="px-6 py-4 text-sm font-medium">Manutenção</td><td className="px-6 py-4 text-sm text-green-700">Simples e previsível</td><td className="px-6 py-4 text-sm text-red-700">Problemática e cara</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-200">
            <h3 className="text-lg font-semibold text-orange-900 mb-3">💡 O Segredo do Sucesso</h3>
            <p className="text-gray-700 mb-2">
              Manter a água balanceada é <strong>muito mais fácil e barato</strong> do que corrigir problemas depois que aparecem!
            </p>
            <p className="text-gray-700">
              Teste regularmente e faça pequenos ajustes preventivos.
            </p>
          </div>
        </section>

        {/* Resumo */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Resumo do Capítulo 4</h2>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Parâmetro</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Faixa Ideal</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Como Elevar</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Como Reduzir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 font-medium">Alcalinidade Total</td>
                    <td className="px-6 py-4">80-120 PPM</td>
                    <td className="px-6 py-4">Bicarbonato de sódio<br/>670g/40.000L = +10 PPM</td>
                    <td className="px-6 py-4">Ácido muriático 5-6 mL/1.000L<br/>ou Bissulfato 8g/1.000L</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 font-medium">pH</td>
                    <td className="px-6 py-4">7,2-7,8</td>
                    <td className="px-6 py-4">Barrilha<br/>(Carbonato de sódio)</td>
                    <td className="px-6 py-4">Ácido muriático<br/>ou Bissulfato de sódio</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium">Dureza Cálcica</td>
                    <td className="px-6 py-4">200-400 PPM</td>
                    <td className="px-6 py-4">Cloreto de cálcio</td>
                    <td className="px-6 py-4">Diluição (trocar água)<br/>ou Sequestrantes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#0072BC] to-[#005a9e] rounded-xl p-8 text-white mb-6">
            <h3 className="text-xl font-semibold mb-4">Ordem de Ajuste (SEMPRE nesta sequência!)</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white text-[#0072BC] rounded-full flex items-center justify-center font-bold">1º</div>
                <p className="text-lg">Alcalinidade Total</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white text-[#0072BC] rounded-full flex items-center justify-center font-bold">2º</div>
                <p className="text-lg">pH</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white text-[#0072BC] rounded-full flex items-center justify-center font-bold">3º</div>
                <p className="text-lg">Dureza de Cálcio</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Pontos-Chave Para Lembrar</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-700">✓ Alcalinidade protege o pH (ajuste primeiro!)</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-700">✓ pH ideal = cloro eficaz</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-700">✓ Dureza protege estrutura e equipamentos</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-700">✓ ISL entre -0,3 e +0,3 = água equilibrada</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-700">✓ Testes regulares previnem problemas</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-700">✓ Ajustes graduais são mais seguros</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-700">✓ Água balanceada = economia e durabilidade</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Próximo Capítulo */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-[#FF6B00] to-[#e55d00] rounded-xl p-8 text-white text-center">
            <h3 className="text-2xl font-semibold mb-4">Preparado para o Próximo Capítulo?</h3>
            <p className="text-lg mb-6">
              No Capítulo 5, vamos aprender sobre <strong>Dosagem e Aplicação de Produtos</strong> – 
              como calcular e aplicar corretamente!
            </p>
            <button
              onClick={() => navigate('/dashboard/chapter/5')}
              className="bg-white text-[#FF6B00] px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all inline-flex items-center gap-2"
            >
              Ir para Módulo 5
              <ArrowRight size={20} />
            </button>
          </div>
        </section>

        {/* Página Final */}
        <section className="mb-8">
          <div className="bg-gradient-to-br from-[#0072BC] to-[#005a9e] rounded-xl p-8 text-white text-center">
            <Scale className="mx-auto mb-4" size={64} />
            <h3 className="text-2xl font-semibold mb-4">Parabéns por Completar o Módulo 4!</h3>
            
            <p className="text-lg text-blue-100 mb-6">
              Você dominou o equilíbrio químico e está pronto para manter piscinas perfeitamente balanceadas!
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

export default ApostilaModulo4;
