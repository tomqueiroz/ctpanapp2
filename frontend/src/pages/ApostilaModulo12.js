import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoggedInHeader from '../components/LoggedInHeader';
import Footer from '../components/Footer';
import { Download, BookOpen, CheckCircle2, Award, Trophy, GraduationCap, Star } from 'lucide-react';
import { generateApostilaPDF } from '../utils/pdfGenerator';

function ApostilaModulo12({ user = { name: 'Aluno' } }) {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    const result = await generateApostilaPDF('apostila-content', 12, 'Certificacao-Final');
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
            <Trophy size={40} />
            <div>
              <p className="text-blue-100 text-sm font-medium">Módulo 12</p>
              <h1 className="text-4xl font-bold">Certificação Final CTP</h1>
            </div>
          </div>
          <p className="text-blue-50 text-lg mt-4">
            Parabéns por chegar até aqui! Prepare-se para a certificação profissional.
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
        
        <section className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-8 mb-8">
          <div className="text-center mb-6">
            <Award className="mx-auto text-[#0072BC] mb-4" size={64} />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Certificação Profissional CTP</h2>
            <p className="text-gray-700 text-lg">
              Você está prestes a concluir sua jornada como Técnico de Piscinas certificado pela ANAPP
            </p>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <BookOpen className="text-[#0072BC]" size={28} />
            O que você aprendeu neste curso
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Módulo 1 - Cálculos</h3>
                <p className="text-gray-700 text-sm">Fundamentos matemáticos essenciais para cálculo de volume, área e conversões</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Módulo 2 - Volume e Capacidade</h3>
                <p className="text-gray-700 text-sm">Cálculos avançados para formatos especiais de piscinas</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Módulo 3 - Desinfecção e Produtos Químicos</h3>
                <p className="text-gray-700 text-sm">Tipos de cloro, dosagens e certificações de produtos</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Módulo 4 - Equilíbrio Químico da Água</h3>
                <p className="text-gray-700 text-sm">Alcalinidade, pH, dureza e Índice de Langelier</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Módulo 5 - Dosagem e Aplicação</h3>
                <p className="text-gray-700 text-sm">Cálculos práticos e técnicas de aplicação segura</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Módulo 6 - Segurança das Instalações</h3>
                <p className="text-gray-700 text-sm">Normas ABNT NBR 10.339 e procedimentos de segurança</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Módulo 7 - Manutenção</h3>
                <p className="text-gray-700 text-sm">Rotinas preventivas e corretivas</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Módulo 8 - Segurança e Normas</h3>
                <p className="text-gray-700 text-sm">Legislação e padrões técnicos</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Módulo 9 - Sistemas de Manutenção</h3>
                <p className="text-gray-700 text-sm">Preventiva, corretiva e preditiva</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Módulo 10 - Norma ABNT NBR 10.339</h3>
                <p className="text-gray-700 text-sm">Classificação de piscinas e requisitos técnicos</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Módulo 11 - Circulação de Água</h3>
                <p className="text-gray-700 text-sm">Sistemas de recirculação e filtragem</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <GraduationCap className="text-[#0072BC]" size={28} />
            Sobre a Certificação
          </h2>
          
          <div className="space-y-4">
            <p className="text-gray-700">
              A certificação CTP (Curso Técnico de Piscinas) da ANAPP é reconhecida nacionalmente e 
              atesta sua competência profissional para atuar na manutenção e gestão de piscinas.
            </p>
            
            <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Requisitos para Certificação:</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <Star className="text-[#FF6B00] flex-shrink-0 mt-1" size={20} />
                <span className="text-gray-700">Conclusão de todos os 12 módulos do curso</span>
              </li>
              <li className="flex items-start gap-3">
                <Star className="text-[#FF6B00] flex-shrink-0 mt-1" size={20} />
                <span className="text-gray-700">Aprovação em todas as avaliações práticas</span>
              </li>
              <li className="flex items-start gap-3">
                <Star className="text-[#FF6B00] flex-shrink-0 mt-1" size={20} />
                <span className="text-gray-700">Nota mínima de 70% na prova final</span>
              </li>
              <li className="flex items-start gap-3">
                <Star className="text-[#FF6B00] flex-shrink-0 mt-1" size={20} />
                <span className="text-gray-700">Participação em todas as atividades práticas</span>
              </li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Benefícios da Certificação:</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
                <span className="text-gray-700">Reconhecimento profissional nacional</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
                <span className="text-gray-700">Diferencial competitivo no mercado</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
                <span className="text-gray-700">Acesso a rede de profissionais certificados ANAPP</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
                <span className="text-gray-700">Credibilidade junto a clientes e empregadores</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
                <span className="text-gray-700">Atualização profissional contínua</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Próximos Passos</h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-[#0072BC] pl-4 py-2">
              <h3 className="font-bold text-gray-900 mb-1">1. Revisão Final</h3>
              <p className="text-gray-700 text-sm">Revise todos os módulos e suas anotações</p>
            </div>

            <div className="border-l-4 border-[#0072BC] pl-4 py-2">
              <h3 className="font-bold text-gray-900 mb-1">2. Prova Teórica</h3>
              <p className="text-gray-700 text-sm">Realize a avaliação final com questões de todos os módulos</p>
            </div>

            <div className="border-l-4 border-[#0072BC] pl-4 py-2">
              <h3 className="font-bold text-gray-900 mb-1">3. Prova Prática</h3>
              <p className="text-gray-700 text-sm">Demonstre suas habilidades em situações reais</p>
            </div>

            <div className="border-l-4 border-[#0072BC] pl-4 py-2">
              <h3 className="font-bold text-gray-900 mb-1">4. Recebimento do Certificado</h3>
              <p className="text-gray-700 text-sm">Após aprovação, receba seu certificado oficial CTP-ANAPP</p>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-[#0072BC] to-[#005a9e] text-white rounded-xl p-8 mb-8">
          <div className="text-center">
            <Trophy className="mx-auto mb-4" size={64} />
            <h2 className="text-3xl font-bold mb-4">Parabéns pela Dedicação!</h2>
            <p className="text-lg mb-4">
              Você demonstrou comprometimento e profissionalismo ao completar todos os módulos do curso CTP.
            </p>
            <p className="text-blue-100">
              Agora você está preparado para realizar a prova final e obter sua certificação profissional.
            </p>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Código de Ética Profissional</h2>
          
          <p className="text-gray-700 mb-4">
            Como profissional certificado CTP, você se compromete a:
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-[#0072BC] flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Manter os mais altos padrões de qualidade e segurança</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-[#0072BC] flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Respeitar as normas técnicas e a legislação vigente</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-[#0072BC] flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Atuar com transparência e honestidade</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-[#0072BC] flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Buscar constante atualização profissional</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-[#0072BC] flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Priorizar sempre a segurança dos usuários</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-[#0072BC] flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Contribuir para o desenvolvimento da profissão</p>
            </div>
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
}

export default ApostilaModulo12;
