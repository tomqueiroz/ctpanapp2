import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoggedInHeader from '../components/LoggedInHeader';
import Footer from '../components/Footer';
import { Download, BookOpen, CheckCircle2, AlertTriangle, Lightbulb, TestTube, Droplet, TrendingUp, ArrowRight, Beaker, Activity } from 'lucide-react';
import { generateApostilaPDF } from '../utils/pdfGenerator';

function ApostilaModulo5({ user = { name: 'Aluno' } }) {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    
    const result = await generateApostilaPDF('apostila-content', 5, 'Testes-Quimicos');
    
    if (!result.success) {
      alert(`Erro ao gerar PDF: ${result.error}`);
    }
    
    setDownloading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LoggedInHeader user={user} />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#0072BC] to-[#005a9e] text-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <TestTube size={40} />
            <div>
              <p className="text-blue-100 text-sm font-medium">Módulo 5</p>
              <h1 className="text-4xl font-bold">Testes Químicos da Água</h1>
            </div>
          </div>
          <p className="text-blue-50 text-lg mt-4">
            Aprenda os procedimentos corretos para testar e monitorar a qualidade química da água da piscina.
          </p>
          
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="mt-6 bg-[#FF6B00] hover:bg-[#e55f00] text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all"
          >
            <Download size={20} />
            {downloading ? 'Gerando PDF...' : 'Baixar Apostila em PDF'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12" id="apostila-content">
        
        {/* Introduction */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <BookOpen className="text-[#0072BC] flex-shrink-0 mt-1" size={28} />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Introdução</h2>
              <p className="text-gray-700 leading-relaxed">
                Os testes químicos da água são essenciais para garantir a segurança e o conforto dos banhistas. Neste capítulo, você aprenderá sobre os principais parâmetros químicos, como testá-los corretamente e como interpretar os resultados.
              </p>
            </div>
          </div>
        </section>

        {/* Principais Parâmetros */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Activity className="text-[#FF6B00]" size={28} />
            Principais Parâmetros Químicos
          </h2>
          
          <div className="space-y-6">
            <div className="border-l-4 border-[#0072BC] pl-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">pH (Potencial Hidrogeniônico)</h3>
              <p className="text-gray-700 mb-3">
                O pH mede a acidez ou alcalinidade da água. É o parâmetro mais importante a ser controlado.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-semibold text-[#0072BC] mb-2">Valores Ideais:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Faixa ideal: <strong>7,2 a 7,6</strong></li>
                  <li>Tolerável: 7,0 a 8,0</li>
                  <li>pH abaixo de 7,2: água ácida (corrosão)</li>
                  <li>pH acima de 7,6: água alcalina (incrustações)</li>
                </ul>
              </div>
            </div>

            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Cloro Livre</h3>
              <p className="text-gray-700 mb-3">
                O cloro livre é o desinfetante ativo que elimina microorganismos da água.
              </p>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="font-semibold text-green-700 mb-2">Valores Ideais:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Piscinas: <strong>1,0 a 3,0 ppm</strong></li>
                  <li>Spas: 2,0 a 5,0 ppm</li>
                  <li>Abaixo de 1,0 ppm: insuficiente para desinfecção</li>
                  <li>Acima de 5,0 ppm: irritação nos olhos e pele</li>
                </ul>
              </div>
            </div>

            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Alcalinidade Total</h3>
              <p className="text-gray-700 mb-3">
                A alcalinidade atua como um "tampão" que estabiliza o pH, evitando variações bruscas.
              </p>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="font-semibold text-purple-700 mb-2">Valores Ideais:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Faixa ideal: <strong>80 a 120 ppm</strong></li>
                  <li>Tolerável: 60 a 150 ppm</li>
                  <li>Baixa alcalinidade: pH instável</li>
                  <li>Alta alcalinidade: dificuldade em ajustar pH</li>
                </ul>
              </div>
            </div>

            <div className="border-l-4 border-orange-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Dureza Cálcica</h3>
              <p className="text-gray-700 mb-3">
                Mede a concentração de cálcio dissolvido na água.
              </p>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="font-semibold text-orange-700 mb-2">Valores Ideais:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Faixa ideal: <strong>200 a 400 ppm</strong></li>
                  <li>Baixa dureza: água corrosiva</li>
                  <li>Alta dureza: formação de incrustações</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Métodos de Teste */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Beaker className="text-[#FF6B00]" size={28} />
            Métodos de Teste
          </h2>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <CheckCircle2 className="text-blue-600" size={24} />
                1. Testes Colorimétricos (DPD)
              </h3>
              <p className="text-gray-700 mb-3">
                Método mais comum, utilizando reagentes que mudam de cor de acordo com a concentração do parâmetro testado.
              </p>
              <div className="ml-6">
                <p className="font-semibold text-gray-800 mb-2">Procedimento:</p>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Colete amostra de água na profundidade de 30-40cm (longe de retornos e skimmers)</li>
                  <li>Lave o tubo de teste 2-3 vezes com a água da piscina</li>
                  <li>Encha o tubo até a marca indicada</li>
                  <li>Adicione o reagente conforme instruções</li>
                  <li>Agite e aguarde o tempo especificado</li>
                  <li>Compare a cor obtida com a escala de cores</li>
                </ol>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <CheckCircle2 className="text-green-600" size={24} />
                2. Testes com Fitas Reagentes
              </h3>
              <p className="text-gray-700 mb-3">
                Método rápido e prático, ideal para testes rotineiros.
              </p>
              <div className="ml-6">
                <p className="font-semibold text-gray-800 mb-2">Procedimento:</p>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Mergulhe a fita na água por 2 segundos (30-40cm de profundidade)</li>
                  <li>Retire e segure horizontalmente</li>
                  <li>Aguarde o tempo especificado (geralmente 15-30 segundos)</li>
                  <li>Compare as cores com a escala do frasco</li>
                  <li>Leia os resultados imediatamente</li>
                </ol>
                <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <p className="text-sm text-gray-700">
                    <strong>⚠️ Atenção:</strong> Não toque nas áreas reagentes da fita e feche bem o frasco após o uso para evitar contaminação.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <CheckCircle2 className="text-purple-600" size={24} />
                3. Fotômetros Digitais
              </h3>
              <p className="text-gray-700 mb-3">
                Método mais preciso, utiliza tecnologia digital para medir os parâmetros.
              </p>
              <div className="ml-6">
                <p className="font-semibold text-gray-800 mb-2">Vantagens:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Maior precisão e eliminação de erro humano</li>
                  <li>Leitura digital clara e objetiva</li>
                  <li>Armazenamento de histórico de medições</li>
                  <li>Calibração automática</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Frequência de Testes */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <TrendingUp className="text-[#FF6B00]" size={28} />
            Frequência de Testes
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#0072BC] text-white">
                  <th className="border border-gray-300 px-4 py-3 text-left">Parâmetro</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">Frequência Mínima</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">Recomendação</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-semibold">pH</td>
                  <td className="border border-gray-300 px-4 py-3">Diariamente</td>
                  <td className="border border-gray-300 px-4 py-3">2x ao dia (manhã e tarde)</td>
                </tr>
                <tr className="bg-gray-50 hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-3 font-semibold">Cloro Livre</td>
                  <td className="border border-gray-300 px-4 py-3">Diariamente</td>
                  <td className="border border-gray-300 px-4 py-3">2x ao dia (manhã e tarde)</td>
                </tr>
                <tr className="bg-white hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-semibold">Alcalinidade</td>
                  <td className="border border-gray-300 px-4 py-3">Semanalmente</td>
                  <td className="border border-gray-300 px-4 py-3">A cada 3-4 dias</td>
                </tr>
                <tr className="bg-gray-50 hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-3 font-semibold">Dureza Cálcica</td>
                  <td className="border border-gray-300 px-4 py-3">Mensalmente</td>
                  <td className="border border-gray-300 px-4 py-3">Quinzenalmente</td>
                </tr>
                <tr className="bg-white hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-semibold">Cloro Total</td>
                  <td className="border border-gray-300 px-4 py-3">Semanalmente</td>
                  <td className="border border-gray-300 px-4 py-3">A cada 3-4 dias</td>
                </tr>
                <tr className="bg-gray-50 hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-3 font-semibold">Ácido Cianúrico</td>
                  <td className="border border-gray-300 px-4 py-3">Mensalmente</td>
                  <td className="border border-gray-300 px-4 py-3">A cada 15 dias</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Boas Práticas */}
        <section className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-sm p-8 mb-8 border-2 border-yellow-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Lightbulb className="text-yellow-600" size={28} />
            Boas Práticas de Teste
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">
                <strong>Colete amostras longe de retornos e skimmers:</strong> Aguarde pelo menos 30 minutos após adicionar produtos químicos antes de testar.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">
                <strong>Lave sempre os tubos de teste:</strong> Use a própria água da piscina 2-3 vezes antes de coletar a amostra final.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">
                <strong>Armazene reagentes adequadamente:</strong> Local fresco, seco e protegido da luz solar direta.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">
                <strong>Verifique validade dos reagentes:</strong> Reagentes vencidos produzem resultados incorretos.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">
                <strong>Registre todos os testes:</strong> Mantenha um histórico para identificar padrões e tendências.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">
                <strong>Calibre equipamentos regularmente:</strong> Fotômetros e outros equipamentos digitais precisam de calibração periódica.
              </p>
            </div>
          </div>
        </section>

        {/* Alerta de Segurança */}
        <section className="bg-red-50 border-2 border-red-300 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={32} />
            <div>
              <h3 className="text-xl font-bold text-red-900 mb-3">Segurança ao Manusear Reagentes</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  Use sempre EPIs: luvas, óculos de proteção e avental
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  Nunca misture reagentes diferentes
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  Mantenha reagentes longe de crianças e animais
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  Em caso de contato com a pele ou olhos, lave imediatamente com água corrente
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  Consulte a FISPQ (Ficha de Informação de Segurança de Produtos Químicos)
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Resumo */}
        <section className="bg-gradient-to-r from-[#0072BC] to-[#005a9e] text-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <BookOpen size={28} />
            Resumo do Capítulo 5
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">Parâmetros Principais:</h3>
              <ul className="space-y-2 text-blue-50">
                <li>✓ pH: 7,2 a 7,6</li>
                <li>✓ Cloro Livre: 1,0 a 3,0 ppm</li>
                <li>✓ Alcalinidade: 80 a 120 ppm</li>
                <li>✓ Dureza Cálcica: 200 a 400 ppm</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-3">Métodos de Teste:</h3>
              <ul className="space-y-2 text-blue-50">
                <li>✓ Colorimétrico (DPD)</li>
                <li>✓ Fitas Reagentes</li>
                <li>✓ Fotômetros Digitais</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-blue-300">
            <p className="text-blue-50 italic">
              Testes químicos regulares e precisos são a base para manter uma piscina segura, confortável e com água cristalina!
            </p>
          </div>
        </section>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/dashboard/chapter/5')}
            className="inline-flex items-center gap-2 text-[#0072BC] hover:text-[#005a9e] font-semibold transition-colors"
          >
            <ArrowRight className="rotate-180" size={20} />
            Voltar para o Módulo 5
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ApostilaModulo5;