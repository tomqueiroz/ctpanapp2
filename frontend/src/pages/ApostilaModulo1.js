import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoggedInHeader from '../components/LoggedInHeader';
import Footer from '../components/Footer';
import { Download, BookOpen, CheckCircle2, AlertTriangle, Lightbulb, Calculator, ArrowRight } from 'lucide-react';

function ApostilaModulo1({ user = { name: 'Aluno' } }) {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    
    // Importar html2pdf dinamicamente
    const html2pdf = (await import('html2pdf.js')).default;
    
    const element = document.getElementById('apostila-content');
    const opt = {
      margin: 1,
      filename: 'Apostila-CTP-Modulo-1-Calculos.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
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
            <BookOpen size={40} />
            <div>
              <p className="text-sm font-light text-blue-100">Apostila Completa</p>
              <h1 className="text-3xl md:text-4xl font-light">Módulo 1 - Cálculos</h1>
            </div>
          </div>
          <p className="text-lg text-blue-100 font-light mb-6">
            Introdução aos Cálculos e Sistema de Medidas
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
                  <span>Entender o Sistema Internacional de Unidades (SI)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0072BC]">•</span>
                  <span>Fazer conversões entre diferentes unidades de medida</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0072BC]">•</span>
                  <span>Usar corretamente metros, litros e quilogramas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0072BC]">•</span>
                  <span>Aplicar estes conhecimentos no dia a dia do trabalho</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Introdução */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Por Que Entender as Medidas é Essencial?</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Olá, futuro especialista em águas cristalinas! Antes de mergulharmos no fantástico mundo das piscinas, 
            precisamos entender algo <strong>fundamental: as medidas!</strong>
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Você já parou para pensar por que alguns tratadores de piscina parecem ter "superpoderes" enquanto outros 
            vivem em apuros? O segredo não está apenas na experiência, mas em saber <strong>exatamente QUANTO</strong> de 
            cada produto usar. E para isso, é crucial dominar as unidades de medida!
          </p>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg p-6 my-6">
            <div className="flex items-start gap-3">
              <Lightbulb className="text-yellow-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">💭 Imagine esta Situação:</h4>
                <p className="text-gray-700">
                  Seu cliente pagou por uma piscina perfeita, não por um experimento químico que pode dar errado. 
                  Então, vamos transformar você em um verdadeiro "cientista das águas" – sem precisar usar jaleco branco!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sistema Internacional */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">O Sistema Internacional de Unidades (SI)</h2>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calculator className="text-[#0072BC]" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Definição</h3>
                <p className="text-gray-700">
                  <strong>Sistema Internacional de Unidades (SI):</strong> É como a "língua oficial" das medições em 
                  todo o mundo. Foi criado para acabar com a confusão entre diferentes sistemas de medida. Imagine se 
                  cada piscineiro usasse um sistema diferente!
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <Lightbulb className="text-green-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">💡 DICA IMPORTANTE:</h4>
                <p className="text-gray-700">
                  Pense no SI como o "idioma universal das piscinas". Se você dominar essa linguagem, poderá 
                  "conversar" com qualquer piscina do mundo!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Unidades Básicas */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">As Unidades Básicas que Você Vai Usar Diariamente</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Metro */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-[#0072BC]">m</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Metro (m)</h3>
              <p className="text-sm text-gray-600 mb-3">Para Medir Comprimentos</p>
              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                É a unidade básica para medir comprimento, largura, altura e profundidade. Um metro tem 100 centímetros.
              </p>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-700 mb-1">📏 Situação Real:</p>
                <p className="text-xs text-gray-600">
                  "Esta piscina tem 8 metros de comprimento por 4 metros de largura"
                </p>
              </div>
            </div>

            {/* Quilograma */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-green-600">kg</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Quilograma (kg)</h3>
              <p className="text-sm text-gray-600 mb-3">Para Medir a Massa dos Produtos</p>
              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                É a unidade básica para medir o peso (na verdade, a massa) de produtos químicos. Um quilograma tem 1.000 gramas.
              </p>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-700 mb-1">⚖️ Situação Real:</p>
                <p className="text-xs text-gray-600">
                  "Precisamos de 2 quilos de cloro para este tratamento de choque"
                </p>
              </div>
            </div>

            {/* Litro */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-cyan-600">L</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Litro (L)</h3>
              <p className="text-sm text-gray-600 mb-3">Para Medir Volumes de Líquidos</p>
              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                É a unidade para medir volume de líquidos. Um litro tem 1.000 mililitros. É também usado para saber quanto de água cabe na piscina.
              </p>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-700 mb-1">💧 Situação Real:</p>
                <p className="text-xs text-gray-600">
                  "Adicione 500 mililitros deste algicida na piscina"
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-6 mt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">⚠️ ATENÇÃO:</h4>
                <p className="text-gray-700">
                  Nunca confunda as unidades! Um erro comum é confundir mililitros com mililitros ou gramas com quilos. 
                  Um erro assim pode transformar um tratamento suave em um desastre químico!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Conversões */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Parte 1: Convertendo Unidades - A Matemática que Salva Vidas (e Piscinas!)
          </h2>
          
          <p className="text-gray-700 leading-relaxed mb-6">
            Agora que você conhece as unidades básicas, precisa aprender a <strong>converter</strong> entre elas. 
            Saber o volume da piscina é praticamente o "CPF" dela – sem isso, você está perdido! Vamos dominar essas conversões:
          </p>

          {/* Tabela de Conversões */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-[#0072BC] to-[#005a9e] px-6 py-4">
              <h3 className="text-lg font-semibold text-white">Tabela Resumo: Conversões Essenciais</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Para Converter</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Em</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Multiplique Por</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">Metros cúbicos (m³)</td>
                    <td className="px-6 py-4 text-sm text-gray-700">Litros (L)</td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#0072BC]">1.000</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">Litros (L)</td>
                    <td className="px-6 py-4 text-sm text-gray-700">Metros cúbicos (m³)</td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#0072BC]">0,001</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">Quilogramas (kg)</td>
                    <td className="px-6 py-4 text-sm text-gray-700">Gramas (g)</td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#0072BC]">1.000</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">Gramas (g)</td>
                    <td className="px-6 py-4 text-sm text-gray-700">Quilogramas (kg)</td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#0072BC]">0,001</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">Centímetros (cm)</td>
                    <td className="px-6 py-4 text-sm text-gray-700">Metros (m)</td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#0072BC]">0,01</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">Metros (m)</td>
                    <td className="px-6 py-4 text-sm text-gray-700">Centímetros (cm)</td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#0072BC]">100</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-6">
            <div className="flex items-start gap-3">
              <Lightbulb className="text-green-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">🔢 TRUQUE DO MESTRE:</h4>
                <p className="text-gray-700">
                  Quando vir "m³", multiplique por 1.000 para obter litros. É como transformar R$1 em centavos – multiplique por 100!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Exemplos Práticos */}
        <section className="mb-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Exemplos Práticos de Conversão</h3>
          
          <div className="space-y-6">
            {/* Exemplo 1 */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-3">📝 Exemplo Prático 1: Mililitro ↔ Litro</h4>
              <div className="space-y-2 text-gray-700">
                <p><strong>Situação:</strong> Após o teste, você avalia que precisa adicionar 1,5 litros de um determinado produto na água.</p>
                <p><strong>Conversão:</strong> Quantos mililitros são?</p>
                <p><strong>Cálculo:</strong> 1,5 litros × 1.000 = 1.500 mililitros</p>
                <p><strong>Resposta:</strong> Você vai adicionar 1.500 mL (ou 1,5 L)</p>
              </div>
            </div>

            {/* Exemplo 2 */}
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h4 className="font-semibold text-gray-900 mb-3">📝 Exemplo Prático 2: Grama ↔ Quilograma</h4>
              <div className="space-y-2 text-gray-700">
                <p><strong>Situação:</strong> Você precisa adicionar 250 gramas de um produto.</p>
                <p><strong>Conversão:</strong> Quanto é isso em quilos?</p>
                <p><strong>Cálculo:</strong> 250 gramas ÷ 1.000 = 0,25 kg (ou seja, ¼ de kg)</p>
                <p><strong>Pensando de outra forma:</strong> 1 kg ÷ 4 = 250 g</p>
              </div>
            </div>
          </div>
        </section>

        {/* Cálculo de Volume */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Parte 2: Calculando o Volume da Piscina - A Base de Tudo
          </h2>
          
          <p className="text-gray-700 leading-relaxed mb-6">
            Conhecer o volume da piscina é <strong>ESSENCIAL</strong>. Sem saber quanto de água tem na piscina, 
            você não consegue calcular quanto produto usar. É como tentar fazer um bolo sem saber o tamanho da forma!
          </p>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <Lightbulb className="text-yellow-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">💡 Por Que o Volume é Tão Importante?</h4>
                <p className="text-gray-700">
                  Todos os produtos químicos têm instruções do tipo: "Use X gramas para cada 1.000 litros de água". 
                  Se você não sabe quantos litros tem a piscina, não sabe quanto produto usar!
                </p>
              </div>
            </div>
          </div>

          {/* Piscina Retangular */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Piscina Retangular (A mais comum)</h3>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-4">Fórmulas:</p>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="font-mono text-sm text-[#0072BC]">
                    Área (m²) = Comprimento (m) × Largura (m)
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="font-mono text-sm text-[#0072BC]">
                    Volume (m³) = Comprimento (m) × Largura (m) × Profundidade Média (m)
                  </p>
                </div>
              </div>
            </div>

            {/* Exemplo Completo */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-3">📝 Exemplo Completo - Piscina Retangular:</h4>
              <div className="space-y-3 text-gray-700">
                <div>
                  <p className="font-semibold mb-2">Dados da piscina:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Comprimento: 8 metros</li>
                    <li>• Largura: 4 metros</li>
                    <li>• Profundidade: 1,4 metros (linha d'água)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold">Passo 1 - Calcular a área:</p>
                  <p className="font-mono text-sm bg-white rounded px-3 py-2 mt-1">
                    Área = 8m × 4m = 32 m² (metros quadrados)
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Passo 2 - Calcular o volume:</p>
                  <p className="font-mono text-sm bg-white rounded px-3 py-2 mt-1">
                    Volume = 8m × 4m × 1,4m = 44,8 m³ (metros cúbicos)
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Passo 3 - Converter para litros:</p>
                  <p className="font-mono text-sm bg-white rounded px-3 py-2 mt-1">
                    44,8 m³ × 1.000 = 44.800 litros
                  </p>
                </div>
                <div className="bg-green-100 rounded-lg p-3 border-2 border-green-400">
                  <p className="font-semibold text-green-800">
                    ✓ Resposta Final: Esta piscina tem 44.800 litros de água!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Piscina Circular */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Piscina Circular (Redonda) ou Spa</h3>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-4">Fórmulas:</p>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="font-mono text-sm text-[#0072BC]">
                    Raio = Diâmetro ÷ 2
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="font-mono text-sm text-[#0072BC]">
                    Área do Círculo (m²) = 3,14 × Raio × Raio
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="font-mono text-sm text-[#0072BC]">
                    Volume (m³) = Área × Profundidade
                  </p>
                </div>
              </div>
            </div>

            {/* Exemplo Circular */}
            <div className="bg-cyan-50 rounded-xl p-6 border border-cyan-200">
              <h4 className="font-semibold text-gray-900 mb-3">📝 Exemplo Completo - Piscina Circular:</h4>
              <div className="space-y-3 text-gray-700">
                <div>
                  <p className="font-semibold mb-2">Dados da piscina:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Diâmetro: 3 metros</li>
                    <li>• Profundidade: 1,5 metros</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold">Passo 1 - Calcular o raio:</p>
                  <p className="font-mono text-sm bg-white rounded px-3 py-2 mt-1">
                    Raio = 3m ÷ 2 = 1,5 metros
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Passo 2 - Calcular a área:</p>
                  <p className="font-mono text-sm bg-white rounded px-3 py-2 mt-1">
                    Área = 3,14 × 1,5 × 1,5 = 7,065 m²
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Passo 3 - Calcular o volume:</p>
                  <p className="font-mono text-sm bg-white rounded px-3 py-2 mt-1">
                    Volume = 7,065 × 1,5 = 10,60 m³
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Passo 4 - Converter para litros:</p>
                  <p className="font-mono text-sm bg-white rounded px-3 py-2 mt-1">
                    10,60 m³ × 1.000 = 10.600 litros
                  </p>
                </div>
                <div className="bg-green-100 rounded-lg p-3 border-2 border-green-400">
                  <p className="font-semibold text-green-800">
                    ✓ Resposta Final: Esta piscina circular tem 10.600 litros!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Profundidade Variável */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Piscinas com Profundidade Variável</h3>
            <p className="text-gray-700 mb-4">
              Muitas piscinas não têm o fundo plano. Elas são mais rasas em uma parte e mais fundas em outra.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-4">Fórmula:</p>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="font-mono text-sm text-[#0072BC]">
                  Profundidade Média = (Parte Rasa + Parte Funda) ÷ 2
                </p>
              </div>
            </div>

            <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
              <h4 className="font-semibold text-gray-900 mb-3">📝 Exemplo - Profundidade Variável:</h4>
              <div className="space-y-3 text-gray-700">
                <p><strong>Situação:</strong> Piscina com 1 metro na parte rasa e 2 metros na parte funda</p>
                <div>
                  <p className="font-semibold">Cálculo da profundidade média:</p>
                  <p className="font-mono text-sm bg-white rounded px-3 py-2 mt-1">
                    Profundidade Média = (1m + 2m) ÷ 2 = 1,5 metros
                  </p>
                </div>
                <div className="bg-blue-100 rounded-lg p-3 border-2 border-blue-400">
                  <p className="font-semibold text-blue-800">
                    💡 Agora use esta profundidade média na fórmula do volume!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Piscinas Irregulares */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Piscinas Irregulares ou com Múltiplos Níveis</h3>
            <p className="text-gray-700 mb-4">
              Para piscinas com formato irregular ou diferentes níveis, divida em seções simples, calcule cada uma separadamente e some os resultados.
            </p>

            <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
              <h4 className="font-semibold text-gray-900 mb-3">📝 Exemplo - Spa com 2 Profundidades:</h4>
              <div className="space-y-3 text-gray-700">
                <p><strong>Situação:</strong> Um spa com duas seções circulares:</p>
                <div>
                  <p className="font-semibold mb-2">Seção 1:</p>
                  <ul className="space-y-1 ml-4 mb-2">
                    <li>• Diâmetro: 3,00 metros (raio = 1,5m)</li>
                    <li>• Profundidade: 1 metro</li>
                  </ul>
                  <p className="font-mono text-sm bg-white rounded px-3 py-2">
                    Volume 1 = 3,14 × 1,5 × 1,5 × 1 = 7,065 m³
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-2">Seção 2:</p>
                  <ul className="space-y-1 ml-4 mb-2">
                    <li>• Diâmetro: 2,40 metros (raio = 1,2m)</li>
                    <li>• Profundidade: 0,5 metro</li>
                  </ul>
                  <p className="font-mono text-sm bg-white rounded px-3 py-2">
                    Volume 2 = 3,14 × 1,2 × 1,2 × 0,5 = 2,26 m³
                  </p>
                </div>
                <div className="bg-green-100 rounded-lg p-3 border-2 border-green-400">
                  <p className="font-semibold text-green-800">
                    ✓ Volume Total: 7,065 + 2,26 = 9,325 m³ (ou 9.325 litros)
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-6 mt-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="text-green-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">💡 MACETE PROFISSIONAL:</h4>
                  <p className="text-gray-700">
                    Tire fotos da piscina e desenhe sobre elas as divisões para facilitar seu cálculo. 
                    Seus clientes ficarão impressionados com sua precisão!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Parte 3: Reposição de Água */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Parte 3: Calculando Reposição de Água
          </h2>
          
          <p className="text-gray-700 leading-relaxed mb-6">
            Você já conhece agora os cálculos para determinar a área de sua piscina e seu volume ideal de água. 
            Agora veremos como você deve calcular e determinar a <strong>quantidade de água a ser adicionada</strong> caso 
            sua linha d'água esteja baixa.
          </p>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Quando o Nível da Água Está Baixo</h3>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-4">Fórmula:</p>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="font-mono text-sm text-[#0072BC]">
                  Volume a Repor = Área da Superfície (m²) × Diferença de Altura (m)
                </p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-3">📝 Exemplo - Reposição de Água:</h4>
              <div className="space-y-3 text-gray-700">
                <p><strong>Situação:</strong> Piscina de 8m × 4m (área = 32m²)</p>
                <ul className="space-y-1 ml-4">
                  <li>• Profundidade ideal: 1,40 metros</li>
                  <li>• Profundidade medida: 1,25 metros</li>
                  <li>• Diferença: 1,40 - 1,25 = 0,15 metros (ou 15 cm)</li>
                </ul>
                <div>
                  <p className="font-semibold">Conversão:</p>
                  <p className="font-mono text-sm bg-white rounded px-3 py-2 mt-1">
                    15 centímetros = 0,15 metros
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Cálculo do volume a repor:</p>
                  <p className="font-mono text-sm bg-white rounded px-3 py-2 mt-1">
                    Volume = 32m² × 0,15m = 4,8 m³
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Conversão para litros:</p>
                  <p className="font-mono text-sm bg-white rounded px-3 py-2 mt-1">
                    4,8 m³ × 1.000 = 4.800 litros a serem adicionados
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-6 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">⚠️ CONSELHO PROFISSIONAL:</h4>
                <p className="text-gray-700 mb-3">
                  Em dias muito quentes, uma piscina pode perder até 0,5cm por dia por evaporação. 
                  Evite repor água constantemente – isso altera o balanço químico!
                </p>
                <p className="text-gray-700 mb-2">
                  Se a piscina perde água constantemente de forma anormal, pode haver:
                </p>
                <ul className="space-y-1 ml-4 text-gray-700">
                  <li>• Vazamento em encanamentos</li>
                  <li>• Rachaduras na estrutura</li>
                  <li>• Uso excessivo de usuários</li>
                </ul>
                <p className="text-gray-700 mt-2">
                  <strong>Investigue antes de simplesmente adicionar mais água!</strong>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Exercícios Práticos */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Exercícios Práticos para Você Treinar</h2>
          <p className="text-gray-700 mb-6">
            Agora é hora de colocar a mão na massa (ou melhor, na calculadora)! Tente resolver estes problemas:
          </p>

          <div className="space-y-6">
            {/* Exercício 1 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-[#0072BC] mb-4">✏️ Exercício 1 - Conversão Simples:</h3>
              <p className="text-gray-700 mb-4">Converta as seguintes medidas:</p>
              <ol className="space-y-2 text-gray-700 ml-6 mb-6 list-decimal">
                <li>3,5 litros = _______ mililitros</li>
                <li>2.500 gramas = _______ quilogramas</li>
                <li>25 centímetros = _______ metros</li>
                <li>35 m³ = _______ litros</li>
              </ol>
              <details className="bg-gray-50 rounded-lg p-4">
                <summary className="font-semibold text-gray-900 cursor-pointer">Ver Respostas</summary>
                <div className="mt-3 space-y-2 text-gray-700">
                  <p>1. <strong>3.500 mL</strong> (multiplique por 1.000)</p>
                  <p>2. <strong>2,5 kg</strong> (divida por 1.000)</p>
                  <p>3. <strong>0,25 m</strong> (divida por 100)</p>
                  <p>4. <strong>35.000 litros</strong> (multiplique por 1.000)</p>
                </div>
              </details>
            </div>

            {/* Exercício 2 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-[#0072BC] mb-4">✏️ Exercício 2 - Volume de Piscina Retangular:</h3>
              <p className="text-gray-700 mb-4">Calcule o volume em litros de uma piscina com:</p>
              <ul className="space-y-1 ml-4 mb-4 text-gray-700">
                <li>• Comprimento: 10 metros</li>
                <li>• Largura: 5 metros</li>
                <li>• Profundidade: 1,5 metros</li>
              </ul>
              <details className="bg-gray-50 rounded-lg p-4">
                <summary className="font-semibold text-gray-900 cursor-pointer">Ver Resposta</summary>
                <div className="mt-3 text-gray-700">
                  <p className="font-mono">10 × 5 × 1,5 = 75 m³ = <strong>75.000 litros</strong></p>
                </div>
              </details>
            </div>

            {/* Exercício 3 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-[#0072BC] mb-4">✏️ Exercício 3 - Piscina Circular:</h3>
              <p className="text-gray-700 mb-4">Calcule o volume de uma piscina circular com:</p>
              <ul className="space-y-1 ml-4 mb-4 text-gray-700">
                <li>• Diâmetro: 4 metros</li>
                <li>• Profundidade: 1,2 metros</li>
              </ul>
              <details className="bg-gray-50 rounded-lg p-4">
                <summary className="font-semibold text-gray-900 cursor-pointer">Ver Resolução</summary>
                <div className="mt-3 space-y-2 text-gray-700">
                  <p>1. Raio = 4 ÷ 2 = <strong>2 metros</strong></p>
                  <p>2. Área = 3,14 × 2 × 2 = <strong>12,56 m²</strong></p>
                  <p>3. Volume = 12,56 × 1,2 = <strong>15,07 m³</strong></p>
                  <p>4. Em litros = <strong>15.070 litros</strong></p>
                </div>
              </details>
            </div>

            {/* Exercício 4 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-[#0072BC] mb-4">✏️ Exercício 4 - Reposição de Água:</h3>
              <p className="text-gray-700 mb-4">
                Uma piscina de 40 m² de área está com o nível 20 cm abaixo do ideal. 
                Quantos litros precisam ser adicionados?
              </p>
              <details className="bg-gray-50 rounded-lg p-4">
                <summary className="font-semibold text-gray-900 cursor-pointer">Ver Resolução</summary>
                <div className="mt-3 space-y-2 text-gray-700">
                  <p>1. Converter: 20 cm = <strong>0,20 m</strong></p>
                  <p>2. Volume = 40 × 0,20 = <strong>8 m³</strong></p>
                  <p>3. Em litros = <strong>8.000 litros</strong></p>
                </div>
              </details>
            </div>
          </div>
        </section>

        {/* 7 Erros Fatais */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-xl p-8 text-white">
            <h2 className="text-2xl font-semibold mb-6 text-center">⚠️ OS 7 ERROS FATAIS DE MEDIÇÃO</h2>
            <p className="text-center text-red-100 mb-8">EVITE ESTAS ARMADILHAS!</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/10 rounded-lg p-6">
                <p className="font-semibold mb-2">1. Confundir miligramas com gramas</p>
                <p className="text-sm text-red-100">
                  Diferença de 1.000x! Pode transformar um tratamento suave em um desastre químico.
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-6">
                <p className="font-semibold mb-2">2. Estimar o volume "no olho"</p>
                <p className="text-sm text-red-100">
                  É como adivinhar o peso de uma pessoa olhando para ela. Raramente dá certo!
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-6">
                <p className="font-semibold mb-2">3. Ignorar a profundidade média</p>
                <p className="text-sm text-red-100">
                  Piscinas com fundo inclinado podem enganar até profissionais experientes.
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-6">
                <p className="font-semibold mb-2">4. Confiar em "medidas de colher"</p>
                <p className="text-sm text-red-100">
                  Uma colher de sopa não é uma unidade de medida padronizada! Use ferramentas apropriadas.
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-6">
                <p className="font-semibold mb-2">5. Esquecer-se da linha d'água</p>
                <p className="text-sm text-red-100">
                  Piscinas não são preenchidas até a borda. Considere sempre 10-15cm abaixo da borda.
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-6">
                <p className="font-semibold mb-2">6. Não compensar para diferentes concentrações</p>
                <p className="text-sm text-red-100">
                  Dois produtos com o mesmo nome podem ter concentrações diferentes. Leia os rótulos!
                </p>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-6 mt-6">
              <p className="font-semibold mb-2 text-center">7. Não registrar os cálculos</p>
              <p className="text-sm text-red-100 text-center">
                Sem histórico, você precisará "reinventar a roda" a cada visita.
              </p>
            </div>

            <div className="mt-8 text-center">
              <p className="text-xl font-semibold">💭 PENSAMENTO FINAL:</p>
              <p className="text-lg italic mt-2">
                "Medir duas vezes, tratar uma". Este pequeno investimento de tempo nos cálculos 
                vai economizar horas de trabalho corretivo depois!
              </p>
            </div>
          </div>
        </section>

        {/* Resumo */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Resumo do Capítulo 1</h2>
          
          <div className="bg-gradient-to-br from-[#0072BC] to-[#005a9e] rounded-xl p-8 text-white mb-6">
            <h3 className="text-xl font-semibold mb-4">Parabéns! Você completou o primeiro capítulo!</h3>
            <p className="text-blue-100 mb-4">Vamos revisar o que aprendeu:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-lg p-4">
                <p className="font-semibold mb-2">Sistema Internacional</p>
                <p className="text-sm text-blue-100">É a "língua universal" das medidas, usada em todo mundo</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <p className="font-semibold mb-2">Unidades Básicas</p>
                <p className="text-sm text-blue-100">Metro (m), Litro (L), Quilograma (kg)</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <p className="font-semibold mb-2">Volume Retangular</p>
                <p className="text-sm text-blue-100">Comprimento × Largura × Profundidade</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <p className="font-semibold mb-2">Volume Circular</p>
                <p className="text-sm text-blue-100">3,14 × Raio × Raio × Profundidade</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">💡 DICAS FINAIS IMPORTANTES:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>✓ Sempre meça duas vezes, calcule uma vez!</li>
                  <li>✓ Tenha uma calculadora e uma balança digital sempre com você</li>
                  <li>✓ Anote as medidas de cada piscina em uma ficha - isso economiza tempo</li>
                  <li>✓ Considere sempre uma margem de erro de 5%</li>
                  <li>✓ Quando em dúvida, pergunte ou refaça o cálculo</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Glossário Ilustrado */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-gray-900 mb-6 text-center">📖 Glossário Ilustrado</h2>
          <p className="text-center text-gray-600 mb-8">
            Este glossário explica todos os termos técnicos usados nesta apostila de forma simples e clara.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { termo: 'Área', def: 'O tamanho da superfície da piscina vista de cima. Medida em metros quadrados (m²).' },
              { termo: 'Centímetro (cm)', def: 'Medida de comprimento. 100 centímetros = 1 metro.' },
              { termo: 'Diâmetro', def: 'Em uma piscina redonda, é a medida de uma borda até a outra, passando pelo centro.' },
              { termo: 'Grama (g)', def: 'Medida de peso. 1.000 gramas = 1 quilograma.' },
              { termo: 'Linha d\'água', def: 'Nível ideal onde a água deve ficar na piscina, geralmente na metade do skimmer.' },
              { termo: 'Litro (L)', def: 'Medida de volume para líquidos. 1 metro cúbico = 1.000 litros.' },
              { termo: 'Metro (m)', def: 'Unidade básica de comprimento. 1 metro = 100 centímetros.' },
              { termo: 'Metro Cúbico (m³)', def: 'Medida de volume. Usado para saber quanto de água cabe na piscina. 1 m³ = 1.000 litros.' },
              { termo: 'Miligrama (mg)', def: 'Medida muito pequena de peso. 1.000 miligramas = 1 grama.' },
              { termo: 'Mililitro (mL)', def: 'Medida pequena de volume. 1.000 mililitros = 1 litro.' },
              { termo: 'Pi (π)', def: 'Número especial (3,14) usado para calcular círculos.' },
              { termo: 'Profundidade', def: 'Altura da água na piscina, medida do fundo até a superfície.' },
              { termo: 'Quilograma (kg)', def: 'Medida de peso. 1 kg = 1.000 gramas.' },
              { termo: 'Raio', def: 'Em piscina redonda, distância do centro até a borda. É metade do diâmetro.' },
              { termo: 'Volume', def: 'Quantidade de água que cabe na piscina. Medido em metros cúbicos (m³) ou litros (L).' }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <p className="font-semibold text-[#0072BC] mb-2">{item.termo}</p>
                <p className="text-sm text-gray-700">{item.def}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tabelas de Conversão Rápida */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-gray-900 mb-6 text-center">📊 Tabelas de Conversão Rápida</h2>
          
          <div className="space-y-6">
            {/* Tabela 1 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#0072BC] to-[#005a9e] px-6 py-4">
                <h3 className="text-lg font-semibold text-white">Tabela 1 - Conversões de Volume</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Para Converter</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Em</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Multiplique Por</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr><td className="px-6 py-4 text-sm">Metros cúbicos (m³)</td><td className="px-6 py-4 text-sm">Litros (L)</td><td className="px-6 py-4 text-sm font-semibold text-[#0072BC]">1.000</td></tr>
                    <tr className="bg-gray-50"><td className="px-6 py-4 text-sm">Litros (L)</td><td className="px-6 py-4 text-sm">Metros cúbicos (m³)</td><td className="px-6 py-4 text-sm font-semibold text-[#0072BC]">0,001</td></tr>
                    <tr><td className="px-6 py-4 text-sm">Litros (L)</td><td className="px-6 py-4 text-sm">Mililitros (mL)</td><td className="px-6 py-4 text-sm font-semibold text-[#0072BC]">1.000</td></tr>
                    <tr className="bg-gray-50"><td className="px-6 py-4 text-sm">Mililitros (mL)</td><td className="px-6 py-4 text-sm">Litros (L)</td><td className="px-6 py-4 text-sm font-semibold text-[#0072BC]">0,001</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tabela 2 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">Tabela 2 - Conversões de Massa</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Para Converter</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Em</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Multiplique Por</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr><td className="px-6 py-4 text-sm">Quilogramas (kg)</td><td className="px-6 py-4 text-sm">Gramas (g)</td><td className="px-6 py-4 text-sm font-semibold text-green-600">1.000</td></tr>
                    <tr className="bg-gray-50"><td className="px-6 py-4 text-sm">Gramas (g)</td><td className="px-6 py-4 text-sm">Quilogramas (kg)</td><td className="px-6 py-4 text-sm font-semibold text-green-600">0,001</td></tr>
                    <tr><td className="px-6 py-4 text-sm">Gramas (g)</td><td className="px-6 py-4 text-sm">Miligramas (mg)</td><td className="px-6 py-4 text-sm font-semibold text-green-600">1.000</td></tr>
                    <tr className="bg-gray-50"><td className="px-6 py-4 text-sm">Miligramas (mg)</td><td className="px-6 py-4 text-sm">Gramas (g)</td><td className="px-6 py-4 text-sm font-semibold text-green-600">0,001</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tabela 3 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">Tabela 3 - Conversões de Comprimento</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Para Converter</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Em</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Multiplique Por</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr><td className="px-6 py-4 text-sm">Metros (m)</td><td className="px-6 py-4 text-sm">Centímetros (cm)</td><td className="px-6 py-4 text-sm font-semibold text-purple-600">100</td></tr>
                    <tr className="bg-gray-50"><td className="px-6 py-4 text-sm">Centímetros (cm)</td><td className="px-6 py-4 text-sm">Metros (m)</td><td className="px-6 py-4 text-sm font-semibold text-purple-600">0,01</td></tr>
                    <tr><td className="px-6 py-4 text-sm">Metros (m)</td><td className="px-6 py-4 text-sm">Milímetros (mm)</td><td className="px-6 py-4 text-sm font-semibold text-purple-600">1.000</td></tr>
                    <tr className="bg-gray-50"><td className="px-6 py-4 text-sm">Milímetros (mm)</td><td className="px-6 py-4 text-sm">Metros (m)</td><td className="px-6 py-4 text-sm font-semibold text-purple-600">0,001</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tabela 4 - Parâmetros Ideais da Água */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">Tabela 4 - Parâmetros Ideais da Água</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Parâmetro</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Faixa Ideal</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Unidade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr><td className="px-6 py-4 text-sm">Cloro Livre</td><td className="px-6 py-4 text-sm font-semibold text-cyan-600">1 a 3</td><td className="px-6 py-4 text-sm">PPM</td></tr>
                    <tr className="bg-gray-50"><td className="px-6 py-4 text-sm">pH</td><td className="px-6 py-4 text-sm font-semibold text-cyan-600">7,2 a 7,6</td><td className="px-6 py-4 text-sm">-</td></tr>
                    <tr><td className="px-6 py-4 text-sm">Alcalinidade Total</td><td className="px-6 py-4 text-sm font-semibold text-cyan-600">80 a 120</td><td className="px-6 py-4 text-sm">PPM</td></tr>
                    <tr className="bg-gray-50"><td className="px-6 py-4 text-sm">Ácido Cianúrico</td><td className="px-6 py-4 text-sm font-semibold text-cyan-600">30 a 50</td><td className="px-6 py-4 text-sm">PPM</td></tr>
                    <tr><td className="px-6 py-4 text-sm">Dureza Cálcica</td><td className="px-6 py-4 text-sm font-semibold text-cyan-600">200 a 400</td><td className="px-6 py-4 text-sm">PPM</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tabela 5 - Fórmulas Rápidas */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#FF6B00] to-[#e55d00] px-6 py-4">
                <h3 className="text-lg font-semibold text-white">Tabela 5 - Fórmulas Rápidas</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tipo de Piscina</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fórmula do Volume</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr><td className="px-6 py-4 text-sm font-medium">Retangular</td><td className="px-6 py-4 text-sm font-mono">Comprimento × Largura × Profundidade</td></tr>
                    <tr className="bg-gray-50"><td className="px-6 py-4 text-sm font-medium">Circular</td><td className="px-6 py-4 text-sm font-mono">3,14 × Raio × Raio × Profundidade</td></tr>
                    <tr><td className="px-6 py-4 text-sm font-medium">Reposição de Água</td><td className="px-6 py-4 text-sm font-mono">Área × Diferença de Altura</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tabela 6 - Tempo de Filtração */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">Tabela 6 - Tempo de Filtração</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Temperatura da Água</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Horas de Filtração por Dia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr><td className="px-6 py-4 text-sm">Até 21°C</td><td className="px-6 py-4 text-sm font-semibold text-indigo-600">6 a 8 horas</td></tr>
                    <tr className="bg-gray-50"><td className="px-6 py-4 text-sm">21°C a 24°C</td><td className="px-6 py-4 text-sm font-semibold text-indigo-600">8 a 10 horas</td></tr>
                    <tr><td className="px-6 py-4 text-sm">24°C a 27°C</td><td className="px-6 py-4 text-sm font-semibold text-indigo-600">10 a 12 horas</td></tr>
                    <tr className="bg-gray-50"><td className="px-6 py-4 text-sm">Acima de 27°C</td><td className="px-6 py-4 text-sm font-semibold text-indigo-600">12 a 14 horas</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg p-6 mt-8">
            <div className="flex items-start gap-3">
              <Lightbulb className="text-yellow-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">💡 Como Usar Estas Tabelas</h4>
                <p className="text-gray-700 mb-2">Estas tabelas são suas aliadas no dia a dia. Sugerimos que você:</p>
                <ul className="space-y-1 ml-4 text-gray-700">
                  <li>• Tire uma foto destas páginas no celular para consulta rápida</li>
                  <li>• Imprima e plastifique para levar na maleta de trabalho</li>
                  <li>• Cole na parede do seu local de trabalho</li>
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
              No Capítulo 2, vamos aprender sobre <strong>PPM (Partes Por Milhão)</strong> – 
              o verdadeiro "idioma das piscinas"!
            </p>
            <button
              onClick={() => navigate('/dashboard/chapter/2')}
              className="bg-white text-[#FF6B00] px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all inline-flex items-center gap-2"
            >
              Ir para Módulo 2
              <ArrowRight size={20} />
            </button>
          </div>
        </section>

        {/* Página Final */}
        <section className="mb-8">
          <div className="bg-gradient-to-br from-[#0072BC] to-[#005a9e] rounded-xl p-8 text-white text-center">
            <BookOpen className="mx-auto mb-4" size={64} />
            <h3 className="text-2xl font-semibold mb-4">Parabéns por Estudar com a Apostila CTP 3.0!</h3>
            
            <div className="bg-white/10 rounded-lg p-6 mb-6 text-left">
              <h4 className="font-semibold mb-4">📚 Próximos Passos</h4>
              <ol className="space-y-2 ml-6 list-decimal">
                <li>Estude todos os 12 capítulos desta apostila com atenção</li>
                <li>Faça os testes ao final de cada capítulo</li>
                <li>Pratique os cálculos e técnicas no dia a dia</li>
                <li>Realize a prova final para obter seu certificado</li>
                <li>Torne-se um Profissional Certificado ANAPP!</li>
              </ol>
            </div>

            <div className="bg-white/10 rounded-lg p-6 text-left">
              <h4 className="font-semibold mb-3">Contato ANAPP</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Site:</strong> www.anapp.org.br</p>
                <p><strong>Curso Online:</strong> www.ctpanapp.online</p>
                <p><strong>E-mail:</strong> cursos@anapp.org.br</p>
              </div>
            </div>

            <p className="text-sm text-blue-100 mt-6">
              © 2025 ANAPP - Associação Nacional das Empresas e Profissionais de Piscinas
            </p>
            <p className="text-xs text-blue-200 mt-2">
              Todos os direitos reservados. Material Didático - CTP 3.0 - Versão para Estudo
            </p>
            
            <p className="text-lg font-semibold mt-6">
              Sucesso em sua jornada profissional! 🎓
            </p>
          </div>
        </section>

      </div>

      <Footer user={user} />
    </div>
  );
}

export default ApostilaModulo1;
