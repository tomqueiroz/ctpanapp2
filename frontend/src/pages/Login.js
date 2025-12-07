import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Lock, Mail, Eye, EyeOff, Video, FileText, MessageCircle, Award, AlertCircle, Phone, MessageSquare, ChevronRight } from 'lucide-react';

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Implementar lógica de autenticação completa com backend
    // Por enquanto, redireciona direto para área logada
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={null} />

      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-[#0072BC] to-[#005a9e] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Portal do Aluno CTP</h1>
            <p className="text-xl">Acesse seus cursos e conteúdos exclusivos da ANAPP. Faça login para continuar sua jornada de aprendizado.</p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Login Form */}
          <div>
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Login</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">E-mail ou Usuário</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0072BC] focus:border-transparent"
                      placeholder="Digite seu e-mail"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0072BC] focus:border-transparent"
                      placeholder="Digite sua senha"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="w-4 h-4 text-[#0072BC] border-gray-300 rounded focus:ring-[#0072BC]"
                    />
                    <span className="ml-2 text-gray-700">Lembrar-me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('Funcionalidade de recuperação de senha em desenvolvimento')}
                    className="text-[#0072BC] hover:underline"
                  >
                    Esqueci minha senha
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0072BC] text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all"
                >
                  Entrar
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600 mb-2">Ainda não tem cadastro? Entre em contato com a ANAPP.</p>
                <button
                  onClick={() => navigate('/contato')}
                  className="text-[#0072BC] font-semibold hover:underline"
                >
                  Solicitar acesso
                </button>
              </div>
            </div>

            {/* Dica de Acesso */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="text-[#0072BC] mr-3 shrink-0" size={20} />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Dica de acesso</h4>
                  <p className="text-sm text-gray-700">Para melhor experiência, utilize um computador ou tablet e mantenha seu navegador atualizado.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Benefícios */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Benefícios do Portal do Aluno</h2>
            <div className="space-y-4">
              {[
                {
                  icone: Video,
                  titulo: "Aulas em vídeo exclusivas",
                  descricao: "Acesse todas as videoaulas do seu curso a qualquer momento e de qualquer dispositivo."
                },
                {
                  icone: FileText,
                  titulo: "Material complementar",
                  descricao: "Baixe apostilas, planilhas e outros materiais exclusivos para aprofundar seus estudos."
                },
                {
                  icone: MessageCircle,
                  titulo: "Fórum de discussão",
                  descricao: "Interaja com outros alunos e instrutores para esclarecer dúvidas e compartilhar experiências."
                },
                {
                  icone: Award,
                  titulo: "Certificados digitais",
                  descricao: "Emita seus certificados de conclusão diretamente pela plataforma após finalizar os cursos."
                }
              ].map((item, index) => {
                const Icone = item.icone;
                return (
                  <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 shrink-0">
                        <Icone className="text-[#0072BC]" size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-2">{item.titulo}</h3>
                        <p className="text-sm text-gray-600">{item.descricao}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Acesse seus cursos */}
            <div className="mt-8 space-y-4">
              <div className="bg-gradient-to-br from-[#0072BC] to-[#005a9e] text-white rounded-xl p-6">
                <h3 className="text-xl font-bold mb-3">CTP Online - Nova Versão</h3>
                <p className="mb-4">O CTP está completamente renovado! Agora com uma plataforma moderna e conteúdo atualizado para formar os melhores profissionais do mercado de piscinas.</p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start text-sm">
                    <ChevronRight className="mr-2 shrink-0" size={16} />
                    Certificação reconhecida em todo o Brasil
                  </li>
                  <li className="flex items-start text-sm">
                    <ChevronRight className="mr-2 shrink-0" size={16} />
                    Conteúdo atualizado com as últimas tendências
                  </li>
                  <li className="flex items-start text-sm">
                    <ChevronRight className="mr-2 shrink-0" size={16} />
                    Professores especialistas do setor
                  </li>
                </ul>
                <button
                  onClick={() => navigate('/dashboard/chapter/1')}
                  className="bg-white text-[#0072BC] px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all w-full"
                >
                  Acessar Plataforma
                </button>
              </div>

              <div className="bg-gradient-to-br from-[#FF6B00] to-[#e55a00] text-white rounded-xl p-6">
                <h3 className="text-xl font-bold mb-3">Certificação Valorizada</h3>
                <p className="mb-4">A certificação CTP está se tornando cada vez mais valiosa e reconhecida no mercado brasileiro de tratamento de piscinas.</p>
                <ul className="space-y-2">
                  <li className="flex items-start text-sm">
                    <ChevronRight className="mr-2 shrink-0" size={16} />
                    Diferencial competitivo no mercado
                  </li>
                  <li className="flex items-start text-sm">
                    <ChevronRight className="mr-2 shrink-0" size={16} />
                    Reconhecimento profissional em todo país
                  </li>
                  <li className="flex items-start text-sm">
                    <ChevronRight className="mr-2 shrink-0" size={16} />
                    Oportunidades exclusivas para certificados
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Instruções de Acesso */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-[#0072BC] mb-8 text-center">Instruções de Acesso</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Como Acessar</h3>
              <ol className="space-y-3">
                {[
                  "Acesse o Portal do Aluno através do site da ANAPP",
                  "Digite seu e-mail/usuário e senha cadastrados",
                  "Clique no botão \"Entrar\"",
                  "Selecione o curso que deseja acessar",
                  "Navegue pelos módulos e materiais disponíveis"
                ].map((item, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-700">
                    <span className="w-6 h-6 bg-[#0072BC] text-white rounded-full flex items-center justify-center text-xs mr-3 shrink-0">{index + 1}</span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Primeiro Acesso</h3>
              <p className="text-sm text-gray-600 mb-4">Para realizar seu primeiro acesso, siga estas instruções:</p>
              <ol className="space-y-3">
                {[
                  "Verifique seu e-mail após a confirmação da matrícula",
                  "Localize o e-mail com o assunto \"Boas-vindas ao CTP\"",
                  "Clique no link de primeiro acesso contido no e-mail",
                  "Crie uma senha forte seguindo os requisitos",
                  "Complete seu perfil com informações pessoais",
                  "Comece a acessar os conteúdos do curso"
                ].map((item, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-700">
                    <span className="w-6 h-6 bg-[#0072BC] text-white rounded-full flex items-center justify-center text-xs mr-3 shrink-0">{index + 1}</span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Recuperação de Senha</h3>
              <p className="text-sm text-gray-600 mb-4">Esqueceu sua senha? Siga estes passos para recuperá-la:</p>
              <ol className="space-y-3">
                {[
                  "Clique no link \"Esqueci minha senha\"",
                  "Informe o e-mail cadastrado no sistema",
                  "Verifique sua caixa de entrada (e pasta de spam)",
                  "Clique no link de redefinição enviado",
                  "Crie uma nova senha seguindo os requisitos",
                  "Faça login com sua nova senha"
                ].map((item, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-700">
                    <span className="w-6 h-6 bg-[#0072BC] text-white rounded-full flex items-center justify-center text-xs mr-3 shrink-0">{index + 1}</span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Suporte */}
        <div className="mt-16 bg-white rounded-xl p-8 shadow-md">
          <h2 className="text-2xl font-bold text-[#0072BC] mb-8 text-center">Suporte ao Aluno</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="text-green-600" size={32} />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">WhatsApp</h4>
              <p className="text-2xl font-bold text-[#0072BC] mb-2">(11) 99000-1750</p>
              <p className="text-sm text-gray-600">Atendimento rápido em horário comercial</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="text-[#0072BC]" size={32} />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">E-mail</h4>
              <p className="text-lg font-bold text-[#0072BC] mb-2">suporte.aluno@anapp.org.br</p>
              <p className="text-sm text-gray-600">Resposta em até 24 horas úteis</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="text-[#FF6B00]" size={32} />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Telefone</h4>
              <p className="text-2xl font-bold text-[#0072BC] mb-2">(11) 5687-7888</p>
              <p className="text-sm text-gray-600">Segunda a sexta, das 9h às 18h</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <h3 className="font-bold text-gray-900 mb-4">Precisa de ajuda?</h3>
            <button
              onClick={() => navigate('/contato')}
              className="bg-[#0072BC] text-white py-3 px-8 rounded-lg font-semibold hover:bg-opacity-90 transition-all"
            >
              Enviar Mensagem
            </button>
          </div>
        </div>
      </div>

      <Footer user={null} />
    </div>
  );
}

export default Login;
