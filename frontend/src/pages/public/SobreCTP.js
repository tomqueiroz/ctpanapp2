import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { BookOpen, Award, Users, Video, FileText, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function SobreCTP() {
  const navigate = useNavigate();

  const handleInscricao = () => {
    navigate('/contato');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={null} />
      
      <section id="ctp" className="pt-24 pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[#0072BC] mb-4">Curso Técnico de Piscinas (CTP)</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Certificação profissional reconhecida pela ANAPP
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl font-bold text-[#0072BC] mb-6">O que é o CTP?</h2>
              <p className="text-gray-600 mb-4">
                O Curso Técnico de Piscinas (CTP) é o programa de capacitação mais completo e reconhecido do Brasil para profissionais que atuam com manutenção e tratamento de piscinas.
              </p>
              <p className="text-gray-600 mb-4">
                Dividido em 12 capítulos, o curso aborda de forma isenta todos os tipos de tratamento de água, equipamentos, segurança, normas técnicas e muito mais.
              </p>
              <p className="text-gray-600 mb-6">
                Ao concluir o CTP, você estará preparado para atender os clientes mais exigentes e cobrar valores justos pelo seu trabalho profissional.
              </p>
              <button
                onClick={handleInscricao}
                className="bg-[#FF6B00] text-white py-3 px-8 rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-sm active:scale-95"
              >
                Fazer Matrícula Agora
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-[#0072BC]/10 rounded-full flex items-center justify-center mr-4">
                    <BookOpen className="text-[#0072BC]" size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-[#0072BC]">12 Capítulos Completos</h3>
                </div>
                <p className="text-gray-600 text-sm">Conteúdo abrangente cobrindo todos os aspectos técnicos</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-[#0072BC]/10 rounded-full flex items-center justify-center mr-4">
                    <Video className="text-[#0072BC]" size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-[#0072BC]">Vídeo-Aulas Práticas</h3>
                </div>
                <p className="text-gray-600 text-sm">Aprenda com demonstrações reais e exemplos do dia a dia</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-[#0072BC]/10 rounded-full flex items-center justify-center mr-4">
                    <CheckCircle2 className="text-[#0072BC]" size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-[#0072BC]">Testes e Avaliações</h3>
                </div>
                <p className="text-gray-600 text-sm">Valide seu conhecimento com quizzes interativos</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-[#FF6B00]/10 rounded-full flex items-center justify-center mr-4">
                    <Award className="text-[#FF6B00]" size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-[#0072BC]">Certificado Reconhecido</h3>
                </div>
                <p className="text-gray-600 text-sm">Certificação oficial ANAPP após aprovação</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0072BC] text-white rounded-xl p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Invista no seu futuro profissional</h2>
            <p className="text-xl mb-6">Associados ANAPP: R$ 299,00 | Não associados: R$ 600,00</p>
            <button
              onClick={handleInscricao}
              className="bg-[#FF6B00] text-white py-4 px-12 rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-lg active:scale-95"
            >
              Inscrever-se no CTP
            </button>
          </div>
        </div>
      </section>
      
      <Footer user={null} />
    </div>
  );
}

export default SobreCTP;