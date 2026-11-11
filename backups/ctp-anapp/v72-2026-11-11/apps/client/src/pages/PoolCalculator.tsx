import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator, Droplets, Beaker, Download, Share2, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROUTE_PATHS } from '@/lib/index';
import html2canvas from 'html2canvas';

interface PoolData {
  length: string;
  width: string;
  avgDepth: string;
  volume: string;
  shape: 'rectangular' | 'circular' | 'irregular';
}

interface WaterTest {
  ph: string;
  chlorine: string;
  alkalinity: string;
  hardness: string;
  cyanuricAcid: string;
  temperature: string;
}

interface ChemicalResult {
  name: string;
  status: 'ok' | 'needs_correction' | 'warning';
  action: string;
  priority: 'high' | 'medium' | 'low';
  icon: any;
  measuredValue: string;
  idealRange: string;
  diagnosis: string;
  recommendation: string;
}

export default function PoolCalculator() {
  const navigate = useNavigate();
  const resultRef = useRef<HTMLDivElement>(null);

  const [poolData, setPoolData] = useState<PoolData>({
    length: '',
    width: '',
    avgDepth: '',
    volume: '',
    shape: 'rectangular',
  });

  const [waterTest, setWaterTest] = useState<WaterTest>({
    ph: '',
    chlorine: '',
    alkalinity: '',
    hardness: '',
    cyanuricAcid: '',
    temperature: '',
  });

  const [results, setResults] = useState<ChemicalResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Calcular volume da piscina
  const calculateVolume = () => {
    const l = parseFloat(poolData.length);
    const w = parseFloat(poolData.width);
    const d = parseFloat(poolData.avgDepth);

    if (!l || !w || !d) return;

    let volume = 0;
    if (poolData.shape === 'rectangular') {
      volume = l * w * d;
    } else if (poolData.shape === 'circular') {
      const radius = l / 2;
      volume = Math.PI * radius * radius * d;
    } else {
      volume = l * w * d * 0.85;
    }

    setPoolData({ ...poolData, volume: volume.toFixed(2) });
  };

  // Diagnóstico da água — sem recomendar quantidades específicas
  const calculateChemicals = () => {
    const volume = parseFloat(poolData.volume);
    if (!volume) {
      alert('Por favor, calcule o volume da piscina primeiro.');
      return;
    }

    const ph = parseFloat(waterTest.ph);
    const chlorine = parseFloat(waterTest.chlorine);
    const alkalinity = parseFloat(waterTest.alkalinity);
    const hardness = parseFloat(waterTest.hardness);
    const cyanuric = parseFloat(waterTest.cyanuricAcid);

    const chemicalResults: ChemicalResult[] = [];

    // pH (Ideal: 7.2 - 7.6)
    if (!isNaN(ph)) {
      if (ph < 7.2) {
        chemicalResults.push({
          name: 'pH',
          status: 'needs_correction',
          action: '⬆ NECESSITA CORREÇÃO — pH BAIXO',
          priority: 'high',
          icon: AlertCircle,
          measuredValue: `${ph}`,
          idealRange: '7,2 – 7,6',
          diagnosis: `pH baixo (${ph}). Água ácida pode irritar olhos, pele e corroer equipamentos.`,
          recommendation: 'Utilize produto elevador de pH (ex: barrilha / carbonato de sódio ou similar). Consulte as instruções e dosagem no rótulo do produto escolhido ou no site do fabricante. Adicione gradualmente com bomba circulando e refaça o teste após 4–6h.',
        });
      } else if (ph > 7.6) {
        chemicalResults.push({
          name: 'pH',
          status: 'needs_correction',
          action: '⬇ NECESSITA CORREÇÃO — pH ALTO',
          priority: 'high',
          icon: AlertCircle,
          measuredValue: `${ph}`,
          idealRange: '7,2 – 7,6',
          diagnosis: `pH alto (${ph}). Reduz eficácia do cloro e pode causar depósitos calcários.`,
          recommendation: 'Utilize produto redutor de pH (ex: ácido muriático ou redutor de pH específico). Consulte as instruções e dosagem no rótulo do produto escolhido ou no site do fabricante. Use EPI e adicione com bomba circulando.',
        });
      } else {
        chemicalResults.push({
          name: 'pH',
          status: 'ok',
          action: '✔ DENTRO DO IDEAL',
          priority: 'low',
          icon: CheckCircle2,
          measuredValue: `${ph}`,
          idealRange: '7,2 – 7,6',
          diagnosis: `pH ideal (${ph}). Nenhuma correção necessária.`,
          recommendation: 'Mantenha o monitoramento regular (recomendado 2x por semana).',
        });
      }
    }

    // Cloro Livre (Ideal: 1.0 - 3.0 ppm)
    if (!isNaN(chlorine)) {
      if (chlorine < 1.0) {
        chemicalResults.push({
          name: 'Cloro Livre',
          status: 'needs_correction',
          action: '⬆ NECESSITA CORREÇÃO — CLORO BAIXO',
          priority: 'high',
          icon: AlertCircle,
          measuredValue: `${chlorine} ppm`,
          idealRange: '1,0 – 3,0 ppm',
          diagnosis: `Cloro baixo (${chlorine} ppm). Risco de proliferação de bactérias e algas.`,
          recommendation: `Aplique produto clorado (hipoclorito de cálcio, sódio ou similar). Consulte a dosagem indicada no rótulo ou site do fabricante para o volume da sua piscina (${volume} m³). Nunca misture diferentes tipos de cloro. Refaça o teste após 6h.`,
        });
      } else if (chlorine > 3.0) {
        chemicalResults.push({
          name: 'Cloro Livre',
          status: 'warning',
          action: '⚠ CLORO ELEVADO — AGUARDAR',
          priority: 'medium',
          icon: Info,
          measuredValue: `${chlorine} ppm`,
          idealRange: '1,0 – 3,0 ppm',
          diagnosis: `Cloro elevado (${chlorine} ppm). Pode causar irritação em banhistas.`,
          recommendation: 'Evite o uso da piscina. Aguarde redução natural por exposição solar e circulação. Você pode realizar troca parcial da água. Refaça o teste após 24h.',
        });
      } else {
        chemicalResults.push({
          name: 'Cloro Livre',
          status: 'ok',
          action: '✔ DENTRO DO IDEAL',
          priority: 'low',
          icon: CheckCircle2,
          measuredValue: `${chlorine} ppm`,
          idealRange: '1,0 – 3,0 ppm',
          diagnosis: `Cloro ideal (${chlorine} ppm). Nenhuma correção necessária.`,
          recommendation: 'Mantenha o monitoramento regular. Dose de manutenção conforme rótulo do produto.',
        });
      }
    }

    // Alcalinidade Total (Ideal: 80 - 120 ppm)
    if (!isNaN(alkalinity)) {
      if (alkalinity < 80) {
        chemicalResults.push({
          name: 'Alcalinidade Total',
          status: 'needs_correction',
          action: '⬆ NECESSITA CORREÇÃO — ALCALINIDADE BAIXA',
          priority: 'medium',
          icon: AlertCircle,
          measuredValue: `${alkalinity} ppm`,
          idealRange: '80 – 120 ppm',
          diagnosis: `Alcalinidade baixa (${alkalinity} ppm). Instabiliza o pH e pode corroer superfícies.`,
          recommendation: 'Utilize bicarbonato de sódio ou corretor de alcalinidade. Consulte a dosagem no rótulo ou site do fabricante para o volume da sua piscina. Adicione gradualmente com circulação ligada.',
        });
      } else if (alkalinity > 120) {
        chemicalResults.push({
          name: 'Alcalinidade Total',
          status: 'warning',
          action: '⬇ NECESSITA CORREÇÃO — ALCALINIDADE ALTA',
          priority: 'medium',
          icon: Info,
          measuredValue: `${alkalinity} ppm`,
          idealRange: '80 – 120 ppm',
          diagnosis: `Alcalinidade alta (${alkalinity} ppm). Dificulta ajuste de pH e pode causar turbidez.`,
          recommendation: 'Utilize redutor de alcalinidade ou produto específico. Consulte as instruções no rótulo ou site do fabricante. Ajuste gradualmente e reavalie após 12h.',
        });
      } else {
        chemicalResults.push({
          name: 'Alcalinidade Total',
          status: 'ok',
          action: '✔ DENTRO DO IDEAL',
          priority: 'low',
          icon: CheckCircle2,
          measuredValue: `${alkalinity} ppm`,
          idealRange: '80 – 120 ppm',
          diagnosis: `Alcalinidade ideal (${alkalinity} ppm). Nenhuma correção necessária.`,
          recommendation: 'Mantenha o monitoramento regular (recomendado semanalmente).',
        });
      }
    }

    // Dureza Cálcica (Ideal: 200 - 400 ppm)
    if (!isNaN(hardness)) {
      if (hardness < 200) {
        chemicalResults.push({
          name: 'Dureza Cálcica',
          status: 'needs_correction',
          action: '⬆ NECESSITA CORREÇÃO — DUREZA BAIXA',
          priority: 'low',
          icon: Info,
          measuredValue: `${hardness} ppm`,
          idealRange: '200 – 400 ppm',
          diagnosis: `Dureza baixa (${hardness} ppm). Pode corroer revestimento e equipamentos.`,
          recommendation: 'Utilize cloreto de cálcio ou produto específico para dureza. Consulte a dosagem indicada no rótulo ou site do fabricante para o volume da sua piscina.',
        });
      } else if (hardness > 400) {
        chemicalResults.push({
          name: 'Dureza Cálcica',
          status: 'warning',
          action: '⬇ NECESSITA CORREÇÃO — DUREZA ALTA',
          priority: 'medium',
          icon: Info,
          measuredValue: `${hardness} ppm`,
          idealRange: '200 – 400 ppm',
          diagnosis: `Dureza alta (${hardness} ppm). Pode causar incrustações e reduzir a vida dos equipamentos.`,
          recommendation: 'Realize troca parcial da água e/ou utilize sequestrante de cálcio. Consulte as instruções no rótulo ou site do fabricante do produto.',
        });
      } else {
        chemicalResults.push({
          name: 'Dureza Cálcica',
          status: 'ok',
          action: '✔ DENTRO DO IDEAL',
          priority: 'low',
          icon: CheckCircle2,
          measuredValue: `${hardness} ppm`,
          idealRange: '200 – 400 ppm',
          diagnosis: `Dureza ideal (${hardness} ppm). Nenhuma correção necessária.`,
          recommendation: 'Mantenha o monitoramento regular.',
        });
      }
    }

    // Ácido Cianúrico — Estabilizante (Ideal: 30 - 50 ppm)
    if (!isNaN(cyanuric)) {
      if (cyanuric < 30) {
        chemicalResults.push({
          name: 'Ácido Cianúrico (Estabilizante)',
          status: 'needs_correction',
          action: '⬆ NECESSITA CORREÇÃO — ESTABILIZANTE BAIXO',
          priority: 'medium',
          icon: Info,
          measuredValue: `${cyanuric} ppm`,
          idealRange: '30 – 50 ppm',
          diagnosis: `Estabilizante baixo (${cyanuric} ppm). O cloro se degrada rapidamente sob luz solar.`,
          recommendation: 'Adicione ácido cianúrico ou estabilizante de cloro. Consulte a dosagem indicada no rótulo ou site do fabricante para o volume da sua piscina.',
        });
      } else if (cyanuric > 50) {
        chemicalResults.push({
          name: 'Ácido Cianúrico (Estabilizante)',
          status: 'warning',
          action: '⬇ NECESSITA CORREÇÃO — ESTABILIZANTE ALTO',
          priority: 'medium',
          icon: Info,
          measuredValue: `${cyanuric} ppm`,
          idealRange: '30 – 50 ppm',
          diagnosis: `Estabilizante alto (${cyanuric} ppm). Reduz a eficácia do cloro (efeito "bloqueio").`,
          recommendation: 'Realize troca parcial da água. Não há produto químico capaz de reduzir o ácido cianúrico — a diluição é a única solução.',
        });
      } else {
        chemicalResults.push({
          name: 'Ácido Cianúrico (Estabilizante)',
          status: 'ok',
          action: '✔ DENTRO DO IDEAL',
          priority: 'low',
          icon: CheckCircle2,
          measuredValue: `${cyanuric} ppm`,
          idealRange: '30 – 50 ppm',
          diagnosis: `Estabilizante ideal (${cyanuric} ppm). Nenhuma correção necessária.`,
          recommendation: 'Mantenha o monitoramento regular.',
        });
      }
    }

    // Ordenar por prioridade
    chemicalResults.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    setResults(chemicalResults);
    setShowResults(true);
  };

  // Exportar como imagem
  const exportAsImage = async () => {
    if (!resultRef.current) return;

    try {
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      const link = document.createElement('a');
      link.download = `diagnostico-piscina-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Erro ao exportar imagem:', error);
      alert('Erro ao exportar imagem. Tente novamente.');
    }
  };

  // Compartilhar
  const shareResults = async () => {
    if (!resultRef.current) return;

    try {
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const file = new File([blob], 'diagnostico-piscina.png', { type: 'image/png' });

        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Diagnóstico da Água da Piscina',
            text: 'Resultado do diagnóstico da qualidade da água da piscina',
            files: [file],
          });
        } else {
          exportAsImage();
        }
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      exportAsImage();
    }
  };

  return (
    <div className="min-h-screen bg-[#0A192F] pt-20 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate(ROUTE_PATHS.DASHBOARD)}
            className="mb-6 text-blue-200 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Painel Geral
          </Button>

          <div className="flex flex-col items-center justify-center gap-4 mb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-[#00A3E0] to-[#0072BC] rounded-2xl flex items-center justify-center shadow-lg shadow-[#00A3E0]/20">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">AcquaCalc</h1>
              <p className="text-blue-200 mt-1">Calculadora Profissional CTP ANAPP</p>
            </div>
          </div>
        </div>

        {/* Aviso legal */}
        <div className="mb-6 bg-amber-900/40 border border-amber-600/40 rounded-2xl p-4 text-amber-200 text-xs leading-relaxed">
          <p className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" />
            Nota Importante
          </p>
          Esta ferramenta realiza o <strong>diagnóstico da qualidade da água</strong> e indica quais parâmetros necessitam correção. <strong>Não são fornecidas quantidades específicas de produtos</strong>, pois as dosagens variam conforme o fabricante, concentração e condições locais. Consulte sempre o rótulo ou o site do produto que irá utilizar.
        </div>

        {/* Main Calculator Card */}
        <Card className="bg-white shadow-2xl border-0 rounded-3xl overflow-hidden">
          <CardContent className="p-6 md:p-8 space-y-8">

            {/* Section 1: Dados da Piscina */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                <div className="bg-[#00A3E0]/10 p-2 rounded-lg">
                  <Droplets className="w-5 h-5 text-[#00A3E0]" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">1. Dados da Piscina</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <Label htmlFor="shape" className="text-sm font-semibold text-gray-600 mb-1.5 block">
                    Formato da Piscina
                  </Label>
                  <Select
                    value={poolData.shape}
                    onValueChange={(value: any) => setPoolData({ ...poolData, shape: value })}
                  >
                    <SelectTrigger className="h-12 bg-gray-50 border-gray-200 focus:ring-[#00A3E0] focus:border-[#00A3E0] rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rectangular">Retangular</SelectItem>
                      <SelectItem value="circular">Circular/Redonda</SelectItem>
                      <SelectItem value="irregular">Irregular/Formato Livre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="length" className="text-sm font-semibold text-gray-600 mb-1.5 block">
                    {poolData.shape === 'circular' ? 'Diâmetro (m)' : 'Comprimento (m)'}
                  </Label>
                  <Input
                    id="length"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 10.0"
                    value={poolData.length}
                    onChange={(e) => setPoolData({ ...poolData, length: e.target.value })}
                    onBlur={calculateVolume}
                    className="h-12 bg-gray-50 border-gray-200 focus:ring-[#00A3E0] focus:border-[#00A3E0] rounded-xl"
                  />
                </div>

                {poolData.shape !== 'circular' && (
                  <div>
                    <Label htmlFor="width" className="text-sm font-semibold text-gray-600 mb-1.5 block">
                      Largura (m)
                    </Label>
                    <Input
                      id="width"
                      type="number"
                      step="0.1"
                      placeholder="Ex: 5.0"
                      value={poolData.width}
                      onChange={(e) => setPoolData({ ...poolData, width: e.target.value })}
                      onBlur={calculateVolume}
                      className="h-12 bg-gray-50 border-gray-200 focus:ring-[#00A3E0] focus:border-[#00A3E0] rounded-xl"
                    />
                  </div>
                )}

                <div className={poolData.shape === 'circular' ? 'md:col-span-1' : 'md:col-span-2'}>
                  <Label htmlFor="avgDepth" className="text-sm font-semibold text-gray-600 mb-1.5 block">
                    Profundidade Média (m)
                  </Label>
                  <Input
                    id="avgDepth"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 1.5"
                    value={poolData.avgDepth}
                    onChange={(e) => setPoolData({ ...poolData, avgDepth: e.target.value })}
                    onBlur={calculateVolume}
                    className="h-12 bg-gray-50 border-gray-200 focus:ring-[#00A3E0] focus:border-[#00A3E0] rounded-xl"
                  />
                </div>
              </div>

              {poolData.volume && (
                <div className="bg-gradient-to-r from-[#00A3E0] to-[#0072BC] text-white rounded-2xl p-5 shadow-md flex items-center justify-between mt-2">
                  <div>
                    <p className="text-blue-100 text-xs font-medium uppercase tracking-wider mb-1">Volume Calculado</p>
                    <p className="text-3xl font-bold">{poolData.volume} <span className="text-xl font-normal opacity-80">m³</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-100 text-xs font-medium uppercase tracking-wider mb-1">Em Litros</p>
                    <p className="text-xl font-semibold">{(parseFloat(poolData.volume) * 1000).toLocaleString('pt-BR')} <span className="text-sm font-normal opacity-80">L</span></p>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Análise da Água */}
            <div className="space-y-5 pt-4">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                <div className="bg-[#FF6B00]/10 p-2 rounded-lg">
                  <Beaker className="w-5 h-5 text-[#FF6B00]" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">2. Análise da Água</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ph" className="text-sm font-semibold text-gray-600 mb-1.5 block">
                    pH <span className="text-xs font-normal text-gray-400 ml-1">(7.2–7.6)</span>
                  </Label>
                  <Input
                    id="ph"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 7.4"
                    value={waterTest.ph}
                    onChange={(e) => setWaterTest({ ...waterTest, ph: e.target.value })}
                    className="h-12 bg-gray-50 border-gray-200 focus:ring-[#FF6B00] focus:border-[#FF6B00] rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="chlorine" className="text-sm font-semibold text-gray-600 mb-1.5 block">
                    Cloro <span className="text-xs font-normal text-gray-400 ml-1">(1–3 ppm)</span>
                  </Label>
                  <Input
                    id="chlorine"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 2.0"
                    value={waterTest.chlorine}
                    onChange={(e) => setWaterTest({ ...waterTest, chlorine: e.target.value })}
                    className="h-12 bg-gray-50 border-gray-200 focus:ring-[#FF6B00] focus:border-[#FF6B00] rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="alkalinity" className="text-sm font-semibold text-gray-600 mb-1.5 block">
                    Alcalinidade <span className="text-xs font-normal text-gray-400 ml-1">(80–120)</span>
                  </Label>
                  <Input
                    id="alkalinity"
                    type="number"
                    step="1"
                    placeholder="Ex: 100"
                    value={waterTest.alkalinity}
                    onChange={(e) => setWaterTest({ ...waterTest, alkalinity: e.target.value })}
                    className="h-12 bg-gray-50 border-gray-200 focus:ring-[#FF6B00] focus:border-[#FF6B00] rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="hardness" className="text-sm font-semibold text-gray-600 mb-1.5 block">
                    Dureza Cálcica <span className="text-xs font-normal text-gray-400 ml-1">(200–400)</span>
                  </Label>
                  <Input
                    id="hardness"
                    type="number"
                    step="1"
                    placeholder="Ex: 300"
                    value={waterTest.hardness}
                    onChange={(e) => setWaterTest({ ...waterTest, hardness: e.target.value })}
                    className="h-12 bg-gray-50 border-gray-200 focus:ring-[#FF6B00] focus:border-[#FF6B00] rounded-xl"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="cyanuricAcid" className="text-sm font-semibold text-gray-600 mb-1.5 block">
                    Ác. Cianúrico <span className="text-xs font-normal text-gray-400 ml-1">(30–50 ppm)</span>
                  </Label>
                  <Input
                    id="cyanuricAcid"
                    type="number"
                    step="1"
                    placeholder="Ex: 40"
                    value={waterTest.cyanuricAcid}
                    onChange={(e) => setWaterTest({ ...waterTest, cyanuricAcid: e.target.value })}
                    className="h-12 bg-gray-50 border-gray-200 focus:ring-[#FF6B00] focus:border-[#FF6B00] rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Calculate Button */}
            <div className="pt-4">
              <Button
                onClick={calculateChemicals}
                disabled={!poolData.volume || !waterTest.ph || !waterTest.chlorine}
                className="w-full h-14 text-lg font-bold bg-[#FF6B00] hover:bg-[#E66000] text-white rounded-xl shadow-lg shadow-[#FF6B00]/30 transition-all active:scale-[0.98]"
              >
                <Calculator className="w-5 h-5 mr-2" />
                Analisar Água
              </Button>
            </div>

          </CardContent>
        </Card>

        {/* Resultados — Diagnóstico */}
        {showResults && results.length > 0 && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-bold text-white">Diagnóstico</h2>
              <div className="flex gap-2">
                <Button
                  onClick={exportAsImage}
                  size="sm"
                  variant="outline"
                  className="bg-transparent border-blue-400 text-blue-200 hover:bg-blue-900 hover:text-white rounded-lg"
                >
                  <Download className="w-4 h-4 mr-1.5" />
                  Salvar
                </Button>
                <Button
                  onClick={shareResults}
                  size="sm"
                  className="bg-[#00A3E0] hover:bg-[#008CC2] text-white rounded-lg"
                >
                  <Share2 className="w-4 h-4 mr-1.5" />
                  Compartilhar
                </Button>
              </div>
            </div>

            {/* Container do Screenshot */}
            <div
              ref={resultRef}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl mx-auto max-w-md relative"
              style={{ width: '100%', maxWidth: '400px' }}
            >
              {/* Header do Relatório */}
              <div className="bg-gradient-to-br from-[#0A192F] to-[#0072BC] p-6 text-white">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">AcquaCalc</h3>
                    <p className="text-blue-200 text-xs uppercase tracking-wider mt-1">Diagnóstico da Água</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-blue-200 uppercase tracking-wider">Data</p>
                    <p className="font-semibold text-sm">
                      {new Date().toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                  <div className="text-center">
                    <p className="text-[10px] text-blue-200 uppercase">Vol.</p>
                    <p className="font-bold text-sm">{poolData.volume}m³</p>
                  </div>
                  <div className="text-center border-l border-white/20">
                    <p className="text-[10px] text-blue-200 uppercase">pH</p>
                    <p className="font-bold text-sm">{waterTest.ph}</p>
                  </div>
                  <div className="text-center border-l border-white/20">
                    <p className="text-[10px] text-blue-200 uppercase">Cloro</p>
                    <p className="font-bold text-sm">{waterTest.chlorine}</p>
                  </div>
                </div>
              </div>

              {/* Lista de Diagnósticos */}
              <div className="p-5 space-y-3 bg-gray-50">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Resultado por Parâmetro</h4>

                {results.map((result, index) => {
                  const Icon = result.icon;
                  let badgeColor = 'bg-gray-100 text-gray-600';
                  let iconColor = 'text-gray-500';
                  let cardBorder = 'border-gray-100';

                  if (result.status === 'needs_correction') {
                    badgeColor = 'bg-red-100 text-red-700';
                    iconColor = 'text-red-500';
                    cardBorder = 'border-red-100';
                  } else if (result.status === 'warning') {
                    badgeColor = 'bg-orange-100 text-orange-700';
                    iconColor = 'text-orange-500';
                    cardBorder = 'border-orange-100';
                  } else {
                    badgeColor = 'bg-green-100 text-green-700';
                    iconColor = 'text-green-500';
                    cardBorder = 'border-green-100';
                  }

                  return (
                    <div key={index} className={`bg-white rounded-2xl p-4 shadow-sm border ${cardBorder}`}>
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 flex-shrink-0 ${iconColor}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          {/* Nome + faixa ideal */}
                          <div className="flex justify-between items-start mb-1">
                            <h5 className="font-bold text-gray-900 text-sm leading-tight">{result.name}</h5>
                            <span className="text-[10px] text-gray-400 ml-2 flex-shrink-0">Ideal: {result.idealRange}</span>
                          </div>
                          {/* Valor medido */}
                          <p className="text-xs text-gray-500 mb-2">
                            Medido: <strong className="text-gray-700">{result.measuredValue}</strong>
                          </p>
                          {/* Badge de status */}
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${badgeColor}`}>
                            {result.action}
                          </span>
                          {/* Diagnóstico */}
                          <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                            {result.diagnosis}
                          </p>
                          {/* Recomendação — apenas se precisar de correção */}
                          {result.status !== 'ok' && (
                            <div className="mt-2 bg-blue-50 rounded-lg p-2 border border-blue-100">
                              <p className="text-[10px] font-bold text-[#0072BC] mb-0.5 uppercase tracking-wide">📋 Recomendação</p>
                              <p className="text-[10px] text-gray-600 leading-relaxed">{result.recommendation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Rodapé do Relatório */}
              <div className="bg-white p-5 border-t border-gray-100">
                <div className="bg-amber-50 rounded-xl p-3 mb-4 border border-amber-200">
                  <p className="text-xs font-bold text-amber-700 mb-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Aviso Importante
                  </p>
                  <p className="text-[10px] text-gray-700 leading-snug">
                    Este diagnóstico indica se cada parâmetro necessita correção, mas <strong>não recomenda quantidades específicas</strong>. As dosagens variam conforme o produto e fabricante. <strong>Consulte sempre o rótulo ou site do fabricante do produto que irá utilizar.</strong> Use EPI e refaça os testes após a aplicação.
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 font-medium">CTP ANAPP © 2026</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
