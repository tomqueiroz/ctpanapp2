import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoggedInHeader from '../components/LoggedInHeader';
import Footer from '../components/Footer';
import { Download, BookOpen, CheckCircle2, Wrench, Calendar, ClipboardList } from 'lucide-react';
import { generateApostilaPDF } from '../utils/pdfGenerator';

function ApostilaModulo9({ user = { name: 'Aluno' } }) {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    const result = await generateApostilaPDF('apostila-content', 9, 'Sistemas-Manutencao');
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
            <Wrench size={40} />
            <div>
              <p className="text-blue-100 text-sm font-medium">Módulo 9</p>
              <h1 className="text-4xl font-bold">Sistemas de Manutenção</h1>
            </div>
          </div>
          <p className="text-blue-50 text-lg mt-4">
            Entenda os três tipos de manutenção e como implementar um plano eficaz.
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
            Os Três Tipos de Manutenção
          </h2>
          
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#0072BC] text-white">
                  <th className="p-3 text-left">Tipo</th>
                  <th className="p-3 text-left">Quando</th>
                  <th className="p-3 text-left">Custo</th>
                  <th className="p-3 text-left">Características</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 font-semibold">Preventiva (MP)</td>
                  <td className="p-3 text-gray-700">Antes da falha</td>
                  <td className="p-3 text-green-600 font-semibold">Baixo</td>
                  <td className="p-3 text-gray-700">Programada, planejada, evita problemas</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-3 font-semibold">Corretiva (MC)</td>
                  <td className="p-3 text-gray-700">Após falha</td>
                  <td className="p-3 text-red-600 font-semibold">Alto</td>
                  <td className="p-3 text-gray-700">Emergencial, paralisação, peças caras</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-semibold">Preditiva (MPR)</td>
                  <td className="p-3 text-gray-700">Monitora</td>
                  <td className="p-3 text-yellow-600 font-semibold">Médio</td>
                  <td className="p-3 text-gray-700">Antecipa, dados, inspeções periódicas</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6">
            <h3 className="text-xl font-bold text-green-900 mb-2">✓ Qual é a Melhor?</h3>
            <p className="text-gray-700">
              A manutenção preventiva é sempre a mais econômica e eficiente a longo prazo!
            </p>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <ClipboardList className="text-[#0072BC]" size={28} />
            Fatores a Considerar
          </h2>
          <p className="text-gray-700 mb-4">Ao estabelecer um plano de manutenção, considere:</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-[#0072BC] flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Design e tipo de instalação</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-[#0072BC] flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Número e idade das piscinas e spas</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-[#0072BC] flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Duração do período anual de operação (temporada)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-[#0072BC] flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Necessidade de gerar receita</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-[#0072BC] flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Tamanho e capacidade do pessoal</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-[#0072BC] flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Natureza, propósito e missão da instalação</span>
            </li>
          </ul>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Primeiros Passos - Arquivo Permanente</h2>
          <p className="text-gray-700 mb-4">
            Para desenvolver um plano de manutenção, é importante manter um arquivo permanente com:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">Projetos e desenhos de engenharia originais</h3>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">Especificações dos equipamentos</h3>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">Valores e parâmetros de operação</h3>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">Manuais de instalação e operação</h3>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Calendar className="text-[#0072BC]" size={28} />
            O Plano de Manutenção
          </h2>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Etapas para Desenvolver:</h3>
          <ol className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="bg-[#0072BC] text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">1</div>
              <span className="text-gray-700 mt-1">Inventariar todos os equipamentos e itens</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-[#0072BC] text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">2</div>
              <span className="text-gray-700 mt-1">Categorizar por função (externos, casa máquinas, segurança, etc)</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-[#0072BC] text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">3</div>
              <span className="text-gray-700 mt-1">Identificar o que precisa inspeção periódica</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-[#0072BC] text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">4</div>
              <span className="text-gray-700 mt-1">Desenvolver calendário baseado em manuais</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-[#0072BC] text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">5</div>
              <span className="text-gray-700 mt-1">Definir periodicidade (diária, semanal, mensal, anual)</span>
            </li>
          </ol>

          <div className="mt-6 bg-blue-100 p-6 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-2">💡 Argumento Profissional</h3>
            <p className="text-gray-700">
              Informe seus superiores: é melhor e geralmente menos dispendioso ter um plano de manutenção 
              preventivo bem preparado do que aguardar até que componentes quebrem ou necessitem de reparo.
            </p>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Formulário de Inventário</h2>
          <p className="text-gray-700 mb-4">Informações a Registrar para Cada Equipamento:</p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left border">Campo</th>
                  <th className="p-3 text-left border">Descrição</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border font-semibold">Nome do equipamento</td>
                  <td className="p-3 border text-gray-700">Exemplo: bomba, filtro, aquecedor</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-3 border font-semibold">Nome do fabricante</td>
                  <td className="p-3 border text-gray-700">Marca do equipamento</td>
                </tr>
                <tr>
                  <td className="p-3 border font-semibold">Número do modelo</td>
                  <td className="p-3 border text-gray-700">Modelo específico</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-3 border font-semibold">Custo de aquisição</td>
                  <td className="p-3 border text-gray-700">Valor de um novo equipamento</td>
                </tr>
                <tr>
                  <td className="p-3 border font-semibold">Contato do fabricante</td>
                  <td className="p-3 border text-gray-700">Telefone, site, e-mail</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-3 border font-semibold">Contato do fornecedor</td>
                  <td className="p-3 border text-gray-700">Onde comprar/fazer manutenção</td>
                </tr>
                <tr>
                  <td className="p-3 border font-semibold">Procedimentos de manutenção</td>
                  <td className="p-3 border text-gray-700">O que fazer e como</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-3 border font-semibold">Periodicidade</td>
                  <td className="p-3 border text-gray-700">Semanal, trimestral, anual</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Rotina Diária</h2>
          <p className="text-gray-700 mb-4">Verificar a qualidade da água é uma tarefa diária em uma piscina ou spa.</p>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Checklist Diário:</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Testar pH e cloro livre</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Verificar temperatura da água</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Inspecionar limpidez (aspecto visual)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Verificar volume da água</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Limpar cesto pré-filtro</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Verificar pressão do filtro (manômetro)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Verificar vazão e taxa de filtração</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Registrar número de banhistas</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Anotar todas as informações no livro</span>
            </li>
          </ul>
        </section>

        <section className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Resumo Capítulo 9</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-bold text-[#0072BC] mb-2">MP - Preventiva</h3>
              <p className="text-gray-700 text-sm">Programada, menor custo, melhor opção</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-bold text-[#0072BC] mb-2">MC - Corretiva</h3>
              <p className="text-gray-700 text-sm">Após falha, maior custo, emergencial</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-bold text-[#0072BC] mb-2">MPR - Preditiva</h3>
              <p className="text-gray-700 text-sm">Monitora dados, antecipa problemas</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-bold text-[#0072BC] mb-2">Plano</h3>
              <p className="text-gray-700 text-sm">Inventário + categorização + calendário</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-bold text-[#0072BC] mb-2">Inventário</h3>
              <p className="text-gray-700 text-sm">Registrar todos equipamentos e dados técnicos</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-bold text-[#0072BC] mb-2">Rotina Diária</h3>
              <p className="text-gray-700 text-sm">Testes, inspeções, registros</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-2xl font-bold text-[#0072BC] mb-2">Parabéns!</p>
            <p className="text-gray-700">Você completou o Capítulo 9</p>
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
}

export default ApostilaModulo9;
