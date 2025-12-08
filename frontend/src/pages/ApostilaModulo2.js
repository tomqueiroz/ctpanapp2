import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoggedInHeader from '../components/LoggedInHeader';
import Footer from '../components/Footer';
import { Download, BookOpen, CheckCircle2, AlertTriangle, Lightbulb, Droplets, Bug, Shield, Clock, ArrowRight } from 'lucide-react';
import { generateApostilaPDF } from '../utils/pdfGenerator';

function ApostilaModulo2({ user = { name: 'Aluno' } }) {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    
    const result = await generateApostilaPDF('apostila-content', 2, 'Agua-Contaminada');
    
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
            <Droplets size={40} />
            <div>
              <p className="text-blue-100 text-sm font-medium">Módulo 2</p>
              <h1 className="text-4xl font-bold">Água Contaminada e Doenças Relacionadas</h1>
            </div>
          </div>
          <p className="text-blue-50 text-lg mt-4">
            Aprenda sobre os principais contaminantes da água e como prevenir doenças em ambientes aquáticos.
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
        
        {/* Aviso Importante */}
        <section className="bg-red-50 border-2 border-red-300 rounded-xl p-8 mb-8">
          <div className="flex items-start gap-4">
            <Shield className="text-red-600 flex-shrink-0 mt-1" size={32} />
            <div>
              <h2 className="text-2xl font-bold text-red-900 mb-4">⚠️ AVISO IMPORTANTE PARA O PROFISSIONAL</h2>
              <p className="text-gray-700 mb-3 leading-relaxed">
                Neste capítulo, você conhecerá os contaminantes mais comuns encontrados no ambiente de piscina ou spa.
              </p>
              <p className="text-gray-700 mb-3 font-semibold">
                O profissional em momento algum deve apresentar parecer sobre eventual contaminação aos usuários.
              </p>
              <p className="text-gray-700 mb-3">
                Todos os sintomas aqui descritos somente devem ser afirmados por um corpo clínico de médicos.
              </p>
              <p className="text-gray-700">
                Usuários que apresentarem quadros suspeitos devem ser imediatamente encaminhados ao atendimento médico.
              </p>
            </div>
          </div>
        </section>

        {/* Objetivos */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <BookOpen className="text-[#0072BC]" size={28} />
            Objetivos deste Capítulo
          </h2>
          
          <p className="text-gray-700 mb-4">Ao final deste capítulo, você será capaz de:</p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Identificar os principais contaminantes da água</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Conhecer sintomas de doenças relacionadas</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Aplicar procedimentos corretos de desinfecção</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Prevenir acidentes e contaminações</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Calcular tempos de inativação de patógenos</p>
            </div>
          </div>
        </section>

        {/* Como a Água se Contamina */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Como a Água se Contamina</h2>
          
          <p className="text-gray-700 mb-4 leading-relaxed">
            Ao menos ¼ das doenças provenientes da utilização de piscinas são devidas à presença de germes que facilmente são eliminados com cloro.
          </p>
          
          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <h3 className="font-semibold text-[#0072BC] mb-3">Fontes de Contaminação</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#0072BC] text-white">
                    <th className="border border-gray-300 px-4 py-3 text-left">Fonte</th>
                    <th className="border border-gray-300 px-4 py-3 text-left">Exemplos</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-4 py-3 font-semibold">Ar</td>
                    <td className="border border-gray-300 px-4 py-3">Poeira, poluição, esporos de fungos</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-semibold">Solo</td>
                    <td className="border border-gray-300 px-4 py-3">Terra, lama, bactérias do solo</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-4 py-3 font-semibold">Animais</td>
                    <td className="border border-gray-300 px-4 py-3">Fezes de pássaros, pets, insetos</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-semibold">Usuários</td>
                    <td className="border border-gray-300 px-4 py-3">Suor, urina, fezes, saliva, pele</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-4 py-3 font-semibold">Água</td>
                    <td className="border border-gray-300 px-4 py-3">Água de abastecimento já contaminada</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
            <h3 className="font-bold text-yellow-800 mb-2">▲ REGRA DE OURO DA PREVENÇÃO</h3>
            <p className="text-gray-700">
              Pessoas que apresentam ou apresentaram quadros de diarreia nos últimos 7 dias devem ser impedidas de adentrar no ambiente da piscina ou spa.
            </p>
          </div>
        </section>

        {/* PARTE 1: PROTOZOÁRIOS */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Bug className="text-[#FF6B00]" size={28} />
            PARTE 1: PROTOZOÁRIOS
          </h2>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-gray-700">
              <strong>Protozoários:</strong> São organismos unicelulares (formados por apenas uma célula) e microscópicos. Normalmente são transmitidos através da água e por alimentos contaminados.
            </p>
          </div>

          {/* Giardia */}
          <div className="border-l-4 border-green-500 pl-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">1. Giardia</h3>
            <p className="text-gray-700 mb-4">
              Este parasita se hospeda no intestino de pessoas e animais. Cria cistos (casulos) que podem sobreviver fora do intestino durante meses.
            </p>
            
            <div className="bg-green-50 p-5 rounded-lg mb-4">
              <h4 className="font-semibold text-green-700 mb-3">✪ Principais Sintomas:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Flatulência (gases intestinais)</li>
                <li>Náuseas (enjoo, vontade de vomitar)</li>
                <li>Cólicas abdominais (dores na barriga)</li>
                <li>Diarreia</li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Clock size={20} />
                Como Inativar (Eliminar) a Giardia
              </h4>
              <p className="text-blue-100 text-lg">
                <strong>45 minutos</strong> com <strong>1 PPM</strong> de cloro livre
              </p>
              <p className="text-blue-100 text-sm mt-1">pH: 7,5 ou menor</p>
            </div>
          </div>

          {/* Cryptosporidium */}
          <div className="border-l-4 border-red-500 pl-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">2. Cryptosporidium (Crypto)</h3>
            <p className="text-gray-700 mb-4">
              Diferente da Giardia, possui uma camada de proteção externa que permite a sobrevivência em condições de desinfecção por cloro, permanecendo ativo durante dias.
            </p>

            <div className="bg-red-50 border-2 border-red-300 p-5 rounded-lg mb-4">
              <h4 className="font-bold text-red-800 mb-2">▲ MUITO RESISTENTE AO CLORO!</h4>
              <p className="text-gray-700">
                O Crypto é extremamente resistente ao cloro comum. Por isso requer métodos especiais de inativação.
              </p>
            </div>
            
            <div className="bg-red-50 p-5 rounded-lg mb-4">
              <h4 className="font-semibold text-red-700 mb-3">✪ Principais Sintomas:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Cólicas abdominais</li>
                <li>Diarreia (pode ser intensa)</li>
                <li>Febre</li>
                <li>Vômito</li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-5 rounded-lg">
              <h4 className="font-semibold mb-2">Métodos Eficazes de Inativação:</h4>
              <ul className="list-disc list-inside space-y-1 text-purple-100">
                <li>Ozônio (O₃)</li>
                <li>Luz Ultravioleta (UV)</li>
              </ul>
              <p className="text-purple-100 text-sm mt-3">
                ⚠️ Usuários infectados devem permanecer ao menos 2 semanas longe do ambiente da piscina.
              </p>
            </div>
          </div>
        </section>

        {/* PARTE 2: BACTÉRIAS */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Bug className="text-[#FF6B00]" size={28} />
            PARTE 2: BACTÉRIAS
          </h2>
          
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <p className="text-gray-700">
              <strong>Bactérias:</strong> São organismos unicelulares que, em ambientes favoráveis, se multiplicam com facilidade. Os tratamentos com produtos clorados são eficientes no combate das bactérias mais comuns.
            </p>
          </div>

          {/* E. coli */}
          <div className="border-l-4 border-orange-500 pl-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">1. Escherichia coli O157:H7 (E. coli)</h3>
            <p className="text-gray-700 mb-4">
              O tipo O157:H7 produz uma toxina que causa cólicas estomacais fortes, vômitos e diarreias sanguinolentas.
            </p>
            
            <div className="bg-orange-50 p-5 rounded-lg mb-4">
              <h4 className="font-semibold text-orange-700 mb-3">✪ Principais Sintomas:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Cólicas estomacais (dores fortes na barriga)</li>
                <li>Diarreia com sangue</li>
                <li>Vômito</li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-5 rounded-lg">
              <h4 className="font-semibold mb-2">Métodos Eficazes de Inativação:</h4>
              <ul className="list-disc list-inside space-y-1 text-green-100">
                <li>Ácido Hipocloroso (cloro ativo)</li>
                <li>Ozônio</li>
                <li>Luz Ultravioleta</li>
              </ul>
            </div>
          </div>

          {/* Shigella */}
          <div className="border-l-4 border-pink-500 pl-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">2. Shigella</h3>
            <p className="text-gray-700 mb-4">
              Seu contágio é normalmente propagado pela má higiene, principalmente em crianças menores de 4 anos de idade.
            </p>
            
            <div className="bg-pink-50 p-5 rounded-lg mb-4">
              <h4 className="font-semibold text-pink-700 mb-3">✪ Principais Sintomas:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Cólicas estomacais</li>
                <li>Diarreia com sangue</li>
                <li>Febre</li>
              </ul>
              <p className="text-gray-700 text-sm mt-3">
                As diarreias são frequentemente sanguinolentas e cessam entre 5 a 7 dias.
              </p>
            </div>
          </div>
        </section>

        {/* PARTE 3: VÍRUS */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Bug className="text-[#FF6B00]" size={28} />
            PARTE 3: VÍRUS
          </h2>
          
          <div className="bg-purple-50 p-4 rounded-lg mb-6">
            <p className="text-gray-700">
              <strong>Vírus:</strong> Organismos microscópicos que não se multiplicam fora do corpo de um hospedeiro. São menores que bactérias e protozoários.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Norovírus</h3>
              <p className="text-sm text-gray-700">Calafrios, náuseas, diarreia, dores estomacais</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Adenovírus</h3>
              <p className="text-sm text-gray-700">Coceiras, conjuntivite, gastroenterite</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-5 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-2">Hepatite A</h3>
              <p className="text-sm text-gray-700">Dores no fígado, febre, erupções na pele</p>
            </div>
          </div>
        </section>

        {/* Cálculo de Inativação */}
        <section className="bg-gradient-to-r from-[#0072BC] to-[#005a9e] text-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Cálculo de Inativação (Valor CT)</h2>
          
          <div className="bg-white bg-opacity-20 p-6 rounded-lg mb-6">
            <h3 className="text-2xl font-bold text-center mb-2">Valor CT = C × T</h3>
            <p className="text-center text-blue-100">
              C = Cloro livre (PPM) | T = Tempo (minutos)
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white bg-opacity-10 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Cryptosporidium</h4>
              <p className="text-3xl font-bold">15.300</p>
            </div>
            <div className="bg-white bg-opacity-10 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Giardia</h4>
              <p className="text-3xl font-bold">45</p>
            </div>
          </div>

          <div className="bg-yellow-500 text-gray-900 p-5 rounded-lg">
            <h4 className="font-bold mb-2">Exemplo Prático:</h4>
            <p className="mb-2">Piscina contaminada por Giardia, tratamento com 15 PPM:</p>
            <p className="text-lg font-semibold">Tempo = 45 ÷ 15 = 3 minutos</p>
          </div>
        </section>

        {/* Prevenções */}
        <section className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-sm p-8 mb-8 border-2 border-yellow-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Lightbulb className="text-yellow-600" size={28} />
            Medidas Preventivas Essenciais
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Lavar as mãos após utilização dos banheiros</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Instruir crianças a usarem o banheiro antes de entrar</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Não engolir água da piscina ou spa</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Tomar banho antes de entrar na piscina</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Manter níveis adequados de cloro e pH</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Higienizar deck, vestiários e banheiros regularmente</p>
            </div>
          </div>
        </section>

        {/* Resumo */}
        <section className="bg-gradient-to-r from-[#0072BC] to-[#005a9e] text-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <BookOpen size={28} />
            Resumo do Capítulo 2
          </h2>
          
          <div className="space-y-4 text-blue-50">
            <div>
              <h3 className="font-semibold text-lg mb-2">Protozoários:</h3>
              <p>Giardia (45 min, 1PPM) e Crypto (UV/Ozônio)</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Bactérias:</h3>
              <p>E. coli e Shigella (eliminadas com cloro)</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Vírus:</h3>
              <p>Norovírus, Adenovírus, Hepatite A</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Acidentes:</h3>
              <p>20 PPM por 12h em casos de diarreia</p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-blue-300">
            <p className="text-blue-50 italic">
              Você não diagnostica doenças, mas previne contaminações através do tratamento adequado da água!
            </p>
          </div>
        </section>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/dashboard/chapter/2')}
            className="inline-flex items-center gap-2 text-[#0072BC] hover:text-[#005a9e] font-semibold transition-colors"
          >
            <ArrowRight className="rotate-180" size={20} />
            Voltar para o Módulo 2
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ApostilaModulo2;
