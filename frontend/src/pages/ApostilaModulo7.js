import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoggedInHeader from '../components/LoggedInHeader';
import Footer from '../components/Footer';
import { Download, BookOpen, CheckCircle2, AlertTriangle, Lightbulb, Wrench, Settings, ArrowRight, Shield } from 'lucide-react';
import { generateApostilaPDF } from '../utils/pdfGenerator';

function ApostilaModulo7({ user = { name: 'Aluno' } }) {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    
    const result = await generateApostilaPDF('apostila-content', 7, 'Solucao-Problemas');
    
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
            <Wrench size={40} />
            <div>
              <p className="text-blue-100 text-sm font-medium">Módulo 7</p>
              <h1 className="text-4xl font-bold">Solução de Problemas e Manutenção</h1>
            </div>
          </div>
          <p className="text-blue-50 text-lg mt-4">
            Aprenda a diagnosticar e resolver os problemas mais comuns em piscinas e sistemas de tratamento.
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
        
        {/* Atenção Profissional */}
        <section className="bg-red-50 border-2 border-red-300 rounded-xl p-8 mb-8">
          <div className="flex items-start gap-4">
            <Shield className="text-red-600 flex-shrink-0 mt-1" size={32} />
            <div>
              <h2 className="text-2xl font-bold text-red-900 mb-4">⚠️ Atenção Profissional</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Um profissional de piscina <strong>nunca deve executar uma tarefa para a qual ele não é qualificado</strong>, e isso também se aplica a outros profissionais.
              </p>
              <p className="text-gray-700 mb-4">
                Sempre recorra a um técnico qualificado ou empresa prestadora de serviços para realizar trabalhos de reparo e substituição de peças ou equipamentos.
              </p>
              <div className="bg-white p-4 rounded-lg mt-4">
                <p className="font-semibold text-gray-800 mb-2">Isso se aplica principalmente para:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Equipamentos elétricos</li>
                  <li>Aquecedores a gás</li>
                  <li>Sistemas de automação</li>
                  <li>Reparos estruturais complexos</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Plano de Manutenção */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Settings className="text-[#0072BC]" size={28} />
            Plano de Manutenção
          </h2>
          
          <p className="text-gray-700 mb-6 leading-relaxed">
            Cada piscina e spa deve ter um plano estruturado de manutenção. Com isso, o profissional terá um histórico bem definido para cuidar da instalação.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-[#0072BC] mb-3">✓ Plano Preventivo</h3>
              <p className="text-sm text-gray-700">
                Manutenção programada antes de ocorrer falhas
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-semibold text-green-700 mb-3">✓ Relatório de Ocorrências</h3>
              <p className="text-sm text-gray-700">
                Registro de todas as falhas e problemas encontrados
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="font-semibold text-purple-700 mb-3">✓ Soluções Adotadas</h3>
              <p className="text-sm text-gray-700">
                Documentação das ações tomadas para cada problema
              </p>
            </div>
          </div>
        </section>

        {/* Sistema de Circulação */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Tool className="text-[#FF6B00]" size={28} />
            Sistema de Circulação
          </h2>
          
          <p className="text-gray-700 mb-6">
            Entenda o fluxo da água no sistema para diagnosticar problemas corretamente:
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3 border-l-4 border-[#0072BC] pl-4">
              <span className="font-bold text-[#0072BC] text-lg">1.</span>
              <div>
                <h3 className="font-semibold text-gray-800">Skimmer (Sucção Superficial)</h3>
                <p className="text-sm text-gray-600">Aspira água e detritos da superfície</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 border-l-4 border-[#0072BC] pl-4">
              <span className="font-bold text-[#0072BC] text-lg">2.</span>
              <div>
                <h3 className="font-semibold text-gray-800">Dreno de Fundo (Sucção Profunda)</h3>
                <p className="text-sm text-gray-600">Remove água e sedimentos do fundo</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 border-l-4 border-[#0072BC] pl-4">
              <span className="font-bold text-[#0072BC] text-lg">3.</span>
              <div>
                <h3 className="font-semibold text-gray-800">Bomba</h3>
                <p className="text-sm text-gray-600">Move a água através do sistema</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 border-l-4 border-[#0072BC] pl-4">
              <span className="font-bold text-[#0072BC] text-lg">4.</span>
              <div>
                <h3 className="font-semibold text-gray-800">Filtro</h3>
                <p className="text-sm text-gray-600">Remove impurezas e sujeira da água</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 border-l-4 border-[#0072BC] pl-4">
              <span className="font-bold text-[#0072BC] text-lg">5.</span>
              <div>
                <h3 className="font-semibold text-gray-800">Aquecedor (se houver)</h3>
                <p className="text-sm text-gray-600">Aquece a água antes de retornar</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 border-l-4 border-[#0072BC] pl-4">
              <span className="font-bold text-[#0072BC] text-lg">6.</span>
              <div>
                <h3 className="font-semibold text-gray-800">Retornos</h3>
                <p className="text-sm text-gray-600">Devolve água limpa e tratada para a piscina</p>
              </div>
            </div>
          </div>
        </section>

        {/* Bombas e Motores */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Bombas e Motores</h2>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6">
            <p className="text-gray-700">
              <strong>▲ IMPORTANTE!</strong> Produtos químicos emitem gases corrosivos e <strong>nunca devem ser armazenados perto de motores e bombas</strong>.
            </p>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="text-red-600" size={24} />
                Problemas Comuns - Motor Não Liga
              </h3>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="font-semibold text-gray-800 mb-3">Verificações básicas:</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-green-600" size={18} />
                    <span className="text-gray-700">Tensão elétrica adequada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-green-600" size={18} />
                    <span className="text-gray-700">Disjuntores e fusíveis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-green-600" size={18} />
                    <span className="text-gray-700">Conexões soltas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-green-600" size={18} />
                    <span className="text-gray-700">Temporizador funcionando</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-green-600" size={18} />
                    <span className="text-gray-700">Capacitor em bom estado</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="text-orange-600" size={24} />
                Problemas Comuns - Superaquecimento
              </h3>
              
              <div className="bg-orange-50 p-6 rounded-lg">
                <p className="font-semibold text-gray-800 mb-3">Causas principais:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Potência insuficiente para a carga</li>
                  <li>Ventilação inadequada na casa de máquinas</li>
                  <li>Sobrecarga do motor</li>
                  <li>Falta de manutenção (poeira acumulada)</li>
                  <li>Rolamentos desgastados</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Filtros */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Filtros</h2>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Areia</h3>
              <p className="text-sm text-gray-700">Mais comum e econômico</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Cartucho</h3>
              <p className="text-sm text-gray-700">Fácil manutenção</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">Diatomáceas</h3>
              <p className="text-sm text-gray-700">Maior eficiência</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-4">Manutenção do Filtro:</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-blue-600" size={18} />
                <span className="text-gray-700">Retrolavagem regular (quando o manômetro indicar)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-blue-600" size={18} />
                <span className="text-gray-700">Verificar manômetro diariamente</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-blue-600" size={18} />
                <span className="text-gray-700">Trocar areia a cada 3-5 anos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-blue-600" size={18} />
                <span className="text-gray-700">Limpar válvula multivias periodicamente</span>
              </div>
            </div>
          </div>
        </section>

        {/* Limpeza do Cesto Pré-Filtro */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Limpeza do Cesto Pré-Filtro</h2>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg mb-6">
            <p className="text-gray-700 mb-4">
              <strong>Frequência:</strong> Limpe o cesto semanalmente ou quando necessário.
            </p>
            
            <h3 className="font-semibold text-gray-800 mb-3">Procedimento:</h3>
            <ol className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-[#0072BC] text-white rounded-full flex items-center justify-center font-bold">1</span>
                <span className="text-gray-700 pt-1">Desligue a bomba</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-[#0072BC] text-white rounded-full flex items-center justify-center font-bold">2</span>
                <span className="text-gray-700 pt-1">Abra a tampa do pré-filtro</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-[#0072BC] text-white rounded-full flex items-center justify-center font-bold">3</span>
                <span className="text-gray-700 pt-1">Retire o cesto</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-[#0072BC] text-white rounded-full flex items-center justify-center font-bold">4</span>
                <span className="text-gray-700 pt-1">Remova detritos</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-[#0072BC] text-white rounded-full flex items-center justify-center font-bold">5</span>
                <span className="text-gray-700 pt-1">Lave com água corrente</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-[#0072BC] text-white rounded-full flex items-center justify-center font-bold">6</span>
                <span className="text-gray-700 pt-1">Recoloque e feche bem</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-[#0072BC] text-white rounded-full flex items-center justify-center font-bold">7</span>
                <span className="text-gray-700 pt-1">Ligue a bomba</span>
              </li>
            </ol>
          </div>
        </section>

        {/* Problemas na Água */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Diagnóstico de Problemas na Água</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#0072BC] text-white">
                  <th className="border border-gray-300 px-4 py-3 text-left">Problema</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">Causa</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">Solução</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-semibold text-green-700">Água Verde</td>
                  <td className="border border-gray-300 px-4 py-3">Algas</td>
                  <td className="border border-gray-300 px-4 py-3">Choque de cloro + algicida</td>
                </tr>
                <tr className="bg-gray-50 hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-3 font-semibold text-blue-700">Água Turva</td>
                  <td className="border border-gray-300 px-4 py-3">Filtração inadequada</td>
                  <td className="border border-gray-300 px-4 py-3">Limpar filtro, ajustar pH</td>
                </tr>
                <tr className="bg-white hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-semibold text-orange-700">Manchas</td>
                  <td className="border border-gray-300 px-4 py-3">Metais ou orgânico</td>
                  <td className="border border-gray-300 px-4 py-3">Sequestrante ou escovação</td>
                </tr>
                <tr className="bg-gray-50 hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-3 font-semibold text-purple-700">Espuma</td>
                  <td className="border border-gray-300 px-4 py-3">Produtos inadequados</td>
                  <td className="border border-gray-300 px-4 py-3">Trocar água parcialmente</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Boas Práticas */}
        <section className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-sm p-8 mb-8 border-2 border-yellow-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Lightbulb className="text-yellow-600" size={28} />
            Dicas Importantes
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Nunca execute tarefas sem qualificação adequada</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Mantenha histórico de manutenções</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Consulte manuais dos fabricantes</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Limpe cesto pré-filtro semanalmente</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Faça retrolavagem do filtro regularmente</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Mantenha produtos químicos longe de equipamentos elétricos</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Diagnostique problemas antes de agir</p>
            </div>
          </div>
        </section>

        {/* Resumo */}
        <section className="bg-gradient-to-r from-[#0072BC] to-[#005a9e] text-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <BookOpen size={28} />
            Resumo do Capítulo 7
          </h2>
          
          <p className="text-blue-50 mb-6">
            A solução de problemas requer conhecimento técnico, ferramentas adequadas e, acima de tudo, bom senso para saber quando chamar um especialista.
          </p>
          
          <div className="bg-blue-900 bg-opacity-30 p-6 rounded-lg">
            <p className="text-blue-50 italic">
              "Prevenir é sempre melhor e mais econômico do que remediar!"
            </p>
          </div>
        </section>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/dashboard/chapter/7')}
            className="inline-flex items-center gap-2 text-[#0072BC] hover:text-[#005a9e] font-semibold transition-colors"
          >
            <ArrowRight className="rotate-180" size={20} />
            Voltar para o Módulo 7
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ApostilaModulo7;
