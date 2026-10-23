import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ROUTE_PATHS } from '@/lib';

const ESTADOS_BR = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

export default function CompleteRegistration() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);
  const [user, setUser] = useState<any>(null);

  // Dados pessoais
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [cpf, setCpf] = useState('');
  const [rg, setRg] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');

  // Endereço
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  // Escolaridade e perfil
  const [educationLevel, setEducationLevel] = useState('');
  const [professionalStatus, setProfessionalStatus] = useState('');
  const [professionalStatusOther, setProfessionalStatusOther] = useState('');
  const [isAnappMember, setIsAnappMember] = useState(false);
  const [poolTypes, setPoolTypes] = useState<string[]>([]);

  useEffect(() => {
    checkProfile();
  }, []);

  const checkProfile = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        navigate(ROUTE_PATHS.LOGIN);
        return;
      }
      setUser(authUser);

      // Verificar se já completou o cadastro
      const { data: profile } = await supabase
        .from('user_extended_profile')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (profile?.profile_completed) {
        navigate(ROUTE_PATHS.DASHBOARD);
        return;
      }

      // Se já tem dados parciais, preencher
      if (profile) {
        setFirstName(profile.first_name || '');
        setLastName(profile.last_name || '');
        setCpf(profile.cpf || '');
        setRg(profile.rg || '');
        setBirthDate(profile.birth_date || '');
        setPhone(profile.phone || '');
        setGender(profile.gender || '');
        setStreet(profile.street || '');
        setNumber(profile.number || '');
        setComplement(profile.complement || '');
        setNeighborhood(profile.neighborhood || '');
        setCity(profile.city || '');
        setState(profile.state || '');
        setZipCode(profile.zip_code || '');
        setEducationLevel(profile.education_level || '');
        setProfessionalStatus(profile.professional_status || '');
        setProfessionalStatusOther(profile.professional_status_other || '');
        setIsAnappMember(profile.is_anapp_member || false);
        setPoolTypes(profile.pool_types || []);
      }
    } catch (error) {
      console.error('Erro ao verificar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const formatZipCode = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  };

  const validateStep1 = () => {
    if (!firstName || !lastName || !cpf || !rg || !birthDate || !phone || !gender) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos pessoais.',
        variant: 'destructive',
      });
      return false;
    }
    if (cpf.replace(/\D/g, '').length !== 11) {
      toast({
        title: 'CPF inválido',
        description: 'Digite um CPF válido com 11 dígitos.',
        variant: 'destructive',
      });
      return false;
    }
    if (rg.replace(/[^A-Za-z0-9]/g, '').length < 3) {
      toast({
        title: 'RG inválido',
        description: 'Informe o número do RG.',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!street || !number || !neighborhood || !city || !state || !zipCode) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos de endereço.',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!educationLevel || !professionalStatus) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha escolaridade e status profissional.',
        variant: 'destructive',
      });
      return false;
    }
    if (professionalStatus === 'outros' && !professionalStatusOther) {
      toast({
        title: 'Campo obrigatório',
        description: 'Descreva seu status profissional.',
        variant: 'destructive',
      });
      return false;
    }
    if (poolTypes.length === 0) {
      toast({
        title: 'Selecione ao menos um tipo',
        description: 'Selecione pelo menos um tipo de piscina.',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    setSaving(true);

    try {
      const profileData = {
        user_id: user.id,
        first_name: firstName,
        last_name: lastName,
        cpf: cpf.replace(/\D/g, ''),
        rg: rg.trim().toUpperCase(),
        birth_date: birthDate,
        phone: phone.replace(/\D/g, ''),
        gender,
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
        zip_code: zipCode.replace(/\D/g, ''),
        education_level: educationLevel,
        professional_status: professionalStatus,
        professional_status_other: professionalStatusOther || null,
        is_anapp_member: isAnappMember,
        pool_types: poolTypes,
        profile_completed: true,
      };

      const { error } = await supabase
        .from('user_extended_profile')
        .upsert(profileData);

      if (error) throw error;

      // Atualizar nome no profiles
      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: `${firstName} ${lastName}`,
          updated_at: new Date().toISOString(),
        });

      toast({
        title: 'Cadastro completo!',
        description: 'Seu perfil foi salvo com sucesso.',
      });

      navigate(ROUTE_PATHS.CHECKOUT);
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar o cadastro.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const togglePoolType = (type: string) => {
    setPoolTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0072BC] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Etapa {step} de 3</span>
            <span className="text-sm text-gray-500">{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#0072BC] h-2 rounded-full transition-all"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && 'Dados Pessoais'}
              {step === 2 && 'Endereço'}
              {step === 3 && 'Perfil Profissional'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Preencha seus dados pessoais'}
              {step === 2 && 'Informe seu endereço completo'}
              {step === 3 && 'Complete seu perfil profissional'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* STEP 1: Dados Pessoais */}
            {step === 1 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nome *</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="João"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Sobrenome Completo *</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Silva Santos"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input
                      id="cpf"
                      value={cpf}
                      onChange={(e) => setCpf(formatCPF(e.target.value))}
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rg">RG *</Label>
                    <Input
                      id="rg"
                      value={rg}
                      onChange={(e) => setRg(e.target.value.toUpperCase().slice(0, 30))}
                      placeholder="Número do RG"
                      maxLength={30}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="birthDate">Data de Nascimento *</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      placeholder="(11) 99999-9999"
                      maxLength={15}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gênero *</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="feminino">Feminino</SelectItem>
                        <SelectItem value="prefiro_nao_informar">Não informar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {/* STEP 2: Endereço */}
            {step === 2 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="street">Rua/Avenida *</Label>
                    <Input
                      id="street"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Rua das Flores"
                    />
                  </div>
                  <div>
                    <Label htmlFor="number">Número *</Label>
                    <Input
                      id="number"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      placeholder="123"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="complement">Complemento</Label>
                    <Input
                      id="complement"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      placeholder="Apto 45"
                    />
                  </div>
                  <div>
                    <Label htmlFor="neighborhood">Bairro *</Label>
                    <Input
                      id="neighborhood"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="Centro"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">Cidade *</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="São Paulo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">UF *</Label>
                    <Select value={state} onValueChange={setState}>
                      <SelectTrigger>
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                      <SelectContent>
                        {ESTADOS_BR.map(uf => (
                          <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="zipCode">CEP *</Label>
                    <Input
                      id="zipCode"
                      value={zipCode}
                      onChange={(e) => setZipCode(formatZipCode(e.target.value))}
                      placeholder="00000-000"
                      maxLength={9}
                    />
                  </div>
                </div>
              </>
            )}

            {/* STEP 3: Perfil Profissional */}
            {step === 3 && (
              <>
                <div>
                  <Label htmlFor="educationLevel">Escolaridade *</Label>
                  <Select value={educationLevel} onValueChange={setEducationLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primeiro_grau_incompleto">1º Grau Incompleto</SelectItem>
                      <SelectItem value="primeiro_grau_completo">1º Grau Completo</SelectItem>
                      <SelectItem value="segundo_grau_incompleto">2º Grau Incompleto</SelectItem>
                      <SelectItem value="segundo_grau_completo">2º Grau Completo</SelectItem>
                      <SelectItem value="superior_incompleto">Superior Incompleto</SelectItem>
                      <SelectItem value="superior_completo">Superior Completo</SelectItem>
                      <SelectItem value="pos_graduado_incompleto">Pós-Graduado Incompleto</SelectItem>
                      <SelectItem value="pos_graduado_completo">Pós-Graduado Completo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="professionalStatus">Status Profissional *</Label>
                  <Select value={professionalStatus} onValueChange={setProfessionalStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="piscineiro_atuante">Sou piscineiro atuante</SelectItem>
                      <SelectItem value="vai_iniciar">Vou iniciar na profissão</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {professionalStatus === 'outros' && (
                  <div>
                    <Label htmlFor="professionalStatusOther">Descreva seu status *</Label>
                    <Input
                      id="professionalStatusOther"
                      value={professionalStatusOther}
                      onChange={(e) => setProfessionalStatusOther(e.target.value)}
                      placeholder="Ex: Estudante, Engenheiro, etc."
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <Label>É associado da ANAPP? *</Label>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant={isAnappMember ? 'default' : 'outline'}
                      onClick={() => setIsAnappMember(true)}
                      className={isAnappMember ? 'bg-[#0072BC]' : ''}
                    >
                      Sim
                    </Button>
                    <Button
                      type="button"
                      variant={!isAnappMember ? 'default' : 'outline'}
                      onClick={() => setIsAnappMember(false)}
                      className={!isAnappMember ? 'bg-[#0072BC]' : ''}
                    >
                      Não
                    </Button>
                  </div>
                  {!isAnappMember && (
                    <div className="bg-blue-50 border-l-4 border-[#0072BC] p-4 rounded">
                      <p className="text-sm text-gray-700">
                        <strong>💡 Sabia que:</strong> A associação à ANAPP é <strong>gratuita</strong> para piscineiros
                        e você ganha <strong>50% de desconto</strong> no valor total do curso!
                      </p>
                      <a
                        href="https://anapp.org.br/associe-se"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0072BC] underline text-sm mt-2 inline-block"
                      >
                        Associe-se agora →
                      </a>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Tipos de piscinas que irá atuar * (múltipla escolha)</Label>
                  <div className="space-y-2">
                    {[
                      { value: 'residenciais', label: 'Residenciais' },
                      { value: 'comerciais', label: 'Comerciais' },
                      { value: 'condominios', label: 'Condomínios' },
                      { value: 'clubes', label: 'Clubes' },
                      { value: 'escolas', label: 'Escolas' },
                    ].map(type => (
                      <div key={type.value} className="flex items-center gap-2">
                        <Checkbox
                          id={type.value}
                          checked={poolTypes.includes(type.value)}
                          onCheckedChange={() => togglePoolType(type.value)}
                        />
                        <label htmlFor={type.value} className="text-sm cursor-pointer">
                          {type.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Buttons */}
            <div className="flex justify-between pt-6">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  disabled={saving}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              )}
              {step < 3 ? (
                <Button
                  onClick={handleNext}
                  className="ml-auto bg-[#0072BC] hover:bg-[#005a9e]"
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="ml-auto bg-[#0072BC] hover:bg-[#005a9e]"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Concluir Cadastro
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
