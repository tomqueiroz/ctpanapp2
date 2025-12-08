import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoggedInHeader from '../components/LoggedInHeader';
import Footer from '../components/Footer';
import { Download, BookOpen, CheckCircle2, Droplets, AlertTriangle, Waves } from 'lucide-react';
import { generateApostilaPDF } from '../utils/pdfGenerator';

function ApostilaModulo11({ user = { name: 'Aluno' } }) {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    const result = await generateApostilaPDF('apostila-content', 11, 'Circulacao-Agua');
    if (!result.success) {
      alert(`Erro ao gerar PDF: ${result.error}`);
    }
    setDownloading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LoggedInHeader user={user} />
      
      <div className="bg-gradient-to-r from-[#0072BC] to-[#005a9e] text-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <Waves size={40} />
            <div>
              <p className="text-blue-100 text-sm font-medium">Módulo 11</p>
              <h1 className="text-4xl font-bold">Circulação de Água</h1>
            </div>
          </div>
          <p className="text-blue-50 text-lg mt-4">
            Compreenda os sistemas de recirculação e filtragem para manter a qualidade da água.
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

      <div className="max-w-4xl mx-auto px-6 py-12" id="apostila-content">
        
        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Droplets className="text-[#0072BC]" size={28} />
            Importância da Circulação
          </h2>
          <p className="text-gray-700 mb-4">
            Um projeto de circulação de água adequado de uma piscina ou spa removerá as impurezas e 
            contaminantes concentrados na água.
          </p>
          <p className="text-gray-700 mb-4">Para garantir boa qualidade da água deve-se sempre manter:</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Níveis adequados de desinfetantes</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Equipamentos de tratamento em perfeito funcionamento</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Rotinas de circular e filtrar constantemente a água</span>
            </li>
          </ul>
          <div className="mt-6 bg-blue-100 p-6 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-2">Função da Circulação</h3>
            <p className="text-gray-700">Esta movimentação da água dilui e homogeneíza os produtos adicionados.</p>
          </div>
          <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-500 p-4">
            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <AlertTriangle size={20} className="text-yellow-600" />
              Realidade Prática
            </h4>
            <p className="text-gray-700">
              Não existe um projeto de circulação de água perfeito. Por mais cálculos e modelos utilizados 
              na teoria, na prática não é possível obter desempenho 100% perfeito.
            </p>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Fatores que Influenciam a Circulação</h2>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-[#0072BC] flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Posicionamento e projeto de entrada/acesso de banhistas</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-[#0072BC] flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Forma da piscina</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-[#0072BC] flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Motobombas e filtros</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-[#0072BC] flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Tubulações e acessórios</span>
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sistemas de Captação da Água</h2>
          <p className="text-gray-700 mb-4">
            O componente principal para que a circulação seja realizada é a motobomba. Ela é responsável 
            por fornecer o movimento para a água através das tubulações.
          </p>
          <p className="text-gray-700 mb-4">Existem 2 meios de prover esta movimentação:</p>

          <div className="space-y-4">
            <div className="border-l-4 border-[#0072BC] pl-4 py-2">
              <h3 className="font-bold text-gray-900 mb-2">1. Sucção Direta</h3>
              <p className="text-gray-700">
                A bomba retira a água por meio de sucção dos bocais de saída (drenos, ralos de fundo), 
                impulsiona para o filtro que segue aos bocais de retorno.
              </p>
            </div>

            <div className="border-l-4 border-[#0072BC] pl-4 py-2">
              <h3 className="font-bold text-gray-900 mb-2">2. Transbordamento</h3>
              <p className="text-gray-700">
                Nesse método, o entorno da piscina possui calhas coletoras ou Skimmers. A água coletada é 
                direcionada para um tanque de compensação. A água do tanque é movida por gravidade ou sucção 
                da motobomba até o sistema de filtração e retorna à piscina.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Tempo de Filtração - NBR 10.339:2018</h2>
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#0072BC] text-white">
                  <th className="p-3 text-left">Profundidade Média</th>
                  <th className="p-3 text-center">Residencial Privada</th>
                  <th className="p-3 text-center">Pública/Coletiva</th>
                  <th className="p-3 text-center">Alta Ocupação*</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3">Até 0,60m</td>
                  <td className="p-3 text-center font-bold">4h</td>
                  <td className="p-3 text-center font-bold">2h</td>
                  <td className="p-3 text-center font-bold">2h</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-3">0,60 a 1,50m</td>
                  <td className="p-3 text-center font-bold">8h</td>
                  <td className="p-3 text-center font-bold">6h</td>
                  <td className="p-3 text-center font-bold">4h</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">&gt; 1,50m</td>
                  <td className="p-3 text-center font-bold">8h</td>
                  <td className="p-3 text-center font-bold">8h</td>
                  <td className="p-3 text-center font-bold">6h</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-gray-700 text-sm mb-4">* Alta ocupação: &gt; 1 usuário/2m²/12h</p>
          
          <div className="bg-blue-100 p-6 rounded-lg mb-4">
            <p className="text-center font-bold text-gray-900 text-lg">
              Vazão de Projeto = Volume da Piscina (m³) ÷ Tempo Máximo (h)
            </p>
          </div>

          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={32} />
              <div>
                <h4 className="font-bold text-red-900 mb-2">⚠️ CUIDADO!</h4>
                <p className="text-gray-700">
                  Tempo MÁXIMO para que a bomba não funcione superdimensionada. Quanto maior a vazão, 
                  mais força de aspiração e perigo de sucção.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Taxa de Recirculação</h2>
          <div className="bg-blue-100 p-6 rounded-lg mb-6">
            <p className="text-gray-700 mb-3">
              <strong>Taxa de Recirculação (T):</strong> É a relação entre o volume de água recirculada 
              pelo sistema em 24h (Vr) e o volume de água contido no tanque (Vp).
            </p>
            <p className="text-center font-bold text-[#0072BC] text-2xl">T = Vr ÷ Vp</p>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-4">Eficiência da Filtração por Rotação:</h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left border">Rotação</th>
                  <th className="p-3 text-center border">Água Não Filtrada</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 border">1ª rotação</td>
                  <td className="p-3 text-center border font-bold text-red-600">37%</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-3 border">2ª rotação</td>
                  <td className="p-3 text-center border font-bold text-yellow-600">14%</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 border">3ª rotação</td>
                  <td className="p-3 text-center border font-bold text-yellow-600">5%</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-3 border">4ª rotação</td>
                  <td className="p-3 text-center border font-bold text-green-600">2%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-gray-700 mb-4">
            Em piscinas residenciais, basicamente é estabelecido o período de 6 horas para que 
            tenhamos apenas 2% da água não filtrada.
          </p>

          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={32} />
              <div>
                <h4 className="font-bold text-red-900 mb-2">❗ PERIGO!</h4>
                <p className="text-gray-700 mb-2">
                  Em hipótese alguma deve ser adicionada motobomba com capacidade superior ao necessário. 
                  Podem ocorrer graves acidentes como:
                </p>
                <ul className="list-disc list-inside text-gray-700 ml-4">
                  <li>Aprisionamento de membros ou pessoas</li>
                  <li>Danos estruturais no filtro e tubulações</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Skimmers</h2>
          <p className="text-gray-700 mb-4">
            Localizados na superfície, são aberturas nas paredes da piscina em formato de caixa responsáveis 
            por coletar as águas de superfície e direcioná-las ao sistema de filtração.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mb-4">Funções do Skimmer:</h3>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Coletar água de superfície (área mais contaminada)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Direcionar ao sistema de filtração</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Manter nível de água na piscina</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Cesto interno coleta resíduos (folhas, cabelos, etc)</span>
            </li>
          </ul>

          <div className="bg-blue-100 p-6 rounded-lg mb-4">
            <h3 className="font-bold text-gray-900 mb-2">Importância da Água de Superfície:</h3>
            <p className="text-gray-700">
              Esporos de algas, óleos de usuários, descargas corporais e impurezas transportadas pelo vento 
              se acumulam na superfície, tornando-a a região com maior concentração de contaminantes.
            </p>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <h4 className="font-bold text-gray-900 mb-2">Manutenção</h4>
            <p className="text-gray-700">Limpe o cesto do skimmer semanalmente ou quando necessário.</p>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Drenos e Segurança</h2>
          <p className="text-gray-700 mb-4">
            Os drenos ficam localizados geralmente na parte mais funda da piscina onde uma quantidade 
            controlada de água é sugada e direcionada ao sistema de filtração.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mb-4">Requisitos NBR 10.339:2018:</h3>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Tampas anti-aprisionamento obrigatórias</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Espaçamento mínimo de 1,5m entre drenos</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Marcação de vazão máxima (m³/h) nas tampas</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Tampa de segurança no sistema de aspiração</span>
            </li>
          </ul>

          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={32} />
              <div>
                <h4 className="font-bold text-red-900 mb-2">❗ PERIGOS DE SUCÇÃO</h4>
                <p className="text-gray-700 mb-2">Acidentes graves podem ocorrer:</p>
                <ul className="list-disc list-inside text-gray-700 ml-4">
                  <li>Aprisionamento corporal</li>
                  <li>Evisceração/estripação</li>
                  <li>Enrolamento de cabelo</li>
                  <li>Aprisionamento de membro</li>
                </ul>
                <p className="text-gray-700 mt-3 font-bold">NUNCA exceda a vazão máxima marcada nas tampas!</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Pontos Cegos</h2>
          <p className="text-gray-700 mb-4">
            <strong>Pontos Cegos:</strong> São áreas da piscina onde o sistema de circulação não faz a água circular adequadamente.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mb-4">Problemas Causados:</h3>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-3">
              <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Crescimento de algas</span>
            </li>
            <li className="flex items-start gap-3">
              <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Acúmulo de impurezas</span>
            </li>
            <li className="flex items-start gap-3">
              <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Água parada e estagnada</span>
            </li>
            <li className="flex items-start gap-3">
              <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Baixa eficiência do tratamento</span>
            </li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mb-4">Como Evitar:</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Projeto adequado de retornos</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Posicionamento correto dos bocais</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Número suficiente de pontos de retorno</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Escovação regular nas áreas problemáticas</span>
            </li>
          </ul>
        </section>

        <section className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Resumo Capítulo 11</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-bold text-[#0072BC] mb-2">Circulação</h3>
              <p className="text-gray-700 text-sm">Remove impurezas, dilui produtos, essencial</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-bold text-[#0072BC] mb-2">Sistemas</h3>
              <p className="text-gray-700 text-sm">Sucção direta ou Transbordamento</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-bold text-[#0072BC] mb-2">Tempo Filtração</h3>
              <p className="text-gray-700 text-sm">4-8h conforme tipo e profundidade (NBR 10.339)</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-bold text-[#0072BC] mb-2">Taxa Recirculação</h3>
              <p className="text-gray-700 text-sm">T = Vr ÷ Vp (volume 24h ÷ volume tanque)</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-bold text-[#0072BC] mb-2">Eficiência</h3>
              <p className="text-gray-700 text-sm">4 rotações = 98% água filtrada (2% não filtrada)</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-bold text-[#0072BC] mb-2">Skimmer</h3>
              <p className="text-gray-700 text-sm">Coleta superfície, área mais contaminada</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-bold text-[#0072BC] mb-2">Drenos</h3>
              <p className="text-gray-700 text-sm">Tampas anti-aprisionamento, 1,5m entre drenos</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-bold text-[#0072BC] mb-2">Pontos Cegos</h3>
              <p className="text-gray-700 text-sm">Áreas sem circulação, causam algas</p>
            </div>
          </div>

          <div className="mt-6 bg-red-100 p-6 rounded-lg border-2 border-red-300">
            <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
              🔒 Segurança Crucial
            </h3>
            <p className="text-gray-700">
              Nunca use bomba superdimensionada! Risco de aprisionamento e danos estruturais.
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-2xl font-bold text-[#0072BC] mb-2">Parabéns!</p>
            <p className="text-gray-700">Você completou o Capítulo 11</p>
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
}

export default ApostilaModulo11;
