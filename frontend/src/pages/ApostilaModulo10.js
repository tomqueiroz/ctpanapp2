import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoggedInHeader from '../components/LoggedInHeader';
import Footer from '../components/Footer';
import { Download, BookOpen, CheckCircle2, FileText, Shield, AlertTriangle } from 'lucide-react';
import { generateApostilaPDF } from '../utils/pdfGenerator';

function ApostilaModulo10({ user = { name: 'Aluno' } }) {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    const result = await generateApostilaPDF('apostila-content', 10, 'Norma-NBR-10339');
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
            <FileText size={40} />
            <div>
              <p className="text-blue-100 text-sm font-medium">Módulo 10</p>
              <h1 className="text-4xl font-bold">Norma ABNT NBR 10.339:2018</h1>
            </div>
          </div>
          <p className="text-blue-50 text-lg mt-4">
            Entenda os requisitos técnicos e de segurança para piscinas.
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
            <BookOpen className="text-[#0072BC]" size={28} />
            Introdução
          </h2>
          <p className="text-gray-700 mb-4">
            A Norma ABNT NBR 10.339:2018 passou por revisão recente pela Comissão Especial de Estudos 
            da ABNT – CEE 215 - Piscinas, e foi publicada em setembro de 2018.
          </p>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Motivação da Revisão:</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Harmonizar critérios técnicos</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Melhorar segurança para usuários</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Qualidade de operação</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Sistemas de recirculação e tratamento</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Manutenções preventivas e corretivas</span>
            </li>
          </ul>
          <div className="mt-6 bg-blue-100 p-4 rounded-lg">
            <h4 className="font-bold text-gray-900 mb-2">Onde Consultar</h4>
            <p className="text-gray-700">Você pode consultar e adquirir normas em:</p>
            <ul className="list-disc list-inside text-gray-700 ml-4 mt-2">
              <li>www.abntcatalogo.com.br</li>
              <li>www.target.com.br</li>
            </ul>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Classificação das Piscinas</h2>
          <p className="text-gray-700 mb-6">As piscinas são classificadas em 7 grupos:</p>

          <div className="space-y-6">
            <div className="border-l-4 border-[#0072BC] pl-4">
              <h3 className="font-bold text-gray-900 mb-2">1. Quanto ao USO (5 tipos):</h3>
              <ul className="list-disc list-inside text-gray-700 ml-4">
                <li>Públicas</li>
                <li>Coletivas exclusivas</li>
                <li>De hospedaria</li>
                <li>Residenciais coletivas (condomínios)</li>
                <li>Residenciais privativas</li>
              </ul>
            </div>

            <div className="border-l-4 border-[#0072BC] pl-4">
              <h3 className="font-bold text-gray-900 mb-2">2. Quanto ao SUPRIMENTO E TRATAMENTO (4 tipos):</h3>
              <ul className="list-disc list-inside text-gray-700 ml-4">
                <li>Recirculação com tratamento</li>
                <li>Renovação contínua programada com tratamento</li>
                <li>Renovação contínua programada sem tratamento</li>
                <li>Renovação programada (encher e esvaziar)</li>
              </ul>
            </div>

            <div className="border-l-4 border-[#0072BC] pl-4">
              <h3 className="font-bold text-gray-900 mb-2">3. Quanto à FINALIDADE:</h3>
              <ul className="list-disc list-inside text-gray-700 ml-4">
                <li>Desportivas</li>
                <li>Recreativas</li>
                <li>Mistas</li>
                <li>Infantis</li>
                <li>Especiais</li>
              </ul>
            </div>

            <div className="border-l-4 border-[#0072BC] pl-4">
              <h3 className="font-bold text-gray-900 mb-2">4. Quanto ao CONDICIONAMENTO DA TEMPERATURA:</h3>
              <ul className="list-disc list-inside text-gray-700 ml-4">
                <li>Com água condicionada (aquecida)</li>
                <li>Sem condicionamento</li>
              </ul>
            </div>

            <div className="border-l-4 border-[#0072BC] pl-4">
              <h3 className="font-bold text-gray-900 mb-2">5. Quanto às CARACTERÍSTICAS FÍSICO-QUÍMICAS:</h3>
              <ul className="list-disc list-inside text-gray-700 ml-4">
                <li>Água doce</li>
                <li>Água medicinal</li>
                <li>Água salgada</li>
              </ul>
            </div>

            <div className="border-l-4 border-[#0072BC] pl-4">
              <h3 className="font-bold text-gray-900 mb-2">6. Quanto ao LOCAL:</h3>
              <ul className="list-disc list-inside text-gray-700 ml-4">
                <li>Abertas (ao ar livre)</li>
                <li>Cobertas-abertas</li>
                <li>Cobertas-fechadas (com fechamento lateral)</li>
              </ul>
            </div>

            <div className="border-l-4 border-[#0072BC] pl-4">
              <h3 className="font-bold text-gray-900 mb-2">7. Quanto à CONCEPÇÃO:</h3>
              <ul className="list-disc list-inside text-gray-700 ml-4">
                <li>Naturais</li>
                <li>Artificiais (projetadas e construídas)</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Definições Técnicas Importantes</h2>
          
          <div className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-3">Taxa de Filtração:</h3>
              <p className="text-gray-700 mb-2">
                É a relação entre a vazão de escoamento da água de filtração e a área do meio filtrante, 
                expressa em m³/h/m².
              </p>
              <div className="bg-white p-4 rounded-lg mt-3">
                <p className="text-center font-bold text-[#0072BC] text-2xl">25 a 50 m³/h/m²</p>
                <p className="text-center text-gray-700 text-sm">(NBR 10.339)</p>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-3">Taxa de Recirculação (T):</h3>
              <p className="text-gray-700 mb-2">
                Relação entre o volume de água recirculada em 24h (Vr) e o volume do tanque (Vp).
              </p>
              <div className="bg-white p-4 rounded-lg mt-3">
                <p className="text-center font-bold text-[#0072BC] text-2xl">T = Vr ÷ Vp</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-2">Taxa de Renovação</h3>
                <p className="text-gray-700 text-sm">
                  Número de vezes que todo o volume de água é filtrado em 24h.
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-2">Tempo de Filtração</h3>
                <p className="text-gray-700 text-sm">
                  Tempo necessário, em horas, para filtração de um volume de água.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Área Mínima por Usuário</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#0072BC] text-white">
                  <th className="p-3 text-left">Proporção Área Circundante/Água</th>
                  <th className="p-3 text-center">Prof. até 1,50m (m²/pessoa)</th>
                  <th className="p-3 text-center">Prof. > 1,50m (m²/pessoa)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3">< 1</td>
                  <td className="p-3 text-center font-bold">2,0</td>
                  <td className="p-3 text-center font-bold">4,0</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-3">≥ 1</td>
                  <td className="p-3 text-center font-bold">1,5</td>
                  <td className="p-3 text-center font-bold">3,0</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">≥ 2</td>
                  <td className="p-3 text-center font-bold">1,0</td>
                  <td className="p-3 text-center font-bold">2,0</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-500 p-4">
            <h4 className="font-bold text-gray-900 mb-2">Observação</h4>
            <p className="text-gray-700">
              Estes requisitos não se aplicam às piscinas residenciais privativas, desportivas e especiais.
            </p>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <AlertTriangle className="text-red-600" size={28} />
            Botão de Emergência
          </h2>
          <p className="text-gray-700 mb-4">
            Dispositivo para acionar parada de emergência e interromper a circulação de água do tanque, 
            proporcionando segurança aos banhistas.
          </p>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Requisitos:</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-red-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Obrigatório para piscinas públicas, de hospedaria e coletivas</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-red-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Local de fácil acesso e visualização</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-red-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Qualquer usuário pode utilizá-lo</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-red-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Próximo ao tanque</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-red-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Mínimo 2m da borda da piscina (NBR 5410)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-red-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Testado periodicamente</span>
            </li>
          </ul>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Shield className="text-[#0072BC]" size={28} />
            Equipamentos Salva-Vidas
          </h2>
          <p className="text-gray-700 mb-4">
            Todas as piscinas públicas, de hospedarias e residenciais coletivas devem dispor de:
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Boia salva-vidas circular com corda</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Vara de resgate telescópica</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Maca rígida para transporte de vítimas</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Kit de primeiros socorros completo</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Telefones de emergência visíveis (192, 193)</span>
            </li>
          </ul>
          <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-4">
            <h4 className="font-bold text-gray-900 mb-2">▲ LOCALIZAÇÃO</h4>
            <p className="text-gray-700">
              Equipamentos devem estar em locais visíveis, sinalizados e de fácil acesso.
            </p>
          </div>
        </section>

        <section className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Resumo Capítulo 10</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white">
              <thead>
                <tr className="bg-[#0072BC] text-white">
                  <th className="p-3 text-left">Item NBR 10.339</th>
                  <th className="p-3 text-left">Especificação</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 font-semibold">Cerca de proteção</td>
                  <td className="p-3 text-gray-700">Altura 1,10m, abertura max 11cm, trava 1,50m</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-3 font-semibold">Capa de proteção</td>
                  <td className="p-3 text-gray-700">Suportar 40 kg/m²</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-semibold">Botão emergência</td>
                  <td className="p-3 text-gray-700">Mínimo 2m da borda, obrigatório</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-3 font-semibold">Taxa de filtração</td>
                  <td className="p-3 text-gray-700">25 a 50 m³/h/m²</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-semibold">Área por pessoa</td>
                  <td className="p-3 text-gray-700">1,0 a 4,0 m² conforme profundidade</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-3 font-semibold">Equipamentos</td>
                  <td className="p-3 text-gray-700">Boia, vara, maca, primeiros socorros</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-semibold">Sinalização</td>
                  <td className="p-3 text-gray-700">Profundidade, regras, avisos</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 text-center">
            <p className="text-2xl font-bold text-[#0072BC] mb-2">Parabéns!</p>
            <p className="text-gray-700">Você completou o Capítulo 10</p>
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
}

export default ApostilaModulo10;
