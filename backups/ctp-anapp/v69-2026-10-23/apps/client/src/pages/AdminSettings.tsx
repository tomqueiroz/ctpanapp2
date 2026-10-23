import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Shield
} from 'lucide-react';
import { ROUTE_PATHS } from '@/lib';
import { useToast } from '@/hooks/use-toast';

interface Settings {
  erede_enabled: string;
  erede_pv: string;
  erede_environment: string;
}

interface ConnectionTestResult {
  success: boolean;
  message?: string;
  error?: string;
  code?: string;
  environment?: string;
  pv_last4?: string;
  token_endpoint?: string;
  transaction_api?: string;
  expires_in?: number | null;
}

interface FunctionErrorLike {
  message?: string;
  context?: Response;
}

export default function AdminSettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  
  const [settings, setSettings] = useState<Settings>({
    erede_enabled: 'false',
    erede_pv: '',
    erede_environment: 'sandbox',
  });

  const [originalSettings, setOriginalSettings] = useState<Settings>({
    erede_enabled: 'false',
    erede_pv: '',
    erede_environment: 'sandbox',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', ['erede_enabled', 'erede_pv', 'erede_environment']);

      if (error) throw error;

      const settingsMap: any = {};
      data?.forEach((item) => {
        settingsMap[item.key] = item.value || '';
      });

      const loadedSettings = {
        erede_enabled: settingsMap.erede_enabled || 'false',
        erede_pv: settingsMap.erede_pv || '',
        erede_environment: settingsMap.erede_environment || 'sandbox',
      };

      setSettings(loadedSettings);
      setOriginalSettings(loadedSettings);
    } catch (error: any) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as configurações.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (settings.erede_enabled === 'true' && !testResult?.success) {
      toast({
        title: 'Validação obrigatória',
        description: 'Teste a conexão com sucesso antes de habilitar pagamentos.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      // Atualizar cada configuração
      const updates = Object.entries(settings).map(([key, value]) =>
        supabase
          .from('system_settings')
          .update({ value })
          .eq('key', key)
      );

      const results = await Promise.all(updates);
      
      const hasError = results.some((result) => result.error);
      if (hasError) {
        throw new Error('Erro ao salvar configurações');
      }

      setOriginalSettings(settings);
      
      toast({
        title: 'Sucesso',
        description: 'Configurações salvas com sucesso!',
      });
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('rede_connection_test', {
        body: {
          expected_environment: settings.erede_environment,
          expected_pv: settings.erede_pv,
        },
      });
      let result = data as ConnectionTestResult | null;
      if (error) {
        const functionError = error as FunctionErrorLike;
        if (functionError.context instanceof Response) {
          result = await functionError.context.clone().json().catch(() => null) as ConnectionTestResult | null;
        }
        throw new Error(result?.error || functionError.message || 'Credenciais inválidas');
      }
      if (!result?.success) throw new Error(result?.error || 'Credenciais inválidas');
      setTestResult(result);
      toast({
        title: 'Conexão bem-sucedida!',
        description: `OAuth ${result.environment || ''} validado sem executar cobrança.`,
      });
    } catch (error: any) {
      console.error('Erro ao testar conexão:', error);
      setTestResult({
        success: false,
        error: error.message || 'Credenciais inválidas',
      });
      toast({
        title: 'Erro na conexão',
        description: error.message || 'Verifique as credenciais do ambiente selecionado.',
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0072BC] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="flex">
        {/* Sidebar space */}
        <div className="hidden lg:block w-64"></div>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto px-2">
            {/* Header */}
            <div className="mb-8">
              <Button 
                variant="ghost" 
                onClick={() => navigate(ROUTE_PATHS.ADMIN)}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
Voltar ao Painel
              </Button>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Configurações do Sistema
              </h1>
              <p className="text-gray-600">
                Gerencie as configurações de pagamento e integração
              </p>
            </div>

            {/* e.Rede Settings */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#0072BC]" />
                  <CardTitle>Integração e.Rede Itaú</CardTitle>
                </div>
                <CardDescription>
                  Configure as credenciais para processar pagamentos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enable/Disable */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <Label className="text-base font-semibold">
                      Habilitar Pagamentos
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      Ative ou desative o sistema de pagamentos da plataforma
                    </p>
                  </div>
                  <Switch
                    checked={settings.erede_enabled === 'true'}
                    onCheckedChange={(checked) => {
                      if (checked && !testResult?.success) {
                        toast({
                          title: 'Teste obrigatório',
                          description: 'Valide a conexão antes de habilitar pagamentos.',
                          variant: 'destructive',
                        });
                        return;
                      }
                      setSettings({ ...settings, erede_enabled: checked ? 'true' : 'false' });
                    }}
                  />
                </div>

                {/* Environment */}
                <div>
                  <Label htmlFor="environment">Ambiente</Label>
                  <Select
                    value={settings.erede_environment}
                    onValueChange={(value) =>
                      setSettings({ ...settings, erede_environment: value })
                    }
                  >
                    <SelectTrigger id="environment" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-orange-500" />
                          Sandbox (Testes)
                        </div>
                      </SelectItem>
                      <SelectItem value="production">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-green-500" />
                          Produção (Real)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Use Sandbox para testes e Produção para transações reais
                  </p>
                </div>

                {/* PV (Client ID) */}
                <div>
                  <Label htmlFor="pv">PV (Client ID)</Label>
                  <Input
                    id="pv"
                    type="text"
                    placeholder="Digite o PV da e.Rede"
                    value={settings.erede_pv}
                    onChange={(e) =>
                      setSettings({ ...settings, erede_pv: e.target.value })
                    }
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Número de filiação fornecido pela e.Rede
                  </p>
                </div>

                {/* Client Secret */}
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <Label>Chave de Integração (Client Secret)</Label>
                  <p className="mt-2 text-sm text-green-800">
                    Gerenciada com segurança em Supabase Secrets. O segredo não é carregado nem exibido no navegador.
                  </p>
                </div>

                {/* Test Connection */}
                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={testing}
                    className="w-full"
                  >
                    {testing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Testando conexão...
                      </>
                    ) : testResult?.success ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        Conexão bem-sucedida
                      </>
                    ) : testResult && !testResult.success ? (
                      <>
                        <XCircle className="w-4 h-4 mr-2 text-red-500" />
                        Erro na conexão
                      </>
                    ) : (
                      'Testar Conexão'
                    )}
                  </Button>
                  {testResult?.success && (
                    <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 text-xs text-green-900">
                      <p><strong>Ambiente:</strong> {testResult.environment}</p>
                      <p><strong>PV:</strong> final {testResult.pv_last4}</p>
                      <p className="break-all"><strong>OAuth:</strong> {testResult.token_endpoint}</p>
                      <p className="break-all"><strong>API:</strong> {testResult.transaction_api}</p>
                      <p><strong>Teste executado:</strong> token OAuth, sem cobrança</p>
                    </div>
                  )}
                  {testResult && !testResult.success && (
                    <Alert className="mt-3 border-red-200 bg-red-50 text-red-900">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Conexão não validada</AlertTitle>
                      <AlertDescription>
                        {testResult.error || 'A credencial foi rejeitada pelo ambiente selecionado.'}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-900">Como obter as credenciais?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-blue-800 space-y-2">
                <p>1. Acesse o <strong>Portal de Desenvolvedores da Rede</strong></p>
                <p>2. Abra <strong>Meus Projetos</strong> e selecione o projeto de homologação</p>
                <p>3. Copie o <strong>clientId, clientSecret e PV do sandbox</strong></p>
                <p>4. Cadastre-os exclusivamente em <strong>Supabase Secrets</strong></p>
                <p>5. Teste a conexão antes de habilitar pagamentos</p>
                <p className="pt-2 text-xs">
                  <strong>Importante:</strong> credenciais de produção não validam no sandbox. O access token é gerado por OAuth e não deve ser cadastrado como uma chave fixa.
                </p>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={loadSettings}
                disabled={!hasChanges || saving}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="bg-[#0072BC] hover:bg-[#005a9e]"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Configurações
                  </>
                )}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
