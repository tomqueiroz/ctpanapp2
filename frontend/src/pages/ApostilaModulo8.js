import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoggedInHeader from '../components/LoggedInHeader';
import Footer from '../components/Footer';
import { Download, BookOpen, CheckCircle2, AlertTriangle, Lightbulb, FileText, ClipboardCheck, Calendar, ArrowRight } from 'lucide-react';
import { generateApostilaPDF } from '../utils/pdfGenerator';

function ApostilaModulo8({ user = { name: 'Aluno' } }) {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    const result = await generateApostilaPDF('apostila-content', 8, 'Relatorios-Registros');
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
              <p className="text-blue-100 text-sm font-medium">Módulo 8</p>
              <h1 className="text-4xl font-bold">Relatórios e Registros de Operação</h1>
            </div>
          </div>
          <p className="text-blue-50 text-lg mt-4">
            A importância da documentação adequada para gestão profissional de piscinas.
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Importância dos Registros</h2>
          
          <p className="text-gray-700 mb-6 leading-relaxed">
            Manter registros adequados das condições de operação, ocorrências e manutenções das instalações é uma responsabilidade importante para todo profissional do setor de piscinas e SPAs.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-5 rounded-lg">
              <h3 className="font-semibold text-[#0072BC] mb-2">✓ Histórico Operacional</h3>
              <p className="text-sm text-gray-700">Registro de como a instalação opera</p>
            </div>
            <div className="bg-green-50 p-5 rounded-lg">
              <h3 className="font-semibold text-green-700 mb-2">✓ Gestão de Insumos</h3>
              <p className="text-sm text-gray-700">Controle de produtos e materiais</p>
            </div>
            <div className="bg-purple-50 p-5 rounded-lg">
              <h3 className="font-semibold text-purple-700 mb-2">✓ Manutenção Preventiva</h3>
              <p className="text-sm text-gray-700">Planejamento e prevenção de falhas</p>
            </div>
            <div className="bg-orange-50 p-5 rounded-lg">
              <h3 className="font-semibold text-orange-700 mb-2">✓ Proteção Legal</h3>
              <p className="text-sm text-gray-700">Segurança jurídica e compliance</p>
            </div>
          </div>
          
          <div className="mt-6 bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-lg border-l-4 border-yellow-400">
            <p className="text-gray-700">
              <strong>Livro de Registros:</strong> Documento onde todas as informações sobre operação e manutenção da piscina são registradas. É essencial para proteger a instalação e prevenir problemas.
            </p>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <ClipboardCheck className="text-[#FF6B00]" size={28} />
            Tipos de Manutenção
          </h2>
          
          <div className="space-y-6">
            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Manutenção Preventiva</h3>
              <p className="text-gray-700 mb-3">
                Intervenção planejada, preparada e programada <strong>ANTES</strong> da possível ocorrência de uma falha.
              </p>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="font-semibold text-green-700 mb-2">Vantagens:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Menor custo</li>
                  <li>Maior disponibilidade</li>
                  <li>Maior vida útil dos equipamentos</li>
                  <li>Previsibilidade no orçamento</li>
                </ul>
              </div>
            </div>

            <div className="border-l-4 border-red-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Manutenção Corretiva</h3>
              <p className="text-gray-700 mb-3">
                Atua quando já há desgaste ou falhas no equipamento, substituindo peças e componentes afetados.
              </p>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="font-semibold text-red-700 mb-2">Características:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Maior custo</li>
                  <li>Tempo de parada prolongado</li>
                  <li>Alto custo de estoque de peças</li>
                  <li>Disponibilidade reduzida</li>
                </ul>
              </div>
            </div>

            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Manutenção Preditiva</h3>
              <p className="text-gray-700 mb-3">
                Metodologia de monitoramento periódico baseada na análise de dados coletados através de inspeções.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-semibold text-blue-700 mb-2">Objetivo:</p>
                <p className="text-gray-700">Antecipar problemas antes que causem maiores despesas.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">ABNT NBR 10.339:2018 - Registros Obrigatórios</h2>
          
          <p className="text-gray-700 mb-6">
            Segundo o Anexo B da Norma ABNT NBR 10339:2018, devem ser controlados:
          </p>
          
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#0072BC] text-white">
                  <th className="border border-gray-300 px-4 py-3 text-left">Item</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">Frequência</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3">Volume dos tanques</td>
                  <td className="border border-gray-300 px-4 py-3 font-semibold">Diário</td>
                </tr>
                <tr className="bg-gray-50 hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-3">Número total de banhistas</td>
                  <td className="border border-gray-300 px-4 py-3 font-semibold">Diário</td>
                </tr>
                <tr className="bg-white hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3">pH e cloro residual</td>
                  <td className="border border-gray-300 px-4 py-3 font-semibold">Diário</td>
                </tr>
                <tr className="bg-gray-50 hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-3">Temperatura da água</td>
                  <td className="border border-gray-300 px-4 py-3 font-semibold">Diário</td>
                </tr>
                <tr className="bg-white hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3">Claridade da água (visual)</td>
                  <td className="border border-gray-300 px-4 py-3 font-semibold">Diário</td>
                </tr>
                <tr className="bg-gray-50 hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-3">Vazão do filtro</td>
                  <td className="border border-gray-300 px-4 py-3 font-semibold">Diário</td>
                </tr>
                <tr className="bg-white hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3">Alcalinidade</td>
                  <td className="border border-gray-300 px-4 py-3 font-semibold">Mensal</td>
                </tr>
                <tr className="bg-gray-50 hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-3">Dureza cálcica</td>
                  <td className="border border-gray-300 px-4 py-3 font-semibold">Mensal</td>
                </tr>
                <tr className="bg-white hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3">Anormalidades</td>
                  <td className="border border-gray-300 px-4 py-3 font-semibold">Quando ocorrerem</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Responsabilidades do Profissional</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Verificar condição de equipamentos e tanques</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Limpeza do tanque e área circundante</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Funcionamento do sistema de filtração</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Controle de estoque de produtos químicos</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Manter avisos em condição legível</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Manter cópias da FISPQ de todos produtos químicos</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Guardar manuais e certificados de garantia</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Não realizar manutenção com banhistas na área</p>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
            <p className="text-gray-700">
              <strong>FISPQ:</strong> Ficha de Informação de Segurança de Produtos Químicos. Documento obrigatório que fornece informações sobre riscos, manuseio seguro e emergências.
            </p>
          </div>
        </section>

        <section className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-sm p-8 mb-8 border-2 border-yellow-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Lightbulb className="text-yellow-600" size={28} />
            Organização da Documentação
          </h2>
          
          <p className="text-gray-700 mb-4">
            Mantenha um arquivo organizado com:
          </p>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="text-[#0072BC] flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Livro de registros encadernado</p>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="text-[#0072BC] flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Relatórios de ocorrências</p>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="text-[#0072BC] flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Planos de manutenção</p>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="text-[#0072BC] flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">FISPQ de todos os produtos</p>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="text-[#0072BC] flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Manuais de equipamentos</p>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="text-[#0072BC] flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Certificados de garantia</p>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-[#0072BC] to-[#005a9e] text-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <BookOpen size={28} />
            Resumo do Capítulo 8
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">Tipos de Manutenção:</h3>
              <ul className="space-y-2 text-blue-50">
                <li>✓ Preventiva: programada, menor custo</li>
                <li>✓ Corretiva: após falha, maior custo</li>
                <li>✓ Preditiva: monitora e antecipa</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-3">Registros Diários NBR 10.339:</h3>
              <ul className="space-y-2 text-blue-50">
                <li>✓ pH e cloro residual</li>
                <li>✓ Temperatura e claridade</li>
                <li>✓ Vazão e número de banhistas</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-blue-300">
            <p className="text-blue-50 italic">
              Documentação adequada é essencial para gestão profissional e proteção legal!
            </p>
          </div>
        </section>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/dashboard/chapter/8')}
            className="inline-flex items-center gap-2 text-[#0072BC] hover:text-[#005a9e] font-semibold transition-colors"
          >
            <ArrowRight className="rotate-180" size={20} />
            Voltar para o Módulo 8
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ApostilaModulo8;
