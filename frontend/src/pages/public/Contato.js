import React, { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

function Contato() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    alert('Mensagem enviada! Entraremos em contato em breve.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={null} />
      
      <section id="contato" className="pt-24 pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[#0072BC] mb-4">Entre em Contato</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Estamos aqui para ajudar. Envie sua mensagem ou utilize um dos canais abaixo.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-[#0072BC] mb-6">Informações de Contato</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-[#0072BC]/10 rounded-full flex items-center justify-center mr-4 shrink-0">
                    <MapPin className="text-[#0072BC]" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Endereço</h3>
                    <p className="text-gray-600">Av. Queiroz Filho, 1700 Sala 807 D<br/>Villa Lobos Office Park<br/>Vila Leopoldina - São Paulo, SP<br/>CEP: 05319-000</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-[#0072BC]/10 rounded-full flex items-center justify-center mr-4 shrink-0">
                    <Phone className="text-[#0072BC]" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Telefone</h3>
                    <p className="text-gray-600">(11) 5687-7888</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-[#0072BC]/10 rounded-full flex items-center justify-center mr-4 shrink-0">
                    <MessageCircle className="text-[#0072BC]" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">WhatsApp</h3>
                    <a href="https://wa.me/5511990001750" className="text-[#0072BC] hover:underline">(11) 99000-1750</a>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-[#0072BC]/10 rounded-full flex items-center justify-center mr-4 shrink-0">
                    <Mail className="text-[#0072BC]" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">E-mail</h3>
                    <a href="mailto:contato@anapp.org.br" className="text-[#0072BC] hover:underline">contato@anapp.org.br</a>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <h3 className="font-bold text-gray-900 mb-4">Horário de Atendimento</h3>
                <p className="text-gray-600">Segunda a Sexta: 9h às 18h</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-[#0072BC] mb-6">Envie sua Mensagem</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0072BC]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">E-mail *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0072BC]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0072BC]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assunto *</label>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0072BC]"
                  >
                    <option value="">Selecione um assunto</option>
                    <option value="curso">Informações sobre o curso CTP</option>
                    <option value="matricula">Matrícula e pagamento</option>
                    <option value="certificado">Certificado</option>
                    <option value="suporte">Suporte técnico</option>
                    <option value="outro">Outro assunto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mensagem *</label>
                  <textarea
                    required
                    rows="5"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0072BC]"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#0072BC] text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-sm active:scale-95"
                >
                  Enviar Mensagem
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      
      <Footer user={null} />
    </div>
  );
}

export default Contato;