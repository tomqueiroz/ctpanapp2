import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoggedInHeader from '../components/LoggedInHeader';
import Footer from '../components/Footer';
import { Download, BookOpen, CheckCircle2, AlertTriangle, Shield, Lightbulb, Lock, Eye, HardHat } from 'lucide-react';
import { generateApostilaPDF } from '../utils/pdfGenerator';

function ApostilaModulo6({ user = { name: 'Aluno' } }) {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    const result = await generateApostilaPDF('apostila-content', 6, 'Seguranca-Instalacoes');
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
            <Shield size={40} />
            <div>
              <p className="text-blue-100 text-sm font-medium">Módulo 6</p>
              <h1 className="text-4xl font-bold">Segurança das Instalações Aquáticas</h1>
            </div>
          </div>
          <p className="text-blue-50 text-lg mt-4">
            Compreenda as normas e responsabilidades de segurança em piscinas e spas.
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
            Objetivos deste Capítulo
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Compreender responsabilidades de segurança</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Conhecer normas ABNT NBR 10.339</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Identificar barreiras e proteções necessárias</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Entender sinalização adequada</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700">Aplicar procedimentos de segurança</p>
            </div>
          </div>
        </section>

        <section className="bg-blue-50 border-2 border-blue-300 rounded-xl p-8 mb-8">
          <div className="flex items-start gap-4">
            <AlertTriangle className="text-blue-600 flex-shrink-0 mt-1" size={32} />
            <div>
              <h2 className="text-2xl font-bold text-blue-900 mb-4">Responsabilidade Compartilhada</h2>
              <p className="text-gray-700 mb-3 leading-relaxed">
                De maneira geral, a segurança na água é responsabilidade de todos: indivíduos, pais,
                líderes de grupo, amigos, operadores, salva-vidas, proprietários e gerentes de instalações
                aquáticas.
              </p>
              <p className="text-gray-700 mb-3">
                A imersão em um ambiente de água requer a compreensão sobre segurança sob vários aspectos:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Qualidade da água</li>
                <li>Instalações adequadas</li>
                <li>Supervisão dos usuários</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-red-50 border-2 border-red-300 rounded-xl p-8 mb-8">
          <div className="flex items-start gap-4">
            <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={32} />
            <div>
              <h2 className="text-2xl font-bold text-red-900 mb-4">⚠️ ATENÇÃO: PRODUTOS QUÍMICOS PERIGOSOS</h2>
              <p className="text-gray-700 mb-3 leading-relaxed">
                Muitos dos produtos químicos utilizados para manter a qualidade da água são
                classificados como tóxicos e perigosos, sendo os proprietários de instalações
                aquáticas responsáveis por manter seguro o ambiente recreativo de água.
              </p>
              <p className="text-gray-700 font-semibold">
                Geralmente acidentes relacionados a água e produtos químicos são resultado de
                falha no cumprimento de práticas e padrões de segurança.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Eye className="text-[#0072BC]" size={28} />
            Treinamento e Supervisão
          </h2>
          <p className="text-gray-700 mb-4">
            Programas educacionais contínuos aos profissionais que zelam pelas instalações devem incluir temas como:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">Gerenciamento de Risco Aquático</h3>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">Planejamento de Resposta a Emergências</h3>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">Auditorias Aquáticas</h3>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">Patógenos Transmitidos pelo Sangue</h3>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">Primeiros Socorros</h3>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">RCP (Ressuscitação Cardiopulmonar)</h3>
            </div>
          </div>

          <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <p className="font-bold text-gray-900 mb-2">ATENÇÃO: RISCO CRÍTICO</p>
                <p className="text-gray-700">
                  Deixar uma instalação sem funcionários no local após horas de uso é um
                  comportamento de alto risco.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Lock className="text-[#0072BC]" size={28} />
            Controle de Acesso
          </h2>
          <p className="text-gray-700 mb-4">
            É importante evitar que banhistas fiquem em lugares impróprios. Uma instalação sem ou
            com baixa presença de funcionário representa risco:
          </p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-red-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">No uso inadequado da piscina</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-red-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">No controle de acesso a áreas restritas</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-red-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Crianças não supervisionadas em local de produtos químicos</span>
            </li>
          </ul>

          <div className="bg-blue-100 p-6 rounded-lg">
            <p className="font-bold text-gray-900 mb-2">Lembre-se!</p>
            <ul className="space-y-1 text-gray-700">
              <li>✓ Sinais encorajam uma mudança de comportamento.</li>
              <li>✓ Barreiras são um impedimento.</li>
              <li>✓ Não há substituto para a supervisão!</li>
            </ul>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Shield className="text-[#0072BC]" size={28} />
            Barreiras de Proteção - ABNT NBR 10.339
          </h2>
          <p className="text-gray-700 mb-6">
            ABNT NBR 10.339: É a norma brasileira que estabelece requisitos de segurança para
            projetos, construção e manutenção de piscinas.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-[#0072BC] mb-2">1,10 m</div>
              <p className="text-gray-700 text-sm">Altura Mínima</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-[#0072BC] mb-2">11 cm</div>
              <p className="text-gray-700 text-sm">Abertura Máxima</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-[#0072BC] mb-2">1,50 m</div>
              <p className="text-gray-700 text-sm">Altura da Trava</p>
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-4">Requisitos Obrigatórios:</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Altura mínima de 1,10 m</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Abertura máxima de 11 cm (impedir passagem de crianças)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Dispositivo automático de fechamento</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Travamento de segurança</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Botão/trava a 1,50 m de altura mínima</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Impedir acesso de crianças e animais</span>
            </li>
          </ul>

          <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-4">
            <p className="font-bold text-gray-900 mb-2">▲ IMPORTANTE SABER</p>
            <p className="text-gray-700 mb-2">
              Cercas, portões ou qualquer outro tipo de barreira nunca devem ser considerados
              substitutos da supervisão direta.
            </p>
            <p className="text-gray-700">
              As barreiras só podem agir como impedimentos e nunca devem ser consideradas
              uma garantia de proteção.
            </p>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Capas de Proteção</h2>
          <p className="text-gray-700 mb-6">
            Outro impedimento da entrada não autorizada na piscina ou spa é a capa de proteção.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mb-4">Especificações NBR 10.339:</h3>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Suportar peso mínimo de 40 kg/m²</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Manter-se na superfície da água</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Ancorada sem espaço entre laterais e bordas</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Permitir remoção de água parada</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Material que não cria fungos, algas e micro-organismos</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">Etiquetas de advertência visíveis</span>
            </li>
          </ul>

          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={32} />
              <div>
                <p className="font-bold text-red-900 mb-2">▲ PERIGO MORTAL</p>
                <p className="text-gray-700 mb-2">
                  A piscina NÃO deve ser usada se houver uma capa de proteção instalada.
                </p>
                <p className="text-gray-700 mb-2">
                  É um sério risco de afogamento entrar na água com uma cobertura total ou parcial.
                </p>
                <p className="text-gray-700">
                  A capa deve ser completamente removida antes da entrada de usuários na piscina.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Sinalização Visual</h2>
          <p className="text-gray-700 mb-6">
            A ABNT NBR 10.339 exige alertas de advertência com informações das regras sobre o
            uso das instalações.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Sinalização na Área da Piscina:</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[#FF6B00] mt-1">•</span>
                  <span className="text-gray-700">Profundidade mínima e máxima de água do tanque</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF6B00] mt-1">•</span>
                  <span className="text-gray-700">Realce nos locais de pouca profundidade</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF6B00] mt-1">•</span>
                  <span className="text-gray-700">Permissão ou não de mergulho</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF6B00] mt-1">•</span>
                  <span className="text-gray-700">Quantidade máxima de banhistas por vez</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Sinalização em Áreas Circundantes:</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[#FF6B00] mt-1">•</span>
                  <span className="text-gray-700">Áreas escorregadias</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF6B00] mt-1">•</span>
                  <span className="text-gray-700">Recomendação de usar ducha antes de entrar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF6B00] mt-1">•</span>
                  <span className="text-gray-700">Horário de funcionamento</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF6B00] mt-1">•</span>
                  <span className="text-gray-700">Riscos químicos em locais de armazenamento</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF6B00] mt-1">•</span>
                  <span className="text-gray-700">Telefones de emergência</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Equipamentos de Emergência</h2>
          <p className="text-gray-700 mb-6">Equipamentos Obrigatórios:</p>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
              <Shield className="text-[#0072BC] flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Boia salva-vidas</h3>
                <p className="text-gray-700 text-sm">Circular com corda</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
              <Shield className="text-[#0072BC] flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Vara de resgate</h3>
                <p className="text-gray-700 text-sm">Alcance mínimo 3,6m</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
              <Shield className="text-[#0072BC] flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Kit de primeiros socorros</h3>
                <p className="text-gray-700 text-sm">Completo e atualizado</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
              <Shield className="text-[#0072BC] flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Telefone de emergência</h3>
                <p className="text-gray-700 text-sm">Números visíveis: 192, 193</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <HardHat className="text-[#0072BC]" size={28} />
            EPIs - Equipamentos de Proteção Individual
          </h2>
          <p className="text-gray-700 mb-6">
            EPI: Equipamento de Proteção Individual. São itens que protegem o trabalhador de
            riscos à sua saúde e segurança durante o trabalho.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#0072BC] text-white">
                  <th className="p-3 text-left">EPI</th>
                  <th className="p-3 text-left">Proteção Contra</th>
                  <th className="p-3 text-left">Quando Usar</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 font-semibold">Luvas</td>
                  <td className="p-3 text-gray-700">Produtos químicos</td>
                  <td className="p-3 text-gray-700">Ao manusear qualquer produto</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-3 font-semibold">Óculos</td>
                  <td className="p-3 text-gray-700">Respingos nos olhos</td>
                  <td className="p-3 text-gray-700">Ao aplicar produtos</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-semibold">Máscara</td>
                  <td className="p-3 text-gray-700">Vapores e gases</td>
                  <td className="p-3 text-gray-700">Em áreas de armazenamento</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-3 font-semibold">Avental</td>
                  <td className="p-3 text-gray-700">Respingos no corpo</td>
                  <td className="p-3 text-gray-700">Ao manusear líquidos</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-semibold">Botas</td>
                  <td className="p-3 text-gray-700">Pisos molhados</td>
                  <td className="p-3 text-gray-700">Durante todo o trabalho</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4">
            <p className="font-bold text-gray-900 mb-2">▲ USO OBRIGATÓRIO</p>
            <p className="text-gray-700">
              Nunca manuseie produtos químicos sem EPIs adequados. Acidentes podem causar
              queimaduras graves, problemas respiratórios e danos permanentes.
            </p>
          </div>
        </section>

        <section className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Resumo do Capítulo 6</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-bold text-[#0072BC] mb-2">Responsabilidade</h3>
              <p className="text-gray-700 text-sm">Segurança é de todos: profissionais, proprietários, usuários</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-bold text-[#0072BC] mb-2">Cerca NBR 10.339</h3>
              <p className="text-gray-700 text-sm">Altura 1,10m, abertura max 11cm, trava a 1,50m</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-bold text-[#0072BC] mb-2">Capa de Proteção</h3>
              <p className="text-gray-700 text-sm">40 kg/m², removível, com etiquetas</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-bold text-[#0072BC] mb-2">Sinalização</h3>
              <p className="text-gray-700 text-sm">Profundidade, regras, perigos, emergências</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-bold text-[#0072BC] mb-2">Equipamentos</h3>
              <p className="text-gray-700 text-sm">Boia, vara, primeiros socorros, telefone</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-bold text-[#0072BC] mb-2">EPIs</h3>
              <p className="text-gray-700 text-sm">Luvas, óculos, máscara, avental, botas</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-2xl font-bold text-[#0072BC] mb-2">Parabéns!</p>
            <p className="text-gray-700">Você completou o Capítulo 6 - Segurança das Instalações Aquáticas</p>
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
}

export default ApostilaModulo6;