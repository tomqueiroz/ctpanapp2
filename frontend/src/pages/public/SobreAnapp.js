import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Users, Award, Building, TrendingUp } from 'lucide-react';

function SobreAnapp() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={null} />
      
      <section id="sobre" className="pt-24 pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[#0072BC] mb-4">Sobre a ANAPP</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Associação Nacional das Empresas e Profissionais de Piscinas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl font-bold text-[#0072BC] mb-6">Nossa História</h2>
              <p className="text-gray-600 mb-4">
                Fundada em 1999, a ANAPP é a principal associação do setor de piscinas e spas do Brasil, promovendo a capacitação profissional e o desenvolvimento do mercado.
              </p>
              <p className="text-gray-600 mb-4">
                Representamos fabricantes, lojistas, construtores, engenheiros, arquitetos e tratadores de piscina em todo o país.
              </p>
              <p className="text-gray-600">
                Nosso compromisso é com a excelência técnica e a valorização dos profissionais do setor.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-[#0072BC] text-white p-6 rounded-lg">
                <Users size={40} className="mb-4" />
                <div className="text-3xl font-bold mb-2">5.000+</div>
                <div className="text-sm">Profissionais Certificados</div>
              </div>
              <div className="bg-[#FF6B00] text-white p-6 rounded-lg">
                <Award size={40} className="mb-4" />
                <div className="text-3xl font-bold mb-2">25+</div>
                <div className="text-sm">Anos de Experiência</div>
              </div>
              <div className="bg-[#0072BC] text-white p-6 rounded-lg">
                <Building size={40} className="mb-4" />
                <div className="text-3xl font-bold mb-2">300+</div>
                <div className="text-sm">Empresas Associadas</div>
              </div>
              <div className="bg-[#FF6B00] text-white p-6 rounded-lg">
                <TrendingUp size={40} className="mb-4" />
                <div className="text-3xl font-bold mb-2">100%</div>
                <div className="text-sm">Compromisso</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-8 mb-16">
            <h2 className="text-2xl font-bold text-[#0072BC] mb-6">Missão, Visão e Valores</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-bold text-[#0072BC] mb-3">Missão</h3>
                <p className="text-gray-600">
                  Promover o desenvolvimento e a qualificação profissional no setor de piscinas, estabelecendo padrões de excelência.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0072BC] mb-3">Visão</h3>
                <p className="text-gray-600">
                  Ser referência nacional em capacitação técnica e representatividade do setor de piscinas e bem-estar aquático.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0072BC] mb-3">Valores</h3>
                <p className="text-gray-600">
                  Ética, profissionalismo, inovação, qualidade e compromisso com a excelência técnica.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer user={null} />
    </div>
  );
}

export default SobreAnapp;